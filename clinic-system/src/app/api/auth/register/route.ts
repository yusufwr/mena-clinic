import { guarded } from "@/lib/apiGuard";
import { withDb, corsHeaders, handleError, HttpError, PatientRecord, newId, hashPasswordAsync, stripSecret, sessionResponse } from "@/lib/clinicDb";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function handlePOST(req: Request) {
  try {
    const body = await req.json();
    const fullName = String(body.fullName || "").trim();
    const identityNo = String(body.identityNo || "").trim();
    const phone = String(body.phone || "").trim();
    if (!fullName || !identityNo) throw new HttpError(400, "fullName ve identityNo zorunludur");
    if (!body.password || String(body.password).length < 6) throw new HttpError(400, "Şifre en az 6 karakter olmalı");
    if (identityNo.length < 5) throw new HttpError(400, "identityNo çok kısa");

    const password = await hashPasswordAsync(String(body.password));
    const patient = await withDb((db) => {
      const existing = db.patients.find((p) => p.identityNo === identityNo || (body.email && p.email.toLowerCase() === String(body.email).trim().toLowerCase()));
      if (existing) throw new HttpError(409, "Bu kimlik numarasıyla kayıtlı hasta zaten var");
      const p: PatientRecord = {
        id: newId("pat"),
        fullName,
        identityNo,
        phone,
        email: String(body.email || "").trim() || `${identityNo}@patient.menaclinic.com`,
        password: password,
        bloodType: body.bloodType || undefined,
        emergencyContact: body.emergencyContact || undefined,
        insuranceInfo: body.insuranceInfo || undefined,
        preferredLang: body.preferredLang || undefined,
        createdAt: new Date().toISOString(),
      };
      db.patients.push(p);
      return p;
    });

    return sessionResponse("patient", patient.id, { ...stripSecret(patient), role: "PATIENT" }, 201);
  } catch (err) {
    return handleError(err);
  }
}

export const POST = guarded(handlePOST);
