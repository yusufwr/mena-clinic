/* Isolated tests: never write to the real clinic database. Run from repository root. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const Module = require('node:module');
const ts = require('../clinic-system/node_modules/typescript');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'clinic-system/src/data/db.json');
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const originalHash = hash(source);
if (process.argv[2] === 'worker') {
  // Child processes share the parent's isolated path, never the live database.
  process.env.CLINIC_DB_PATH = process.argv[3];
}
const directory = path.join(__dirname, 'backups', 'isolated-' + Date.now());
fs.mkdirSync(directory, { recursive: true });
if (process.argv[2] !== 'worker') {
  process.env.CLINIC_DB_PATH = path.join(directory, 'db.json');
  fs.copyFileSync(source, process.env.CLINIC_DB_PATH);
}
const resolve = Module._resolveFilename;
Module._resolveFilename = function(name, ...args) {
  return resolve.call(this, name.startsWith('@/') ? path.join(root, 'clinic-system/src', name.slice(2)) : name, ...args);
};
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
}).outputText, filename);
const db = require('../clinic-system/src/lib/clinicDb.ts');
const route = name => require('../clinic-system/src/app/api/' + name + '/route.ts');
const results = [];
async function test(name, action) {
  const start = performance.now();
  await action();
  results.push({ name, passed: true, durationMs: Math.round(performance.now() - start) });
  console.log('PASS ' + name);
}
const tokens = {};
function req(feature, method = 'GET', body, role = 'ADMIN') {
  return new Request('http://localhost:3000/api/' + feature, { method, headers: {
    'Content-Type': 'application/json', ...(tokens[role] ? { Authorization: 'Bearer ' + tokens[role] } : {})
  }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
async function main() {
  if (process.argv[2] === 'worker') {
    for (let i = 0; i < 75; i++) await db.withDb(data => {
      (data.auditLogs ||= []).push({ id: `worker-${process.pid}-${i}`, action: 'AUDIT_TEST', details: 'isolated test', createdAt: new Date().toISOString(), user: { fullName: 'Test' } });
    });
    return;
  }
  await db.withDb(data => {
    for (const role of ['ADMIN', 'DOCTOR', 'PHARMACIST', 'LAB_TECH', 'RECEPTIONIST']) {
      const id = 'audit-' + role;
      data.staff.push({ id, role, email: id + '@audit.invalid', password: db.hashPassword('Audit-Password-123'), fullName: id, phone: '', identityNo: id, status: 'ACTIVE' });
      tokens[role] = db.issueToken('staff', id);
    }
    data.doctors.push({ id:'audit-DOCTOR',fullName:'Audit Doctor',email:'audit@audit.invalid',phone:'',specialty:'Test',department:{name:'Test'},room:'',hours:'09:00 - 17:00',consultationFee:100,unavailableSlots:[],role:'DOCTOR' });
    data.patients.push({ id:'audit-patient',fullName:'Audit Patient',identityNo:'audit-patient',email:'patient@audit.invalid',phone:'',password:db.hashPassword('Audit-Password-123') });
    tokens.PATIENT = db.issueToken('patient', 'audit-patient');
  });
  await test('Authentication: valid login, wrong password, forged and expired tokens', async () => {
    assert.equal((await route('auth/login').POST(req('auth/login','POST',{email:'audit-ADMIN@audit.invalid',password:'Audit-Password-123'}))).status,200);
    assert.equal((await route('auth/login').POST(req('auth/login','POST',{email:'audit-ADMIN@audit.invalid',password:'wrong'}))).status,401);
    assert.equal((await route('patients').GET(req('patients','GET',undefined,'NONE'))).status,401);
    const forged=req('patients');forged.headers.set('Authorization','Bearer token_staff_audit-ADMIN_123');
    assert.equal((await route('patients').GET(forged)).status,401);
    const expiredPayload=Buffer.from(JSON.stringify({kind:'staff',id:'audit-ADMIN',expires:1})).toString('base64url');
    const secret=fs.readFileSync(path.join(directory,'.session-secret'),'utf8');
    const expired=req('patients');expired.headers.set('Authorization','Bearer '+expiredPayload+'.'+crypto.createHmac('sha256',secret).update(expiredPayload).digest('base64url'));
    assert.equal((await route('patients').GET(expired)).status,401);
  });
  await test('Role access and patient isolation, secret redaction', async () => {
    assert.equal((await route('users').GET(req('users','GET',undefined,'PHARMACIST'))).status,403);
    const staff=await (await route('users').GET(req('users'))).json();assert.ok(staff.every(s=>!('password' in s)));
    assert.equal((await route('medical-records/patient/[id]').GET(req('medical-records/patient/other','GET',undefined,'PATIENT'),{params:{id:'other'}})).status,403);
    const patientAppointments=await (await route('appointments').GET(req('appointments','GET',undefined,'PATIENT'))).json();
    assert.ok(patientAppointments.every(a=>a.patientId==='audit-patient'));
    assert.equal((await route('patients/lookup').GET(req('patients/lookup?q=audit-patient','GET',undefined,'PATIENT'))).status,200);
    assert.equal((await route('patients/lookup').GET(req('patients/lookup?q='+encodeURIComponent(db.getDb().patients.find(p=>p.id!=='audit-patient').identityNo),'GET',undefined,'PATIENT'))).status,403);
    assert.equal((await route('medical-records/[id]/pdf').GET(req('medical-records/missing/pdf'),{params:{id:'missing'}})).status,404);
  });
  await test('300 concurrent writes: all unique patient registrations persist', async () => {
    const before=db.getDb().patients.length;
    const responses=await Promise.all(Array.from({length:300},(_,i)=>route('patients').POST(req('patients','POST',{fullName:'Audit '+i,identityNo:'audit-'+i,email:'audit-'+i+'@audit.invalid',password:'Audit-Password-123'}))));
    assert.ok(responses.every(r=>r.status===201));
    assert.equal(db.getDb().patients.length,before+300);
    assert.equal(new Set(db.getDb().patients.map(p=>p.id)).size,db.getDb().patients.length);
  });
  await test('Four separate processes: 300 writes persist without lost updates', async () => {
    const { fork } = require('node:child_process');
    const before = db.getDb().auditLogs?.length || 0;
    await Promise.all(Array.from({ length: 4 }, () => new Promise((resolve, reject) => {
      const child = fork(__filename, ['worker', process.env.CLINIC_DB_PATH], { stdio: 'pipe' });
      let errors = '';
      child.stderr.on('data', chunk => errors += chunk);
      child.on('error', reject);
      child.on('exit', code => code === 0 ? resolve() : reject(new Error(errors || 'Worker exit ' + code)));
    })));
    assert.equal(db.getDb().auditLogs.length, before + 300);
  });
  await test('Transaction failure rolls back, temporary Windows file lock retries safely', async () => {
    const before = hash(process.env.CLINIC_DB_PATH);
    await assert.rejects(db.withDb(data => { data.patients.length = 0; throw new Error('test rollback'); }));
    assert.equal(hash(process.env.CLINIC_DB_PATH), before);
    const rename = fs.renameSync;
    let retries = 0;
    fs.renameSync = (...args) => { if (retries++ < 3) { const error = new Error('simulated Windows sharing lock'); error.code = 'EPERM'; throw error; } return rename(...args); };
    try { await db.withDb(() => undefined); } finally { fs.renameSync = rename; }
    assert.equal(retries, 4);
    assert.equal(hash(process.env.CLINIC_DB_PATH), before);
  });
  await test('300 concurrent bookings for one slot: exactly one accepted', async () => {
    const body={patientId:'audit-patient',doctorId:'audit-DOCTOR',dateStr:'2098-01-15',timeStr:'10:00'};
    const responses=await Promise.all(Array.from({length:300},()=>route('appointments').POST(req('appointments','POST',body,'PATIENT'))));
    assert.equal(responses.filter(r=>r.status===201).length,1);
    assert.equal(responses.filter(r=>r.status===409).length,299);
  });
  await test('Medical encounter creates prescription and lab order atomically', async () => {
    const appointment=db.getDb().appointments.find(a=>a.patientId==='audit-patient');
    const response=await route('medical-records').POST(req('medical-records','POST',{patientId:'audit-patient',doctorId:'audit-DOCTOR',appointmentId:appointment.id,diagnosis:'Test only',prescriptionItems:[{itemName:'Audit medication',dosage:'test',quantity:2}],labTests:[{testName:'Audit lab'}]},'DOCTOR'));
    assert.equal(response.status,201);
    assert.equal(db.getDb().appointments.find(a=>a.id===appointment.id).status,'COMPLETED');
    assert.ok(db.getDb().labOrders.some(l=>l.patientId==='audit-patient'));
    const duplicate = await route('medical-records').POST(req('medical-records','POST',{patientId:'audit-patient',doctorId:'audit-DOCTOR',appointmentId:appointment.id,diagnosis:'Duplicate test'},'DOCTOR'));
    assert.equal(duplicate.status,409);
  });
  await test('300 concurrent dispensings: stock changes only once, never below zero', async () => {
    assert.equal((await route('inventory').POST(req('inventory','POST',{itemName:'Audit medication',SKU:'AUDIT',stockQuantity:5,supplierPrice:1,retailPrice:2,expiryDate:'2098-01-01'},'PHARMACIST'))).status,201);
    const prescription=db.getDb().prescriptions.find(p=>p.patientId==='audit-patient');
    const responses=await Promise.all(Array.from({length:300},()=>route('prescriptions/[id]/dispense').PUT(req('prescriptions/'+prescription.id+'/dispense','PUT',undefined,'PHARMACIST'),{params:{id:prescription.id}})));
    assert.equal(responses.filter(r=>r.status===200).length,1);
    assert.equal(responses.filter(r=>r.status===409).length,299);
    assert.equal(db.getDb().inventory.find(i=>i.SKU==='AUDIT').stockQuantity,3);
  });
  await test('Lab results update patient record, fee update persists, invalid dates rejected', async () => {
    const lab=db.getDb().labOrders.find(l=>l.patientId==='audit-patient');
    assert.equal((await route('lab-orders/[id]').PUT(req('lab-orders/'+lab.id,'PUT',{resultData:'Test result'},'LAB_TECH'),{params:{id:lab.id}})).status,200);
    assert.equal(db.getDb().medicalRecords.find(r=>r.id===lab.medicalRecordId).labTests[lab.testIndex].resultData,'Test result');
    assert.equal((await route('doctors/[id]').PUT(req('doctors/audit-DOCTOR','PUT',{consultationFee:123}),{params:{id:'audit-DOCTOR'}})).status,200);
    assert.equal(db.getDb().doctors.find(d=>d.id==='audit-DOCTOR').consultationFee,123);
    assert.equal((await route('appointments').POST(req('appointments','POST',{patientId:'audit-patient',doctorId:'audit-DOCTOR',dateStr:'2098-02-31',timeStr:'10:00'}))).status,400);
  });
  await test('300 mixed concurrent visitors, patients, doctors, pharmacists and administrators', async () => {
    const calls=[()=>route('doctors').GET(req('doctors','GET',undefined,'NONE')),()=>route('appointments').GET(req('appointments','GET',undefined,'PATIENT')),()=>route('medical-records').GET(req('medical-records','GET',undefined,'DOCTOR')),()=>route('inventory').GET(req('inventory','GET',undefined,'PHARMACIST')),()=>route('users').GET(req('users'))];
    const responses=await Promise.all(Array.from({length:300},(_,i)=>calls[i%calls.length]()));assert.ok(responses.every(r=>r.status===200));
  });
  await test('Live HTTP: 300 concurrent requests across ports 3000 and 3003', async () => {
    const urls=['http://127.0.0.1:3000/api/doctors','http://127.0.0.1:3003/'];
    for(const url of urls)assert.equal((await fetch(url)).status,200);
    const times=[];
    const statuses=await Promise.all(Array.from({length:300},async(_,i)=>{const start=performance.now();const response=await fetch(urls[i%2]);await response.text();times.push(performance.now()-start);return response.status;}));
    assert.ok(statuses.every(s=>s===200));times.sort((a,b)=>a-b);
    results.push({name:'Live HTTP latency',requests:300,p50Ms:Math.round(times[149]),p95Ms:Math.round(times[284]),maxMs:Math.round(times[299])});
  });
  assert.equal(hash(source),originalHash,'Live data must remain byte-for-byte unchanged');
  const report={date:new Date().toISOString(),liveDataUnchanged:true,results,limitations:['Handler concurrency and HTTP request bursts are not 300 real browser sessions or a sustained production capacity certification.','Isolated fixture data only; legacy browser localStorage is neither deleted nor imported.']};
  fs.writeFileSync(path.join(__dirname,'verification-results.json'),JSON.stringify(report,null,2));
  console.log('Live database unchanged. Report: audit/verification-results.json');
}
main().catch(err=>{console.error(err);process.exitCode=1;});
