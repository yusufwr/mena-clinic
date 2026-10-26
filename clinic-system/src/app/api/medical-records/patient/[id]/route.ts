import { guarded } from "@/lib/apiGuard";
import { getDb, jsonResponse, corsHeaders } from "@/lib/clinicDb";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function handleGET(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const list = (db.medicalRecords || []).filter((r) => r.patientId === params.id && (!new URL(req.url).searchParams.get("doctorId") || r.doctorId === new URL(req.url).searchParams.get("doctorId")));
  return jsonResponse(list);
}

export const GET = guarded(handleGET);
