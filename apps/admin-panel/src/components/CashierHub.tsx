import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Banknote,
  Receipt,
  RefreshCw,
  X,
  RotateCcw,
} from "lucide-react";
import { AdminLang, tr3 } from "../i18n";
import { apiFetch, API_URL, DoctorModel } from "../apiClient";
import { PatientSearchSelect } from "./PatientSearchSelect";

export interface BillingPaymentEntry {
  id: string;
  amount: number;
  method: "CASH";
  note?: string;
  collectedBy: string;
  createdAt: string;
}

export interface BillingChargeRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientIdentityNo?: string;
  doctorId?: string;
  doctorName?: string;
  appointmentId?: string;
  medicalRecordId?: string;
  title: string;
  category: "CONSULTATION" | "PROCEDURE" | "SURGERY" | "OTHER";
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "UNPAID" | "PARTIAL" | "PAID";
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  payments: BillingPaymentEntry[];
}

interface CashierHubProps {
  patients: any[];
  doctors: DoctorModel[];
  lang: AdminLang;
  userRole: string;
}

export const CashierHub: React.FC<CashierHubProps> = ({ patients, doctors, lang }) => {
  const [charges, setCharges] = useState<BillingChargeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "UNPAID" | "PARTIAL" | "PAID">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const curLabel = lang === "ar" ? "ل.س" : "SYP";

  // Add New Charge / Receivable Modal (Cash Only - No Card/Transfer Selection)
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({
    patientId: "",
    doctorId: "",
    title: "",
    category: "PROCEDURE" as "CONSULTATION" | "PROCEDURE" | "SURGERY" | "OTHER",
    totalAmount: "",
    paidAmount: "0",
    notes: "",
  });

  // Collect Cash Payment Modal (Full or Partial)
  const [collectModalCharge, setCollectModalCharge] = useState<BillingChargeRecord | null>(null);
  const [collectAmount, setCollectAmount] = useState<string>("");
  const [collectNote, setCollectNote] = useState<string>("");

  const loadCharges = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_URL}/billing`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setCharges(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharges();
  }, []);

  const handleCreateCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!newForm.patientId) {
      setFeedback({ type: "err", text: tr3(lang, "Lütfen listeden bir hasta seçiniz.", "يرجى اختيار مريض من القائمة.", "Please select a patient from the list.") });
      return;
    }
    try {
      const total = Number(newForm.totalAmount);
      const paid = Number(newForm.paidAmount || 0);
      const res = await apiFetch(`${API_URL}/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: newForm.patientId,
          doctorId: newForm.doctorId || undefined,
          title: newForm.title,
          category: newForm.category,
          totalAmount: total,
          paidAmount: paid,
          paymentMethod: "CASH",
          notes: newForm.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || tr3(lang, "Ücret kaydı oluşturulamadı", "تعذر إنشاء سجل الرسوم", "Could not create billing record"));

      setFeedback({
        type: "ok",
        text:
          paid === 0
            ? tr3(lang, "Alınacak (bekleyen borç) kaydı başarıyla oluşturuldu.", "تم تسجيل الذمة المطلوبة بالليرة السورية بنجاح!", "Receivable (unpaid balance) recorded successfully.")
            : paid < total
            ? tr3(lang, `Nakit kısmi ödeme (${paid.toLocaleString("tr-TR")} SYP) alındı, kalan alacak (${(total - paid).toLocaleString("tr-TR")} SYP) kaydedildi.`, `تم تحصيل دفعة نقدية جزئية (${paid.toLocaleString("tr-TR")} ل.س) وتسجيل المتبقي (${(total - paid).toLocaleString("tr-TR")} ل.س).`, `Partial cash payment (${paid.toLocaleString("tr-TR")} SYP) collected; remaining balance (${(total - paid).toLocaleString("tr-TR")} SYP) saved.`)
            : tr3(lang, "Nakit ödeme tam tahsil edildi olarak kaydedildi.", "تم تسجيل الدفعة النقدية بالكامل بنجاح!", "Full cash payment recorded successfully."),
      });
      setShowNewModal(false);
      setNewForm({
        patientId: "",
        doctorId: "",
        title: "",
        category: "PROCEDURE",
        totalAmount: "",
        paidAmount: "0",
        notes: "",
      });
      loadCharges();
    } catch (err: any) {
      setFeedback({ type: "err", text: err.message || tr3(lang, "Hata oluştu", "حدث خطأ", "An error occurred") });
    }
  };

  const handleOpenCollect = (c: BillingChargeRecord, presetAmount?: number) => {
    setCollectModalCharge(c);
    setCollectAmount(String(presetAmount !== undefined ? presetAmount : c.remainingAmount));
    setCollectNote("");
  };

  const handleCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectModalCharge) return;
    setFeedback(null);
    try {
      const res = await apiFetch(`${API_URL}/billing/${collectModalCharge.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addPaymentAmount: Number(collectAmount),
          paymentMethod: "CASH",
          paymentNote: collectNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || tr3(lang, "Tahsilat kaydedilemedi", "تعذر تسجيل التحصيل", "Could not save payment"));

      setFeedback({
        type: "ok",
        text: tr3(
          lang,
          `${Number(collectAmount).toLocaleString("tr-TR")} SYP nakit tahsil edildi. Kalan alacak: ${(data.charge?.remainingAmount ?? 0).toLocaleString("tr-TR")} SYP.`,
          `تم تحصيل ${Number(collectAmount).toLocaleString("tr-TR")} ل.س نقداً بنجاح! المتبقي: ${(data.charge?.remainingAmount ?? 0).toLocaleString("tr-TR")} ل.س.`,
          `${Number(collectAmount).toLocaleString("tr-TR")} SYP collected in cash. Remaining balance: ${(data.charge?.remainingAmount ?? 0).toLocaleString("tr-TR")} SYP.`
        ),
      });
      setCollectModalCharge(null);
      loadCharges();
    } catch (err: any) {
      setFeedback({ type: "err", text: err.message || tr3(lang, "Tahsilat hatası", "خطأ في التحصيل", "Collection error") });
    }
  };

  const handleResetToUnpaid = async (c: BillingChargeRecord) => {
    setFeedback(null);
    try {
      const res = await apiFetch(`${API_URL}/billing/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetPayments: true }),
      });
      if (!res.ok) throw new Error((await res.json()).message || tr3(lang, "İşlem başarısız", "فشلت العملية", "Operation failed"));
      setFeedback({ type: "ok", text: tr3(lang, "Ödeme durumu 'Alınmadı (Bekliyor)' olarak sıfırlandı.", "تمت إعادة تعيين حالة الدفع إلى 'غير مدفوع'.", "Payment status reset to 'Unpaid (Pending)'.") });
      loadCharges();
    } catch (err: any) {
      setFeedback({ type: "err", text: err.message });
    }
  };

  const filtered = charges.filter((c) => {
    if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLocaleLowerCase("tr-TR");
    return (
      c.patientName.toLocaleLowerCase("tr-TR").includes(q) ||
      (c.patientIdentityNo || "").toLowerCase().includes(q) ||
      c.title.toLocaleLowerCase("tr-TR").includes(q) ||
      (c.doctorName || "").toLocaleLowerCase("tr-TR").includes(q)
    );
  });

  const unpaidCount = charges.filter((c) => c.status === "UNPAID").length;
  const partialCount = charges.filter((c) => c.status === "PARTIAL").length;
  const paidCount = charges.filter((c) => c.status === "PAID").length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DCD0] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFE8DC] border border-[#E5DCD0] text-[#4A2E1B] text-[11px] font-bold uppercase mb-1">
            <Receipt size={12} className="text-[#B8860B]" />
            <span>{tr3(lang, "Danışma Nakit Kasa & Tahsilat Merkezi (SYP)", "الصندوق النقدي وتحصيل الرسوم (ل.س)", "Reception Cash Desk & Billing Hub (SYP)")}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2C1810]">
            {tr3(lang, "Nakit Hasta Ödemeleri, Ek İşlem Ücretleri & Alacak Takibi", "إدارة الدفعات النقدية، العمليات الإضافية والذمم المتبقية", "Cash Patient Payments, Extra Procedure Fees & Receivables")}
          </h2>
          <p className="text-xs text-[#7D6E63]">
            {tr3(lang, "Tüm tahsilatlar Suriye Lirası (SYP) üzerinden doğrudan nakit olarak işlenir; tam ödeme, kısmi ödeme veya alınacak kaydı girebilirsiniz.", "تحصيل أجور المعاينات والعمليات نقداً بالليرة السورية كاملة أو على دفعات جزئية ومتابعة المبالغ المتبقية.", "All payments are processed directly in cash in Syrian Pounds (SYP); record full payments, partial payments, or open receivables.")}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadCharges}
            className="p-2.5 rounded-xl bg-white border border-[#E5DCD0] hover:bg-[#FAF7F2] text-[#4A2E1B] transition-colors"
            title={tr3(lang, "Yenile", "تحديث", "Refresh")}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs shadow-md transition-all"
          >
            <Plus size={14} className="text-[#D4AF37]" />
            <span>{tr3(lang, "Yeni Ücret / Alınacak Ekle", "إضافة رسم / مبلغ مطلوب", "New Charge / Receivable")}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            feedback.type === "ok"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)} className="font-bold px-2">
            ×
          </button>
        </div>
      )}

      {/* Status Filter Pills + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterStatus("ALL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              filterStatus === "ALL"
                ? "bg-[#4A2E1B] text-white border-[#4A2E1B]"
                : "bg-white text-[#6E492D] border-[#E5DCD0] hover:bg-[#FAF7F2]"
            }`}
          >
            {tr3(lang, `Tüm Kayıtlar (${charges.length})`, `الكل (${charges.length})`, `All Records (${charges.length})`)}
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("UNPAID")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              filterStatus === "UNPAID"
                ? "bg-red-700 text-white border-red-700"
                : "bg-red-50 text-red-900 border-red-200 hover:bg-red-100"
            }`}
          >
            <AlertCircle size={13} />
            <span>{tr3(lang, `Henüz Alınmadı / Bekleyen (${unpaidCount})`, `لم يُدفع بعد (${unpaidCount})`, `Unpaid / Pending (${unpaidCount})`)}</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("PARTIAL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              filterStatus === "PARTIAL"
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100"
            }`}
          >
            <Clock size={13} />
            <span>{tr3(lang, `Kısmi Ödenen / Devam Eden (${partialCount})`, `مدفوع جزئياً (${partialCount})`, `Partially Paid (${partialCount})`)}</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("PAID")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              filterStatus === "PAID"
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle2 size={13} />
            <span>{tr3(lang, `Tamamı Tahsil Edildi (${paidCount})`, `تم التحصيل بالكامل (${paidCount})`, `Paid in Full (${paidCount})`)}</span>
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-[#8C6D53]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tr3(lang, "Hasta adı, kimlik veya işlem ara...", "بحث باسم المريض أو العملية...", "Search patient, ID, or procedure...")}
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 rounded-xl bg-white border border-[#E5DCD0] text-xs text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
          />
        </div>
      </div>

      {/* Charges Table / Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E5DCD0] rounded-3xl p-10 text-center text-xs text-[#7D6E63]">
          {tr3(lang, "Bu filtrede henüz kayıtlı bir ücret veya alacak işlemi bulunmuyor.", "لا توجد معاملات مالية مطابقة حالياً.", "No billing or receivable records match this filter.")}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const pct = c.totalAmount > 0 ? Math.min(100, Math.round((c.paidAmount / c.totalAmount) * 100)) : 0;
            return (
              <div
                key={c.id}
                className="bg-white border border-[#E5DCD0] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.status === "PAID"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : c.status === "PARTIAL"
                          ? "bg-amber-50 text-amber-900 border-amber-300"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      {c.status === "PAID"
                        ? tr3(lang, "Tamamı Nakit Alındı ✓", "تم الدفع نقداً بالكامل ✓", "Paid in Full (Cash) ✓")
                        : c.status === "PARTIAL"
                        ? tr3(lang, `Kısmi Nakit Alındı (%${pct})`, `دفعة نقدية جزئية (${pct}%)`, `Partial Cash Paid (${pct}%)`)
                        : tr3(lang, "Alınmadı (Tahsilat Bekliyor)", "لم يُدفع (ذمة مطلوبة)", "Unpaid (Collection Pending)")}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DCD0] text-[10px] font-semibold text-[#6E492D]">
                      {c.category === "SURGERY"
                        ? tr3(lang, "Ameliyat / Cerrahi", "عملية جراحية", "Surgery / Prosthesis")
                        : c.category === "CONSULTATION"
                        ? tr3(lang, "Muayene", "معاينة", "Consultation")
                        : tr3(lang, "Ek Tedavi / İşlem", "إجراء علاجي إضافي", "Extra Procedure")}
                    </span>
                    <span className="text-[11px] text-[#8C6D53] font-mono">
                      {new Date(c.createdAt).toLocaleString(lang === "ar" ? "ar-SY" : lang === "en" ? "en-US" : "tr-TR", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-2">
                    <h4 className="text-sm font-bold text-[#2C1810]">{c.title}</h4>
                    <span className="text-xs text-[#6E492D]">• {tr3(lang, "Hasta:", "المريض:", "Patient:")} <strong className="text-[#2C1810]">{c.patientName}</strong></span>
                    {c.doctorName && (
                      <span className="text-xs text-[#8A5F35]">({c.doctorName})</span>
                    )}
                  </div>

                  {c.notes && <p className="text-[11px] text-[#7D6E63] italic">{tr3(lang, "Not:", "ملاحظة:", "Note:")} {c.notes}</p>}

                  {c.payments && c.payments.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {c.payments.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[10px] text-emerald-900 font-mono"
                        >
                          +{p.amount.toLocaleString("tr-TR")} {curLabel} ({tr3(lang, "Nakit", "نقداً", "Cash")}) • {p.collectedBy}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amounts & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#F3EDE2]">
                  <div className="grid grid-cols-3 gap-3 text-center bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl px-3.5 py-2">
                    <div>
                      <span className="block text-[9px] uppercase text-[#7D6E63] font-bold">{tr3(lang, "Toplam", "الإجمالي", "Total")}</span>
                      <strong className="text-xs font-mono text-[#2C1810]">{c.totalAmount.toLocaleString("tr-TR")} {curLabel}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase text-emerald-700 font-bold">{tr3(lang, "Alınan (Nakit)", "المدفوع (نقداً)", "Paid (Cash)")}</span>
                      <strong className="text-xs font-mono text-emerald-700">{c.paidAmount.toLocaleString("tr-TR")} {curLabel}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase text-red-700 font-bold">{tr3(lang, "Kalan Alacak", "المتبقي", "Remaining")}</span>
                      <strong className="text-xs font-mono text-red-700">{c.remainingAmount.toLocaleString("tr-TR")} {curLabel}</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {c.remainingAmount > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenCollect(c, c.remainingAmount)}
                          className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                        >
                          <Banknote size={13} />
                          <span>{tr3(lang, "Tamamını Nakit Al", "تحصيل كامل نقداً", "Collect Full Cash")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCollect(c, Math.ceil(c.remainingAmount / 2))}
                          className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold text-xs transition-all flex items-center gap-1"
                        >
                          <Banknote size={13} />
                          <span>{tr3(lang, "Kısmi Tahsilat", "دفعة جزئية", "Partial Payment")}</span>
                        </button>
                      </>
                    )}
                    {c.paidAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => handleResetToUnpaid(c)}
                        title={tr3(lang, "Ödemeyi Sıfırla (Alınmadı Yap)", "إعادة تعيين كغير مدفوع", "Reset to Unpaid")}
                        className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-red-50 text-[#7D6E63] hover:text-red-700 border border-[#E5DCD0] transition-colors"
                      >
                        <RotateCcw size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: NEW CHARGE / RECEIVABLE (SEARCHABLE PATIENT + CASH ONLY) */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-[#2C1810]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E5DCD0] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowNewModal(false)}
              className="absolute right-4 rtl:right-auto rtl:left-4 top-4 p-1.5 rounded-full bg-[#FAF7F2] text-[#6E492D] hover:bg-[#EFE8DC]"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 border-b border-[#E5DCD0] pb-3">
              <div className="w-9 h-9 rounded-xl bg-[#4A2E1B] text-[#D4AF37] flex items-center justify-center">
                <DollarSign size={18} />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#2C1810]">
                  {tr3(lang, "Yeni Ücret / Ek Tedavi / Alınacak Kaydı (SYP • Nakit)", "إضافة رسم / علاج إضافي / ذمة مطلوبة (ل.س • نقداً)", "New Charge / Extra Procedure / Receivable (SYP • Cash)")}
                </h3>
                <p className="text-[11px] text-[#7D6E63]">
                  {tr3(lang, "Suriye Lirası (SYP) üzerinden tam nakit tahsilat, kısmi ödeme veya alınacak (0 SYP) olarak kaydedin.", "التسجيل بالليرة السورية نقداً كدفعة كاملة أو جزئية أو ذمة مطلوبة (0 ل.س).", "Record in Syrian Pounds (SYP) as full cash payment, partial payment, or open receivable (0 SYP).")}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateCharge} className="space-y-3 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-[#4A2E1B] mb-1">
                    {tr3(lang, "Hasta Seçin (Harf Harf Arayın) *", "اختر المريض (ابحث حرفاً بحرف) *", "Select Patient (Search Letter-by-Letter) *")}
                  </label>
                  <PatientSearchSelect
                    patients={patients}
                    value={newForm.patientId}
                    onChange={(pid) => setNewForm({ ...newForm, patientId: pid })}
                    required
                    lang={lang}
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A2E1B] mb-1">{tr3(lang, "İlgili Hekim (İsteğe Bağlı)", "الطبيب المعني (اختياري)", "Related Doctor (Optional)")}</label>
                  <select
                    value={newForm.doctorId}
                    onChange={(e) => setNewForm({ ...newForm, doctorId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1]"
                  >
                    <option value="">{tr3(lang, "-- Klinik Genel --", "-- المركز العام --", "-- General Clinic --")}</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#4A2E1B] mb-1">{tr3(lang, "İşlem / Ödeme Açıklaması *", "وصف العملية / الإجراء *", "Procedure / Charge Title *")}</label>
                  <input
                    type="text"
                    required
                    placeholder={tr3(lang, "Örn: Protez Ameliyatı, İmplant, Kanal Tedavisi...", "مثال: عملية مفصل، زراعة أسنان، علاج عصب...", "e.g., Prosthesis Surgery, Dental Implant, Root Canal...")}
                    value={newForm.title}
                    onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Tür", "النوع", "Category")}</label>
                  <select
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1]"
                  >
                    <option value="PROCEDURE">{tr3(lang, "Ek Tedavi / İşlem", "علاج / إجراء إضافي", "Extra Procedure")}</option>
                    <option value="SURGERY">{tr3(lang, "Ameliyat / Protez", "عملية جراحية / طرف صناعي", "Surgery / Prosthesis")}</option>
                    <option value="CONSULTATION">{tr3(lang, "Muayene Ücreti", "أجرة معاينة", "Consultation Fee")}</option>
                    <option value="OTHER">{tr3(lang, "Diğer", "أخرى", "Other")}</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="font-bold text-[#6E492D] py-1">{tr3(lang, "Hızlı Seçim:", "اختيار سريع:", "Quick Presets:")}</span>
                {[
                  { t: tr3(lang, "Protez Ameliyatı", "عملية تركيب طرف صناعي", "Prosthesis Surgery"), c: "SURGERY", a: "15000" },
                  { t: tr3(lang, "Diş İmplant / Kanal Tedavisi", "زراعة أسنان / سحب عصب", "Dental Implant / Root Canal"), c: "PROCEDURE", a: "5000" },
                  { t: tr3(lang, "Küçük Cerrahi Müdahale", "تداخل جراحي صغرى", "Minor Surgical Procedure"), c: "SURGERY", a: "4000" },
                  { t: tr3(lang, "Ekokardiyografi / USG", "إيكو قلب / تصوير إيكو", "Echocardiography / USG"), c: "PROCEDURE", a: "2000" },
                ].map((preset) => (
                  <button
                    key={preset.t}
                    type="button"
                    onClick={() => setNewForm({ ...newForm, title: preset.t, category: preset.c as any, totalAmount: preset.a })}
                    className="px-2 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE8DC] border border-[#E5DCD0] text-[#4A2E1B] font-semibold"
                  >
                    + {preset.t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0]">
                <div>
                  <label className="block font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Toplam Tutar", "المبلغ الإجمالي", "Total Amount")} ({curLabel}) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newForm.totalAmount}
                    onChange={(e) => setNewForm({ ...newForm, totalAmount: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#DDD2C1] font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-800 mb-1">{tr3(lang, "Şimdi Nakit Alınan", "المقبوض نقداً الآن", "Cash Collected Now")} ({curLabel})</label>
                  <input
                    type="number"
                    min={0}
                    max={Number(newForm.totalAmount) || undefined}
                    value={newForm.paidAmount}
                    onChange={(e) => setNewForm({ ...newForm, paidAmount: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-white border border-emerald-300 font-mono font-bold text-emerald-900"
                  />
                  <div className="flex gap-2 mt-1 text-[10px]">
                    <button type="button" onClick={() => setNewForm({ ...newForm, paidAmount: "0" })} className="underline text-red-700 font-semibold">{tr3(lang, "Alınmadı (0)", "لم يُدفع (0)", "Unpaid (0)")}</button>
                    <button type="button" onClick={() => setNewForm({ ...newForm, paidAmount: String(Math.ceil((Number(newForm.totalAmount) || 0) / 2)) })} className="underline text-amber-800 font-semibold">{tr3(lang, "Yarısı", "النصف", "Half")}</button>
                    <button type="button" onClick={() => setNewForm({ ...newForm, paidAmount: newForm.totalAmount || "0" })} className="underline text-emerald-800 font-semibold">{tr3(lang, "Tamamı", "الكامل", "Full")}</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Not (İsteğe Bağlı)", "ملاحظات (اختياري)", "Notes (Optional)")}</label>
                <input
                  type="text"
                  placeholder={tr3(lang, "Örn: Kalan tutar haftaya kontrol seansında nakit alınacak", "مثال: يُدفع المتبقي في جلسة المراجعة القادمة", "e.g., Remaining balance to be paid in cash at follow-up")}
                  value={newForm.notes}
                  onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs shadow-md transition-all"
              >
                {tr3(lang, "Nakit Kasaya Kaydet", "حفظ في الصندوق النقدي", "Save to Cash Ledger")} ({curLabel})
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: COLLECT FULL OR PARTIAL CASH PAYMENT */}
      {collectModalCharge && (
        <div className="fixed inset-0 z-50 bg-[#2C1810]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5DCD0] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setCollectModalCharge(null)}
              className="absolute right-4 rtl:right-auto rtl:left-4 top-4 p-1.5 rounded-full bg-[#FAF7F2] text-[#6E492D]"
            >
              <X size={16} />
            </button>

            <div>
              <h3 className="text-base font-serif font-bold text-[#2C1810]">
                {tr3(lang, "Nakit Tahsilat Al (Tam veya Kısmi)", "تحصيل دفعة نقدية (كاملة أو جزئية)", "Collect Cash Payment (Full or Partial)")}
              </h3>
              <p className="text-xs text-[#6E492D] mt-0.5">
                <strong>{collectModalCharge.patientName}</strong> — {collectModalCharge.title}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] text-center text-xs">
              <div>
                <span className="block text-[10px] text-[#7D6E63]">{tr3(lang, "Toplam", "الإجمالي", "Total")}</span>
                <strong className="font-mono">{collectModalCharge.totalAmount.toLocaleString("tr-TR")} {curLabel}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-emerald-700">{tr3(lang, "Ödenen (Nakit)", "المدفوع (نقداً)", "Paid (Cash)")}</span>
                <strong className="font-mono text-emerald-700">{collectModalCharge.paidAmount.toLocaleString("tr-TR")} {curLabel}</strong>
              </div>
              <div>
                <span className="block text-[10px] text-red-700">{tr3(lang, "Kalan Borç", "المتبقي", "Remaining")}</span>
                <strong className="font-mono text-red-700">{collectModalCharge.remainingAmount.toLocaleString("tr-TR")} {curLabel}</strong>
              </div>
            </div>

            <form onSubmit={handleCollectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#4A2E1B] mb-1">
                  {tr3(lang, "Şimdi Nakit Tahsil Edilen Tutar", "المبلغ المحصل نقداً الآن", "Cash Amount Collected Now")} ({curLabel}) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={collectModalCharge.remainingAmount}
                  required
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#B8860B] font-mono font-bold text-sm"
                />
                <div className="flex gap-2 mt-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setCollectAmount(String(Math.ceil(collectModalCharge.remainingAmount / 2)))}
                    className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-semibold"
                  >
                    {tr3(lang, "Yarısını Al", "تحصيل النصف", "Collect Half")} ({Math.ceil(collectModalCharge.remainingAmount / 2).toLocaleString("tr-TR")} {curLabel})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectAmount(String(collectModalCharge.remainingAmount))}
                    className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold"
                  >
                    {tr3(lang, "Kalanın Tamamını Al", "تحصيل المتبقي بالكامل", "Collect Full Remaining")} ({collectModalCharge.remainingAmount.toLocaleString("tr-TR")} {curLabel})
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Tahsilat Notu (İsteğe Bağlı)", "ملاحظة التحصيل (اختياري)", "Collection Note (Optional)")}</label>
                <input
                  type="text"
                  placeholder={tr3(lang, "Örn: Nakit 2. taksit alındı", "مثال: تم استلام الدفعة الثانية نقداً", "e.g., 2nd cash installment collected")}
                  value={collectNote}
                  onChange={(e) => setCollectNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all"
              >
                {tr3(lang, "Nakit Tahsilatı Onayla", "تأكيد التحصيل النقدي", "Confirm Cash Collection")} ({curLabel})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
