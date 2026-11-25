import { guarded } from "@/lib/apiGuard";
import { withDb, jsonResponse, corsHeaders, handleError, HttpError, hashPasswordAsync, stripSecret } from "@/lib/clinicDb";
import { logOperation } from "@/features/inventory/inventory.server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

const VALID_ROLES = ["ADMIN", "DOCTOR", "RECEPTIONIST", "PHARMACIST", "LAB_TECH", "FINANCE", "ACCOUNTANT"];
const VALID_STATUS = ["ACTIVE", "SUSPENDED"];

async function handlePUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    let hashedPw: string | undefined;
    if (body.password !== undefined && String(body.password).trim() !== "") {
      const rawPw = String(body.password).trim();
      if (rawPw.length < 3) throw new HttpError(400, "Yeni şifre en az 3 karakter olmalıdır");
      hashedPw = await hashPasswordAsync(rawPw);
    }

    const updated = await withDb((db) => {
      const staff = db.staff.find((s) => s.id === params.id);
      if (!staff) throw new HttpError(404, "Personel hesabı bulunamadı");

      if (body.email !== undefined) {
        const nextEmail = String(body.email).trim().toLowerCase();
        if (!nextEmail) throw new HttpError(400, "E-posta boş olamaz");
        if (db.staff.some((s) => s.id !== staff.id && s.email.toLowerCase() === nextEmail)) {
          throw new HttpError(409, "Bu e-posta adresi başka bir personel tarafından kullanılıyor");
        }
        staff.email = nextEmail;
      }

      if (body.fullName !== undefined && String(body.fullName).trim()) {
        staff.fullName = String(body.fullName).trim();
      }
      if (body.phone !== undefined) {
        staff.phone = String(body.phone).trim();
      }
      if (body.identityNo !== undefined) {
        staff.identityNo = String(body.identityNo).trim();
      }
      if (body.role !== undefined) {
        if (!VALID_ROLES.includes(body.role)) throw new HttpError(400, "Geçersiz rol");
        staff.role = body.role;
      }
      if (body.status !== undefined) {
        if (!VALID_STATUS.includes(body.status)) throw new HttpError(400, "Geçersiz hesap durumu");
        staff.status = body.status;
      }
      if (hashedPw) {
        staff.password = hashedPw;
      }

      // Sync or create linked doctor profile when applicable
      let linkedDoctor = db.doctors.find((d) => d.id === staff.id);
      if (staff.role === "DOCTOR" && !linkedDoctor) {
        const fee = body.consultationFee !== undefined ? Number(body.consultationFee) : 1000;
        const spec = String(body.specialty || "Uzman Hekim").trim();
        linkedDoctor = {
          id: staff.id,
          fullName: staff.fullName.split("(")[0].trim() || staff.fullName,
          fullNameAr: staff.fullName,
          email: staff.email,
          phone: staff.phone,
          specialty: spec,
          department: { name: spec.split("•")[0].trim() + " Kliniği" },
          room: String(body.room || "Poliklinik 101").trim(),
          hours: String(body.hours || "09:00 - 17:00").trim(),
          consultationFee: Number.isFinite(fee) && fee >= 0 ? fee : 1000,
          fee: `${(Number.isFinite(fee) && fee >= 0 ? fee : 1000).toLocaleString("tr-TR")} SYP`,
          rating: 5,
          unavailableSlots: ["12:00", "12:30"],
          availabilityStatus: "AVAILABLE",
          role: "DOCTOR",
        };
        db.doctors.push(linkedDoctor);
      } else if (linkedDoctor) {
        linkedDoctor.email = staff.email;
        linkedDoctor.phone = staff.phone;
        if (body.fullName !== undefined && String(body.fullName).trim()) {
          linkedDoctor.fullName = staff.fullName.split("(")[0].trim() || staff.fullName;
        }
        if (body.consultationFee !== undefined) {
          const fee = Number(body.consultationFee);
          if (!Number.isFinite(fee) || fee < 0) throw new HttpError(400, "Geçersiz muayene ücreti");
          linkedDoctor.consultationFee = fee;
          linkedDoctor.fee = `${fee.toLocaleString("tr-TR")} SYP`;
        }
        if (body.specialty !== undefined && String(body.specialty).trim()) {
          linkedDoctor.specialty = String(body.specialty).trim();
          linkedDoctor.department = { name: linkedDoctor.specialty.split("•")[0].trim() + " Kliniği" };
        }
        if (body.room !== undefined) linkedDoctor.room = String(body.room).trim();
        if (body.hours !== undefined && String(body.hours).trim()) linkedDoctor.hours = String(body.hours).trim();
      }

      logOperation(
        db,
        req,
        hashedPw ? "STAFF_PASSWORD_UPDATED" : "STAFF_PROFILE_UPDATED",
        `${staff.fullName} (${staff.role})`
      );

      return stripSecret(staff);
    });

    return jsonResponse({ success: true, user: updated });
  } catch (err) {
    return handleError(err);
  }
}

export const PUT = guarded(handlePUT);

async function handleDELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await withDb((db) => {
      const idx = db.staff.findIndex((s) => s.id === params.id);
      if (idx === -1) throw new HttpError(404, "Personel hesabı bulunamadı");
      const [removed] = db.staff.splice(idx, 1);
      const docIdx = db.doctors.findIndex((d) => d.id === params.id);
      if (docIdx !== -1) db.doctors.splice(docIdx, 1);
      logOperation(db, req, "STAFF_DELETED", `${removed.fullName} (${removed.role})`);
    });
    return jsonResponse({ success: true });
  } catch (err) {
    return handleError(err);
  }
}

export const DELETE = guarded(handleDELETE);
