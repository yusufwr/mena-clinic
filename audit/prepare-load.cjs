const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'clinic-system/src/data/db.json'), 'utf8'));
const salt = crypto.randomBytes(16).toString('hex');
const password = `scrypt$${salt}$${crypto.scryptSync('Audit-Load-Password-123', salt, 32).toString('hex')}`;
for (let i = 0; i < 60; i++) {
  const patientId = 'load-patient-' + i;
  const doctorId = 'load-DOCTOR-' + i;
  data.patients.push({ id: patientId, fullName: 'Load Patient ' + i, identityNo: 'load-patient-' + i, email: patientId + '@audit.invalid', phone: '', password });
  for (const role of ['DOCTOR', 'PHARMACIST', 'ADMIN']) {
    const id = 'load-' + role + '-' + i;
    data.staff.push({ id, fullName: id, role, email: id + '@audit.invalid', identityNo: id, phone: '', password, status: 'ACTIVE' });
  }
  data.doctors.push({ id: doctorId, fullName: 'Load Doctor ' + i, email: doctorId + '@audit.invalid', phone: '', specialty: 'Test', department: { name: 'Test' }, room: '', hours: '09:00 - 17:00', consultationFee: 100, unavailableSlots: [], role: 'DOCTOR' });
}
const directory = path.join(__dirname, 'backups', 'load-' + Date.now());
fs.mkdirSync(directory, { recursive: true });
const dbPath = path.join(directory, 'db.json');
fs.writeFileSync(dbPath, JSON.stringify(data));
fs.writeFileSync(path.join(__dirname, 'load-db-path.txt'), dbPath);
console.log('Prepared 300 virtual clients (60 visitors plus 240 authenticated users) in an isolated database.');
