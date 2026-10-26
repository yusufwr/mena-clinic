import { guarded } from "@/lib/apiGuard";
import { withDb, jsonResponse, corsHeaders, handleError, HttpError } from "@/lib/clinicDb";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

const ALLOWED = ["WAITING", "CONFIRMED", "IN_CONSULTATION", "COMPLETED", "CANCELLED", "PENDING"];

async function handlePUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    if (!ALLOWED.includes(body.status)) throw new HttpError(400, "Geçersiz durum");
    const app = await withDb((db) => {
      const a = db.appointments.find((x) => x.id === params.id);
      if (!a) throw new HttpError(404, "Randevu bulunamadı");
      if (a.status === "CANCELLED" && body.status !== "CANCELLED" && db.appointments.some(x => x.id !== a.id && x.status !== "CANCELLED" && x.dateStr === a.dateStr && x.timeStr === a.timeStr && (x.doctorId === a.doctorId || x.patientId === a.patientId))) throw new HttpError(409, "Bu saat başka bir randevu tarafından alındı");
      a.status = body.status;
      return a;
    });
    return jsonResponse({ success: true, appointment: app });
  } catch (err) {
    return handleError(err);
  }
}

export const PUT = guarded(handlePUT);
