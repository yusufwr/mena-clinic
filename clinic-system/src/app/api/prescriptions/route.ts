import { guarded } from "@/lib/apiGuard";
import { getDb, jsonResponse, parseToken, corsHeaders } from "@/lib/clinicDb";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export const GET = guarded(async request => {
  const db = getDb();
  const session = parseToken(request);
  const staff = db.staff.find(user => user.id === session?.id);
  const prescriptions = (db.prescriptions || [])
    .filter(prescription => staff?.role !== "DOCTOR" || prescription.doctorId === staff.id)
    .map(prescription => ({
      ...prescription,
      items: prescription.items.map(item => ({
        ...item,
        inventoryItem: db.inventory?.find(stock => item.inventoryItemId ? stock.id === item.inventoryItemId : stock.itemName === item.itemName),
      })),
    }));
  return jsonResponse(prescriptions);
});
