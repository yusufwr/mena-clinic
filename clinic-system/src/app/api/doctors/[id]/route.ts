import { guarded } from "@/lib/apiGuard";
import { withDb, jsonResponse, HttpError, corsHeaders, handleError, DoctorAvailabilityStatus, parseToken, hashPasswordAsync } from "@/lib/clinicDb";
import { logOperation } from "@/features/inventory/inventory.server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

const ALLOWED_AVAILABILITY: DoctorAvailabilityStatus[] = ["AVAILABLE", "EVENING_SHIFT", "ON_LEAVE", "EMERGENCY_ONLY"];

export const PUT = guarded(async (req, { params }) => {
  try {
    const body = await req.json();
    let hashedPw: string | undefined;
    if (body.password !== undefined && String(body.password).trim() !== "") {
      const rawPw = String(body.password).trim();
      if (rawPw.length < 3) throw new HttpError(400, "Şifre en az 3 karakter olmalıdır");
      hashedPw = await hashPasswordAsync(rawPw);
    }

    return jsonResponse(
      await withDb((db) => {
        const session = parseToken(req);
        const caller = db.staff.find((s) => s.id === session?.id);
        if (hashedPw && caller?.role !== "ADMIN") {
          throw new HttpError(403, "Şifre değiştirme yetkisi yalnızca yöneticidedir");
        }

        const doctor = db.doctors.find((d) => d.id === params.id);
        if (!doctor) throw new HttpError(404, "Hekim bulunamadı");

        if (body.fullName !== undefined && String(body.fullName).trim()) {
          doctor.fullName = String(body.fullName).trim();
        }
        if (body.email !== undefined && String(body.email).trim()) {
          const nextEmail = String(body.email).trim().toLowerCase();
          if (db.staff.some((s) => s.id !== doctor.id && s.email.toLowerCase() === nextEmail)) {
            throw new HttpError(409, "Bu e-posta başka bir personel tarafından kullanılıyor");
          }
          doctor.email = nextEmail;
        }
        if (body.consultationFee !== undefined) {
          const fee = Number(body.consultationFee);
          if (!Number.isFinite(fee) || fee < 0) throw new HttpError(400, "Geçersiz muayene ücreti");
          doctor.consultationFee = fee;
          doctor.fee = `${fee.toLocaleString("tr-TR")} SYP`;
        }
        if (body.hours !== undefined && String(body.hours).trim()) {
          doctor.hours = String(body.hours).trim();
        }
        if (body.room !== undefined) {
          doctor.room = String(body.room).trim();
        }
        if (body.phone !== undefined) {
          doctor.phone = String(body.phone).trim();
        }
        if (body.specialty !== undefined && String(body.specialty).trim()) {
          doctor.specialty = String(body.specialty).trim();
          doctor.department = { name: doctor.specialty.split("•")[0].trim() + " Kliniği" };
        }
        if (Array.isArray(body.unavailableSlots)) {
          doctor.unavailableSlots = body.unavailableSlots.map(String);
        }
        if (body.availabilityStatus !== undefined) {
          if (!ALLOWED_AVAILABILITY.includes(body.availabilityStatus)) {
            throw new HttpError(400, "Geçersiz müsaitlik durumu");
          }
          doctor.availabilityStatus = body.availabilityStatus;
        }
        if (body.availabilityNote !== undefined) {
          doctor.availabilityNote = String(body.availabilityNote).trim();
        }

        // Sync linked staff account (email, phone, name, and password if ADMIN updated it)
        const linkedStaff = db.staff.find((s) => s.id === doctor.id);
        if (linkedStaff) {
          linkedStaff.email = doctor.email;
          linkedStaff.phone = doctor.phone;
          if (body.fullName !== undefined && String(body.fullName).trim()) {
            linkedStaff.fullName = doctor.fullName;
          }
          if (hashedPw) {
            linkedStaff.password = hashedPw;
          }
        }

        logOperation(
          db,
          req,
          hashedPw ? "DOCTOR_CREDENTIALS_UPDATED" : "DOCTOR_PROFILE_OR_SCHEDULE_UPDATED",
          `${doctor.fullName} (${doctor.availabilityStatus || "AVAILABLE"} • ${doctor.consultationFee} SYP)`
        );
        return doctor;
      })
    );
  } catch (err) {
    return handleError(err);
  }
});
