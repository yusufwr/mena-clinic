import { guarded } from "@/lib/apiGuard";
import { getDb, jsonResponse, parseToken, corsHeaders } from "@/lib/clinicDb";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export const GET = guarded(async request => {
  const db = getDb();
  const staff = db.staff.find(user => user.id === parseToken(request)?.id);
  const orders = (db.labOrders || []).filter(order => staff?.role !== "DOCTOR" || order.doctorId === staff.id);
  return jsonResponse(orders);
});
