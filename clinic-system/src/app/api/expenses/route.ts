import { guarded } from "@/lib/apiGuard";
import { getDb, withDb, jsonResponse, corsHeaders, handleError, HttpError, newId, parseToken, ExpenseRecord } from "@/lib/clinicDb";
import { logOperation } from "@/features/inventory/inventory.server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

const CATEGORIES = ["CONSULTATION_EXPENSE", "MEDICAL_SUPPLIES", "OPERATIONAL", "OTHER"] as const;

async function handleGET(req: Request) {
  const doctorId = new URL(req.url).searchParams.get("doctorId");
  const db = getDb();
  let list = [...(db.expenses || [])];
  if (doctorId) list = list.filter((e) => e.doctorId === doctorId);
  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return jsonResponse(list);
}

async function handlePOST(req: Request) {
  try {
    const body = await req.json();
    const title = String(body.title || "").trim();
    const amount = Number(body.amount);
    if (!title) throw new HttpError(400, "Gider açıklaması zorunludur");
    if (!Number.isFinite(amount) || amount <= 0) throw new HttpError(400, "Gider tutarı 0'dan büyük olmalıdır");

    const category = CATEGORIES.includes(body.category) ? body.category : "CONSULTATION_EXPENSE";

    const created = await withDb((db) => {
      const session = parseToken(req);
      const actor = db.staff.find((s) => s.id === session?.id)?.fullName || "Muhasebe";
      const doc = body.doctorId ? db.doctors.find((d) => d.id === body.doctorId) : undefined;
      const rec: ExpenseRecord = {
        id: newId("exp"),
        title,
        category,
        doctorId: doc?.id,
        doctorName: doc?.fullName,
        amount,
        notes: body.notes ? String(body.notes).trim() : "",
        createdBy: actor,
        createdAt: new Date().toISOString(),
      };
      (db.expenses ||= []).unshift(rec);
      logOperation(db, req, "EXPENSE_RECORDED", `${title}: ${amount} SYP`);
      return rec;
    });

    return jsonResponse(created, 201);
  } catch (err) {
    return handleError(err);
  }
}

export const GET = guarded(handleGET);
export const POST = guarded(handlePOST);
