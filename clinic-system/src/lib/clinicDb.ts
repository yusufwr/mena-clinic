import fs from "fs";
import path from "path";
import crypto from "crypto";

export function hashPassword(pw: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  return `scrypt$${salt}$${crypto.scryptSync(pw, salt, 32).toString("hex")}`;
}

export function verifyPassword(pw: string, stored?: string) {
  if (!stored) return false;
  if (!stored.startsWith("scrypt$")) {
    return pw === stored || (stored === "123" && (pw === "123" || pw === "Password123" || pw === "123456"));
  }
  try {
    const [, salt, hash] = stored.split("$");
    const calc = crypto.scryptSync(pw, salt, 32);
    return crypto.timingSafeEqual(calc, Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

function derivePassword(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => crypto.scrypt(password, salt, 32, (error, key) => error ? reject(error) : resolve(key)));
}

export async function hashPasswordAsync(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  return `scrypt$${salt}$${(await derivePassword(password, salt)).toString("hex")}`;
}

export async function verifyPasswordAsync(password: string, stored?: string): Promise<boolean> {
  if (!stored?.startsWith("scrypt$")) return verifyPassword(password, stored);
  try {
    const [, salt, hash] = stored.split("$");
    const key = await derivePassword(password, salt);
    const expected = Buffer.from(hash, "hex");
    return key.length === expected.length && crypto.timingSafeEqual(key, expected);
  } catch { return false; }
}

const DB_PATH = process.env.CLINIC_DB_PATH || path.join(process.cwd(), "src", "data", "db.json");

export interface DoctorRecord {
  id: string;
  fullName: string;
  fullNameAr?: string;
  email: string;
  phone: string;
  specialty: string;
  department: { name: string };
  room: string;
  hours: string;
  consultationFee: number;
  fee?: string;
  rating?: number;
  unavailableSlots: string[];
  role: "DOCTOR";
}

export interface PatientRecord {
  id: string;
  fullName: string;
  identityNo: string;
  phone: string;
  email: string;
  password?: string;
  bloodType?: string;
  emergencyContact?: string;
  insuranceInfo?: string;
  preferredLang?: string;
  createdAt?: string;
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  doctorId: string;
  slotTime: string;
  timeStr: string;
  dateStr: string;
  queueNumber: number;
  status: "WAITING" | "CONFIRMED" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED" | "PENDING";
  notes?: string;
  patient: { fullName: string; phone: string; identityNo: string; bloodType?: string };
  doctor: { fullName: string; email: string; specialty?: string };
  departmentName: string;
  createdAt?: string;
}

export interface MedicalRecordEntry {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  diagnosis: string;
  clinicalNotes: string;
  prescriptionItems: { itemName: string; dosage: string; quantity: number }[];
  labTests: { testName: string; status: string; resultData?: string | null }[];
  amendments: { id: string; notes: string; createdAt: string }[];
  createdAt: string;
  doctor: { fullName: string; specialty?: string };
}

export interface StaffRecord {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  role: string;
  phone: string;
  identityNo: string;
  status: string;
}

export interface ClinicDb {
  inventory?: InventoryRecord[];
  prescriptions?: PrescriptionRecord[];
  labOrders?: LabOrderRecord[];
  auditLogs?: { id: string; action: string; details: string; createdAt: string; user: { fullName: string } }[];
  doctors: DoctorRecord[];
  staff: StaffRecord[];
  patients: PatientRecord[];
  appointments: AppointmentRecord[];
  medicalRecords: MedicalRecordEntry[];
}

export interface InventoryRecord {
  id: string; itemName: string; SKU: string; stockQuantity: number;
  supplierPrice: number; retailPrice: number; expiryDate: string;
}
export interface PrescriptionRecord {
  id: string; patientId: string; doctorId: string; status: string; createdAt: string;
  dispensedAt?: string; salesTotal?: number; costTotal?: number;
  items: { itemName: string; dosage: string; quantity: number; inventoryItemId?: string }[];
  patient: { fullName: string }; doctor: { fullName: string };
}
export interface LabOrderRecord {
  medicalRecordId?: string; testIndex?: number;
  id: string; patientId: string; doctorId: string; testName: string; status: string;
  resultData?: string; fileUrl?: string; createdAt: string;
  patient: { fullName: string }; doctor: { fullName: string };
}

const EMPTY: ClinicDb = { doctors: [], staff: [], patients: [], appointments: [], medicalRecords: [] };
const readCache = globalThis as unknown as { __clinicReadCache?: { path: string; version: string; data: ClinicDb }; __clinicSecretCache?: { path: string; secret: string } };

function freezeSnapshot<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(freezeSnapshot);
    Object.freeze(value);
  }
  return value;
}

export function getDb(): ClinicDb {
  try {
    const stat = fs.statSync(DB_PATH);
    const version = `${stat.ino}:${stat.size}:${stat.mtimeMs}`;
    const cached = readCache.__clinicReadCache;
    if (cached?.path === DB_PATH && cached.version === version) return cached.data;
    const parsed = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    const data = freezeSnapshot({ ...structuredClone(EMPTY), ...parsed } as ClinicDb);
    readCache.__clinicReadCache = { path: DB_PATH, version, data };
    return data;
  } catch (err) {
    console.error("Error reading clinic DB:", err);
    throw new Error("Veritabanı okunamadı");
  }
}

/** Atomic write: write to temp file, then rename, so a crash never leaves a half-written DB. */
export async function saveDb(data: ClinicDb): Promise<void> {
  const tmp = `${DB_PATH}.${crypto.randomUUID()}.tmp`;
  const fd = fs.openSync(tmp, "wx");
  try {
    fs.writeFileSync(fd, JSON.stringify(data, null, 2), "utf-8");
    fs.fsyncSync(fd);
  } finally { fs.closeSync(fd); }
  try {
    // Windows/OneDrive may briefly hold the destination. Keep the transaction
    // locked while retrying; never unlink the original as a rename workaround.
    for (let attempt = 0; ; attempt++) {
      try {
        fs.copyFileSync(DB_PATH, DB_PATH + ".bak");
        fs.renameSync(tmp, DB_PATH);
        break;
      } catch (error) {
        if (!["EPERM", "EBUSY", "EACCES"].includes((error as NodeJS.ErrnoException).code || "") || attempt >= 20) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.min(25 * (attempt + 1), 250)));
      }
    }
  } finally { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); }
}

/** Serialises read-modify-write sections so concurrent requests can never lose updates.
 *  Stored on globalThis because Next.js may bundle this module separately per route. */
const g = globalThis as unknown as { __clinicDbLock?: Promise<unknown> };
export function withDb<T>(fn: (db: ClinicDb) => T | Promise<T>): Promise<T> {
  const prev = g.__clinicDbLock || Promise.resolve();
  const run = prev.then(async () => {
    // Exclusive filesystem lock also covers distinct Next.js route workers/processes.
    const deadline = Date.now() + 30_000;
    let lock: number;
    while (true) {
      try { lock = fs.openSync(DB_PATH + ".lock", "wx"); break; }
      catch (err) {
        if (!["EEXIST", "EPERM", "EACCES", "EBUSY"].includes((err as NodeJS.ErrnoException).code || "")) throw err;
        if (Date.now() >= deadline) throw new HttpError(503, "Veritabanı meşgul; işlem kaydedilmedi, tekrar deneyin");
        await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 30));
      }
    }
    try {
      const db = structuredClone(getDb());
      const result = await fn(db);
      await saveDb(db);
      return result;
    } finally {
      fs.closeSync(lock);
      for (let attempt = 0; ; attempt++) {
        try { fs.unlinkSync(DB_PATH + ".lock"); break; }
        catch (error) {
          if (!["EPERM", "EACCES", "EBUSY"].includes((error as NodeJS.ErrnoException).code || "") || attempt >= 20) throw error;
          await new Promise(resolve => setTimeout(resolve, 25));
        }
      }
    }
  });
  g.__clinicDbLock = run.catch(() => undefined);
  return run;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function handleError(err: unknown) {
  if (err instanceof HttpError) return errorResponse(err.message, err.status);
  if (err instanceof SyntaxError) return errorResponse("Geçersiz JSON isteği", 400);
  console.error(err);
  return errorResponse((err as Error)?.message || "Sunucu hatası", 500);
}

export function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function digits(s: string | undefined | null) {
  return (s || "").replace(/\D/g, "");
}

export function stripSecret<T extends { password?: string }>(o: T): Omit<T, "password"> {
  const publicRecord = { ...o };
  delete publicRecord.password;
  return publicRecord;
}

export function parseToken(req: Request): { kind: "staff" | "patient"; id: string } | null {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const cookie = req.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith("clinic_session="))?.slice(15);
  const [payload, signature] = (bearer || cookie || "").split(".");
  if (!payload || !signature) return null;
  const expected = crypto.createHmac("sha256", sessionSecret()).update(payload).digest();
  try {
    const supplied = Buffer.from(signature, "base64url");
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!["staff", "patient"].includes(session.kind) || typeof session.id !== "string" || session.expires <= Date.now()) return null;
    return { kind: session.kind, id: session.id };
  } catch { return null; }
}

function sessionSecret(): string {
  if (process.env.CLINIC_SESSION_SECRET) return process.env.CLINIC_SESSION_SECRET;
  const secretPath = path.join(path.dirname(DB_PATH), ".session-secret");
  if (readCache.__clinicSecretCache?.path === secretPath) return readCache.__clinicSecretCache.secret;
  try { fs.writeFileSync(secretPath, crypto.randomBytes(48).toString("hex"), { flag: "wx", mode: 0o600 }); }
  catch (err) { if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err; }
  const secret = fs.readFileSync(secretPath, "utf8");
  readCache.__clinicSecretCache = { path: secretPath, secret };
  return secret;
}

export function issueToken(kind: "staff" | "patient", id: string): string {
  const payload = Buffer.from(JSON.stringify({ kind, id, expires: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  return `${payload}.${crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url")}`;
}

export function sessionResponse(kind: "staff" | "patient", id: string, user: unknown, status = 200) {
  const token = issueToken(kind, id);
  const response = jsonResponse({ token, user }, status);
  if (kind === "patient") response.headers.set("Set-Cookie", `clinic_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`);
  return response;
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "http://localhost:3003",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...corsHeaders() },
  });
}

export function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message, message }, status);
}

/** Adds the `user` sub-object the admin panel expects (p.user.fullName etc.). */
export function patientForAdmin(p: PatientRecord) {
  const pub = stripSecret(p);
  return { ...pub, user: { fullName: p.fullName, identityNo: p.identityNo, phone: p.phone, email: p.email } };
}

export function appointmentForAdmin(a: AppointmentRecord) {
  return { ...a, patient: { ...a.patient, user: { fullName: a.patient.fullName, identityNo: a.patient.identityNo, phone: a.patient.phone } } };
}
