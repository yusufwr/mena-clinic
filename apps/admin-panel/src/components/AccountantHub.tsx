import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Pill,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Building2,
  Receipt,
  Plus,
  Trash2,
} from "lucide-react";
import { AdminTranslations, tr3 } from "../i18n";
import { DoctorModel, apiFetch, API_URL } from "../apiClient";

interface ExpenseItem {
  id: string;
  title: string;
  category: "CONSULTATION_EXPENSE" | "MEDICAL_SUPPLIES" | "UTILITIES" | "SALARY" | "MAINTENANCE" | "OTHER";
  amount: number;
  doctorId?: string;
  doctorName?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

interface AccountantHubProps {
  doctors: DoctorModel[];
  appointments: any[];
  prescriptions: any[];
  inventory: any[];
  financialStats: {
    todayRevenue: number;
    pendingInvoices: number;
    totalPatients: number;
    monthlyRevenue?: number;
  };
  t: AdminTranslations;
  lang: string;
}

export const AccountantHub: React.FC<AccountantHubProps> = ({
  doctors,
  appointments,
  prescriptions,
  inventory,
  t,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<"doctors" | "expenses" | "pharmacy">("doctors");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("ALL");
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [billingCharges, setBillingCharges] = useState<any[]>([]);
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "CONSULTATION_EXPENSE" as ExpenseItem["category"],
    amount: "",
    doctorId: "",
    notes: "",
  });
  const [expenseMsg, setExpenseMsg] = useState<string>("");

  const loadAccountingExtras = async () => {
    try {
      const [expRes, billRes] = await Promise.all([
        apiFetch(`${API_URL}/expenses`),
        apiFetch(`${API_URL}/billing`),
      ]);
      if (expRes.ok) {
        const expData = await expRes.json();
        if (Array.isArray(expData)) setExpenses(expData);
      }
      if (billRes.ok) {
        const billData = await billRes.json();
        if (Array.isArray(billData)) setBillingCharges(billData);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadAccountingExtras();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseMsg("");
    try {
      const res = await apiFetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: expenseForm.title,
          category: expenseForm.category,
          amount: Number(expenseForm.amount),
          doctorId: expenseForm.doctorId || undefined,
          notes: expenseForm.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || tr3(lang, "Gider kaydedilemedi", "تعذر تسجيل المصروف", "Could not save expense"));
      setExpenseForm({
        title: "",
        category: "CONSULTATION_EXPENSE",
        amount: "",
        doctorId: "",
        notes: "",
      });
      setExpenseMsg(tr3(lang, "Gider kaydı Suriye Lirası (SYP) olarak eklendi.", "تم تسجيل المصروف بالليرة السورية بنجاح!", "Expense recorded in Syrian Pounds (SYP)."));
      loadAccountingExtras();
    } catch (err: any) {
      setExpenseMsg(err.message || tr3(lang, "Hata oluştu", "حدث خطأ", "An error occurred"));
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await apiFetch(`${API_URL}/expenses/${id}`, { method: "DELETE" });
      if (res.ok) loadAccountingExtras();
    } catch {
      // ignore
    }
  };

  // Doctor-by-doctor Income & Expenses (NO percentage split!)
  const doctorSummaries = doctors.map((doc) => {
    const docAppts = appointments.filter(
      (a) => a.status === "COMPLETED" && (a.doctorId === doc.id || a.doctor?.fullName === doc.fullName)
    );
    const patientCount = docAppts.length;
    const fee = doc.consultationFee ?? 0;
    const consultationIncome = patientCount * fee;
    const extraCollectedIncome = billingCharges
      .filter((b) => b.doctorId === doc.id)
      .reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    const grossRevenue = consultationIncome + extraCollectedIncome;

    const docExpenses = expenses
      .filter((ex) => ex.doctorId === doc.id)
      .reduce((sum, ex) => sum + (ex.amount || 0), 0);

    const netIncome = grossRevenue - docExpenses;

    return {
      doctor: doc,
      patientCount,
      fee,
      consultationIncome,
      extraCollectedIncome,
      grossRevenue,
      docExpenses,
      netIncome,
      appointments: docAppts,
    };
  });

  // General (unassigned) clinic expenses + doctor-linked expenses
  const generalClinicIncome = billingCharges
    .filter((b) => !b.doctorId)
    .reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const totalGrossRevenue =
    doctorSummaries.reduce((sum, d) => sum + d.grossRevenue, 0) + generalClinicIncome;
  const totalClinicExpenses = expenses.reduce((sum, ex) => sum + (ex.amount || 0), 0);
  const totalNetConsultationBalance = totalGrossRevenue - totalClinicExpenses;
  const totalPatientsServed = doctorSummaries.reduce((sum, d) => sum + d.patientCount, 0);

  // Pharmacy calculations (100% SYP)
  const totalMedicationItems = inventory.reduce((sum, item) => sum + (item.stockQuantity ?? 0), 0);
  const totalInventoryValuation = inventory.reduce(
    (sum, item) => sum + (item.stockQuantity ?? 0) * (item.supplierPrice ?? 0),
    0
  );
  const pharmacyGrossSales = prescriptions
    .filter((p) => p.status === "DISPENSED")
    .reduce((sum, p) => sum + (p.salesTotal ?? 0), 0);
  const pharmacyCostOfGoods = prescriptions
    .filter((p) => p.status === "DISPENSED")
    .reduce((sum, p) => sum + (p.costTotal ?? 0), 0);
  const pharmacyGrossProfit = pharmacyGrossSales - pharmacyCostOfGoods;

  const selectedDoctorSummary =
    selectedDoctorId === "ALL"
      ? null
      : doctorSummaries.find((d) => d.doctor.id === selectedDoctorId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#FAF7F2] via-[#F4EFE6] to-[#FAF7F2] border border-[#E5DCD0] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#4A2E1B] flex items-center justify-center text-[#EFE8DC] shadow-sm">
              <Receipt className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFE8DC] border border-[#E5DCD0] text-[#4A2E1B] text-[11px] font-semibold uppercase mb-1">
                <span>Mena Clinic</span> • <span>{t.roleAccountant}</span> • <span>{t.currency}</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#2C1810]">{t.accountantTitle}</h2>
              <p className="text-sm text-[#6E492D] mt-0.5">{t.accountantSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#D5C7B5] hover:bg-[#FAF7F2] text-[#4A2E1B] text-sm font-semibold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-[#B8860B]" />
              <span>{t.printReport}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#382214] text-white text-sm font-semibold transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              <span>{t.downloadPdf}</span>
            </button>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex flex-wrap items-center gap-2 mt-6 border-b border-[#E5DCD0] pb-2">
          <button
            onClick={() => setActiveTab("doctors")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "doctors"
                ? "bg-[#4A2E1B] text-[#FAF7F2] shadow-sm"
                : "text-[#6E492D] hover:bg-[#EFE8DC]/60"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{t.doctorFinancialReports}</span>
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "expenses"
                ? "bg-[#4A2E1B] text-[#FAF7F2] shadow-sm"
                : "text-[#6E492D] hover:bg-[#EFE8DC]/60"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>
              {tr3(lang, `Muayene & Klinik Giderleri (${expenses.length})`, `سجل المصاريف والنفقات (${expenses.length})`, `Consultation & Clinic Expenses (${expenses.length})`)}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("pharmacy")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "pharmacy"
                ? "bg-[#4A2E1B] text-[#FAF7F2] shadow-sm"
                : "text-[#6E492D] hover:bg-[#EFE8DC]/60"
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>{t.pharmacyFinancialReport}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CONSULTATION INCOME & EXPENSE SUMMARY (NO PERCENTAGE SPLITS) */}
      {activeTab === "doctors" && (
        <div className="space-y-6">
          {/* Top KPI Cards (All in SYP, Cash Only, Income vs Expense vs Net) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-[#E5DCD0] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8C6D53] mb-2 uppercase tracking-wide">
                <span>{t.patientCount}</span>
                <UserCheck className="w-4 h-4 text-[#B8860B]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#2C1810]">
                {totalPatientsServed}{" "}
                <span className="text-xs font-normal text-[#8C6D53]">
                  {tr3(lang, "hasta", "مريض", "patients")}
                </span>
              </div>
              <div className="text-xs text-emerald-700 mt-2 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {tr3(lang, "Tamamlanan nakit muayeneler", "معاينات مكتملة (نقداً)", "Completed cash consultations")}
                </span>
              </div>
            </div>

            <div className="bg-white border border-[#E5DCD0] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8C6D53] mb-2 uppercase tracking-wide">
                <span>{tr3(lang, "Toplam Muayene & İşlem Geliri", "إجمالي الإيرادات النقدية", "Total Consultation & Procedure Income")}</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-serif font-bold text-emerald-700">
                {totalGrossRevenue.toLocaleString("tr-TR")}{" "}
                <span className="text-xs font-normal text-emerald-700">{t.currency}</span>
              </div>
              <div className="text-xs text-[#8C6D53] mt-2">
                {tr3(lang, "Nakit muayene + ek işlem tahsilatı", "جميع التحصيلات نقداً بالليرة السورية", "Cash consultations + extra procedure collections")}
              </div>
            </div>

            <div className="bg-white border border-[#E5DCD0] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8C6D53] mb-2 uppercase tracking-wide">
                <span>{tr3(lang, "Muayene & Klinik Giderleri", "مصاريف المعاينات والمركز", "Consultation & Clinic Expenses")}</span>
                <TrendingDown className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-serif font-bold text-rose-700">
                {totalClinicExpenses.toLocaleString("tr-TR")}{" "}
                <span className="text-xs font-normal text-rose-700">{t.currency}</span>
              </div>
              <div className="text-xs text-[#8C6D53] mt-2 flex items-center justify-between">
                <span>{tr3(lang, "Kayıtlı poliklinik ve sarf giderleri", "إجمالي المصروفات المسجلة", "Recorded clinic & supply expenses")}</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("expenses")}
                  className="text-[#4A2E1B] underline font-bold"
                >
                  {tr3(lang, "+ Gider Ekle", "+ إضافة مصروف", "+ Add Expense")}
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#E5DCD0] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8C6D53] mb-2 uppercase tracking-wide">
                <span>{tr3(lang, "Net Gelir (Gelir - Gider)", "صافي الرصيد النقدي", "Net Balance (Income - Expense)")}</span>
                <DollarSign className="w-4 h-4 text-[#B8860B]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#4A2E1B]">
                {totalNetConsultationBalance.toLocaleString("tr-TR")}{" "}
                <span className="text-xs font-normal text-[#4A2E1B]">{t.currency}</span>
              </div>
              <div className="text-xs text-[#8C6D53] mt-2">
                {tr3(lang, "Toplam nakit gelir eksi giderler", "الإيرادات مطروحاً منها المصاريف", "Total cash income minus expenses")}
              </div>
            </div>
          </div>

          {/* Doctor Filter Control */}
          <div className="bg-white border border-[#E5DCD0] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#4A2E1B]">
              <Filter className="w-4 h-4 text-[#B8860B]" />
              <span>{t.selectDoctor}</span>
            </div>
            <div className="w-full sm:w-80">
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C7B5] bg-[#FAF7F2] text-sm text-[#2C1810] font-medium focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
              >
                <option value="ALL">🌟 {t.allDoctors}</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.fullName} ({doc.department?.name || tr3(lang, "Poliklinik", "عيادة", "Clinic")})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Individual Doctor Breakdown or Master Table (NO percentage columns) */}
          {selectedDoctorSummary ? (
            <div className="bg-white border border-[#E5DCD0] rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DCD0] pb-4">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EFE8DC] text-[#4A2E1B]">
                    {selectedDoctorSummary.doctor.department?.name}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-[#2C1810] mt-1">
                    {selectedDoctorSummary.doctor.fullName}
                  </h3>
                  <p className="text-xs text-[#8C6D53]">
                    {selectedDoctorSummary.doctor.email} • {selectedDoctorSummary.doctor.department?.name || tr3(lang, "Poliklinik", "عيادة", "Clinic")}
                  </p>
                </div>
                <div className="text-right rtl:text-left">
                  <div className="text-xs text-[#8C6D53]">{t.consultationFee}</div>
                  <div className="text-xl font-bold font-serif text-[#4A2E1B]">
                    {selectedDoctorSummary.fee.toLocaleString("tr-TR")} {t.currency}
                  </div>
                </div>
              </div>

              {/* Income / Expense / Net Cards for this Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl p-4">
                  <div className="text-xs text-[#8C6D53]">{t.patientCount}</div>
                  <div className="text-2xl font-serif font-bold text-[#2C1810] mt-1">
                    {selectedDoctorSummary.patientCount}
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    {tr3(lang, "Tamamlanan muayene", "معاينة مكتملة", "Completed visits")}
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="text-xs text-emerald-800 font-semibold">
                    {tr3(lang, "Toplam Muayene & İşlem Geliri", "إجمالي الإيراد (نقداً)", "Total Consultation & Extra Income")}
                  </div>
                  <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">
                    {selectedDoctorSummary.grossRevenue.toLocaleString("tr-TR")} {t.currency}
                  </div>
                  <div className="text-xs text-emerald-700 mt-1">
                    {tr3(lang, "Muayene:", "المعاينة:", "Consult:")} {selectedDoctorSummary.consultationIncome.toLocaleString("tr-TR")} {t.currency}
                    {selectedDoctorSummary.extraCollectedIncome > 0
                      ? ` + ${tr3(lang, "Ek:", "إضافي:", "Extra:")} ${selectedDoctorSummary.extraCollectedIncome.toLocaleString("tr-TR")} ${t.currency}`
                      : ""}
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <div className="text-xs text-rose-800 font-semibold">
                    {tr3(lang, "Poliklinik / Muayene Gideri", "مصاريف العيادة", "Clinic / Consultation Expenses")}
                  </div>
                  <div className="text-2xl font-serif font-bold text-rose-700 mt-1">
                    {selectedDoctorSummary.docExpenses.toLocaleString("tr-TR")} {t.currency}
                  </div>
                  <div className="text-xs text-rose-700 mt-1">
                    {tr3(lang, "Bu polikliniğe ait giderler", "المصاريف المسجلة", "Expenses linked to this clinic")}
                  </div>
                </div>

                <div className="bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl p-4">
                  <div className="text-xs text-[#4A2E1B] font-semibold">
                    {tr3(lang, "Net Gelir (Gelir - Gider)", "صافي الإيراد", "Net Balance (Income - Expense)")}
                  </div>
                  <div className="text-2xl font-serif font-bold text-[#2C1810] mt-1">
                    {selectedDoctorSummary.netIncome.toLocaleString("tr-TR")} {t.currency}
                  </div>
                  <div className="text-xs text-[#7D6E63] mt-1">
                    {tr3(lang, "Suriye Lirası (Nakit)", "نقداً بالليرة السورية", "Syrian Pounds (Cash)")}
                  </div>
                </div>
              </div>

              {/* Patient Visits Breakdown Table (Cash Only, No Percentage Columns) */}
              <div>
                <h4 className="text-sm font-bold text-[#4A2E1B] mb-3 uppercase tracking-wide">
                  {tr3(lang, "Bu Hekimin Hasta Muayene Gelir Dökümü (Nakit • SYP)", "تفاصيل إيرادات معاينات هذا الطبيب (نقداً بالليرة السورية)", "Patient Consultation Cash Breakdown for This Doctor (SYP)")}
                </h4>
                <div className="overflow-x-auto border border-[#E5DCD0] rounded-xl">
                  <table className="w-full min-w-[600px] text-left rtl:text-right text-sm">
                    <thead className="bg-[#FAF7F2] text-[#6E492D] text-xs uppercase font-semibold border-b border-[#E5DCD0]">
                      <tr>
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">{t.patientName}</th>
                        <th className="py-3 px-4">
                          {tr3(lang, "Muayene Tarihi", "تاريخ المعاينة", "Visit Date")}
                        </th>
                        <th className="py-3 px-4">
                          {tr3(lang, "Muayene Geliri", "مبلغ الإيراد", "Consultation Income")}
                        </th>
                        <th className="py-3 px-4">
                          {tr3(lang, "Tahsilat", "الدفع", "Collection")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DCD0] text-[#2C1810]">
                      {selectedDoctorSummary.appointments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-xs text-[#7D6E63] italic">
                            {tr3(lang, "Henüz tamamlanmış muayene kaydı bulunmuyor.", "لا توجد معاينات مكتملة مسجلة بعد.", "No completed consultation records yet.")}
                          </td>
                        </tr>
                      ) : (
                        selectedDoctorSummary.appointments.map((appt: any, idx: number) => {
                          const patientName = appt?.patient?.fullName || appt?.patient?.user?.fullName || `#${idx + 1}`;
                          const rawDate = appt?.dateStr || appt?.slotTime || appt?.scheduledAt;
                          const date = rawDate
                            ? new Date(rawDate).toLocaleDateString(lang === "ar" ? "ar-SY" : lang === "en" ? "en-US" : "tr-TR")
                            : "-";
                          return (
                            <tr key={appt?.id || idx} className="hover:bg-[#FAF7F2]/60 transition-colors">
                              <td className="py-3 px-4 text-xs font-mono text-stone-500">#{idx + 1}</td>
                              <td className="py-3 px-4 font-medium">{patientName}</td>
                              <td className="py-3 px-4 text-xs text-stone-600">{date}</td>
                              <td className="py-3 px-4 font-bold text-emerald-700 font-mono">
                                {selectedDoctorSummary.fee.toLocaleString("tr-TR")} {t.currency}
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                  {tr3(lang, "Nakit", "نقداً", "Cash")}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* MASTER ALL-DOCTORS INCOME & EXPENSE TABLE (NO PERCENTAGES) */
            <div className="bg-white border border-[#E5DCD0] rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#E5DCD0] bg-[#FAF7F2] flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold font-serif text-[#2C1810]">
                    {tr3(lang, "Poliklinik Muayene Gelirleri & Giderleri İcmal Tablosu (SYP)", "جدول إيرادات ومصاريف المعاينات بالليرة السورية", "Consolidated Clinic Income & Expenses Table (SYP)")}
                  </h4>
                  <p className="text-xs text-[#8C6D53]">
                    {tr3(lang, "Tüm tutarlar Suriye Lirası (SYP) cinsinden nakit gelir ve gider olarak listelenmektedir", "جميع المبالغ معروضة بالليرة السورية (نقداً) دون نسب توزيع", "All amounts are listed in Syrian Pounds (SYP) as cash income and expenses")}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFE8DC] text-[#4A2E1B]">
                  {doctors.length} {tr3(lang, "Kayıtlı Hekim", "أطباء مسجلون", "Registered Doctors")}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left rtl:text-right text-sm">
                  <thead className="bg-[#FAF7F2] text-[#6E492D] text-xs uppercase font-semibold border-b border-[#E5DCD0]">
                    <tr>
                      <th className="py-3.5 px-4">{t.roleDoctor}</th>
                      <th className="py-3.5 px-4">{t.allDepartments}</th>
                      <th className="py-3.5 px-4">{t.consultationFee}</th>
                      <th className="py-3.5 px-4">{t.patientCount}</th>
                      <th className="py-3.5 px-4 text-emerald-700">
                        {tr3(lang, "Muayene & İşlem Geliri", "الإيرادات", "Income")}
                      </th>
                      <th className="py-3.5 px-4 text-rose-700">
                        {tr3(lang, "Poliklinik Giderleri", "المصاريف", "Expenses")}
                      </th>
                      <th className="py-3.5 px-4 text-[#2C1810]">
                        {tr3(lang, "Net Gelir", "الصافي", "Net Balance")}
                      </th>
                      <th className="py-3.5 px-4">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DCD0] text-[#2C1810]">
                    {doctorSummaries.map((summary) => (
                      <tr key={summary.doctor.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#2C1810]">
                          {summary.doctor.fullName}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#6E492D]">
                          {summary.doctor.department?.name || tr3(lang, "Poliklinik", "عيادة", "Clinic")}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium">
                          {summary.fee.toLocaleString("tr-TR")} {t.currency}
                        </td>
                        <td className="py-3.5 px-4 font-semibold">{summary.patientCount}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700 font-mono">
                          {summary.grossRevenue.toLocaleString("tr-TR")} {t.currency}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-rose-700 font-mono">
                          {summary.docExpenses.toLocaleString("tr-TR")} {t.currency}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#2C1810] font-mono">
                          {summary.netIncome.toLocaleString("tr-TR")} {t.currency}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setSelectedDoctorId(summary.doctor.id)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-[#EFE8DC] hover:bg-[#D5C7B5] text-[#4A2E1B] font-semibold transition-colors"
                          >
                            {tr3(lang, "Ayrıntı Gör", "التفاصيل", "View Details")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#EFE8DC]/60 font-bold border-t-2 border-[#D5C7B5] text-[#2C1810]">
                    <tr>
                      <td className="py-3.5 px-4 text-xs uppercase" colSpan={3}>
                        {tr3(lang, "Genel Toplam (Klinik Genel Dahil)", "المجموع الكلي (شاملاً العام)", "Grand Total (Including General Clinic)")}
                      </td>
                      <td className="py-3.5 px-4">{totalPatientsServed}</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-mono">
                        {totalGrossRevenue.toLocaleString("tr-TR")} {t.currency}
                      </td>
                      <td className="py-3.5 px-4 text-rose-700 font-mono">
                        {totalClinicExpenses.toLocaleString("tr-TR")} {t.currency}
                      </td>
                      <td className="py-3.5 px-4 text-[#2C1810] font-mono">
                        {totalNetConsultationBalance.toLocaleString("tr-TR")} {t.currency}
                      </td>
                      <td className="py-3.5 px-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLINIC & CONSULTATION EXPENSES LEDGER */}
      {activeTab === "expenses" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Expense Form */}
          <div className="bg-white border border-[#E5DCD0] rounded-2xl p-5 shadow-sm space-y-4 h-fit">
            <div className="flex items-center gap-2 border-b border-[#E5DCD0] pb-3">
              <Plus className="w-4 h-4 text-rose-600" />
              <h3 className="text-base font-serif font-bold text-[#2C1810]">
                {tr3(lang, "Yeni Muayene / Klinik Gideri Ekle", "تسجيل مصروف جديد (ل.س)", "Add New Consultation / Clinic Expense")}
              </h3>
            </div>

            {expenseMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                {expenseMsg}
              </div>
            )}

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Gider Açıklaması *", "وصف المصروف *", "Expense Description *")}</label>
                <input
                  type="text"
                  required
                  placeholder={tr3(lang, "Örn: Muayene sarf malzemesi, elektrik, sterilizasyon...", "مثال: مستلزمات معاينة، تعقيم، كهرباء...", "e.g., Examination supplies, sterilization, utilities...")}
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Kategori", "الفئة", "Category")}</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1]"
                  >
                    <option value="CONSULTATION_EXPENSE">{tr3(lang, "Muayene Gideri", "مصروف معاينة", "Consultation Expense")}</option>
                    <option value="MEDICAL_SUPPLIES">{tr3(lang, "Tıbbi Sarf Malzeme", "مستلزمات طبية", "Medical Supplies")}</option>
                    <option value="UTILITIES">{tr3(lang, "Fatura / İşletme", "فواتير وتشغيل", "Utilities & Operations")}</option>
                    <option value="MAINTENANCE">{tr3(lang, "Bakım / Cihaz", "صيانة وأجهزة", "Equipment & Maintenance")}</option>
                    <option value="SALARY">{tr3(lang, "Personel Ödemesi", "رواتب وأجور", "Staff Payment")}</option>
                    <option value="OTHER">{tr3(lang, "Diğer Gider", "مصاريف أخرى", "Other Expense")}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-rose-800 mb-1">{tr3(lang, "Tutar", "المبلغ", "Amount")} ({t.currency}) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="500"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-rose-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4A2E1B] mb-1">{tr3(lang, "İlgili Poliklinik / Hekim (İsteğe Bağlı)", "العيادة / الطبيب المعني (اختياري)", "Related Clinic / Doctor (Optional)")}</label>
                <select
                  value={expenseForm.doctorId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, doctorId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1]"
                >
                  <option value="">{tr3(lang, "-- Klinik Genel Gideri --", "-- مصروف عام للمركز --", "-- General Clinic Expense --")}</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Not", "ملاحظات", "Notes")}</label>
                <input
                  type="text"
                  placeholder={tr3(lang, "İsteğe bağlı açıklama...", "ملاحظات إضافية...", "Optional notes...")}
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs shadow-sm transition-all"
              >
                {tr3(lang, "Gideri Kaydet", "حفظ المصروف", "Save Expense")} ({t.currency})
              </button>
            </form>
          </div>

          {/* Expenses Table */}
          <div className="lg:col-span-2 bg-white border border-[#E5DCD0] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E5DCD0] bg-[#FAF7F2] flex items-center justify-between">
              <div>
                <h4 className="text-base font-serif font-bold text-[#2C1810]">
                  {tr3(lang, "Kayıtlı Muayene & Klinik Giderleri", "سجل مصاريف المعاينات والمركز", "Recorded Consultation & Clinic Expenses")}
                </h4>
                <p className="text-xs text-[#8C6D53]">
                  {tr3(lang, `Tüm gider kalemleri Suriye Lirası (${t.currency}) üzerinden nakit düşülür`, `تُخصم جميع المصاريف نقداً بالليرة السورية (${t.currency})`, `All expense items are deducted in cash in Syrian Pounds (${t.currency})`)}
                </p>
              </div>
              <strong className="text-sm font-mono text-rose-700">
                {tr3(lang, "Toplam:", "الإجمالي:", "Total:")} {totalClinicExpenses.toLocaleString("tr-TR")} {t.currency}
              </strong>
            </div>

            {expenses.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#7D6E63] italic">
                {tr3(lang, "Henüz kayıtlı bir gider kalemi bulunmamaktadır. Sol taraftaki formdan muayene veya klinik gideri ekleyebilirsiniz.", "لا توجد مصاريف مسجلة بعد. يمكنك إضافة مصروف جديد من النموذج المجاور.", "No expenses recorded yet. Use the form to add a consultation or clinic expense.")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right text-xs">
                  <thead className="bg-[#FAF7F2] text-[#6E492D] uppercase border-b border-[#E5DCD0]">
                    <tr>
                      <th className="p-3">{tr3(lang, "Tarih", "التاريخ", "Date")}</th>
                      <th className="p-3">{tr3(lang, "Açıklama", "الوصف", "Description")}</th>
                      <th className="p-3">{tr3(lang, "Poliklinik", "العيادة", "Clinic")}</th>
                      <th className="p-3">{tr3(lang, "Tutar", "المبلغ", "Amount")}</th>
                      <th className="p-3 text-right rtl:text-left">{tr3(lang, "Sil", "حذف", "Delete")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DCD0]">
                    {expenses.map((ex) => (
                      <tr key={ex.id} className="hover:bg-[#FAF7F2]/60">
                        <td className="p-3 font-mono text-[#7D6E63]">
                          {new Date(ex.createdAt).toLocaleDateString(lang === "ar" ? "ar-SY" : lang === "en" ? "en-US" : "tr-TR")}
                        </td>
                        <td className="p-3 font-semibold text-[#2C1810]">
                          {ex.title}
                          {ex.notes && <span className="block text-[10px] text-[#7D6E63] font-normal">{ex.notes}</span>}
                        </td>
                        <td className="p-3 text-[#6E492D]">{ex.doctorName || tr3(lang, "Klinik Genel", "المركز العام", "General Clinic")}</td>
                        <td className="p-3 font-mono font-bold text-rose-700">
                          -{ex.amount.toLocaleString("tr-TR")} {t.currency}
                        </td>
                        <td className="p-3 text-right rtl:text-left">
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(ex.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            title={tr3(lang, "Gideri Sil", "حذف المصروف", "Delete Expense")}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PHARMACY REPORT TAB (100% SYP) */}
      {activeTab === "pharmacy" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5DCD0] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8C6D53] mb-2 uppercase tracking-wide">
                <span>{t.pharmacyRevenue}</span>
                <Pill className="w-4 h-4 text-[#B8860B]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#2C1810]">
                {pharmacyGrossSales.toLocaleString("tr-TR")}{" "}
                <span className="text-xs font-normal text-[#8C6D53]">{t.currency}</span>
              </div>
              <div className="text-xs text-stone-500 mt-2">
                {tr3(lang, "Nakit ilaç satış geliri", "مبيعات الوصفات والأدوية (نقداً)", "Cash prescription sales income")}
              </div>
            </div>

            <div className="bg-white border border-[#E5DCD0] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8C6D53] mb-2 uppercase tracking-wide">
                <span>{t.pharmacyCost}</span>
                <TrendingDown className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-serif font-bold text-amber-700">
                {pharmacyCostOfGoods.toLocaleString("tr-TR")}{" "}
                <span className="text-xs font-normal text-amber-700">{t.currency}</span>
              </div>
              <div className="text-xs text-stone-500 mt-2">
                {tr3(lang, "Toptan ilaç alım gideri", "تكلفة شراء المستحضرات", "Wholesale medication acquisition cost")}
              </div>
            </div>

            <div className="bg-white border border-[#E5DCD0] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8C6D53] mb-2 uppercase tracking-wide">
                <span>{t.pharmacyProfit}</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-serif font-bold text-emerald-700">
                {pharmacyGrossProfit.toLocaleString("tr-TR")}{" "}
                <span className="text-xs font-normal text-emerald-700">{t.currency}</span>
              </div>
              <div className="text-xs text-emerald-700 font-medium mt-2">
                {tr3(lang, "Satış geliri eksi ilaç maliyeti", "الإيراد مطروحاً منه التكلفة", "Sales income minus medication cost")}
              </div>
            </div>

            <div className="bg-white border border-[#E5DCD0] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8C6D53] mb-2 uppercase tracking-wide">
                <span>{t.inventoryValuation}</span>
                <Building2 className="w-4 h-4 text-[#B8860B]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#4A2E1B]">
                {totalInventoryValuation.toLocaleString("tr-TR")}{" "}
                <span className="text-xs font-normal text-[#4A2E1B]">{t.currency}</span>
              </div>
              <div className="text-xs text-[#8C6D53] mt-2">
                {totalMedicationItems}{" "}
                {tr3(lang, "adet stok kalemi", "وحدة دواء متوفرة", "units in stock")}
              </div>
            </div>
          </div>

          {/* Pharmacy Breakdown Table */}
          <div className="bg-white border border-[#E5DCD0] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E5DCD0] bg-[#FAF7F2] flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold font-serif text-[#2C1810]">
                  {tr3(lang, "Eczane İlaç Satış Geliri & Alış Gideri Dökümü (SYP)", "تقرير حركة مبيعات ومخزون الأدوية بالليرة السورية", "Pharmacy Medication Sales Income & Cost Breakdown (SYP)")}
                </h4>
                <p className="text-xs text-[#8C6D53]">
                  {tr3(lang, "İlaç birim satış fiyatı, alış maliyeti ve toplam stok değeri (SYP)", "تسعير الأدوية وتكلفة الشراء بالليرة السورية", "Unit retail price, supplier cost, and total stock valuation (SYP)")}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left rtl:text-right text-sm">
                <thead className="bg-[#FAF7F2] text-[#6E492D] text-xs uppercase font-semibold border-b border-[#E5DCD0]">
                  <tr>
                    <th className="py-3.5 px-4">{tr3(lang, "İlaç Adı", "اسم الدواء", "Medication Name")}</th>
                    <th className="py-3.5 px-4">{tr3(lang, "Barkod / Kod", "الكود", "SKU")}</th>
                    <th className="py-3.5 px-4">{tr3(lang, "Mevcut Stok", "المخزون", "Stock")}</th>
                    <th className="py-3.5 px-4">{tr3(lang, "Satış Fiyatı", "سعر البيع", "Retail Price")}</th>
                    <th className="py-3.5 px-4">{tr3(lang, "Alış Gideri", "تكلفة الشراء", "Supplier Cost")}</th>
                    <th className="py-3.5 px-4 text-emerald-700">{tr3(lang, "Birim Net", "صافي الوحدة", "Unit Net")}</th>
                    <th className="py-3.5 px-4">{tr3(lang, "Toplam Stok Değeri", "قيمة المخزون", "Total Valuation")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DCD0] text-[#2C1810]">
                  {inventory.map((item, idx) => {
                    const price = item.retailPrice ?? 0;
                    const cost = item.supplierPrice ?? 0;
                    const unitMargin = price - cost;
                    const stock = item.stockQuantity ?? 0;
                    const totalVal = stock * price;
                    return (
                      <tr key={item.id || idx} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#2C1810]">{item.itemName}</td>
                        <td className="py-3.5 px-4 text-xs font-mono text-stone-500">{item.SKU}</td>
                        <td className="py-3.5 px-4 font-medium">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              stock < 10 ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {stock} {tr3(lang, "kutu", "علبة", "boxes")}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold font-mono">{price.toLocaleString("tr-TR")} {t.currency}</td>
                        <td className="py-3.5 px-4 text-xs text-amber-800 font-medium font-mono">{cost.toLocaleString("tr-TR")} {t.currency}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700 font-mono">+{unitMargin.toLocaleString("tr-TR")} {t.currency}</td>
                        <td className="py-3.5 px-4 font-bold text-[#4A2E1B] font-mono">{totalVal.toLocaleString("tr-TR")} {t.currency}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
