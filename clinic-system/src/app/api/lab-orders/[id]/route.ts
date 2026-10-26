import { guarded } from "@/lib/apiGuard";
import { withDb, jsonResponse, HttpError, corsHeaders } from "@/lib/clinicDb";
import { logOperation } from "@/features/inventory/inventory.server";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export const PUT = guarded(async (request, { params }) => {
  const body = await request.json();
  if (!String(body.resultData || "").trim()) throw new HttpError(400, "Sonuç zorunludur");
  const result = await withDb(db => {
    const lab = db.labOrders?.find(order => order.id === params.id);
    if (!lab) throw new HttpError(404, "Tetkik bulunamadı");
    lab.resultData = String(body.resultData);
    lab.status = "COMPLETED";
    const record = db.medicalRecords.find(record => record.id === lab.medicalRecordId);
    const test = record?.labTests[lab.testIndex ?? -1];
    if (test) {
      test.status = "COMPLETED";
      test.resultData = lab.resultData;
    }
    logOperation(db, request, "LAB_RESULT_UPDATED", lab.id);
    return { success: true, labOrder: lab };
  });
  return jsonResponse(result);
});
