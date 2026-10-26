import { guarded } from "@/lib/apiGuard";
import { getDb, withDb, jsonResponse, corsHeaders, handleError, HttpError, PatientRecord, newId, patientForAdmin, hashPasswordAsync } from "@/lib/clinicDb";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function handleGET() {
  return jsonResponse(getDb().patients.map(patientForAdmin));
}

/** Reception desk walk-in registration */
async function handlePOST(req: Request) {
  try {
    const body = await req.json();
    const identityNo = String(body.identityNo || "").trim();
    const fullName = String(body.fullName || "").trim();
    if (!identityNo || !fullName) throw new HttpError(400, "fullName ve identityNo zorunludur");
    const password = await hashPasswordAsync(String(body.password || "123"));
    const p = await withDb((db) => {
      if (db.patients.some((x) => x.identityNo === identityNo)) throw new HttpError(409, "Bu kimlik numarası zaten kayıtlı");
      const rec: PatientRecord = {
        id: newId("pat"),
        fullName,
        identityNo,
        phone: String(body.phone || "").trim(),
        email: String(body.email || "").trim() || `${identityNo}@patient.menaclinic.com`,
        bloodType: body.bloodType || undefined,
        emergencyContact: body.emergencyContact || undefined,
        insuranceInfo: body.insuranceInfo || undefined,
        password: password,
        createdAt: new Date().toISOString(),
      };
      db.patients.push(rec);
      return rec;
    });
    return jsonResponse(patientForAdmin(p), 201);
  } catch (err) {
    return handleError(err);
  }
}

export const GET = guarded(handleGET);
export const POST = guarded(handlePOST);
