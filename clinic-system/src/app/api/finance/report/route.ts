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
  return jsonResponse({
    totalRevenue: consultationRevenue + pharmacyRevenue,
    totalDiscounts: 0,
    estimatedProfit: consultationRevenue * 0.35 + pharmacyRevenue - pharmacyCost,
    lowStockItemsCount: (db.inventory || []).filter(i => i.stockQuantity < 10).length,
    todayRevenue: completed.filter(a => a.dateStr === today).reduce((sum, a) => sum + feeFor(a.doctorId), 0) + delivered.filter(p => p.dispensedAt?.slice(0, 10) === today).reduce((sum, p) => sum + (p.salesTotal ?? 0), 0),
    totalSalesCount: delivered.length,
    pendingPayments: 0,
    monthlyGrowth: "—",
    departmentBreakdown: db.doctors.map(d => ({ name: d.fullName, revenue: completed.filter(a => a.doctorId === d.id).length * d.consultationFee })),
    reportBasis: "Completed appointments at current consultation fees and recorded pharmacy sales; not a payment ledger",
  });
});
