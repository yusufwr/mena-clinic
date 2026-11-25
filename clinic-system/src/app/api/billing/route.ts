import { guarded } from "@/lib/apiGuard";
import { getDb, withDb, jsonResponse, corsHeaders, handleError, HttpError, newId, parseToken, BillingChargeRecord, BillingPaymentEntry } from "@/lib/clinicDb";
import { logOperation } from "@/features/inventory/inventory.server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

const ALLOWED_CATEGORIES = ["CONSULTATION", "PROCEDURE", "SURGERY", "OTHER"] as const;
const ALLOWED_METHODS = ["CASH", "CARD", "TRANSFER", "OTHER"] as const;

function computeStatus(total: number, paid: number): "UNPAID" | "PARTIAL" | "PAID" {
  if (paid <= 0) return "UNPAID";
  if (paid >= total) return "PAID";
  return "PARTIAL";
}

async function handleGET(req: Request) {
  const url = new URL(req.url);
  const patientId = url.searchParams.get("patientId");
  const doctorId = url.searchParams.get("doctorId");
  const status = url.searchParams.get("status");

  const db = getDb();
  let list = [...(db.billingCharges || [])];
  if (patientId) list = list.filter((c) => c.patientId === patientId);
  if (doctorId) list = list.filter((c) => c.doctorId === doctorId);
  if (status) list = list.filter((c) => c.status === status);

  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return jsonResponse(list);
}

async function handlePOST(req: Request) {
  try {
    const body = await req.json();
    const title = String(body.title || "").trim();
    const totalAmount = Number(body.totalAmount);
    const initialPaid = body.paidAmount !== undefined ? Number(body.paidAmount) : 0;

    if (!body.patientId) throw new HttpError(400, "Hasta seçimi (patientId) zorunludur");
    if (!title) throw new HttpError(400, "Ödeme / işlem açıklaması zorunludur");
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) throw new HttpError(400, "Toplam tutar 0'dan büyük olmalıdır");
    if (!Number.isFinite(initialPaid) || initialPaid < 0 || initialPaid > totalAmount) {
      throw new HttpError(400, "Alınan tutar 0 ile toplam tutar arasında olmalıdır");
    }

    const category = ALLOWED_CATEGORIES.includes(body.category) ? body.category : "PROCEDURE";
    const method = ALLOWED_METHODS.includes(body.paymentMethod) ? body.paymentMethod : "CASH";

    const created = await withDb((db) => {
      const patient = db.patients.find((p) => p.id === body.patientId);
      if (!patient) throw new HttpError(404, "Hasta bulunamadı");

      const doctor = body.doctorId ? db.doctors.find((d) => d.id === body.doctorId) : undefined;
      const session = parseToken(req);
      const actor = db.staff.find((s) => s.id === session?.id)?.fullName || "Personel";
      const now = new Date().toISOString();

      const payments: BillingPaymentEntry[] = [];
      if (initialPaid > 0) {
        payments.push({
          id: newId("pay"),
          amount: initialPaid,
          method,
          note: body.paymentNote ? String(body.paymentNote).trim() : "İlk tahsilat",
          collectedBy: actor,
          createdAt: now,
        });
      }

      const remainingAmount = Math.max(0, totalAmount - initialPaid);
      const record: BillingChargeRecord = {
        id: newId("chg"),
        patientId: patient.id,
        patientName: patient.fullName,
        patientPhone: patient.phone,
        patientIdentityNo: patient.identityNo,
        doctorId: doctor?.id,
        doctorName: doctor?.fullName,
        appointmentId: body.appointmentId || undefined,
        medicalRecordId: body.medicalRecordId || undefined,
        title,
        category,
        totalAmount,
        paidAmount: initialPaid,
        remainingAmount,
        status: computeStatus(totalAmount, initialPaid),
        notes: body.notes ? String(body.notes).trim() : "",
        createdBy: actor,
        createdAt: now,
        updatedAt: now,
        payments,
      };

      (db.billingCharges ||= []).unshift(record);
      logOperation(db, req, "BILLING_CHARGE_CREATED", `${patient.fullName} - ${title}: ${initialPaid}/${totalAmount} SYP`);
      return record;
    });

    return jsonResponse(created, 201);
  } catch (err) {
    return handleError(err);
  }
}

export const GET = guarded(handleGET);
export const POST = guarded(handlePOST);
