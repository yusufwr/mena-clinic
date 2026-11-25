import { clinicDate } from "../clinicDate";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  RotateCcw,
  FileText,
  Pill,
  FlaskConical,
  Send,
  Download,
  Printer,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  Stethoscope,
  Activity,
  History,
  Phone,
  FileDown,
  Building,
  DollarSign,
  MessageCircle
} from "lucide-react";
import { AdminTranslations, tr3 } from "../i18n";
import { DoctorModel, apiFetch } from "../apiClient";
import { LabReportModal, LabReportOrder, openLabReportPrintWindow } from "./LabReportModal";

interface DoctorWorkspaceProps {
  currentUser: any;
  allDoctors: DoctorModel[];
  appointments: any[];
  patients: any[];
  labOrders?: LabReportOrder[];
  onRefreshLabs?: () => void;
  t: AdminTranslations;
  lang: string;
  selectedDoctorOverrideId?: string;
  onChangeDoctorOverride?: (docId: string) => void;
  onUpdateAppStatus: (id: string, status: string) => void;
  onAppointmentCreated?: () => void;
  apiUrl?: string;
  token?: string | null;
}

export const DoctorWorkspace: React.FC<DoctorWorkspaceProps> = ({
  currentUser,
  allDoctors,
  appointments,
  patients,
  labOrders = [],
  onRefreshLabs,
  t,
  lang,
  selectedDoctorOverrideId,
  onChangeDoctorOverride,
  onUpdateAppStatus,
  onAppointmentCreated,
  apiUrl = "/api",
  token = null,
}) => {
  const isRtl = lang === "ar";

  // Active view tab
  const [activeTab, setActiveTab] = useState<"queue" | "labs" | "schedule" | "weekly" | "archive">("queue");
  const [selectedLabReportModal, setSelectedLabReportModal] = useState<LabReportOrder | null>(null);

  // Selected doctor with safe fallback
  const fallbackDoctor: DoctorModel = {
    id: currentUser?.id || "doc-gastro-horo",
    fullName: currentUser?.fullName || "Dr. Mena Clinic",
    email: currentUser?.email || "doctor@menaclinic.com",
    phone: currentUser?.phone || "+963 991 223301",
    consultationFee: 1000,
    room: "Poliklinik 101",
    hours: "09:00 - 17:00",
    monthlyPatients: 42,
    commissionRate: 0.65,
    department: { name: "Genel Poliklinik" },
  };

  const canActAsAnyDoctor = currentUser?.role === "ADMIN" || currentUser?.role === "RECEPTIONIST";
  const [internalDocId, setInternalDocId] = useState<string>("");
  const activeOverrideId = selectedDoctorOverrideId || internalDocId;

  const currentDoctor =
    (canActAsAnyDoctor && activeOverrideId ? allDoctors.find((d) => d.id === activeOverrideId) : undefined) ||
    allDoctors.find((d) => d.id === currentUser?.id || d.email === currentUser?.email) ||
    (allDoctors.length > 0 ? allDoctors[0] : fallbackDoctor);

  const handleSelectActiveDoctor = (docId: string) => {
    setInternalDocId(docId);
    setSelectedApp(null);
    setSessionStarted(false);
    if (onChangeDoctorOverride) onChangeDoctorOverride(docId);
  };

  // Selected patient appointment for consultation
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // Active consultation state
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Chief Complaint & Clinical inputs
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [soapNotes, setSoapNotes] = useState({ diagnosis: "", clinicalNotes: "" });
  const [prescDrugs, setPrescDrugs] = useState<any[]>([]);
  const [drugInput, setDrugInput] = useState({ itemName: "", dosage: "", quantity: 1 });
  const [reqTests, setReqTests] = useState<string[]>([]);
  const [testInput, setTestInput] = useState("");

  // Extra Procedure / Surgery Payment Items sent to Cashier (Kasa)
  const [extraCharges, setExtraCharges] = useState<{ title: string; amount: number; category: string; notes: string }[]>([]);
  const [chargeInput, setChargeInput] = useState({ title: "", amount: "", category: "PROCEDURE", notes: "" });

  // Patient past records history
  const [pastRecords, setPastRecords] = useState<any[]>([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Referral to another doctor state
  const [referralDoctorId, setReferralDoctorId] = useState("");
  const [referralReason, setReferralReason] = useState("");
  const [referralPriority, setReferralPriority] = useState<"ROUTINE" | "URGENT">("ROUTINE");
  const [referralSuccess, setReferralSuccess] = useState("");

  // Feedback notifications
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  // Weekly calendar day filter
  const [selectedWeekDay, setSelectedWeekDay] = useState<number>(new Date().getDay());

  // Archive search
  const [archiveSearch, setArchiveSearch] = useState("");

  // Consultation Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (sessionStarted) {
      interval = setInterval(() => {
        setSessionSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      setSessionSeconds(0);
    }
    return () => clearInterval(interval);
  }, [sessionStarted]);

  // Format seconds into MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Load patient when clicked from queue
  const handleSelectPatient = (app: any) => {
    setSelectedApp(app);
    setSessionStarted(app.status === "IN_CONSULTATION");
    setSessionSeconds(0);
    setChiefComplaint(app.notes || app.chiefComplaint || tr3(lang, "Genel muayene ve klinik başvuru", "أعراض فحص عام واستشارة طبية", "General clinical consultation"));
    setSoapNotes({ diagnosis: "", clinicalNotes: "" });
    setPrescDrugs([]);
    setReqTests([]);
    setExtraCharges([]);
    setChargeInput({ title: "", amount: "", category: "PROCEDURE", notes: "" });
    setReferralSuccess("");
    setSaveSuccess("");
    setSaveError("");

    // Fetch past records
    const patientId = app.patientId || app.patient?.id;
    if (patientId) {
      apiFetch(`${apiUrl}/medical-records/patient/${patientId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setPastRecords(data);
          else setPastRecords([]);
        })
        .catch(() => setPastRecords([]));
    }
  };

  // Action: Start Consultation
  const handleStartConsultation = () => {
    if (!selectedApp) return;
    setSessionStarted(true);
    onUpdateAppStatus(selectedApp.id, "IN_CONSULTATION");
    selectedApp.status = "IN_CONSULTATION";
  };

  // Action: Mark Attendance
  const handleMarkAttendance = (appId: string, status: "CONFIRMED" | "WAITING" | "CANCELLED" | "COMPLETED") => {
    onUpdateAppStatus(appId, status);
  };

  // Action: Add Drug
  const addDrug = () => {
    if (!drugInput.itemName.trim()) return;
    setPrescDrugs([...prescDrugs, { ...drugInput }]);
    setDrugInput({ itemName: "", dosage: "", quantity: 1 });
  };

  const removeDrug = (index: number) => {
    setPrescDrugs(prescDrugs.filter((_, i) => i !== index));
  };

  // Action: Add Test
  const addTest = () => {
    if (!testInput.trim()) return;
    setReqTests([...reqTests, testInput.trim()]);
    setTestInput("");
  };

  const removeTest = (index: number) => {
    setReqTests(reqTests.filter((_, i) => i !== index));
  };

  // Action: Add Extra Procedure / Surgery Charge
  const addExtraCharge = () => {
    const amt = Number(chargeInput.amount);
    if (!chargeInput.title.trim() || !Number.isFinite(amt) || amt <= 0) return;
    setExtraCharges([
      ...extraCharges,
      {
        title: chargeInput.title.trim(),
        amount: amt,
        category: chargeInput.category,
        notes: chargeInput.notes.trim(),
      },
    ]);
    setChargeInput({ title: "", amount: "", category: "PROCEDURE", notes: "" });
  };

  const removeExtraCharge = (index: number) => {
    setExtraCharges(extraCharges.filter((_, i) => i !== index));
  };

  // Action: Finalize & Complete Consultation
  const handleFinalizeConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (!soapNotes.diagnosis.trim() || !soapNotes.clinicalNotes.trim()) {
      setSaveError(tr3(lang, "Lütfen tanı ve SOAP klinik notlarını doldurunuz.", "يرجى إدخال التشخيص والملاحظات السريرية قبل إنهاء الجلسة.", "Please fill in the diagnosis and SOAP clinical notes before completing."));
      return;
    }

    try {
      const payload = {
        patientId: selectedApp.patientId,
        doctorId: currentDoctor.id,
        appointmentId: selectedApp.id,
        diagnosis: soapNotes.diagnosis,
        clinicalNotes: `Şikayet: ${chiefComplaint}\n\n${soapNotes.clinicalNotes}`,
        prescriptionItems: prescDrugs,
        labTests: reqTests.map((t) => ({ testName: t, status: "PENDING" })),
        additionalCharges: extraCharges,
      };

      const saved = await apiFetch(`${apiUrl}/medical-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!saved.ok) throw new Error((await saved.json()).message || tr3(lang, "Kayıt kaydedilmedi", "تعذر حفظ السجل", "Could not save medical record"));
      // Update appointment status to COMPLETED
      onUpdateAppStatus(selectedApp.id, "COMPLETED");
      setSessionStarted(false);
      setSaveSuccess(tr3(lang, "Muayene başarıyla tamamlandı, EMR ve reçete kaydedildi.", "تم إنهاء المعاينة وتثبيت السجل الطبي والوصفة بنجاح!", "Consultation completed; medical record and prescription saved!"));

      setTimeout(() => {
        setSelectedApp(null);
        setSaveSuccess("");
      }, 2000);
    } catch (err: any) {
      setSaveError(err.message || tr3(lang, "Kayıt hatası oluştu.", "حدث خطأ في الحفظ.", "Save error occurred."));
    }
  };

  // Action: Refer to Another Doctor
  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !referralDoctorId) return;

    const targetDoc = allDoctors.find((d) => d.id === referralDoctorId);
    if (!targetDoc) return;

    try {
      const referralNote = `[SEVK / REFERRAL - Dr. ${currentDoctor.fullName} -> Dr. ${targetDoc.fullName}]\nÖncelik: ${referralPriority}\nNeden: ${referralReason}\nGeliş Şikayeti: ${chiefComplaint}`;

      const referral = await apiFetch(`${apiUrl}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          patientId: selectedApp.patientId,
          doctorId: targetDoc.id,
          slotTime: new Date(Date.now() + 86400000).toISOString(),
          notes: referralNote,
        }),
      });

      if (!referral.ok) throw new Error((await referral.json()).message || tr3(lang, "Sevk kaydedilmedi", "تعذر حفظ الإحالة", "Could not save referral"));
      setReferralSuccess(
        tr3(
          lang,
          `Hasta ${targetDoc.fullName} polikliniğine başarıyla sevk edildi (${referralPriority === "URGENT" ? "ACİL" : "Rutin"}).`,
          `تمت إحالة المريض بنجاح إلى ${targetDoc.fullName} (${referralPriority === "URGENT" ? "عاجل" : "عادي"}).`,
          `Patient referred to ${targetDoc.fullName} (${referralPriority === "URGENT" ? "URGENT" : "Routine"}).`
        )
      );
      setReferralReason("");
      if (onAppointmentCreated) onAppointmentCreated();
    } catch (error: any) {
      setSaveError(error.message || tr3(lang, "Sevk kaydedilmedi", "تعذر حفظ الإحالة", "Could not save referral"));
    }
  };

  // Filter appointments for this doctor
  let docAppointments = appointments.filter(
    (a) => a.doctorId === currentDoctor.id || a.doctor?.email === currentDoctor.email || a.doctor?.id === currentDoctor.id
  );

  // Filter lab reports sent to this doctor or belonging to this doctor's patients
  const doctorLabReports = labOrders.filter((ord) => {
    if (ord.status !== "COMPLETED") return false;
    if (ord.doctorId === currentDoctor.id) return true;
    if (Array.isArray(ord.sharedDoctorIds) && ord.sharedDoctorIds.includes(currentDoctor.id)) return true;
    if (docAppointments.some((a) => a.patientId === ord.patientId)) return true;
    return false;
  });

  const activePatientLabReports = selectedApp
    ? labOrders.filter(
        (ord) =>
          ord.status === "COMPLETED" &&
          (ord.patientId === selectedApp.patientId || ord.patientId === selectedApp.patient?.id)
      )
    : [];



  // Filter today's queue
  const todayStr = clinicDate();
  const todayQueue = docAppointments.filter((a) => {
    const dStr = (a.dateStr || a.slotTime || "").slice(0, 10);
    return dStr === todayStr || a.status === "CONFIRMED" || a.status === "IN_CONSULTATION" || a.status === "WAITING";
  });

  // Week days definition
  const weekDays = [
    { dayIndex: 1, nameTr: "Pazartesi", nameAr: "الإثنين", nameEn: "Monday" },
    { dayIndex: 2, nameTr: "Salı", nameAr: "الثلاثاء", nameEn: "Tuesday" },
    { dayIndex: 3, nameTr: "Çarşamba", nameAr: "الأربعاء", nameEn: "Wednesday" },
    { dayIndex: 4, nameTr: "Perşembe", nameAr: "الخميس", nameEn: "Thursday" },
    { dayIndex: 5, nameTr: "Cuma", nameAr: "الجمعة", nameEn: "Friday" },
    { dayIndex: 6, nameTr: "Cumartesi", nameAr: "السبت", nameEn: "Saturday" },
    { dayIndex: 0, nameTr: "Pazar", nameAr: "الأحد", nameEn: "Sunday" },
  ];

  // Daily Schedule slots (09:00 - 17:00)
  const scheduleSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30"
  ];

  // Patient Archive List
  const patientArchiveList = patients.filter((p) => {
    const q = archiveSearch.toLowerCase();
    const name = (p.fullName || p.user?.fullName || "").toLowerCase();
    const idNo = (p.identityNo || p.user?.identityNo || "").toLowerCase();
    const phone = (p.phone || p.user?.phone || "").toLowerCase();
    return name.includes(q) || idNo.includes(q) || phone.includes(q);
  });

  // Print Patient Archive as PDF
  const handleExportArchivePdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#2C1810]">
      {/* ADMIN / RECEPTIONIST POLYCLINIC SWITCHER */}
      {canActAsAnyDoctor && (
        <div className="bg-[#FAF7F2] border border-[#D5C7B5] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-bold text-[#4A2E1B] uppercase tracking-wider block">
              {currentUser?.role === "ADMIN"
                ? tr3(lang, "Yönetici Süper Yetki • Poliklinik Seçimi", "صلاحية المدير العام • اختيار العيادة", "Admin Super Access • Select Clinic")
                : tr3(lang, "Danışma Destek Yetkisi • Poliklinik Seçimi", "صلاحية دعم الاستقبال • اختيار العيادة", "Reception Support Access • Select Clinic")}
            </span>
            <span className="text-[11px] text-[#7D6E63]">
              {tr3(lang, "İşlem yapmak, muayene/reçete girmek veya ek ödeme oluşturmak istediğiniz hekimi seçin:", "اختر الطبيب لإجراء المعاينة أو كتابة الوصفة أو تسجيل رسوم إضافية:", "Select the physician whose clinic, consultation, prescription, or extra charges you want to manage:")}
            </span>
          </div>
          <select
            value={currentDoctor.id}
            onChange={(e) => handleSelectActiveDoctor(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#B8860B] text-xs font-bold text-[#2C1810] min-w-[240px]"
          >
            {allDoctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName} ({d.department?.name || d.room})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 1. DOCTOR POLICLINIC HEADER */}
      <div className="bg-white border border-[#E5DCD0] rounded-3xl p-4 sm:p-6 2xl:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#4A2E1B] text-amber-200 flex items-center justify-center font-bold shadow-md shrink-0">
            <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-[#2C1810]">
                {currentDoctor.fullName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {tr3(lang, "Poliklinik Aktif", "متواجد في العيادة", "Clinic Active")}
              </span>
            </div>
            <p className="text-xs text-[#8A5F35] font-semibold mt-0.5">
              {currentDoctor.department?.name || currentDoctor.room} • {currentDoctor.room || "Poliklinik 101"}
            </p>
            <p className="text-[11px] text-[#7D6E63] mt-1 font-mono">
              {currentDoctor.phone} • {currentDoctor.email}
            </p>
          </div>
        </div>

        {/* Doctor Stats & Consultation Fee */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3">
          <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] text-center flex-1 sm:flex-initial">
            <span className="block text-[10px] text-[#7D6E63] uppercase font-bold">{t.feePerVisit}</span>
            <strong className="text-xs sm:text-sm font-bold text-[#4A2E1B]">{currentDoctor.consultationFee?.toLocaleString()} {t.currency}</strong>
          </div>
          <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] text-center flex-1 sm:flex-initial">
            <span className="block text-[10px] text-[#7D6E63] uppercase font-bold">{t.totalAppointments}</span>
            <strong className="text-xs sm:text-sm font-bold text-[#4A2E1B]">{docAppointments.length} {tr3(lang, "Hasta", "مريض", "Patients")}</strong>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-[#E5DCD0] pb-2 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => setActiveTab("queue")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs ${
            activeTab === "queue"
              ? "bg-[#4A2E1B] text-white shadow-sm"
              : "bg-white text-[#5A483B] hover:bg-[#FAF7F2] border border-[#E5DCD0]"
          }`}
        >
          <Activity className="w-4 h-4 text-amber-200" />
          <span>{t.patientQueue}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {todayQueue.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("labs");
            onRefreshLabs?.();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs ${
            activeTab === "labs"
              ? "bg-[#4A2E1B] text-white shadow-sm"
              : "bg-white text-[#5A483B] hover:bg-[#FAF7F2] border border-[#E5DCD0]"
          }`}
        >
          <FlaskConical className="w-4 h-4 text-amber-200" />
          <span>{tr3(lang, "Laboratuvar Raporları", "تقارير المختبر", "Lab Reports")}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {doctorLabReports.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs ${
            activeTab === "schedule"
              ? "bg-[#4A2E1B] text-white shadow-sm"
              : "bg-white text-[#5A483B] hover:bg-[#FAF7F2] border border-[#E5DCD0]"
          }`}
        >
          <Clock className="w-4 h-4 text-amber-200" />
          <span>{t.dailySchedule}</span>
        </button>

        <button
          onClick={() => setActiveTab("weekly")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs ${
            activeTab === "weekly"
              ? "bg-[#4A2E1B] text-white shadow-sm"
              : "bg-white text-[#5A483B] hover:bg-[#FAF7F2] border border-[#E5DCD0]"
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-200" />
          <span>{t.weeklySchedule}</span>
        </button>

        <button
          onClick={() => setActiveTab("archive")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs ${
            activeTab === "archive"
              ? "bg-[#4A2E1B] text-white shadow-sm"
              : "bg-white text-[#5A483B] hover:bg-[#FAF7F2] border border-[#E5DCD0]"
          }`}
        >
          <History className="w-4 h-4 text-amber-200" />
          <span>{t.patientArchive}</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: PATIENT QUEUE & ACTIVE CONSULTATION */}
      {activeTab === "queue" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {/* QUEUE COLUMN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-bold tracking-wider text-[#6E492D] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8A5F35]" />
                <span>{tr3(lang, "Bugünkü Hasta Muayene Kuyruğu", "قائمة انتظار اليوم", "Today's Patient Queue")}</span>
              </h3>
              <span className="text-xs text-[#7D6E63] font-mono">{todayQueue.length} {tr3(lang, "Kayıt", "حالة", "Records")}</span>
            </div>

            <div className="space-y-3">
              {todayQueue.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#E5DCD0] rounded-2xl text-xs text-[#7D6E63] italic">
                  {tr3(lang, "Bugünkü kuyrukta bekleyen hasta bulunmamaktadır.", "لا توجد مواعيد متبقية في طابور اليوم.", "No patients waiting in today's queue.")}
                </div>
              ) : (
                todayQueue.map((app) => {
                  const isSelected = selectedApp?.id === app.id;
                  const patName = app.patient?.fullName || app.patient?.user?.fullName || tr3(lang, "Kayıtlı Hasta", "مريض مسجل", "Registered Patient");
                  const slotStr = app.timeStr || (app.slotTime ? new Date(app.slotTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "10:00");
                  const complaint = app.notes || app.chiefComplaint || tr3(lang, "Genel Muayene", "معاينة عامة", "General Consultation");

                  return (
                    <div
                      key={app.id}
                      onClick={() => handleSelectPatient(app)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative space-y-2.5 ${
                        isSelected
                          ? "bg-[#FAF7F2] border-[#4A2E1B] ring-2 ring-[#4A2E1B]/20 shadow-md"
                          : "bg-white border-[#E5DCD0] hover:border-[#C5A880] shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#4A2E1B] text-amber-200 font-mono text-xs font-bold flex items-center justify-center">
                            #{app.queueNumber || 1}
                          </span>
                          <strong className="text-xs font-bold text-[#2C1810]">{patName}</strong>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-[#8A5F35] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E5DCD0]">
                          {slotStr}
                        </span>
                      </div>

                      {/* Complaint Preview */}
                      <p className="text-[11px] text-[#6A584A] line-clamp-1 italic bg-[#FAF7F2] p-1.5 rounded-lg border border-[#EFE8DC]">
                        <strong>{tr3(lang, "Şikayet: ", "الشكوى: ", "Complaint: ")}</strong>
                        {complaint}
                      </p>

                      {/* Status & Attendance Action Buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#E5DCD0]">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            app.status === "IN_CONSULTATION"
                              ? "bg-amber-100 text-amber-900 animate-pulse"
                              : app.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : app.status === "CANCELLED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {app.status === "IN_CONSULTATION"
                            ? tr3(lang, "Muayenede", "في غرفة المعاينة", "In Consultation")
                            : app.status === "COMPLETED"
                            ? tr3(lang, "Tamamlandı", "تمت المعاينة", "Completed")
                            : app.status === "CANCELLED"
                            ? tr3(lang, "Gelmedi / İptal", "ملغى / لم يحضر", "Cancelled / No-Show")
                            : tr3(lang, "Bekliyor", "في الانتظار", "Waiting")}
                        </span>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            title={t.patientArrived}
                            onClick={() => handleMarkAttendance(app.id, "CONFIRMED")}
                            className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title={t.patientNoShow}
                            onClick={() => handleMarkAttendance(app.id, "CANCELLED")}
                            className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ACTIVE CONSULTATION WORKSPACE */}
          <div className="lg:col-span-2 2xl:col-span-3 space-y-6">
            {selectedApp ? (
              <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 shadow-md space-y-6">
                
                {/* Patient Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DCD0] gap-4">
                  <div>
                    <span className="text-[10px] text-[#8A5F35] font-bold uppercase tracking-wider block">
                      {tr3(lang, "Muayene Edilen Hasta", "المريض تحت المعاينة", "Active Consultation Patient")}
                    </span>
                    <h3 className="text-xl font-bold font-serif text-[#2C1810]">
                      {selectedApp.patient?.fullName || selectedApp.patient?.user?.fullName}
                    </h3>
                    <p className="text-xs text-[#6A584A] mt-0.5">
                      {tr3(lang, "Kimlik No: ", "الرقم الوطني: ", "National ID: ")}
                      <span className="font-mono">{selectedApp.patient?.identityNo || selectedApp.patient?.user?.identityNo}</span>
                      {" • "}
                      {tr3(lang, "Telefon: ", "الهاتف: ", "Phone: ")}
                      <span className="font-mono">{selectedApp.patient?.phone || selectedApp.patient?.user?.phone}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Past Records History Button */}
                    <button
                      type="button"
                      onClick={() => setHistoryModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#E5DCD0] text-xs font-bold text-[#4A2E1B] flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <History className="w-3.5 h-3.5 text-[#8A5F35]" />
                      <span>{t.pastConsultationsHistory}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-[#4A2E1B] text-amber-200 text-[10px]">
                        {pastRecords.length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Chief Complaint Display & Edit Banner */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-2">
                  <label className="text-xs font-bold text-[#4A2E1B] flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#8A5F35]" />
                    <span>{t.chiefComplaint}</span>
                  </label>
                  <input
                    type="text"
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder={t.complaintPlaceholder}
                    className="w-full bg-white border border-[#DDD2C1] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
                  />
                </div>

                {/* START CONSULTATION BUTTON / ACTIVE TIMER BANNER */}
                {!sessionStarted ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FAF7F2] via-[#F3EDE2] to-[#FAF7F2] border-2 border-dashed border-[#B8860B]/40 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#4A2E1B] text-amber-200 flex items-center justify-center mx-auto shadow-md">
                      <Play className="w-6 h-6 rtl:rotate-180" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold font-serif text-[#2C1810]">
                        {tr3(lang, "Muayene Oturumu Başlamaya Hazır", "جلسة المعاينة الطبية جاهزة للبدء", "Consultation Session Ready to Start")}
                      </h4>
                      <p className="text-xs text-[#7D6E63] max-w-md mx-auto">
                        {tr3(
                          lang,
                          "SOAP notları, e-reçete ve sevk araçlarını aktifleştirmek için oturumu başlatın.",
                          "اضغط على زر بدء الجلسة لتفعيل الملاحظات السريرية، الوصفة الطبية، وطلب الفحوصات.",
                          "Click Start Consultation to activate SOAP notes, e-prescriptions, lab requests, and referrals."
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartConsultation}
                      className="px-6 py-3 rounded-2xl bg-[#4A2E1B] hover:bg-[#382112] text-amber-200 hover:text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#4A2E1B]/20 transition-all transform active:scale-95 inline-flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 rtl:rotate-180 text-amber-200" />
                      <span>{t.startConsultation}</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-600 animate-ping" />
                      <div>
                        <strong className="text-xs text-emerald-900 block font-bold">
                          {t.consultationInProgress}
                        </strong>
                        <span className="text-[11px] text-emerald-700">
                          {t.activeConsultationTimer}: <strong className="font-mono text-sm">{formatTimer(sessionSeconds)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications */}
                {saveSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{saveSuccess}</span>
                  </div>
                )}
                {saveError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* SOAP FORM & CLINICAL TOOLS */}
                <form onSubmit={handleFinalizeConsultation} className="space-y-5">
                  {/* Diagnosis Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4A2E1B] uppercase tracking-wider block">
                      {tr3(lang, "Klinik Tanı (ICD-10 Kodu & Açıklama)", "التشخيص الطبي (ICD-10)", "Clinical Diagnosis (ICD-10 Code & Description)")}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={tr3(lang, "Örn: K29.7 - Akut Gastrit veya I10 - Primer Hipertansiyon", "مثال: K29.7 - التهاب المعدة الحاد أو I10 - ارتفاع ضغط الدم الشرياني", "e.g., K29.7 - Acute Gastritis or I10 - Essential Hypertension")}
                      value={soapNotes.diagnosis}
                      onChange={(e) => setSoapNotes({ ...soapNotes, diagnosis: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-2xl px-4 py-2.5 text-xs text-[#2C1810] focus:outline-none focus:border-[#4A2E1B] font-medium"
                    />
                  </div>

                  {/* SOAP Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4A2E1B] uppercase tracking-wider block">
                      {tr3(lang, "SOAP Klinik Notları & Bulgular", "ملاحظات المعاينة وخطة العلاج (SOAP Notes)", "SOAP Clinical Notes & Examination Findings")}
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder={tr3(
                        lang,
                        "S (Şikayet): Yemek sonrası epigastrik yanma ve dolgunluk.\nO (Bulgular): TA: 120/80 mmHg, batın palpasyonda hassas.\nA (Değerlendirme): Akut gastrit alevlenmesi.\nP (Plan): PPI tedavisi ve diyet önerileri.",
                        "S (الشكوى): ألم شرسوفي بعد الأكل.\nO (الفحص السريري): البطن لينة مع إيلام خفيف.\nA (التقييم): أعراض التهاب غشاء المعدة.\nP (الخطة): حمية ومثبط مضخة البروتون.",
                        "S (Subjective): Postprandial epigastric burning.\nO (Objective): BP 120/80 mmHg, mild epigastric tenderness.\nA (Assessment): Acute gastritis flare.\nP (Plan): PPI therapy and dietary guidance."
                      )}
                      value={soapNotes.clinicalNotes}
                      onChange={(e) => setSoapNotes({ ...soapNotes, clinicalNotes: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-2xl p-4 text-xs font-mono text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
                    />
                  </div>

                  {/* ELECTRONIC PRESCRIPTION WRITER */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-3">
                    <span className="text-xs font-bold text-[#4A2E1B] flex items-center gap-1.5 uppercase tracking-wider">
                      <Pill className="w-4 h-4 text-[#8A5F35]" />
                      <span>{t.prescriptions}</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder={tr3(lang, "İlaç Adı (Örn: Nexium 40mg)", "اسم الدواء (مثال: Nexium 40mg)", "Medication Name (e.g., Nexium 40mg)")}
                        value={drugInput.itemName}
                        onChange={(e) => setDrugInput({ ...drugInput, itemName: e.target.value })}
                        className="sm:col-span-2 bg-white border border-[#DDD2C1] rounded-xl px-3 py-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder={tr3(lang, "Dozaj (Örn: 1x1 Aç Karnına)", "الجرعة (مثال: 1x1 صباحاً قبل الأكل)", "Dosage (e.g., 1x1 Before Meals)")}
                        value={drugInput.dosage}
                        onChange={(e) => setDrugInput({ ...drugInput, dosage: e.target.value })}
                        className="bg-white border border-[#DDD2C1] rounded-xl px-3 py-2 text-xs"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          value={drugInput.quantity}
                          onChange={(e) => setDrugInput({ ...drugInput, quantity: parseInt(e.target.value) || 1 })}
                          className="w-16 bg-white border border-[#DDD2C1] rounded-xl px-2 py-2 text-xs text-center font-bold"
                        />
                        <button
                          type="button"
                          onClick={addDrug}
                          className="px-3 py-2 rounded-xl bg-[#4A2E1B] text-amber-200 font-bold hover:bg-[#382112] text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {prescDrugs.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-[11px] font-bold text-[#8A5F35]">
                            {tr3(lang, "Eklenen İlaçlar:", "قائمة الأدوية المضافة:", "Added Medications:")}
                          </span>
                          <a
                            href={`https://api.whatsapp.com/send?phone=${(selectedApp?.patient?.phone || "").replace(/\D/g, "")}&text=${encodeURIComponent(
                              `🏥 *Mena Clinic - Rx*\n${selectedApp?.patient?.fullName || ""}\n${currentDoctor.fullName}\n${new Date().toISOString().slice(0, 10)}\n${prescDrugs.map((d: any, i: number) => `  ${i + 1}. *${d.itemName}* (${d.dosage}) - ${d.quantity}`).join("\n")}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-xs"
                          >
                            <MessageCircle size={12} />
                            <span>{tr3(lang, "WhatsApp ile Paylaş 📲", "إرسال للواتساب 📲", "Share via WhatsApp 📲")}</span>
                          </a>
                        </div>
                        {prescDrugs.map((d, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E5DCD0] text-xs"
                          >
                            <div>
                              <strong className="text-[#2C1810]">{d.itemName}</strong>
                              <span className="text-[#7D6E63] mx-2">• {d.dosage}</span>
                              <span className="text-[#8A5F35] font-bold font-mono">({d.quantity} {tr3(lang, "Kutu", "علبة", "Box")})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDrug(index)}
                              className="text-rose-600 hover:text-rose-800 text-[11px] font-bold"
                            >
                              {tr3(lang, "Kaldır", "حذف", "Remove")}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* LAB ORDERS + COMPLETED LAB REPORTS FOR THIS PATIENT */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-3">
                    <span className="text-xs font-bold text-[#4A2E1B] flex items-center gap-1.5 uppercase tracking-wider">
                      <FlaskConical className="w-4 h-4 text-[#8A5F35]" />
                      <span>{t.labOrders}</span>
                    </span>

                    {/* Quick Panel Request Presets */}
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {[
                        "CBC (Hemogram)",
                        "Biochemistry (Glucose, Urea, Creatinine, Cholesterol, ALT)",
                        "Coagulation (D-Dimer, ESR, PTT)",
                        "Hormones (TSH, Free T4, Prolactin)",
                        "Serology (CRP, RF, ASLO, Wright, Widal)",
                        "Urinalysis (Complete Urine)",
                        "Hepatitis Profile (HBsAg, HCV, HAV)",
                        "Tumor Markers (PSA, CEA, AFP, CA125)",
                      ].map((presetName) => (
                        <button
                          key={presetName}
                          type="button"
                          onClick={() => {
                            if (!reqTests.includes(presetName)) {
                              setReqTests([...reqTests, presetName]);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#EFE8DC] border border-[#DDD2C1] text-[#4A2E1B] font-semibold"
                        >
                          + {presetName}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={tr3(lang, "İstenecek Tahlil (Örn: CBC, CRP, Urinalysis, TSH)", "اسم التحليل (مثال: CBC, CRP, TSH, Urinalysis)", "Lab Test to Order (e.g., CBC, CRP, Urinalysis, TSH)")}
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        className="flex-grow bg-white border border-[#DDD2C1] rounded-xl px-3 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={addTest}
                        className="px-4 py-2 rounded-xl bg-[#4A2E1B] text-amber-200 font-bold hover:bg-[#382112] text-xs"
                      >
                        +
                      </button>
                    </div>

                    {reqTests.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {reqTests.map((tItem, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DDD2C1] text-xs font-medium text-[#4A2E1B]"
                          >
                            {tItem}
                            <button
                              type="button"
                              onClick={() => removeTest(index)}
                              className="text-rose-600 hover:text-rose-800 text-[10px] font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Completed Lab Reports for this Patient */}
                    {activePatientLabReports.length > 0 && (
                      <div className="pt-3 border-t border-[#E5DCD0] space-y-2">
                        <span className="text-[11px] font-bold text-[#4A2E1B] block">
                          {tr3(lang, `Bu Hastanın Tamamlanan Laboratuvar Sonuçları (${activePatientLabReports.length}):`, `نتائج التحاليل المخبرية المكتملة لهذا المريض (${activePatientLabReports.length}):`, `Completed Laboratory Reports for This Patient (${activePatientLabReports.length}):`)}
                        </span>
                        {activePatientLabReports.map((rep) => {
                          const outCount = (rep.structuredResults || []).filter((r) => r.flag !== "NORMAL").length;
                          return (
                            <div
                              key={rep.id}
                              className="p-3 rounded-xl bg-white border border-[#DDD2C1] flex flex-wrap items-center justify-between gap-2 text-xs"
                            >
                              <div>
                                <strong className="text-[#2C1810]">{rep.testName}</strong>
                                {outCount > 0 && (
                                  <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                                    {outCount} {tr3(lang, "Referans Dışı Değer", "قيمة خارج الطبيعي", "Out-of-Range")}
                                  </span>
                                )}
                                <div className="text-[10px] text-[#7D6E63] font-mono mt-0.5">
                                  {new Date(rep.completedAt || rep.createdAt).toLocaleString(lang === "ar" ? "ar-SY" : lang === "en" ? "en-US" : "tr-TR", {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  })}{" "}
                                  • {tr3(lang, "Yapan:", "المختبر:", "By:")} {rep.performedBy || tr3(lang, "Laboratuvar", "المختبر", "Laboratory")}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedLabReportModal(rep)}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE8DC] border border-[#D5C7B5] text-[#4A2E1B] text-[11px] font-bold"
                                >
                                  {tr3(lang, "Sonuçları Gör", "عرض النتائج", "View Results")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openLabReportPrintWindow(rep, lang)}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#4A2E1B] hover:bg-[#382112] text-white text-[11px] font-bold flex items-center gap-1"
                                >
                                  <FileDown size={12} className="text-amber-200" />
                                  <span>{tr3(lang, "PDF Çıkart", "تصدير PDF", "Export PDF")}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* EXTRA PROCEDURE / SURGERY PAYMENT CHARGES (SENT TO CASHIER / KASA) */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#4A2E1B] flex items-center gap-1.5 uppercase tracking-wider">
                        <DollarSign className="w-4 h-4 text-[#B8860B]" />
                        <span>
                          {tr3(
                            lang,
                            "Ek Tedavi / Ameliyat / Protez Ücreti Ekle (Kasaya Gönderilir)",
                            "رسوم إجراءات / عمليات إضافية (تُرسل للصندوق)",
                            "Add Extra Procedure / Surgery Fee (Sent to Cashier)"
                          )}
                        </span>
                      </span>
                      <span className="text-[10px] text-[#7D6E63]">
                        {tr3(lang, "Muayene harici ek işlemler Danışma Kasasına tahsilat için düşer", "تُرسل الرسوم الإضافية مباشرة إلى صندوق الاستقبال للتحصيل", "Extra procedure fees are sent to the Reception Cashier for cash collection")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {[
                        { t: tr3(lang, "Protez Ameliyatı", "عملية تركيب طرف صناعي", "Prosthesis Surgery"), c: "SURGERY", a: "15000" },
                        { t: tr3(lang, "Kanal Tedavisi / İmplant", "سحب عصب / زراعة أسنان", "Root Canal / Dental Implant"), c: "PROCEDURE", a: "5000" },
                        { t: tr3(lang, "Küçük Cerrahi Müdahale", "تداخل جراحي صغرى", "Minor Surgical Procedure"), c: "SURGERY", a: "4000" },
                        { t: tr3(lang, "Ekokardiyografi / Endoskopi", "إيكو قلب / تنظير", "Echocardiography / Endoscopy"), c: "PROCEDURE", a: "2500" },
                      ].map((p) => (
                        <button
                          key={p.t}
                          type="button"
                          onClick={() => setChargeInput({ title: p.t, category: p.c, amount: p.a, notes: "" })}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FAF7F2] border border-[#E5DCD0] text-[#4A2E1B] font-semibold"
                        >
                          + {p.t} ({p.a} {t.currency})
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder={tr3(lang, "İşlem / Ödeme Türü (Örn: Protez Ameliyatı)", "اسم الإجراء أو العملية...", "Procedure / Surgery Title...")}
                        value={chargeInput.title}
                        onChange={(e) => setChargeInput({ ...chargeInput, title: e.target.value })}
                        className="sm:col-span-2 bg-white border border-[#DDD2C1] rounded-xl px-3 py-2 text-xs"
                      />
                      <select
                        value={chargeInput.category}
                        onChange={(e) => setChargeInput({ ...chargeInput, category: e.target.value })}
                        className="bg-white border border-[#DDD2C1] rounded-xl px-2.5 py-2 text-xs"
                      >
                        <option value="PROCEDURE">{tr3(lang, "Ek Tedavi / İşlem", "إجراء علاجي إضافي", "Extra Procedure")}</option>
                        <option value="SURGERY">{tr3(lang, "Ameliyat / Protez", "عملية جراحية", "Surgery / Prosthesis")}</option>
                        <option value="OTHER">{tr3(lang, "Diğer Ücret", "رسوم أخرى", "Other Fee")}</option>
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          placeholder={`${tr3(lang, "Tutar", "المبلغ", "Amount")} (${t.currency})`}
                          value={chargeInput.amount}
                          onChange={(e) => setChargeInput({ ...chargeInput, amount: e.target.value })}
                          className="w-full bg-white border border-[#DDD2C1] rounded-xl px-2.5 py-2 text-xs font-mono font-bold"
                        />
                        <button
                          type="button"
                          onClick={addExtraCharge}
                          className="px-3.5 py-2 rounded-xl bg-[#4A2E1B] text-amber-200 font-bold hover:bg-[#382112] text-xs shrink-0"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {extraCharges.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {extraCharges.map((chg, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200 text-xs"
                          >
                            <div>
                              <strong className="text-[#2C1810]">{chg.title}</strong>
                              <span className="mx-2 text-[#8A5F35] font-mono font-bold">
                                {chg.amount.toLocaleString("tr-TR")} {t.currency}
                              </span>
                              <span className="text-[10px] text-[#7D6E63]">
                                ({chg.category === "SURGERY" ? tr3(lang, "Ameliyat/Protez", "عملية جراحية", "Surgery") : tr3(lang, "Ek İşlem", "إجراء إضافي", "Extra Procedure")})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeExtraCharge(idx)}
                              className="text-rose-600 hover:text-rose-800 text-[11px] font-bold"
                            >
                              {tr3(lang, "Kaldır", "حذف", "Remove")}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* DOCTOR REFERRAL SYSTEM (BAŞKA DOKTORA SEVK) */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-3">
                    <span className="text-xs font-bold text-[#4A2E1B] flex items-center gap-1.5 uppercase tracking-wider">
                      <Send className="w-4 h-4 text-[#8A5F35]" />
                      <span>{t.referToDoctor}</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[#7D6E63] block mb-1">
                          {t.selectReferralDoctor}
                        </label>
                        <select
                          value={referralDoctorId}
                          onChange={(e) => setReferralDoctorId(e.target.value)}
                          className="w-full bg-white border border-[#DDD2C1] rounded-xl px-3 py-2 text-xs text-[#2C1810]"
                        >
                          <option value="">{tr3(lang, "-- Sevk Edilecek Doktor Seçin --", "-- اختر استشاري للتحويل --", "-- Select Specialist to Refer --")}</option>
                          {allDoctors
                            .filter((d) => d.id !== currentDoctor.id)
                            .map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.fullName} ({d.department?.name || d.room})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#7D6E63] block mb-1">
                          {t.referralPriority}
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setReferralPriority("ROUTINE")}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                              referralPriority === "ROUTINE"
                                ? "bg-[#4A2E1B] text-white border-[#4A2E1B]"
                                : "bg-white text-[#7D6E63] border-[#DDD2C1]"
                            }`}
                          >
                            {t.routine}
                          </button>
                          <button
                            type="button"
                            onClick={() => setReferralPriority("URGENT")}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                              referralPriority === "URGENT"
                                ? "bg-rose-700 text-white border-rose-700"
                                : "bg-white text-[#7D6E63] border-[#DDD2C1]"
                            }`}
                          >
                            {t.urgent}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder={t.referralReason}
                        value={referralReason}
                        onChange={(e) => setReferralReason(e.target.value)}
                        className="w-full bg-white border border-[#DDD2C1] rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      {referralSuccess ? (
                        <span className="text-xs text-emerald-700 font-bold">{referralSuccess}</span>
                      ) : <span />}
                      <button
                        type="button"
                        onClick={handleCreateReferral}
                        disabled={!referralDoctorId}
                        className="px-4 py-2 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-amber-200 text-xs font-bold transition-all disabled:opacity-40"
                      >
                        {t.confirmReferral}
                      </button>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#4A2E1B]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-amber-200" />
                    <span>{t.endConsultation}</span>
                  </button>
                </form>

              </div>
            ) : (
              <div className="bg-white border border-[#E5DCD0] rounded-3xl p-12 text-center text-[#7D6E63] space-y-3">
                <Stethoscope className="w-12 h-12 text-[#8A5F35] mx-auto opacity-40" />
                <h4 className="text-base font-bold font-serif text-[#2C1810]">
                  {tr3(lang, "Lütfen sol taraftaki kuyruktan bir hasta seçiniz", "يرجى اختيار مريض من قائمة الانتظار", "Please select a patient from the queue on the left")}
                </h4>
                <p className="text-xs text-[#8A796D] max-w-sm mx-auto">
                  {tr3(
                    lang,
                    "Hasta seçildiğinde geliş şikayeti, geçmiş muayene arşivi ve e-reçete alanı açılacaktır.",
                    "عند اختيار المريض ستظهر كافة معلوماته السريرية وشكواه، وتتمكن من بدء جلسة المعاينة الطبية.",
                    "Selecting a patient opens their chief complaint, medical history archive, SOAP notes, and e-prescription workspace."
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: INCOMING / SHARED LABORATORY REPORTS FOR DOCTOR */}
      {activeTab === "labs" && (
        <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5DCD0] pb-4 gap-3">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#2C1810]">
                {tr3(lang, "Gelen Laboratuvar Tahlil Sonuçları & PDF Çıktıları", "نتائج وتقارير التحاليل المخبرية", "Incoming Laboratory Test Reports & PDF Exports")}
              </h3>
              <p className="text-xs text-[#7D6E63]">
                {tr3(
                  lang,
                  "Laboratuvardan size veya hastalarınıza gönderilen tahlil sonuçlarını inceleyin, başka bir doktora iletin veya resmi PDF şablonunda çıkartın.",
                  "راجع نتائج التحاليل المرسلة إليك أو لمرضاك من المختبر، أو شاركها مع طبيب آخر أو اطبعها كـ PDF رسمي.",
                  "Inspect laboratory reports sent to you or your patients, forward them to another specialist, or export them as official A4 PDFs."
                )}
              </p>
            </div>
            {onRefreshLabs && (
              <button
                type="button"
                onClick={onRefreshLabs}
                className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DC] border border-[#E5DCD0] text-xs font-bold text-[#4A2E1B]"
              >
                {tr3(lang, "Listeyi Yenile", "تحديث القائمة", "Refresh List")}
              </button>
            )}
          </div>

          {doctorLabReports.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#7D6E63] italic">
              {tr3(lang, "Bu polikliniğe gönderilmiş tamamlanmış bir laboratuvar tahlil sonucu bulunmamaktadır.", "لا توجد تقارير تحاليل مخبرية مكتملة مرسلة إلى هذه العيادة بعد.", "No completed laboratory reports have been sent to this clinic yet.")}
            </div>
          ) : (
            <div className="space-y-3">
              {doctorLabReports.map((rep) => {
                const patName =
                  rep.patient?.fullName ||
                  rep.patient?.user?.fullName ||
                  rep.record?.patient?.user?.fullName ||
                  tr3(lang, "Kayıtlı Hasta", "مريض مسجل", "Registered Patient");
                const outItems = (rep.structuredResults || []).filter((r) => r.flag !== "NORMAL");
                return (
                  <div
                    key={rep.id}
                    className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm font-bold text-[#2C1810]">{patName}</strong>
                        <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#DDD2C1] text-[11px] font-semibold text-[#4A2E1B]">
                          {rep.testName}
                        </span>
                        {outItems.length > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-100 border border-red-300 text-red-700 text-[10px] font-extrabold">
                            {outItems.length} {tr3(lang, "Referans Dışı Değer", "قيمة خارج الطبيعي", "Out-of-Range Values")}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#6E492D] font-mono">
                        {tr3(lang, "Tarih/Saat:", "التاريخ والوقت:", "Date/Time:")}{" "}
                        {new Date(rep.completedAt || rep.createdAt).toLocaleString(lang === "ar" ? "ar-SY" : lang === "en" ? "en-US" : "tr-TR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}{" "}
                        • {tr3(lang, "Yapan Laboratuvarcı:", "فني المختبر:", "Performed By:")} <strong>{rep.performedBy || tr3(lang, "Laboratuvar Uzmanı", "أخصائي المختبر", "Lab Specialist")}</strong>
                      </div>
                      {outItems.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {outItems.slice(0, 6).map((ab) => (
                            <span
                              key={ab.code}
                              className="px-2 py-0.5 rounded bg-white border border-red-300 text-red-600 font-mono font-bold text-[10px]"
                            >
                              {ab.name}: {ab.value} {ab.unit} ({ab.flag === "HIGH" ? "↑" : ab.flag === "LOW" ? "↓" : "!"})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedLabReportModal(rep)}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#EFE8DC] border border-[#D5C7B5] text-xs font-bold text-[#4A2E1B]"
                      >
                        {tr3(lang, "Raporu Gör / Doktora İlet", "عرض التقرير / إرسال لطبيب", "View Report / Forward")}
                      </button>
                      <button
                        type="button"
                        onClick={() => openLabReportPrintWindow(rep, lang)}
                        className="px-4 py-2 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <FileDown size={14} className="text-amber-200" />
                        <span>{tr3(lang, "PDF Çıkart", "تصدير PDF", "Export PDF")}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DAILY SCHEDULE TIMELINE */}
      {activeTab === "schedule" && (
        <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5DCD0] pb-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#2C1810]">{t.dailySchedule}</h3>
              <p className="text-xs text-[#7D6E63]">{currentDoctor.fullName} • {new Date().toLocaleDateString(lang === "ar" ? "ar-SY" : lang === "en" ? "en-US" : "tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] text-xs font-bold text-[#4A2E1B]">
              09:00 - 17:00 ({scheduleSlots.length} {tr3(lang, "Slot", "فترة", "Slots")})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 tv:grid-cols-5 gap-3">
            {scheduleSlots.map((slot) => {
              const matchedApp = docAppointments.find(
                (a) =>
                  a.status !== "CANCELLED" &&
                  (a.dateStr === todayStr || (a.slotTime || "").startsWith(todayStr)) &&
                  (a.timeStr || a.slotTime || "").includes(slot)
              );
              const isClosedByDoctor = (currentDoctor.unavailableSlots || []).includes(slot);
              const isRedSlot = Boolean(matchedApp) || isClosedByDoctor;

              return (
                <div
                  key={slot}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    isRedSlot
                      ? "bg-red-50/70 border-red-300 shadow-xs"
                      : "bg-emerald-50/40 border-emerald-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-14 text-center font-mono font-bold text-xs px-2 py-1 rounded-lg ${
                        isRedSlot ? "bg-red-700 text-white" : "bg-emerald-700 text-white"
                      }`}
                    >
                      {slot}
                    </span>
                    <div>
                      {matchedApp ? (
                        <>
                          <strong className="text-xs text-[#2C1810] block">
                            {matchedApp.patient?.fullName || matchedApp.patient?.user?.fullName}
                          </strong>
                          <span className="text-[10px] text-red-800 italic line-clamp-1">
                            {matchedApp.notes || tr3(lang, "Dolu • Randevulu", "موعد محجوز", "Booked Appointment")}
                          </span>
                        </>
                      ) : isClosedByDoctor ? (
                        <span className="text-xs text-red-800 font-semibold">
                          {tr3(lang, "Kapalı / Mola", "مغلق / استراحة", "Closed / Break")}
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-900 font-medium">
                          {tr3(lang, "Randevuya Açık Müsait", "فترة متاحة للحجز", "Open for Booking")}
                        </span>
                      )}
                    </div>
                  </div>

                  {matchedApp ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-900 border border-red-300">
                      {tr3(lang, "Dolu", "محجوز", "Booked")} #{matchedApp.queueNumber || 1}
                    </span>
                  ) : isClosedByDoctor ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-900 border border-red-300">
                      {tr3(lang, "Kapalı", "مغلق", "Closed")}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {tr3(lang, "Müsait", "متاح", "Available")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: WEEKLY APPOINTMENT SCHEDULE */}
      {activeTab === "weekly" && (
        <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5DCD0] pb-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#2C1810]">{t.weeklySchedule}</h3>
              <p className="text-xs text-[#7D6E63]">{tr3(lang, "Haftalık hasta randevu dağılımı ve poliklinik akışı", "جدول توزيع مواعيد المرضى على مدار الأسبوع", "Weekly patient appointment distribution and clinic flow")}</p>
            </div>
          </div>

          {/* Day Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dayName = tr3(lang, day.nameTr, day.nameAr, day.nameEn);
              const isSelected = selectedWeekDay === day.dayIndex;
              const count = docAppointments.length > 0 ? (day.dayIndex === 1 || day.dayIndex === 3 ? 4 : 2) : 0;

              return (
                <button
                  key={day.dayIndex}
                  type="button"
                  onClick={() => setSelectedWeekDay(day.dayIndex)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? "bg-[#4A2E1B] text-white border-[#4A2E1B] shadow-sm"
                      : "bg-[#FAF7F2] text-[#4A2E1B] border-[#E5DCD0] hover:bg-[#F3EDE2]"
                  }`}
                >
                  <span className="block text-[11px] font-bold">{dayName}</span>
                  <strong className="text-lg font-mono block mt-1">{count}</strong>
                  <span className="text-[9px] opacity-80 block">{tr3(lang, "Hasta", "مرضى", "Patients")}</span>
                </button>
              );
            })}
          </div>

          {/* Appointments for Selected Day */}
          <div className="space-y-3 pt-4 border-t border-[#E5DCD0]">
            <h4 className="text-xs uppercase font-bold text-[#6E492D]">
              {tr3(lang, "Seçili Günün Randevu Listesi", "مواعيد اليوم المحدد", "Appointments for Selected Day")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 tv:grid-cols-5 gap-3">
              {docAppointments.slice(0, 4).map((app, idx) => (
                <div key={app.id || idx} className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-[#2C1810] block">{app.patient?.fullName || app.patient?.user?.fullName}</strong>
                    <span className="text-[11px] text-[#7D6E63] font-mono">{app.timeStr || "10:30"} • {tr3(lang, "Sıra", "الدور", "Queue")} #{app.queueNumber || idx + 1}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {tr3(lang, "Onaylı", "مؤكد", "Confirmed")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PATIENT ARCHIVE & PDF REPORT */}
      {activeTab === "archive" && (
        <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DCD0] gap-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#2C1810]">{t.patientArchive}</h3>
              <p className="text-xs text-[#7D6E63]">{tr3(lang, "Klinik muayenesine gelen tüm hastaların ve tanıların arşivi", "أرشيف كامل للمرضى المراجعين مع سجل التشخيصات السابقة", "Complete archive of clinic patients and past diagnoses")}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportArchivePdf}
                className="px-4 py-2.5 rounded-2xl bg-[#4A2E1B] text-amber-200 hover:text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-[#4A2E1B]/20"
              >
                <Printer className="w-4 h-4 text-amber-200" />
                <span>{t.exportArchivePdf}</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A5F35] absolute left-3 rtl:left-auto rtl:right-3 top-3" />
            <input
              type="text"
              placeholder={t.searchPatientPlaceholder}
              value={archiveSearch}
              onChange={(e) => setArchiveSearch(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-2xl py-2.5 ltr:pl-9 rtl:pr-9 pr-3 text-xs text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
            />
          </div>

          {/* Archive Table */}
          <div className="overflow-x-auto rounded-2xl border border-[#E5DCD0]">
            <table className="w-full min-w-[650px] text-left rtl:text-right text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#E5DCD0] text-[#6E492D] font-bold">
                <tr>
                  <th className="p-3">{t.patientName}</th>
                  <th className="p-3">{t.identityNo}</th>
                  <th className="p-3">{t.phone}</th>
                  <th className="p-3">{t.bloodType}</th>
                  <th className="p-3">{tr3(lang, "Son Tanı & Şikayet", "آخر تشخيص مسجل", "Latest Diagnosis & Notes")}</th>
                  <th className="p-3 text-center">{tr3(lang, "PDF Rapor", "تقرير PDF", "PDF Report")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DCD0]">
                {patientArchiveList.map((p) => {
                  const pName = p.fullName || p.user?.fullName;
                  const idNum = p.identityNo || p.user?.identityNo;
                  const ph = p.phone || p.user?.phone;
                  const blood = p.bloodType || "A+";

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="p-3 font-bold text-[#2C1810]">{pName}</td>
                      <td className="p-3 font-mono">{idNum}</td>
                      <td className="p-3 font-mono">{ph}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-bold font-mono text-[10px] bg-red-100 text-red-800">
                          {blood}
                        </span>
                      </td>
                      <td className="p-3 text-[#6A584A] max-w-xs truncate">
                        {p.emergencyContact || tr3(lang, "Periyodik Klinik Kontrol", "فحص سريري دوري", "Routine Clinical Checkup")}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#DDD2C1] text-[10px] font-bold text-[#4A2E1B] inline-flex items-center gap-1"
                        >
                          <FileDown className="w-3 h-3 text-[#8A5F35]" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: LAB REPORT VIEWER, FORWARDING & PDF PRINT */}
      {selectedLabReportModal && (
        <LabReportModal
          order={selectedLabReportModal}
          onClose={() => setSelectedLabReportModal(null)}
          allDoctors={allDoctors}
          canSendToDoctors={true}
          onUpdated={onRefreshLabs}
          lang={lang}
        />
      )}

      {/* MODAL: PAST CONSULTATIONS & MEDICAL HISTORY */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-[#E5DCD0] rounded-3xl shadow-2xl overflow-hidden text-[#2C1810] max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="p-5 border-b border-[#E5DCD0] bg-[#FAF7F2] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4A2E1B] text-amber-200 flex items-center justify-center font-bold">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif text-[#2C1810]">
                    {t.pastConsultationsHistory}
                  </h3>
                  <p className="text-xs text-[#7D6E63]">
                    {selectedApp?.patient?.fullName || selectedApp?.patient?.user?.fullName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#E5DCD0] text-[#7D6E63] hover:text-[#2C1810] flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Records List Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-grow">
              {pastRecords.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#7D6E63] italic">
                  {t.noPastRecords}
                </div>
              ) : (
                pastRecords.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-2.5">
                    <div className="flex items-center justify-between border-b border-[#E5DCD0] pb-2">
                      <div>
                        <strong className="text-xs text-[#2C1810] block">{rec.diagnosis}</strong>
                        <span className="text-[10px] text-[#8A5F35] font-semibold">{rec.doctor?.fullName || currentDoctor.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-[#7D6E63]">
                          {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : "2026-10-24"}
                        </span>
                        <a
                          href={`${apiUrl}/medical-records/${rec.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-[#4A2E1B] text-amber-200 text-[10px] font-bold flex items-center gap-1 hover:text-white"
                        >
                          <FileDown className="w-3 h-3" />
                          <span>PDF</span>
                        </a>
                      </div>
                    </div>

                    {/* Notes */}
                    <p className="text-[11px] text-[#4E3D30] whitespace-pre-wrap font-mono bg-white p-2.5 rounded-xl border border-[#EFE8DC]">
                      {rec.clinicalNotes}
                    </p>

                    {/* Prescriptions */}
                    {rec.prescriptionItems && rec.prescriptionItems.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] font-bold text-[#8A5F35] uppercase block mb-1">
                          {t.prescriptions}:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.prescriptionItems.map((p: any, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-[#E5DCD0] text-[10px] text-[#2C1810]">
                              {p.itemName} ({p.dosage})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E5DCD0] bg-[#FAF7F2] text-right rtl:text-left">
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#4A2E1B] text-white text-xs font-bold"
              >
                {t.close}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
