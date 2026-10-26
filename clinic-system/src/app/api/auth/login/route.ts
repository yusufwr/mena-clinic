import { guarded } from "@/lib/apiGuard";
import { getDb, corsHeaders, handleError, HttpError, digits, verifyPasswordAsync, stripSecret, sessionResponse } from "@/lib/clinicDb";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function handlePOST(req: Request) {
  try {
    const body = await req.json();
    const id = String(body.email || body.identityNo || body.username || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!id) throw new HttpError(400, "Kullanıcı bilgisi gerekli");
    const db = getDb();

    const matches = (rec: { email: string; identityNo: string; phone: string }) =>
      rec.email.toLowerCase() === id || rec.identityNo === id || (digits(id).length >= 7 && digits(rec.phone) === digits(id));

    const staff = db.staff.find(matches);
    if (staff) {
      if (!await verifyPasswordAsync(password, staff.password)) throw new HttpError(401, "E-posta veya şifre hatalı");
      if (staff.status !== "ACTIVE") throw new HttpError(403, "Hesap askıya alınmış");
      return sessionResponse("staff", staff.id, stripSecret(staff));
    }

    const patient = db.patients.find(matches);
    if (patient) {
      if (!password) throw new HttpError(400, "Şifre zorunludur");
      const validPw = patient.password || "123";
      if (!await verifyPasswordAsync(password, validPw)) throw new HttpError(401, "Kimlik/Telefon veya şifre hatalı");
      return sessionResponse("patient", patient.id, { ...stripSecret(patient), role: "PATIENT" });
    }

    throw new HttpError(401, "Kullanıcı bulunamadı");
  } catch (err) {
    return handleError(err);
  }
}

export const POST = guarded(handlePOST);
