import React, { useState, useMemo } from "react";
import {
  FlaskConical,
  Droplets,
  TestTube2,
  Microscope,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Send,
  Plus,
  RefreshCw,
  Eye,
  Sparkles,
} from "lucide-react";
import { DoctorModel, apiFetch, API_URL } from "../apiClient";
import { tr3 } from "../i18n";
import {
  SPECIMEN_CATEGORIES,
  LAB_PANELS_CATALOG,
  SpecimenCategory,
  EvaluatedLabResult,
  evaluateParameterFlag,
  detectPanelsFromTestName,
} from "../labCatalog";
import { PatientSearchSelect } from "./PatientSearchSelect";
import { LabReportModal, LabReportOrder, openLabReportPrintWindow } from "./LabReportModal";

interface LaboratoryHubProps {
  currentUser: any;
  labOrders: LabReportOrder[];
  patients: any[];
  doctors: DoctorModel[];
  lang: string;
  onRefresh: () => void;
}

export const LaboratoryHub: React.FC<LaboratoryHubProps> = ({
  currentUser,
  labOrders,
  patients,
  doctors,
  lang,
  onRefresh,
}) => {
  const [queueTab, setQueueTab] = useState<"pending" | "completed">("pending");
  const [mode, setMode] = useState<"idle" | "order" | "direct">("idle");
  const [activeOrder, setActiveOrder] = useState<LabReportOrder | null>(null);

  // Direct walk-in lab entry patient selection
  const [directPatientId, setDirectPatientId] = useState<string>("");
  const [roomNumber, setRoomNumber] = useState<string>("Laboratuvar");

  // Step 1: Specimen Category (Blood vs Urine vs Stool/Microbiology)
  const [selectedSpecimen, setSelectedSpecimen] = useState<SpecimenCategory>("BLOOD");

  // Step 2: Selected Panel(s) inside Specimen Category
  const [selectedPanelIds, setSelectedPanelIds] = useState<string[]>(["cbc_hematology"]);

  // Step 3: Entered Parameter Values { [paramCode]: rawString }
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [labNotes, setLabNotes] = useState<string>("");

  // Step 4: Target Doctors to receive the report
  const [targetDoctorIds, setTargetDoctorIds] = useState<string[]>([]);

  // Feedback & Preview Modal
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewReport, setPreviewReport] = useState<LabReportOrder | null>(null);

  const pendingOrders = useMemo(
    () => labOrders.filter((o) => o.status !== "COMPLETED"),
    [labOrders]
  );
  const completedOrders = useMemo(
    () => labOrders.filter((o) => o.status === "COMPLETED"),
    [labOrders]
  );

  // Start fulfilling an existing doctor-requested lab order
  const handleSelectPendingOrder = (order: LabReportOrder) => {
    const detected = detectPanelsFromTestName(order.testName);
    setActiveOrder(order);
    setMode("order");
    setSelectedSpecimen(detected.specimen);
    setSelectedPanelIds(detected.panelIds);
    setParamValues({});
    setLabNotes("");
    setRoomNumber(order.roomNumber || order.doctor?.room || "Poliklinik");
    setTargetDoctorIds(order.doctorId ? [order.doctorId] : []);
    setFeedback(null);
  };

  // Start a brand-new lab report directly from Laboratory
  const handleStartDirectTest = () => {
    setActiveOrder(null);
    setMode("direct");
    setDirectPatientId("");
    setSelectedSpecimen("BLOOD");
    setSelectedPanelIds(["cbc_hematology"]);
    setParamValues({});
    setLabNotes("");
    setRoomNumber("Laboratuvar");
    setTargetDoctorIds(doctors[0]?.id ? [doctors[0].id] : []);
    setFeedback(null);
  };

  const handleSelectSpecimen = (spec: SpecimenCategory) => {
    setSelectedSpecimen(spec);
    const firstPanel = LAB_PANELS_CATALOG.find((p) => p.specimen === spec);
    if (firstPanel && !selectedPanelIds.some((id) => LAB_PANELS_CATALOG.find((p) => p.id === id)?.specimen === spec)) {
      setSelectedPanelIds([firstPanel.id]);
    }
  };

  const togglePanel = (panelId: string) => {
    setSelectedPanelIds((prev) =>
      prev.includes(panelId)
        ? prev.length > 1
          ? prev.filter((id) => id !== panelId)
          : prev
        : [...prev, panelId]
    );
  };

  const handleValueChange = (code: string, val: string) => {
    setParamValues((prev) => {
      const next = { ...prev, [code]: val };
      // Auto-calculate Bilirubin Indirect = Bilirubin (Tot.) - Bilirubin Direct
      if (code === "BIL_TOT" || code === "BIL_DIR") {
        const tot = parseFloat((next["BIL_TOT"] || "").replace(",", "."));
        const dir = parseFloat((next["BIL_DIR"] || "").replace(",", "."));
        if (Number.isFinite(tot) && Number.isFinite(dir) && tot >= dir) {
          next["BIL_IND"] = String(Math.round((tot - dir) * 100) / 100);
        }
      }
      return next;
    });
  };

  // Helper: Fill qualitative "Neg." / normal defaults for active panels so Lab Tech only changes positive/abnormal ones
  const handleFillQualitativeDefaults = () => {
    const activePanels = LAB_PANELS_CATALOG.filter((p) => selectedPanelIds.includes(p.id));
    setParamValues((prev) => {
      const next = { ...prev };
      for (const panel of activePanels) {
        for (const param of panel.parameters) {
          if (param.inputType === "qualitative" && param.normalQualitative && !next[param.code]) {
            next[param.code] = param.normalQualitative;
          }
        }
      }
      return next;
    });
  };

  const toggleTargetDoctor = (docId: string) => {
    setTargetDoctorIds((prev) =>
      prev.includes(docId) ? prev.filter((x) => x !== docId) : [...prev, docId]
    );
  };

  const activePanels = useMemo(
    () => LAB_PANELS_CATALOG.filter((p) => selectedPanelIds.includes(p.id)),
    [selectedPanelIds]
  );

  const visibleSpecimenPanels = useMemo(
    () => LAB_PANELS_CATALOG.filter((p) => p.specimen === selectedSpecimen),
    [selectedSpecimen]
  );

  // Build evaluated structured results for all filled parameters
  const buildStructuredResults = (): EvaluatedLabResult[] => {
    const list: EvaluatedLabResult[] = [];
    for (const panel of activePanels) {
      for (const param of panel.parameters) {
        const raw = (paramValues[param.code] ?? "").trim();
        if (!raw) continue;
        const flag = evaluateParameterFlag(param, raw);
        if (flag === "EMPTY") continue;
        list.push({
          code: param.code,
          name: param.name,
          sectionTitle: panel.sectionHeaderEn,
          value: raw,
          unit: param.unit,
          referenceText: param.referenceText,
          min: param.min,
          max: param.max,
          normalQualitative: param.normalQualitative,
          flag,
        });
      }
    }
    return list;
  };

  const handleSaveAndSubmit = async (alsoPrintPdf: boolean) => {
    setFeedback(null);
    const structuredResults = buildStructuredResults();
    if (structuredResults.length === 0) {
      setFeedback({
        type: "err",
        text: tr3(lang, "Lütfen seçtiğiniz tahlilde en az bir parametre sonucunu doldurunuz.", "يرجى إدخال نتيجة مؤشر واحد على الأقل في التحليل المحدد.", "Please enter at least one parameter result in the selected panel."),
      });
      return;
    }

    if (mode === "direct" && !directPatientId) {
      setFeedback({ type: "err", text: tr3(lang, "Lütfen tahlil yapılacak hastayı seçiniz.", "يرجى اختيار المريض المطلوب إجراء التحليل له.", "Please select a patient for the lab test.") });
      return;
    }

    const panelTitleSummary = activePanels.map((p) => tr3(lang, p.titleTr, p.titleAr, p.titleEn).split("(")[0].trim()).join(" + ");
    const labTechFullName = currentUser?.fullName || tr3(lang, "Laboratuvar Uzmanı", "أخصائي المختبر", "Lab Specialist");

    setSaving(true);
    try {
      let savedOrder: LabReportOrder | null = null;

      if (mode === "order" && activeOrder) {
        const res = await apiFetch(`${API_URL}/lab-orders/${encodeURIComponent(activeOrder.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            specimenCategory: selectedSpecimen,
            panelIds: selectedPanelIds,
            testName: activeOrder.testName || panelTitleSummary,
            structuredResults,
            performedBy: labTechFullName,
            sharedDoctorIds: targetDoctorIds,
            roomNumber,
            notes: labNotes,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || tr3(lang, "Tahlil kaydedilemedi", "تعذر حفظ التحليل", "Could not save lab result"));
        savedOrder = data.labOrder;
      } else {
        const res = await apiFetch(`${API_URL}/lab-orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: directPatientId,
            doctorId: targetDoctorIds[0] || doctors[0]?.id || "",
            sharedDoctorIds: targetDoctorIds,
            specimenCategory: selectedSpecimen,
            panelIds: selectedPanelIds,
            testName: panelTitleSummary,
            structuredResults,
            performedBy: labTechFullName,
            roomNumber,
            notes: labNotes,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || tr3(lang, "Tahlil raporu oluşturulamadı", "تعذر إنشاء تقرير التحليل", "Could not create lab report"));
        savedOrder = data;
      }

      setFeedback({
        type: "ok",
        text: tr3(lang, "Laboratuvar sonuçları başarıyla kaydedildi ve seçilen doktorların ekranına gönderildi!", "تم حفظ نتائج التحاليل المخبرية وإرسالها إلى شاشات الأطباء المحددين بنجاح!", "Laboratory results saved and forwarded to the selected doctors' workspaces!"),
      });
      onRefresh();
      setMode("idle");
      setActiveOrder(null);
      setQueueTab("completed");

      if (savedOrder) {
        if (alsoPrintPdf) {
          openLabReportPrintWindow(savedOrder, lang);
        } else {
          setPreviewReport(savedOrder);
        }
      }
    } catch (err: any) {
      setFeedback({ type: "err", text: err.message || tr3(lang, "Kaydetme hatası", "خطأ في الحفظ", "Save error") });
    } finally {
      setSaving(false);
    }
  };

  const selectedPatientForDisplay = useMemo(() => {
    if (mode === "order" && activeOrder) {
      return {
        fullName:
          activeOrder.patient?.fullName ||
          activeOrder.patient?.user?.fullName ||
          activeOrder.record?.patient?.user?.fullName ||
          "Hasta",
        identityNo: activeOrder.patient?.identityNo || "-",
        phone: activeOrder.patient?.phone || "-",
      };
    }
    if (mode === "direct" && directPatientId) {
      const p = patients.find((x) => x.id === directPatientId);
      if (p) {
        return {
          fullName: p.fullName || p.user?.fullName || "Hasta",
          identityNo: p.identityNo || p.user?.identityNo || "-",
          phone: p.phone || p.user?.phone || "-",
        };
      }
    }
    return null;
  }, [mode, activeOrder, directPatientId, patients]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DCD0] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFE8DC] border border-[#E5DCD0] text-[#4A2E1B] text-[11px] font-bold uppercase mb-1">
            <FlaskConical size={12} className="text-[#B8860B]" />
            <span>{tr3(lang, "Mena Clinic • Akıllı Laboratuvar & Tahlil Raporlama Sistemi", "مجمع مينا الطبي • نظام المختبر والتقارير الذكي", "Mena Clinic • Smart Laboratory & Diagnostic Reporting System")}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2C1810]">
            {tr3(lang, "Laboratuvar Tahlil Girişi, Referans Kontrolü & PDF Rapor Merkezi", "إدخال التحاليل المخبرية، فحص القيم المرجعية وتصدير تقارير PDF", "Laboratory Result Entry, Reference Validation & PDF Report Hub")}
          </h3>
          <p className="text-xs text-[#6E492D]">
            {tr3(
              lang,
              "Önce ana tahlil türünü (Kan / İdrar / Gaita), ardından alt testi seçin; normal aralık dışındaki değerler otomatik kırmızı işaretlenir, normal değerler renksiz kalır.",
              "اختر نوع العينة أولاً (دم / بول / براز) ثم التحليل الفرعي؛ القيم خارج المعدل الطبيعي تظهر باللون الأحمر، والقيم الطبيعية تبقى بدون لون.",
              "First select the specimen category (Blood / Urine / Stool), then choose the sub-panel; out-of-range values are highlighted in red while normal values remain uncolored."
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-white border border-[#E5DCD0] hover:bg-[#FAF7F2] text-[#4A2E1B]"
            title={tr3(lang, "Yenile", "تحديث", "Refresh")}
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            onClick={handleStartDirectTest}
            className="px-4 py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
          >
            <Plus size={14} className="text-[#D4AF37]" />
            <span>{tr3(lang, "Yeni Tahlil Başlat (Hasta Seç)", "بدء تحليل جديد (اختيار مريض)", "Start New Lab Test (Select Patient)")}</span>
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
          <div className="flex items-center gap-2">
            {feedback.type === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{feedback.text}</span>
          </div>
          <button type="button" onClick={() => setFeedback(null)} className="font-bold px-2">
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (4 cols): Pending Doctor Orders & Completed Lab Reports */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#E5DCD0] rounded-2xl p-3 shadow-xs space-y-3">
            <div className="grid grid-cols-2 gap-1.5 bg-[#FAF7F2] p-1 rounded-xl border border-[#E5DCD0]">
              <button
                type="button"
                onClick={() => setQueueTab("pending")}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  queueTab === "pending"
                    ? "bg-[#4A2E1B] text-white shadow-xs"
                    : "text-[#6E492D] hover:bg-[#EFE8DC]"
                }`}
              >
                {tr3(lang, `Bekleyen İstekler (${pendingOrders.length})`, `الطلبات المعلقة (${pendingOrders.length})`, `Pending Orders (${pendingOrders.length})`)}
              </button>
              <button
                type="button"
                onClick={() => setQueueTab("completed")}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  queueTab === "completed"
                    ? "bg-[#4A2E1B] text-white shadow-xs"
                    : "text-[#6E492D] hover:bg-[#EFE8DC]"
                }`}
              >
                {tr3(lang, `Tamamlanan PDF (${completedOrders.length})`, `التقارير المكتملة (${completedOrders.length})`, `Completed PDF (${completedOrders.length})`)}
              </button>
            </div>

            {queueTab === "pending" ? (
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {pendingOrders.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#7D6E63] italic">
                    {tr3(lang, "Bekleyen tahlil isteği yok. Üstteki \"Yeni Tahlil Başlat\" butonuyla doğrudan hasta seçerek de tahlil girebilirsiniz.", "لا توجد طلبات تحاليل معلقة. يمكنك بدء تحليل جديد مباشرة باختيار المريض.", "No pending lab orders. You can also start a direct test by selecting a patient.")}
                  </div>
                ) : (
                  pendingOrders.map((order) => {
                    const isSelected = mode === "order" && activeOrder?.id === order.id;
                    const pName =
                      order.patient?.fullName ||
                      order.patient?.user?.fullName ||
                      order.record?.patient?.user?.fullName ||
                      tr3(lang, "Hasta", "مريض", "Patient");
                    const dName = order.doctor?.fullName || order.record?.doctor?.fullName || tr3(lang, "Hekim", "طبيب", "Doctor");
                    return (
                      <div
                        key={order.id}
                        onClick={() => handleSelectPendingOrder(order)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                          isSelected
                            ? "bg-[#FAF7F2] border-[#4A2E1B] ring-2 ring-[#4A2E1B]/20"
                            : "bg-white border-[#E5DCD0] hover:border-[#B8860B]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-[#2C1810]">{order.testName}</strong>
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                            {tr3(lang, "Bekliyor", "قيد الانتظار", "Pending")}
                          </span>
                        </div>
                        <div className="text-xs text-[#4A2E1B] font-semibold">{tr3(lang, "Hasta:", "المريض:", "Patient:")} {pName}</div>
                        <div className="text-[10px] text-[#7D6E63] flex justify-between">
                          <span>{tr3(lang, "İsteyen:", "الطبيب الطالب:", "Ordered by:")} {dName}</span>
                          <span>{new Date(order.createdAt).toLocaleDateString(lang === "ar" ? "ar-SY" : lang === "en" ? "en-US" : "tr-TR")}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {completedOrders.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#7D6E63] italic">
                    {tr3(lang, "Henüz tamamlanmış tahlil raporu bulunmuyor.", "لا توجد تقارير تحاليل مكتملة بعد.", "No completed lab reports yet.")}
                  </div>
                ) : (
                  completedOrders.map((order) => {
                    const pName =
                      order.patient?.fullName ||
                      order.patient?.user?.fullName ||
                      order.record?.patient?.user?.fullName ||
                      tr3(lang, "Hasta", "مريض", "Patient");
                    const outCount = (order.structuredResults || []).filter(
                      (r) => r.flag !== "NORMAL"
                    ).length;
                    return (
                      <div
                        key={order.id}
                        className="p-3.5 rounded-xl border border-[#E5DCD0] bg-[#FAF7F2]/60 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <strong className="text-xs font-bold text-[#2C1810] block">{pName}</strong>
                            <span className="text-[11px] text-[#6E492D] font-medium">{order.testName}</span>
                          </div>
                          {outCount > 0 && (
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold shrink-0">
                              {outCount} {tr3(lang, "Referans Dışı", "خارج الطبيعي", "Out of Range")}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#7D6E63] font-mono">
                          {new Date(order.completedAt || order.createdAt).toLocaleString(lang === "ar" ? "ar-SY" : lang === "en" ? "en-US" : "tr-TR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}{" "}
                          • {order.performedBy || tr3(lang, "Laboratuvar", "المختبر", "Laboratory")}
                        </div>
                        <div className="flex gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setPreviewReport(order)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-white border border-[#D5C7B5] hover:bg-[#EFE8DC] text-[#4A2E1B] text-[11px] font-bold flex items-center justify-center gap-1"
                          >
                            <Eye size={12} />
                            <span>{tr3(lang, "İncele / Gönder", "عرض / إرسال", "View / Share")}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openLabReportPrintWindow(order, lang)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#4A2E1B] hover:bg-[#382112] text-white text-[11px] font-bold flex items-center justify-center gap-1"
                          >
                            <FileDown size={12} className="text-[#D4AF37]" />
                            <span>{tr3(lang, "PDF Çıkart", "تصدير PDF", "Export PDF")}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (8 cols): Structured Step-by-Step Result Entry */}
        <div className="lg:col-span-8">
          {mode === "idle" ? (
            <div className="bg-white border border-[#E5DCD0] rounded-3xl p-10 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] flex items-center justify-center mx-auto text-[#4A2E1B]">
                <Microscope size={28} className="text-[#B8860B]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-serif font-bold text-[#2C1810]">
                  {tr3(lang, "Tahlil Girişi İçin İstek Seçin veya Yeni Tahlil Başlatın", "اختر طلباً من القائمة أو ابدأ تحليلاً مخبرياً جديداً", "Select a Pending Lab Order or Start a New Lab Test")}
                </h4>
                <p className="text-xs text-[#7D6E63] max-w-md mx-auto">
                  {tr3(
                    lang,
                    "Sol listeden doktorun istediği tetkike tıklayın ya da doğrudan bir hasta seçerek Kan (CBC, Biyokimya, Hormon, Seroloji, Tümör) veya İdrar tahlili başlatın.",
                    "اضغط على التحليل المطلوب من القائمة الجانبية أو اختر مريضاً مباشرة لبدء تحاليل الدم أو البول أو البراز.",
                    "Click a doctor-ordered test on the left or select a patient directly to enter Blood (CBC, Biochemistry, Hormones, Serology, Tumor Markers) or Urine tests."
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={handleStartDirectTest}
                className="px-5 py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm"
              >
                <Plus size={14} className="text-[#D4AF37]" />
                <span>{tr3(lang, "Yeni Tahlil Başlat", "بدء تحليل جديد", "Start New Lab Test")}</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[#E5DCD0] rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
              {/* Automatic Report Header Info Preview */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DCD0] pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A5F35] block">
                      {tr3(lang, "Otomatik Şablon Bilgileri", "بيانات نموذج التقرير التلقائية", "Automatic Report Template Metadata")}
                    </span>
                    <h4 className="text-base font-serif font-bold text-[#2C1810]">
                      {mode === "order"
                        ? `${tr3(lang, "İstenen Tetkik:", "التحليل المطلوب:", "Requested Test:")} ${activeOrder?.testName}`
                        : tr3(lang, "Yeni Laboratuvar Tahlil Kaydı", "تسجيل تحليل مخبري جديد", "New Laboratory Test Entry")}
                    </h4>
                  </div>
                  <div className="text-[11px] font-mono text-[#4A2E1B] bg-white px-3 py-1.5 rounded-xl border border-[#E5DCD0]">
                    <div>
                      <strong>{tr3(lang, "Yapan:", "فني المختبر:", "Lab Tech:")}</strong> {currentUser?.fullName || tr3(lang, "Laboratuvar Uzmanı", "أخصائي المختبر", "Lab Specialist")}
                    </div>
                    <div>
                      <strong>{tr3(lang, "Tarih/Saat:", "التاريخ والوقت:", "Date/Time:")}</strong>{" "}
                      {new Date().toLocaleString(lang === "ar" ? "ar-SY" : lang === "en" ? "en-US" : "tr-TR", { dateStyle: "short", timeStyle: "short" })}
                    </div>
                  </div>
                </div>

                {mode === "direct" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#4A2E1B] mb-1">
                        {tr3(lang, "Hasta Seçin (Harf Harf Arayın) *", "اختر المريض (ابحث حرفاً بحرف) *", "Select Patient (Search Letter-by-Letter) *")}
                      </label>
                      <PatientSearchSelect
                        patients={patients}
                        value={directPatientId}
                        onChange={setDirectPatientId}
                        required
                        lang={lang}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#4A2E1B] mb-1">
                        {tr3(lang, "Oda / Birim No", "رقم الغرفة / القسم", "Room / Unit No")}
                      </label>
                      <input
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-[#DDD2C1] text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  selectedPatientForDisplay && (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        {tr3(lang, "Hasta:", "المريض:", "Patient:")} <strong className="text-[#2C1810]">{selectedPatientForDisplay.fullName}</strong>{" "}
                        <span className="font-mono text-[#7D6E63]">
                          ({tr3(lang, "Kimlik:", "الرقم الوطني:", "ID:")} {selectedPatientForDisplay.identityNo} • {tr3(lang, "Tel:", "الهاتف:", "Phone:")} {selectedPatientForDisplay.phone})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#7D6E63]">{tr3(lang, "Oda:", "الغرفة:", "Room:")}</span>
                        <input
                          type="text"
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          className="w-28 px-2.5 py-1 rounded-lg bg-white border border-[#DDD2C1] text-xs"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* STEP 1: SELECT MAIN SPECIMEN GROUP (BLOOD vs URINE vs STOOL) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E1B]">
                  {tr3(lang, "1. Ana Tahlil Grubunu Seçin (Kan / İdrar / Gaita)", "1. اختر فئة العينة الرئيسية (دم / بول / براز)", "1. Select Specimen Category (Blood / Urine / Stool)")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SPECIMEN_CATEGORIES.map((cat) => {
                    const active = selectedSpecimen === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectSpecimen(cat.id)}
                        className={`p-3.5 rounded-2xl border text-left rtl:text-right transition-all ${
                          active
                            ? "bg-[#4A2E1B] text-white border-[#4A2E1B] shadow-md"
                            : "bg-[#FAF7F2] text-[#2C1810] border-[#E5DCD0] hover:bg-[#EFE8DC]"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs">
                          {cat.id === "BLOOD" ? (
                            <Droplets size={15} className={active ? "text-rose-300" : "text-rose-600"} />
                          ) : cat.id === "URINE" ? (
                            <TestTube2 size={15} className={active ? "text-amber-200" : "text-amber-600"} />
                          ) : (
                            <Microscope size={15} className={active ? "text-emerald-200" : "text-emerald-700"} />
                          )}
                          <span>{tr3(lang, cat.badge, cat.badgeAr, cat.badgeEn)}</span>
                        </div>
                        <div className={`text-[11px] mt-1 font-medium ${active ? "text-amber-100" : "text-[#6E492D]"}`}>
                          {tr3(lang, cat.subtitleTr, cat.subtitleAr, cat.subtitleEn)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: SELECT SUB-PANEL(S) FOR THE CHOSEN SPECIMEN */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E1B]">
                    {tr3(lang, "2. Yapılan Tahlil / Alt Panel Türünü Seçin (Birden Fazla Seçebilirsiniz)", "2. اختر نوع التحليل / اللوحة الفرعية (يمكن اختيار أكثر من تحليل)", "2. Select Diagnostic Sub-Panel(s) (Multi-Select Supported)")}
                  </label>
                  <span className="text-[10px] text-[#7D6E63]">
                    {selectedPanelIds.length} {tr3(lang, "panel aktif", "لوحة نشطة", "active")}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {visibleSpecimenPanels.map((panel) => {
                    const isChecked = selectedPanelIds.includes(panel.id);
                    return (
                      <button
                        key={panel.id}
                        type="button"
                        onClick={() => togglePanel(panel.id)}
                        className={`p-3 rounded-xl border text-left rtl:text-right text-xs transition-all flex items-center justify-between gap-2 ${
                          isChecked
                            ? "bg-amber-50 border-[#4A2E1B] text-[#2C1810] font-bold shadow-xs"
                            : "bg-white border-[#E5DCD0] text-[#5A483B] hover:bg-[#FAF7F2]"
                        }`}
                      >
                        <div>
                          <span className="block">{tr3(lang, panel.titleTr, panel.titleAr, panel.titleEn)}</span>
                          <span className="text-[10px] text-[#8A5F35] font-mono">
                            {panel.sectionHeaderEn} ({panel.parameters.length})
                          </span>
                        </div>
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                            isChecked
                              ? "bg-[#4A2E1B] text-white"
                              : "bg-[#FAF7F2] border border-[#DDD2C1] text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: ENTER PARAMETER RESULTS ONE BY ONE (STRICT RED IF OUT-OF-RANGE, PLAIN IF NORMAL) */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4A2E1B]">
                      {tr3(lang, "3. Değerleri Doldurun (Sadece Doldurulan Satırlar Rapora Çıkar)", "3. أدخل نتائج المؤشرات (تظهر المؤشرات المعبأة فقط في التقرير)", "3. Enter Parameter Values (Only Filled Rows Appear on Report)")}
                    </label>
                    <p className="text-[11px] text-[#7D6E63]">
                      {tr3(
                        lang,
                        "Normal değerin üstünde veya altındaysa kırmızı görünür; normal ise renksiz kalır.",
                        "إذا كانت القيمة أعلى أو أقل من المعدل الطبيعي تظهر باللون الأحمر، وإذا كانت طبيعية تبقى بدون لون.",
                        "Values above or below the reference range appear in red; normal values remain plain black."
                      )}
                    </p>
                  </div>
                  {activePanels.some((p) => p.parameters.some((pr) => pr.inputType === "qualitative")) && (
                    <button
                      type="button"
                      onClick={handleFillQualitativeDefaults}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DC] border border-[#D5C7B5] text-[11px] font-bold text-[#4A2E1B] flex items-center gap-1"
                    >
                      <Sparkles size={12} className="text-[#B8860B]" />
                      <span>{tr3(lang, "Nitel (Neg./Normal) Değerleri Hızlı Doldur", "تعبئة القيم النوعية الطبيعية (Neg.) تلقائياً", "Auto-Fill Normal Qualitative Defaults (Neg.)")}</span>
                    </button>
                  )}
                </div>

                {activePanels.map((panel) => (
                  <div key={panel.id} className="border border-[#D5C7B5] rounded-2xl overflow-hidden bg-white">
                    {/* Classic Section Banner */}
                    <div className="bg-[#FAF7F2] border-b border-[#E5DCD0] px-4 py-2.5 flex items-center justify-between">
                      <span className="font-extrabold italic text-xs text-red-700 tracking-wide">
                        {panel.sectionHeaderEn}
                      </span>
                      <span className="text-[11px] font-semibold text-[#6E492D]">{tr3(lang, panel.titleTr, panel.titleAr, panel.titleEn)}</span>
                    </div>

                    <div className="overflow-x-auto" dir="ltr">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#E5DCD0] text-blue-800 bg-white">
                            <th className="py-2.5 px-3 text-left w-[34%]">{tr3(lang, "Tetkik (Tests)", "التحليل (Tests)", "Tests")}</th>
                            <th className="py-2.5 px-3 text-center w-[26%]">{tr3(lang, "Sonuç Girişi (Results)", "إدخال النتيجة (Results)", "Results")}</th>
                            <th className="py-2.5 px-3 text-center w-[26%]">{tr3(lang, "Normal Değer (Reference Range)", "القيم الطبيعية (Reference Range)", "Reference Range")}</th>
                            <th className="py-2.5 px-3 text-left w-[14%]">{tr3(lang, "Birim (Units)", "الوحدة (Units)", "Units")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0E9DF]">
                          {panel.parameters.map((param) => {
                            const rawVal = paramValues[param.code] ?? "";
                            const flag = evaluateParameterFlag(param, rawVal);
                            const isOut = flag === "HIGH" || flag === "LOW" || flag === "ABNORMAL";

                            return (
                              <tr key={param.code} className="hover:bg-neutral-50/70">
                                <td className="py-2 px-3 font-bold text-neutral-900">{param.name}</td>
                                <td className="py-2 px-3 text-center">
                                  <div className="inline-flex items-center gap-1.5 justify-center w-full">
                                    {param.inputType === "qualitative" && param.qualitativeOptions ? (
                                      <select
                                        value={rawVal}
                                        onChange={(e) => handleValueChange(param.code, e.target.value)}
                                        className={`w-40 px-2.5 py-1.5 rounded-lg border text-xs font-mono focus:outline-none ${
                                          isOut
                                            ? "border-red-500 text-red-600 font-extrabold bg-white"
                                            : "border-neutral-300 text-neutral-900 font-normal bg-white"
                                        }`}
                                      >
                                        <option value="">{tr3(lang, "— Seçin —", "— اختر —", "— Select —")}</option>
                                        {param.qualitativeOptions.map((opt) => (
                                          <option key={opt} value={opt}>
                                            {opt}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        type={param.inputType === "number" ? "number" : "text"}
                                        step={param.step || "any"}
                                        value={rawVal}
                                        onChange={(e) => handleValueChange(param.code, e.target.value)}
                                        placeholder={tr3(lang, "Değer girin...", "أدخل القيمة...", "Enter value...")}
                                        className={`w-36 px-2.5 py-1.5 rounded-lg border text-center text-xs font-mono focus:outline-none ${
                                          isOut
                                            ? "border-red-500 text-red-600 font-extrabold bg-white"
                                            : "border-neutral-300 text-neutral-900 font-normal bg-white"
                                        }`}
                                      />
                                    )}
                                    {isOut && (
                                      <span className="text-[10px] font-extrabold text-red-600 shrink-0">
                                        {flag === "HIGH"
                                          ? tr3(lang, "↑ Yüksek", "↑ مرتفع", "↑ High")
                                          : flag === "LOW"
                                          ? tr3(lang, "↓ Düşük", "↓ منخفض", "↓ Low")
                                          : tr3(lang, "! Pozitif", "! إيجابي", "! Abnormal")}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-center font-mono text-neutral-900">
                                  {param.referenceText}
                                </td>
                                <td className="py-2 px-3 font-mono text-neutral-700">{param.unit}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>

              {/* STEP 4: NOTES & SEND TO DOCTORS + SAVE / EXPORT PDF */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A2E1B] mb-1">
                    {tr3(lang, "Laboratuvar Notu / Yorumu (İsteğe Bağlı)", "ملاحظات المختبر (اختياري)", "Laboratory Note / Comment (Optional)")}
                  </label>
                  <input
                    type="text"
                    value={labNotes}
                    onChange={(e) => setLabNotes(e.target.value)}
                    placeholder={tr3(lang, "Örn: Numune aç karnına alındı, hemoliz görülmedi...", "مثال: أخذت العينة على الريق...", "e.g., Fasting specimen collected, no hemolysis observed...")}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#DDD2C1] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2E1B] mb-1.5 flex items-center gap-1.5">
                    <Send size={13} className="text-[#B8860B]" />
                    <span>{tr3(lang, "4. Sonucu Hangi Doktor(lar)a Göndermek İstiyorsunuz?", "4. اختر الطبيب (أو الأطباء) لإرسال النتيجة إليهم:", "4. Select Doctor(s) to Receive This Report:")}</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {doctors.map((doc) => {
                      const selected = targetDoctorIds.includes(doc.id);
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => toggleTargetDoctor(doc.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                            selected
                              ? "bg-[#4A2E1B] text-white border-[#4A2E1B]"
                              : "bg-white text-[#4A2E1B] border-[#DDD2C1] hover:bg-[#EFE8DC]"
                          }`}
                        >
                          {selected ? "✓ " : "+ "}
                          {doc.fullName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-[#E5DCD0]">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("idle");
                      setActiveOrder(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#DDD2C1] text-xs font-bold text-[#6E492D]"
                  >
                    {tr3(lang, "Vazgeç", "إلغاء", "Cancel")}
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveAndSubmit(false)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <Send size={14} />
                    <span>{saving ? tr3(lang, "Kaydediliyor...", "جاري الحفظ...", "Saving...") : tr3(lang, "Kaydet & Seçili Doktorlara Gönder", "حفظ وإرسال للأطباء المحددين", "Save & Send to Selected Doctors")}</span>
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveAndSubmit(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <FileDown size={14} className="text-[#D4AF37]" />
                    <span>{tr3(lang, "Kaydet, Doktora Gönder & PDF Çıkart", "حفظ وإرسال للطبيب وتصدير PDF", "Save, Send to Doctor & Export PDF")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal for Viewing / Printing PDF / Forwarding */}
      {previewReport && (
        <LabReportModal
          order={previewReport}
          onClose={() => setPreviewReport(null)}
          allDoctors={doctors}
          canSendToDoctors={true}
          onUpdated={onRefresh}
          lang={lang}
        />
      )}
    </div>
  );
};
