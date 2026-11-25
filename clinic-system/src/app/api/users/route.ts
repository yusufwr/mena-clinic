import { guarded } from "@/lib/apiGuard";
import { getDb, withDb, jsonResponse, corsHeaders, stripSecret, hashPasswordAsync, HttpError, newId, handleError } from "@/lib/clinicDb";
import { logOperation } from "@/features/inventory/inventory.server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function handleGET() {
  const db = getDb();
  return jsonResponse(db.staff.map(stripSecret));
}

export const GET = guarded(handleGET);

export const POST = guarded(async (req) => {
  try {
    const body = await req.json();
    const roles = ["ADMIN", "DOCTOR", "RECEPTIONIST", "PHARMACIST", "LAB_TECH", "FINANCE", "ACCOUNTANT"];
    const email = String(body.email || "").trim().toLowerCase();
    const fullName = String(body.fullName || "").trim();
    const rawPw = String(body.password || "").trim();
    if (!email || !fullName || !roles.includes(body.role) || rawPw.length < 3) {
      throw new HttpError(400, "Ad soyad, geçerli e-posta, rol ve en az 3 karakterli şifre zorunludur");
    }

    const password = await hashPasswordAsync(rawPw);
    const staff = await withDb((db) => {
      if (db.staff.some((s) => s.email.toLowerCase() === email || (body.identityNo && s.identityNo === body.identityNo))) {
        throw new HttpError(409, "Bu e-posta veya kimlik numarasıyla personel zaten kayıtlı");
      }
      const id = body.role === "DOCTOR" ? newId("doc") : newId("staff");
      const phone = String(body.phone || "").trim();
      const identityNo = String(body.identityNo || "").trim() || `S${Date.now().toString().slice(-9)}`;
      const record = { id, email, password, fullName, role: body.role, phone, identityNo, status: "ACTIVE" };
      db.staff.push(record);

      if (body.role === "DOCTOR") {
        const fee = Number(body.consultationFee) || 1000;
        const spec = String(body.specialty || "Uzman Hekim").trim();
        db.doctors.push({
          id,
          fullName,
          fullNameAr: body.fullNameAr || fullName,
          email,
          phone,
          specialty: spec,
          department: { name: String(body.departmentName || spec.split("•")[0].trim() + " Kliniği") },
          room: String(body.room || "Poliklinik 101").trim(),
          hours: String(body.hours || "09:00 - 17:00").trim(),
          consultationFee: fee,
          fee: `${fee.toLocaleString("tr-TR")} SYP`,
          rating: 5,
          unavailableSlots: Array.isArray(body.unavailableSlots) ? body.unavailableSlots : ["12:00", "12:30"],
          availabilityStatus: "AVAILABLE",
          role: "DOCTOR",
        });
      }

      logOperation(db, req, "STAFF_CREATED", `${fullName} (${body.role})`);
      return stripSecret(record);
    });
    return jsonResponse(staff, 201);
  } catch (err) {
    return handleError(err);
  }
});
