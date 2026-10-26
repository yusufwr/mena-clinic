import { guarded } from "@/lib/apiGuard";
import { getDb, withDb, jsonResponse, corsHeaders, stripSecret, hashPasswordAsync, HttpError, newId } from "@/lib/clinicDb";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function handleGET() {
  const db = getDb();
  return jsonResponse(db.staff.map(stripSecret));
}

export const GET = guarded(handleGET);

export const POST = guarded(async req => {
  const body = await req.json();
  const roles = ["ADMIN", "RECEPTIONIST", "PHARMACIST", "LAB_TECH", "FINANCE", "ACCOUNTANT"];
  const email = String(body.email || "").trim().toLowerCase();
  if (!email || !String(body.fullName || "").trim() || !roles.includes(body.role) || String(body.password || "").length < 6) throw new HttpError(400, "Geçersiz personel bilgileri; hekim eklemek için hekim ekranını kullanın");
  const password = await hashPasswordAsync(String(body.password));
  const staff = await withDb(db => {
    if (db.staff.some(s => s.email.toLowerCase() === email || (body.identityNo && s.identityNo === body.identityNo))) throw new HttpError(409, "Personel zaten kayıtlı");
    const record = { id: newId("staff"), email, password, fullName: String(body.fullName).trim(), role: body.role, phone: String(body.phone || ""), identityNo: String(body.identityNo || ""), status: "ACTIVE" };
    db.staff.push(record);
    return stripSecret(record);
  });
  return jsonResponse(staff, 201);
});
