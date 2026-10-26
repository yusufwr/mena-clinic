import { guarded } from "@/lib/apiGuard";
import { withDb, jsonResponse, HttpError, corsHeaders } from "@/lib/clinicDb";
export async function OPTIONS() { return new Response(null, { status: 204, headers: corsHeaders() }); }
export const PUT = guarded(async (req, { params }) => {
  const body = await req.json();
  const fee = Number(body.consultationFee);
  if (!Number.isFinite(fee) || fee < 0) throw new HttpError(400, "Geçersiz muayene ücreti");
  return jsonResponse(await withDb(db => {
    const doctor = db.doctors.find(d => d.id === params.id);
    if (!doctor) throw new HttpError(404, "Hekim bulunamadı");
    doctor.consultationFee = fee;
    doctor.fee = `${fee.toLocaleString("tr-TR")} SYP`;
    return doctor;
  }));
});
