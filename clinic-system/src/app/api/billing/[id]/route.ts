import { guarded } from "@/lib/apiGuard";
import { withDb, jsonResponse, corsHeaders, handleError, HttpError, newId, parseToken } from "@/lib/clinicDb";
import { logOperation } from "@/features/inventory/inventory.server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

const ALLOWED_METHODS = ["CASH", "CARD", "TRANSFER", "OTHER"] as const;

function computeStatus(total: number, paid: number): "UNPAID" | "PARTIAL" | "PAID" {
  if (paid <= 0) return "UNPAID";
  if (paid >= total) return "PAID";
  return "PARTIAL";
}

async function handlePUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    const updated = await withDb((db) => {
      const charge = (db.billingCharges || []).find((c) => c.id === params.id);
      if (!charge) throw new HttpError(404, "Ücret/borç kaydı bulunamadı");

      const session = parseToken(req);
      const actor = db.staff.find((s) => s.id === session?.id)?.fullName || "Danışma / Kasa";
      const now = new Date().toISOString();

      // Update totalAmount or title or notes if passed
      if (body.title !== undefined && String(body.title).trim()) {
        charge.title = String(body.title).trim();
      }
      if (body.notes !== undefined) {
        charge.notes = String(body.notes).trim();
      }
      if (body.totalAmount !== undefined) {
        const nextTotal = Number(body.totalAmount);
        if (!Number.isFinite(nextTotal) || nextTotal <= 0) throw new HttpError(400, "Geçersiz toplam tutar");
        if (nextTotal < charge.paidAmount) throw new HttpError(400, "Toplam tutar, halihazırda tahsil edilmiş tutardan küçük olamaz");
        charge.totalAmount = nextTotal;
      }

      // Option A: Reset to UNPAID (if mistakenly marked paid)
      if (body.resetPayments === true) {
        charge.payments = [];
        charge.paidAmount = 0;
        charge.remainingAmount = charge.totalAmount;
        charge.status = "UNPAID";
        charge.updatedAt = now;
        logOperation(db, req, "BILLING_PAYMENT_RESET", `${charge.patientName} - ${charge.title}`);
        return charge;
      }

      // Option B: Collect new payment (partial or full remaining)
      if (body.addPaymentAmount !== undefined) {
        const payAmt = Number(body.addPaymentAmount);
        if (!Number.isFinite(payAmt) || payAmt <= 0) {
          throw new HttpError(400, "Tahsilat tutarı 0'dan büyük olmalıdır");
        }
        if (payAmt > charge.remainingAmount) {
          throw new HttpError(400, `Tahsilat tutarı kalan borçtan (${charge.remainingAmount} SYP) fazla olamaz`);
        }

        const method = ALLOWED_METHODS.includes(body.paymentMethod) ? body.paymentMethod : "CASH";
        charge.payments.push({
          id: newId("pay"),
          amount: payAmt,
          method,
          note: body.paymentNote ? String(body.paymentNote).trim() : "",
          collectedBy: actor,
          createdAt: now,
        });

        charge.paidAmount = Math.min(charge.totalAmount, charge.paidAmount + payAmt);
        charge.remainingAmount = Math.max(0, charge.totalAmount - charge.paidAmount);
        charge.status = computeStatus(charge.totalAmount, charge.paidAmount);
        charge.updatedAt = now;

        logOperation(
          db,
          req,
          "BILLING_PAYMENT_COLLECTED",
          `${charge.patientName} - ${charge.title}: +${payAmt} SYP (Kalan: ${charge.remainingAmount} SYP)`
        );
        return charge;
      }

      // Recalculate in case totalAmount was edited
      charge.remainingAmount = Math.max(0, charge.totalAmount - charge.paidAmount);
      charge.status = computeStatus(charge.totalAmount, charge.paidAmount);
      charge.updatedAt = now;
      return charge;
    });

    return jsonResponse({ success: true, charge: updated });
  } catch (err) {
    return handleError(err);
  }
}

export const PUT = guarded(handlePUT);
