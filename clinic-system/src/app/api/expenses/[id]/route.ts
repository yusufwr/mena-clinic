import { guarded } from "@/lib/apiGuard";
import { withDb, jsonResponse, corsHeaders, handleError, HttpError } from "@/lib/clinicDb";
import { logOperation } from "@/features/inventory/inventory.server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export const DELETE = guarded(async (req, { params }) => {
  try {
    await withDb((db) => {
      const idx = (db.expenses || []).findIndex((e) => e.id === params.id);
      if (idx === -1) throw new HttpError(404, "Gider kaydı bulunamadı");
      const removed = db.expenses![idx];
      db.expenses!.splice(idx, 1);
      logOperation(db, req, "EXPENSE_DELETED", `${removed.title}: ${removed.amount} SYP`);
    });
    return jsonResponse({ success: true });
  } catch (err) {
    return handleError(err);
  }
});
