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
  DollarSign
} from "lucide-react";
import { AdminTranslations } from "../i18n";
import { DoctorModel, apiFetch } from "../apiClient";

interface DoctorWorkspaceProps {
  currentUser: any;
  allDoctors: DoctorModel[];
  appointments: any[];
  patients: any[];
  t: AdminTranslations;
  lang: string;
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
  t,
  lang,
  onUpdateAppStatus,
  onAppointmentCreated,
  apiUrl = "http://localhost:3000/api",
  token = null,
}) => {
  const isRtl = lang === "ar";

  // Active view tab
  const [activeTab, setActiveTab] = useState<"queue" | "schedule" | "weekly" | "archive">("queue");

  // Selected doctor with safe fallback
  const fallbackDoctor: DoctorModel = {
    id: currentUser?.id || "doc-gastro-horo",
    fullName: currentUser?.fullName || "Dr. Mena Clinic",
    email: currentUser?.email || "doctor@menaclinic.com",
    phone: currentUser?.phone || "+963 991 223301",
    consultationFee: 1200,
    room: "Poliklinik 101",
    hours: "09:00 - 17:00",
    monthlyPatients: 42,
    commissionRate: 0.65,
    department: { name: "Genel Poliklinik" },
  };

  const currentDoctor = allDoctors.find((d) => d.id === currentUser?.id || d.email === currentUser?.email) 
    || (allDoctors.length > 0 ? allDoctors[0] : fallbackDoctor);

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
    setChiefComplaint(app.notes || app.chiefComplaint || (lang === "ar" ? "أعراض فحص عام واستشارة طبية" : "Genel muayene ve klinik başvuru"));
    setSoapNotes({ diagnosis: "", clinicalNotes: "" });
    setPrescDrugs([]);
    setReqTests([]);
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

  // Action: Finalize & Complete Consultation
  const handleFinalizeConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    if (!soapNotes.diagnosis.trim() || !soapNotes.clinicalNotes.trim()) {
      setSaveError(lang === "ar" ? "يرجى إدخال التشخيص والملاحظات السريرية قبل إنهاء الجلسة." : "Lütfen tanı ve SOAP klinik notlarını doldurunuz.");
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
      };

      const saved = await apiFetch(`${apiUrl}/medical-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!saved.ok) throw new Error((await saved.json()).message || "Kayıt kaydedilmedi");
      // Update appointment status to COMPLETED
      onUpdateAppStatus(selectedApp.id, "COMPLETED");
      setSessionStarted(false);
      setSaveSuccess(lang === "ar" ? "تم إنهاء المعاينة وتثبيت السجل الطبي والوصفة بنجاح!" : "Muayene başarıyla tamamlandı, EMR ve reçete kaydedildi.");

      setTimeout(() => {
        setSelectedApp(null);
        setSaveSuccess("");
      }, 2000);
    } catch (err: any) {
      setSaveError(err.message || "Kayıt hatası oluştu.");
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

      if (!referral.ok) throw new Error((await referral.json()).message || "Sevk kaydedilmedi");
      setReferralSuccess(
        lang === "ar"
          ? `تمت إحالة المريض بنجاح إلى ${targetDoc.fullName} (${referralPriority === "URGENT" ? "عاجل" : "عادي"}).`
          : `Hasta ${targetDoc.fullName} polikliniğine başarıyla sevk edildi (${referralPriority === "URGENT" ? "ACİL" : "Rutin"}).`
      );
      setReferralReason("");
      if (onAppointmentCreated) onAppointmentCreated();
    } catch (error: any) {
      setSaveError(error.message || "Sevk kaydedilmedi");
    }
  };

  // Filter appointments for this doctor
  let docAppointments = appointments.filter(
    (a) => a.doctorId === currentDoctor.id || a.doctor?.email === currentDoctor.email || a.doctor?.id === currentDoctor.id
  );



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
      {/* 1. DOCTOR POLICLINIC HEADER */}
      <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#4A2E1B] text-amber-200 flex items-center justify-center font-bold shadow-md">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-serif text-[#2C1810]">
                {currentDoctor.fullName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {lang === "ar" ? "متواجد في العيادة" : "Poliklinik Aktif"}
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
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] text-center">
            <span className="block text-[10px] text-[#7D6E63] uppercase font-bold">{t.feePerVisit}</span>
            <strong className="text-sm font-bold text-[#4A2E1B]">{currentDoctor.consultationFee?.toLocaleString()} TL / 250.000 SYP</strong>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] text-center">
            <span className="block text-[10px] text-[#7D6E63] uppercase font-bold">{t.totalAppointments}</span>
            <strong className="text-sm font-bold text-[#4A2E1B]">{docAppointments.length} {lang === "ar" ? "مريض" : "Hasta"}</strong>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-[#E5DCD0] pb-2 overflow-x-auto">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QUEUE COLUMN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-bold tracking-wider text-[#6E492D] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8A5F35]" />
                <span>{lang === "ar" ? "قائمة انتظار اليوم" : "Bugünkü Hasta Muayene Kuyruğu"}</span>
              </h3>
              <span className="text-xs text-[#7D6E63] font-mono">{todayQueue.length} {lang === "ar" ? "حالة" : "Kayıt"}</span>
            </div>

            <div className="space-y-3">
              {todayQueue.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#E5DCD0] rounded-2xl text-xs text-[#7D6E63] italic">
                  {lang === "ar" ? "لا توجد مواعيد متبقية في طابور اليوم." : "Bugünkü kuyrukta bekleyen hasta bulunmamaktadır."}
                </div>
              ) : (
                todayQueue.map((app) => {
                  const isSelected = selectedApp?.id === app.id;
                  const patName = app.patient?.fullName || app.patient?.user?.fullName || "Kayıtlı Hasta";
                  const slotStr = app.timeStr || (app.slotTime ? new Date(app.slotTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "10:00");
                  const complaint = app.notes || app.chiefComplaint || (lang === "ar" ? "معاينة عامة" : "Genel Muayene");

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
                        <strong>{lang === "ar" ? "الشكوى: " : "Şikayet: "}</strong>
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
                            ? lang === "ar" ? "في غرفة المعاينة" : "Muayenede"
                            : app.status === "COMPLETED"
                            ? lang === "ar" ? "تمت المعاينة" : "Tamamlandı"
                            : app.status === "CANCELLED"
                            ? lang === "ar" ? "ملغى / لم يحضر" : "Gelmedi / İptal"
                            : lang === "ar" ? "في الانتظار" : "Bekliyor"}
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
          <div className="lg:col-span-2 space-y-6">
            {selectedApp ? (
              <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 shadow-md space-y-6">
                
                {/* Patient Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DCD0] gap-4">
                  <div>
                    <span className="text-[10px] text-[#8A5F35] font-bold uppercase tracking-wider block">
                      {lang === "ar" ? "المريض تحت المعاينة" : "Muayene Edilen Hasta"}
                    </span>
                    <h3 className="text-xl font-bold font-serif text-[#2C1810]">
                      {selectedApp.patient?.fullName || selectedApp.patient?.user?.fullName}
                    </h3>
                    <p className="text-xs text-[#6A584A] mt-0.5">
                      {lang === "ar" ? "الرقم الوطني: " : "Kimlik No: "}
                      <span className="font-mono">{selectedApp.patient?.identityNo || selectedApp.patient?.user?.identityNo}</span>
                      {" • "}
                      {lang === "ar" ? "الهاتف: " : "Telefon: "}
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
                        {lang === "ar" ? "جلسة المعاينة الطبية جاهزة للبدء" : "Muayene Oturumu Başlamaya Hazır"}
                      </h4>
                      <p className="text-xs text-[#7D6E63] max-w-md mx-auto">
                        {lang === "ar"
                          ? "اضغط على زر بدء الجلسة لتفعيل الملاحظات السريرية، الوصفة الطبية، وطلب الفحوصات."
                          : "SOAP notları, e-reçete ve sevk araçlarını aktifleştirmek için oturumu başlatın."}
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
                      {lang === "ar" ? "التشخيص الطبي (ICD-10)" : "Klinik Tanı (ICD-10 Kodu & Açıklama)"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "ar" ? "مثال: K29.7 - التهاب المعدة الحاد أو I10 - ارتفاع ضغط الدم الشرياني" : "Örn: K29.7 - Akut Gastrit veya I10 - Primer Hipertansiyon"}
                      value={soapNotes.diagnosis}
                      onChange={(e) => setSoapNotes({ ...soapNotes, diagnosis: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-2xl px-4 py-2.5 text-xs text-[#2C1810] focus:outline-none focus:border-[#4A2E1B] font-medium"
                    />
                  </div>

                  {/* SOAP Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4A2E1B] uppercase tracking-wider block">
                      {lang === "ar" ? "ملاحظات المعاينة وخطة العلاج (SOAP Notes)" : "SOAP Klinik Notları & Bulgular"}
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder={
                        lang === "ar"
                          ? "S (الشكوى): ألم شرسوفي بعد الأكل.\nO (الفحص السريري): البطن لينة مع إيلام خفيف.\nA (التقييم): أعراض التهاب غشاء المعدة.\nP (الخطة): حمية ومثبط مضخة البروتون."
                          : "S (Şikayet): Yemek sonrası epigastrik yanma ve dolgunluk.\nO (Bulgular): TA: 120/80 mmHg, batın palpasyonda hassas.\nA (Değerlendirme): Akut gastrit alevlenmesi.\nP (Plan): PPI tedavisi ve diyet önerileri."
                      }
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
                        placeholder={lang === "ar" ? "اسم الدواء (مثال: Nexium 40mg)" : "İlaç Adı (Örn: Nexium 40mg)"}
                        value={drugInput.itemName}
                        onChange={(e) => setDrugInput({ ...drugInput, itemName: e.target.value })}
                        className="sm:col-span-2 bg-white border border-[#DDD2C1] rounded-xl px-3 py-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder={lang === "ar" ? "الجرعة (مثال: 1x1 صباحاً قبل الأكل)" : "Dozaj (Örn: 1x1 Aç Karnına)"}
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
                        {prescDrugs.map((d, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E5DCD0] text-xs"
                          >
                            <div>
                              <strong className="text-[#2C1810]">{d.itemName}</strong>
                              <span className="text-[#7D6E63] mx-2">• {d.dosage}</span>
                              <span className="text-[#8A5F35] font-bold font-mono">({d.quantity} {lang === "ar" ? "علبة" : "Kutu"})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDrug(index)}
                              className="text-rose-600 hover:text-rose-800 text-[11px] font-bold"
                            >
                              {lang === "ar" ? "حذف" : "Kaldır"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* LAB ORDERS */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-3">
                    <span className="text-xs font-bold text-[#4A2E1B] flex items-center gap-1.5 uppercase tracking-wider">
                      <FlaskConical className="w-4 h-4 text-[#8A5F35]" />
                      <span>{t.labOrders}</span>
                    </span>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={lang === "ar" ? "اسم التحليل (مثال: تنظير هضمي علوي، فحص جرثومة المعدة H. Pylori)" : "İstenecek Tahlil (Örn: H. Pylori Antijeni, CBC, ALT/AST)"}
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
                          <option value="">{lang === "ar" ? "-- اختر استشاري للتحويل --" : "-- Sevk Edilecek Doktor Seçin --"}</option>
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
                  {lang === "ar" ? "يرجى اختيار مريض من قائمة الانتظار" : "Lütfen sol taraftaki kuyruktan bir hasta seçiniz"}
                </h4>
                <p className="text-xs text-[#8A796D] max-w-sm mx-auto">
                  {lang === "ar"
                    ? "عند اختيار المريض ستظهر كافة معلوماته السريرية وشكواه، وتتمكن من بدء جلسة المعاينة الطبية."
                    : "Hasta seçildiğinde geliş şikayeti, geçmiş muayene arşivi ve e-reçete alanı açılacaktır."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DAILY SCHEDULE TIMELINE */}
      {activeTab === "schedule" && (
        <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5DCD0] pb-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#2C1810]">{t.dailySchedule}</h3>
              <p className="text-xs text-[#7D6E63]">{currentDoctor.fullName} • {new Date().toLocaleDateString(lang === "ar" ? "ar-SY" : "tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] text-xs font-bold text-[#4A2E1B]">
              09:00 - 17:00 ({scheduleSlots.length} {lang === "ar" ? "فترة" : "Slot"})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scheduleSlots.map((slot) => {
              const matchedApp = docAppointments.find((a) => (a.timeStr || a.slotTime || "").includes(slot));
              const isPast = slot < "12:00";

              return (
                <div
                  key={slot}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    matchedApp
                      ? "bg-[#FAF7F2] border-[#C5A880] shadow-xs"
                      : "bg-white border-[#E5DCD0] opacity-80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-14 text-center font-mono font-bold text-xs px-2 py-1 rounded-lg bg-[#4A2E1B] text-amber-200">
                      {slot}
                    </span>
                    <div>
                      {matchedApp ? (
                        <>
                          <strong className="text-xs text-[#2C1810] block">
                            {matchedApp.patient?.fullName || matchedApp.patient?.user?.fullName}
                          </strong>
                          <span className="text-[10px] text-[#7D6E63] italic line-clamp-1">
                            {matchedApp.notes || (lang === "ar" ? "معاينة عادية" : "Rutin Kontrol")}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-[#7D6E63] italic">
                          {lang === "ar" ? "فترة متاحة للحجز" : "Randevuya Açık Müsait Slot"}
                        </span>
                      )}
                    </div>
                  </div>

                  {matchedApp ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      #{matchedApp.queueNumber || 1}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {lang === "ar" ? "متاح" : "Müsait"}
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
              <p className="text-xs text-[#7D6E63]">{lang === "ar" ? "جدول توزيع مواعيد المرضى على مدار الأسبوع" : "Haftalık hasta randevu dağılımı ve poliklinik akışı"}</p>
            </div>
          </div>

          {/* Day Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dayName = lang === "ar" ? day.nameAr : lang === "en" ? day.nameEn : day.nameTr;
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
                  <span className="text-[9px] opacity-80 block">{lang === "ar" ? "مرضى" : "Hasta"}</span>
                </button>
              );
            })}
          </div>

          {/* Appointments for Selected Day */}
          <div className="space-y-3 pt-4 border-t border-[#E5DCD0]">
            <h4 className="text-xs uppercase font-bold text-[#6E492D]">
              {lang === "ar" ? "مواعيد اليوم المحدد" : "Seçili Günün Randevu Listesi"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {docAppointments.slice(0, 4).map((app, idx) => (
                <div key={app.id || idx} className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-[#2C1810] block">{app.patient?.fullName || app.patient?.user?.fullName}</strong>
                    <span className="text-[11px] text-[#7D6E63] font-mono">{app.timeStr || "10:30"} • Sıra #{app.queueNumber || idx + 1}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {lang === "ar" ? "مؤكد" : "Onaylı"}
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
              <p className="text-xs text-[#7D6E63]">{lang === "ar" ? "أرشيف كامل للمرضى المراجعين مع سجل التشخيصات السابقة" : "Klinik muayenesine gelen tüm hastaların ve tanıların arşivi"}</p>
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
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#E5DCD0] text-[#6E492D] font-bold">
                <tr>
                  <th className="p-3">{t.patientName}</th>
                  <th className="p-3">{t.identityNo}</th>
                  <th className="p-3">{t.phone}</th>
                  <th className="p-3">{t.bloodType}</th>
                  <th className="p-3">{lang === "ar" ? "آخر تشخيص مسجل" : "Son Tanı & Şikayet"}</th>
                  <th className="p-3 text-center">{lang === "ar" ? "تقرير PDF" : "PDF Rapor"}</th>
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
                        {p.emergencyContact || (lang === "ar" ? "فحص سريري دوري" : "Periyodik Klinik Kontrol")}
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
