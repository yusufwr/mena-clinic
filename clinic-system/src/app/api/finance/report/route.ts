import { guarded } from "@/lib/apiGuard";
import { getDb, jsonResponse, corsHeaders } from "@/lib/clinicDb";

export const dynamic = "force-dynamic";
export async function OPTIONS() { return new Response(null, { status: 204, headers: corsHeaders() }); }

export const GET = guarded(async () => {
  const db = getDb();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  const completed = db.appointments.filter(a => a.status === "COMPLETED");
  const feeFor = (doctorId: string) => db.doctors.find(d => d.id === doctorId)?.consultationFee ?? 0;
  const delivered = (db.prescriptions || []).filter(p => p.status === "DISPENSED");
  const consultationRevenue = completed.reduce((sum, a) => sum + feeFor(a.doctorId), 0);
  const pharmacyRevenue = delivered.reduce((sum, p) => sum + (p.salesTotal ?? 0), 0);
  const pharmacyCost = delivered.reduce((sum, p) => sum + (p.costTotal ?? 0), 0);
  const billingCharges = db.billingCharges || [];
  const expenses = db.expenses || [];

  const procedureCollectedRevenue = billingCharges
    .filter(c => c.category !== "CONSULTATION")
    .reduce((sum, c) => sum + (c.paidAmount ?? 0), 0);
  const pendingReceivables = billingCharges.reduce((sum, c) => sum + (c.remainingAmount ?? 0), 0);
  const clinicExpensesTotal = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  const totalExpenses = pharmacyCost + clinicExpensesTotal;
  const totalRevenue = consultationRevenue + procedureCollectedRevenue + pharmacyRevenue;
  const netBalance = totalRevenue - totalExpenses;

  const todayBillingCollected = billingCharges
    .flatMap(c => c.category !== "CONSULTATION" ? (c.payments || []) : [])
    .filter(pay => pay.createdAt?.slice(0, 10) === today)
    .reduce((sum, pay) => sum + (pay.amount ?? 0), 0);

  return jsonResponse({
    currency: "SYP",
    totalRevenue,
    consultationRevenue,
    procedureCollectedRevenue,
    pharmacyRevenue,
    pharmacyCost,
    clinicExpensesTotal,
    totalExpenses,
    totalDiscounts: 0,
    estimatedProfit: netBalance,
    netBalance,
    lowStockItemsCount: (db.inventory || []).filter(i => i.stockQuantity < 10).length,
    todayRevenue:
      completed.filter(a => a.dateStr === today).reduce((sum, a) => sum + feeFor(a.doctorId), 0) +
      delivered.filter(p => p.dispensedAt?.slice(0, 10) === today).reduce((sum, p) => sum + (p.salesTotal ?? 0), 0) +
      todayBillingCollected,
    totalSalesCount: delivered.length,
    pendingPayments: pendingReceivables,
    monthlyGrowth: "—",
    departmentBreakdown: db.doctors.map(d => {
      const docConsult = completed.filter(a => a.doctorId === d.id).length * d.consultationFee;
      const docProc = billingCharges
        .filter(c => c.doctorId === d.id && c.category !== "CONSULTATION")
        .reduce((s, c) => s + (c.paidAmount ?? 0), 0);
      const docExpenses = expenses
        .filter(e => e.doctorId === d.id)
        .reduce((s, e) => s + (e.amount ?? 0), 0);
      return { name: d.fullName, revenue: docConsult + docProc, expenses: docExpenses, net: docConsult + docProc - docExpenses };
    }),
    reportBasis: "SYP cash accounting: consultation & procedure revenues minus recorded clinic & pharmacy expenses",
  });
});
