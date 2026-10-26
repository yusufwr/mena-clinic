const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const source = path.join(__dirname, '../clinic-system/src/data/db.json');
const digest = () => crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');
const before = digest();
const origin = 'http://127.0.0.1:3000';
const metrics = {};
const users = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function call(client, route, method = 'GET', body) {
  const start = performance.now();
  const response = await fetch(origin + route, { method, signal: AbortSignal.timeout(30000), headers: {
    'Content-Type': 'application/json', ...(client.token ? { Authorization: 'Bearer ' + client.token } : {}),
  }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const text = await response.text();
  const metric = metrics[client.role] ||= { requests: 0, failures: 0, latencies: [], statuses: {} };
  metric.requests++; metric.latencies.push(performance.now() - start);
  metric.statuses[response.status] = (metric.statuses[response.status] || 0) + 1;
  if (!response.ok) { metric.failures++; throw new Error(`${client.role} ${method} ${route}: HTTP ${response.status}`); }
  return response.headers.get('content-type')?.includes('application/json') ? JSON.parse(text) : text;
}
async function main() {
  // Preflight must authenticate known isolated users before any test mutation.
  // Real database contains none of these accounts, so accidental live runs fail closed.
  for (const role of ['VISITOR', 'PATIENT', 'DOCTOR', 'PHARMACIST', 'ADMIN']) for (let index = 0; index < 60; index++) users.push({ role, index });
  await Promise.all(users.filter(u => u.role !== 'VISITOR').map(async client => {
    const id = client.role === 'PATIENT' ? 'load-patient-' + client.index : 'load-' + client.role + '-' + client.index;
    const response = await fetch(origin + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: id + '@audit.invalid', password: 'Audit-Load-Password-123' }) });
    assert.equal(response.status, 200, 'Isolated fixture authentication required; refusing test writes');
    const data = await response.json(); assert.equal(data.user.id, id); client.token = data.token;
  }));
  console.log('240 distinct accounts authenticated; starting 300 clients for 30 seconds.');
  const start = performance.now();
  const errors = [];
  await Promise.all(users.map(async client => {
    await delay(client.index * 5);
    while (performance.now() - start < 30000) {
      try {
        const patientId = 'load-patient-' + client.index;
        const doctorId = 'load-DOCTOR-' + client.index;
        if (client.role === 'VISITOR') {
          await call(client, ['/tr', '/ar', '/en'][client.index % 3]);
          await call(client, '/api/doctors');
        } else if (client.role === 'PATIENT') {
          if (!client.booked) { await call(client, '/api/appointments', 'POST', { patientId, doctorId, dateStr: '2098-02-15', timeStr: '10:00' }); client.booked = true; }
          else await call(client, '/api/appointments');
        } else if (client.role === 'DOCTOR') {
          const appointments = await call(client, '/api/appointments');
          const appointment = appointments.find(a => a.patientId === patientId && a.dateStr === '2098-02-15');
          if (appointment && !client.completed) {
            await call(client, '/api/medical-records', 'POST', { patientId, doctorId, appointmentId: appointment.id, diagnosis: 'Isolated load test', clinicalNotes: 'Synthetic test data', prescriptionItems: [{ itemName: 'Load medication ' + client.index, dosage: 'test', quantity: 1 }], labTests: [{ testName: 'Load test' }] });
            client.completed = true;
          }
        } else if (client.role === 'PHARMACIST') {
          if (!client.stocked) { await call(client, '/api/inventory', 'POST', { itemName: 'Load medication ' + client.index, SKU: 'LOAD-' + client.index, stockQuantity: 10, supplierPrice: 1, retailPrice: 2, expiryDate: '2098-01-01' }); client.stocked = true; }
          const prescriptions = await call(client, '/api/prescriptions');
          const prescription = prescriptions.find(p => p.patientId === patientId);
          if (prescription && !client.dispensed) { await call(client, '/api/prescriptions/' + prescription.id + '/dispense', 'PUT'); client.dispensed = true; }
        } else {
          if (!client.created) { await call(client, '/api/patients', 'POST', { fullName: 'Load registered ' + client.index, identityNo: 'load-new-' + client.index, password: 'Audit-Load-Password-123' }); client.created = true; }
          await call(client, '/api/users');
        }
      } catch (error) { errors.push(error.message); }
      await delay(1000);
    }
  }));
  const isolated = JSON.parse(fs.readFileSync(fs.readFileSync(path.join(__dirname, 'load-db-path.txt'), 'utf8'), 'utf8'));
  const workflows = {
    bookings: isolated.appointments.filter(a => a.patientId.startsWith('load-patient-')).length,
    consultations: isolated.medicalRecords.filter(r => r.patientId.startsWith('load-patient-')).length,
    dispensed: (isolated.prescriptions || []).filter(p => p.patientId.startsWith('load-patient-') && p.status === 'DISPENSED').length,
    correctStock: (isolated.inventory || []).filter(i => i.SKU.startsWith('LOAD-') && i.stockQuantity === 9).length,
    registered: isolated.patients.filter(p => p.identityNo.startsWith('load-new-')).length,
  };
  const summary = Object.fromEntries(Object.entries(metrics).map(([role, metric]) => {
    metric.latencies.sort((a, b) => a - b);
    const percentile = fraction => Math.round(metric.latencies[Math.min(metric.latencies.length - 1, Math.floor(metric.latencies.length * fraction))]);
    return [role, { requests: metric.requests, failures: metric.failures, statuses: metric.statuses, p50Ms: percentile(.5), p95Ms: percentile(.95), maxMs: percentile(1) }];
  }));
  const report = { localDate: '2026-10-26', timestamp: new Date().toISOString(), clients: 300, distinctAccounts: 240, durationSeconds: (performance.now() - start) / 1000, summary, workflows, errors: errors.slice(0, 20), liveDataUnchanged: digest() === before };
  fs.writeFileSync(path.join(__dirname, 'load-results.json'), JSON.stringify(report, null, 2));
  assert.deepEqual(workflows, { bookings: 60, consultations: 60, dispensed: 60, correctStock: 60, registered: 60 });
  assert.equal(errors.length, 0);
  assert.equal(digest(), before);
  console.log(JSON.stringify(report, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
