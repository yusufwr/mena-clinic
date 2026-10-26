import { guarded } from "@/lib/apiGuard";
import { withDb, jsonResponse, HttpError, newId, parseToken, corsHeaders } from "@/lib/clinicDb";
export async function OPTIONS() { return new Response(null, { status: 204, headers: corsHeaders() }); }
export const POST = guarded(async (req, { params }) => {
  const body = await req.json();
  if (!String(body.notes || "").trim()) throw new HttpError(400, "Ek not zorunludur");
  return jsonResponse(await withDb(db => {
    const record = db.medicalRecords.find(r => r.id === params.id);
    if (!record) throw new HttpError(404, "Kayıt bulunamadı");
    const user = db.staff.find(s => s.id === parseToken(req)?.id);
    if (user?.role === "DOCTOR" && record.doctorId !== user.id) throw new HttpError(403, "Erişim yetkiniz yok");
    record.amendments.push({ id: newId("am"), notes: String(body.notes).trim(), createdAt: new Date().toISOString() });
    return { success: true, record };
  }));
});
