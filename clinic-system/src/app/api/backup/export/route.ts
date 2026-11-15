import { guarded } from "@/lib/apiGuard";
import { getDb, jsonResponse, corsHeaders } from "@/lib/clinicDb";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export const GET = guarded(async () => {
  const db = getDb();
  const exportedAt = new Date().toISOString();
  const dateStr = exportedAt.slice(0, 10);

  const payload = {
    system: "Mena Clinic Aleppo HIS",
    backupVersion: "1.0",
    exportedAt,
    stats: {
      patientsCount: (db.patients || []).length,
      doctorsCount: (db.doctors || []).length,
      appointmentsCount: (db.appointments || []).length,
      medicalRecordsCount: (db.medicalRecords || []).length,
      staffCount: (db.staff || []).length,
      inventoryCount: (db.inventory || []).length,
      prescriptionsCount: (db.prescriptions || []).length,
      labOrdersCount: (db.labOrders || []).length,
    },
    data: db,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const checksum = crypto.createHash("sha256").update(jsonStr).digest("hex");
  const fullBackup = { ...payload, checksum };

  // Also maintain an automated server-side snapshot in backups/
  try {
    const backupDir = path.join(process.cwd(), "backups", "daily");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const backupFilePath = path.join(backupDir, `mena-clinic-backup-${dateStr}.json`);
    fs.writeFileSync(backupFilePath, JSON.stringify(fullBackup, null, 2), "utf8");
  } catch (err) {
    console.error("Auto backup file write warning:", err);
  }

  return jsonResponse(fullBackup);
});

