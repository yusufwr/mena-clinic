import { guarded } from "@/lib/apiGuard";
import { getDb, withDb, jsonResponse, corsHeaders, handleError, HttpError, DoctorRecord, newId, hashPasswordAsync } from "@/lib/clinicDb";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function handleGET() {
  return jsonResponse(getDb().doctors);
}

async function handlePOST(req: Request) {
  try {
    const body = await req.json();
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (!fullName || !email) throw new HttpError(400, "fullName ve email zorunludur");
    if (!body.password || String(body.password).length < 6) throw new HttpError(400, "Şifre en az 6 karakter olmalı");

    const password = await hashPasswordAsync(String(body.password));
    const doctor = await withDb((db) => {
      if (db.staff.some((s) => s.email.toLowerCase() === email)) throw new HttpError(409, "Bu e-posta zaten kullanılıyor");
      const id = newId("doc");
      const fee = Number(body.consultationFee) || 1200;
      const d: DoctorRecord = {
        id,
        fullName,
        fullNameAr: body.fullNameAr || fullName,
        email,
        phone: body.phone || "",
        specialty: body.specialty || "Genel Tıp",
        department: { name: body.departmentName || body.specialty || "Poliklinik" },
        room: body.room || "",
        hours: body.hours || "09:00 - 17:00",
        consultationFee: fee,
        fee: body.fee || `${fee.toLocaleString("tr-TR")} SYP`,
        rating: 5,
        unavailableSlots: Array.isArray(body.unavailableSlots) ? body.unavailableSlots : [],
        role: "DOCTOR",
      };
      db.doctors.push(d);
      db.staff.push({
        id,
        email,
        password: password,
        fullName,
        role: "DOCTOR",
        phone: d.phone,
        identityNo: body.identityNo || `D${Date.now().toString().slice(-9)}`,
        status: "ACTIVE",
      });
      return d;
    });
    return jsonResponse(doctor, 201);
  } catch (err) {
    return handleError(err);
  }
}

export const GET = guarded(handleGET);
export const POST = guarded(handlePOST);
