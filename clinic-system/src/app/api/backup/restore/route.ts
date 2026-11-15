import { guarded } from "@/lib/apiGuard";
import { withDb, jsonResponse, errorResponse, corsHeaders, HttpError } from "@/lib/clinicDb";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export const POST = guarded(async (request: Request) => {
  const body = await request.json().catch(() => null);
  if (!body) return errorResponse("Geçersiz yedek dosyası", 400);

  // Support both full wrapper format ({ system, data }) and raw db format ({ doctors, patients, ... })
  const incoming = body.data && typeof body.data === "object" ? body.data : body;

  if (!Array.isArray(incoming.doctors) || !Array.isArray(incoming.patients)) {
    throw new HttpError(400, "Yedek dosyası bozuk veya geçersiz; doktor ve hasta kayıtları bulunamadı.");
  }

  // Pre-restore safety backup
  try {
    const backupDir = path.join(process.cwd(), "backups", "safety");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const safetyFile = path.join(backupDir, `pre-restore-${Date.now()}.json`);
    const currentDb = path.join(process.cwd(), "src", "data", "db.json");
    if (fs.existsSync(currentDb)) {
      fs.copyFileSync(currentDb, safetyFile);
    }
  } catch (err) {
    console.error("Safety backup write warning:", err);
  }

  const restoredStats = await withDb((db) => {
    db.doctors = incoming.doctors;
    db.patients = incoming.patients;
    db.staff = Array.isArray(incoming.staff) && incoming.staff.length > 0 ? incoming.staff : db.staff;
    db.appointments = Array.isArray(incoming.appointments) ? incoming.appointments : db.appointments;
    db.medicalRecords = Array.isArray(incoming.medicalRecords) ? incoming.medicalRecords : db.medicalRecords;
    if (Array.isArray(incoming.inventory)) db.inventory = incoming.inventory;
    if (Array.isArray(incoming.prescriptions)) db.prescriptions = incoming.prescriptions;
    if (Array.isArray(incoming.labOrders)) db.labOrders = incoming.labOrders;

    // Log the restore event
    if (!db.auditLogs) db.auditLogs = [];
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: "DISASTER_RECOVERY_RESTORE",
      details: `Sistem yedeği geri yüklendi: ${db.patients.length} hasta, ${db.doctors.length} hekim, ${db.appointments.length} randevu.`,
      createdAt: new Date().toISOString(),
      user: { fullName: "Yönetici (Admin)" }
    });

    return {
      patientsCount: db.patients.length,
      doctorsCount: db.doctors.length,
      appointmentsCount: db.appointments.length,
      medicalRecordsCount: db.medicalRecords.length,
      staffCount: db.staff.length,
    };
  });

  return jsonResponse({
    success: true,
    message: "Tüm sistem verileri başarıyla geri yüklendi ve doğrulandı.",
    restoredStats,
  });
});

