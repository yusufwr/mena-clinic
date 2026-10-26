"use client";
import { clinicDate } from "@/lib/clinicDate";


import React, { useState, useEffect, useMemo } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { 
  HeartPulse, 
  QrCode, 
  User, 
  Search, 
  Calendar, 
  Clock, 
  FileText, 
  Pill, 
  FlaskConical, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus, 
  CreditCard, 
  Phone, 
  Mail, 
  Droplet, 
  Lock, 
  Globe, 
  ChevronDown, 
  ArrowLeft, 
  ArrowRight, 
  Printer, 
  Download, 
  Sparkles, 
  LogOut, 
  ExternalLink,
  PlusCircle,
  Copy,
  Check,
  Stethoscope,
  Info,
  Eye,
  EyeOff
} from "lucide-react";
import { DOCTORS_DATA, Doctor } from "@/features/doctors";
import { FlagIcon } from "@/components/FlagIcon";

// Interface for consultation records
interface PatientConsultation {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  diagnosis: string;
  clinicalNotes: string;
  prescriptions: { itemName: string; dosage: string; quantity: number }[];
  labTests: { testName: string; status: string; resultData?: string }[];
}

// Interface for Patient Profile
interface PatientProfile {
  id: string;
  fullName: string;
  identityNo: string;
  phone: string;
  email: string;
  bloodType: string;
  emergencyContact?: string;
  consultations: PatientConsultation[];
  appointments: {
    id: string;
    doctorName: string;
    slotTime: string;
    queueNumber: number;
    status: "CONFIRMED" | "COMPLETED" | "CANCELLED";
  }[];
}

export default function DedicatedPatientPortalPage() {
  const t = useTranslations("patientPortalPage");
  const tCommon = useTranslations("common");
  const tBooking = useTranslations("booking");
  const locale = useLocale();
  const pathname = usePathname();
  const isRtl = locale === "ar";

  // Language Dropdown
  const [langDropdown, setLangDropdown] = useState(false);
  const languages: { code: "tr" | "ar" | "en"; label: string }[] = [
    { code: "tr", label: "Türkçe" },
    { code: "ar", label: "العربية" },
    { code: "en", label: "English" },
  ];
  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  // Search / Login State
  const [searchInput, setSearchInput] = useState("");
  const [searchPassword, setSearchPassword] = useState("");
  const [showSearchPassword, setShowSearchPassword] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activePatient, setActivePatient] = useState<PatientProfile | null>(null);
  const [notFoundIdentity, setNotFoundIdentity] = useState<string | null>(null);

  // Active Tab for Found Patient: 'history' | 'prescriptions' | 'labs' | 'book' | 'doctors'
  const [activeTab, setActiveTab] = useState<"history" | "prescriptions" | "labs" | "book" | "doctors">("history");

  // New Patient Registration Form State (Shown when not found)
  const [regFullName, setRegFullName] = useState("");
  const [regIdentityNo, setRegIdentityNo] = useState("");
  const [regPhone, setRegPhone] = useState("+963 9");
  const [regEmail, setRegEmail] = useState("");
  const [regBloodType, setRegBloodType] = useState("O+");
  const [regPassword, setRegPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState("");

  // Booking Form State (Inside Portal)
  const [liveDoctors, setLiveDoctors] = useState<any[]>(DOCTORS_DATA);
  const [bookDoctorId, setBookDoctorId] = useState<string>(DOCTORS_DATA[0]?.id || "doc-cardio");
  const [bookDate, setBookDate] = useState<string>(() => clinicDate());
  const [bookSlot, setBookSlot] = useState("10:00");
  const [blockedSlots, setBlockedSlots] = useState<string[]>(["12:00", "12:30", "15:00"]);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState("");
  const [bookErrorMsg, setBookErrorMsg] = useState("");
  const [isBookingIntent, setIsBookingIntent] = useState(false);

  // Business Card QR Modal State & Fixed IP Config
  const [businessCardModalOpen, setBusinessCardModalOpen] = useState(false);
  const [customOrigin, setCustomOrigin] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize from LocalStorage or URL params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCustomOrigin(window.location.origin);

      // Check URL query parameters (e.g. ?id=99999999996 or ?tab=book or ?doc=doc-cardio)
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get("id") || params.get("identityNo") || params.get("tc");
      const targetTab = params.get("tab");
      const targetDoc = params.get("doc");

      if (targetTab === "book") {
        setIsBookingIntent(true);
        setActiveTab("book");
      }
      if (targetDoc) {
        setBookDoctorId(targetDoc);
      }

      if (queryId) {
        setSearchInput(queryId);
        // Identity from a URL only pre-fills the form; it never authenticates.
        return;
      }

      // Check logged in user in localStorage
      const storedUser = localStorage.getItem("mena_auth_user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.identityNo) {
            setSearchInput(u.identityNo);
          }
        } catch {}
      }

      // Fetch live doctors from unified API on port 3000
      loadDoctors();
      const token = localStorage.getItem("mena_auth_token");
      const headers = token ? { Authorization: "Bearer " + token } : undefined;
      fetch("/api/auth/me", { headers })
        .then(async response => response.ok ? response.json() : null)
        .then(async session => {
          if (session?.user?.role !== "PATIENT") return;
          const response = await fetch("/api/patients/lookup?q=" + encodeURIComponent(session.user.identityNo), { headers });
          if (response.ok) setActivePatient(await response.json());
        }).catch(() => {});
    }
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await fetch("/api/doctors", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLiveDoctors(data);
          if (!bookDoctorId && data[0]?.id) {
            setBookDoctorId(data[0].id);
          }
        }
      }
    } catch {}
  };

  const loadDoctorSchedule = async (docId: string) => {
    try {
      const res = await fetch(`/api/doctors/${docId}/schedule`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.allBlockedSlots) {
          setBlockedSlots(data.allBlockedSlots);
          if (data.allBlockedSlots.includes(bookSlot) && data.availableSlots && data.availableSlots.length > 0) {
            setBookSlot(data.availableSlots[0]);
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (bookDoctorId) {
      loadDoctorSchedule(bookDoctorId);
    }
  }, [bookDoctorId, bookDate]);

  // Compute Permanent QR Code Target URL
  const qrTargetUrl = useMemo(() => {
    const origin = customOrigin.trim() || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    return `${origin}/${locale}/patient`;
  }, [customOrigin, locale]);

  // QR Code Image Service (Zero config, ultra sharp 300x300 QR generator)
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(qrTargetUrl)}`;

  // Patient Authentication Function (Strict National ID / Phone + Password)
  const executeSearch = async (rawId: string, passwordInput?: string, forceBookTab?: boolean) => {
    const cleaned = rawId.trim();
    if (!cleaned) return;

    // 1. Enforce No Name Login: Input must not be a name!
    const digitsOnly = cleaned.replace(/\D/g, "");
    const hasLetters = /[a-zA-ZğüşıöçĞÜŞİÖÇء-ي]/.test(cleaned);
    if (hasLetters && digitsOnly.length < 7) {
      setLoginErrorMsg(t("errNameSearchNotAllowed"));
      return;
    }

    const pw = (passwordInput ?? searchPassword).trim();
    if (!pw) {
      setLoginErrorMsg(t("errPasswordRequired"));
      return;
    }

    setIsSearching(true);
    setLoginErrorMsg(null);
    setNotFoundIdentity(null);
    setBookingSuccessMsg("");

    try {
      // 2. Call backend auth endpoint
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identityNo: cleaned,
          password: pw,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Check if password error
        if (res.status === 401 && (data.message?.includes("şifre") || data.message?.includes("password"))) {
          setLoginErrorMsg(t("errPasswordWrong"));
          setIsSearching(false);
          return;
        }

        // Patient not found in system -> Open registration
        setActivePatient(null);
        setNotFoundIdentity(cleaned);
        setRegIdentityNo(digitsOnly.length >= 10 ? digitsOnly : "");
        setRegPhone(cleaned.startsWith("+") ? cleaned : "+963 9");
        setRegPassword(pw);
        setIsSearching(false);
        return;
      }

      // 3. User authenticated successfully!
      const loggedUser = data.user;
      localStorage.setItem("mena_auth_token", data.token);
      localStorage.setItem("mena_auth_user", JSON.stringify(loggedUser));

      // Fetch patient's medical records
      let consultations: PatientConsultation[] = [];
      try {
        const recRes = await fetch(`/api/medical-records/patient/${loggedUser.id}`, { cache: "no-store" });
        if (recRes.ok) {
          const recData = await recRes.json();
          if (Array.isArray(recData)) consultations = recData.map(record => ({ ...record, doctorName: record.doctor?.fullName || "", specialty: record.doctor?.specialty || "", date: record.createdAt?.slice(0, 10) || "", prescriptions: record.prescriptionItems || [], labTests: record.labTests || [] }));
        }
      } catch {}

      // Fetch patient's appointments
      let appList: any[] = [];
      try {
        const appRes = await fetch(`/api/appointments`, { cache: "no-store" });
        if (appRes.ok) {
          const allApps = await appRes.json();
          if (Array.isArray(allApps)) {
            appList = allApps.filter((a: any) => a.patientId === loggedUser.id || a.patient?.identityNo === loggedUser.identityNo);
          }
        }
      } catch {}

      const allConsults = consultations;

      const profile: PatientProfile = {
        id: loggedUser.id,
        fullName: loggedUser.fullName,
        identityNo: loggedUser.identityNo,
        phone: loggedUser.phone,
        email: loggedUser.email,
        bloodType: loggedUser.bloodType || "—",
        emergencyContact: loggedUser.emergencyContact,
        consultations: allConsults,
        appointments: appList.length > 0 ? appList.map((a: any) => ({
          id: a.id,
          doctorName: a.doctor?.fullName || a.doctorName || "Dr. Mena Clinic",
          slotTime: a.slotTime,
          queueNumber: a.queueNumber || 1,
          status: a.status
        })) : []
      };

      setActivePatient(profile);
      setNotFoundIdentity(null);
      setLoginErrorMsg(null);
      if (forceBookTab || isBookingIntent) {
        setActiveTab("book");
      }
    } catch (err: any) {
      setLoginErrorMsg(err.message || "Giriş işlemi sırasında bağlantı hatası oluştu.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchInput, searchPassword);
  };

  // Register New Patient Submit
  const handleRegisterNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setLoginErrorMsg(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: regFullName.trim(), identityNo: regIdentityNo.trim(), phone: regPhone.trim(), email: regEmail.trim(), bloodType: regBloodType, password: regPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Kayıt tamamlanamadı");
      localStorage.setItem("mena_auth_token", data.token);
      localStorage.setItem("mena_auth_user", JSON.stringify(data.user));
      setRegSuccessMsg(t("registerSuccess"));
      setActivePatient({ ...data.user, consultations: [], appointments: [] });
      setNotFoundIdentity(null);
      setActiveTab("book");
    } catch (error: any) { setLoginErrorMsg(error.message || "Kayıt kaydedilmedi"); }
    finally { setRegLoading(false); }
  };

  // Book Appointment Submit
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    setBookErrorMsg("");
    setBookingSuccessMsg("");

    if (blockedSlots.includes(bookSlot)) {
      setBookErrorMsg(`Seçilen saat (${bookSlot}) doktor için uygun değildir (Mola/Ameliyat/Dolu). Lütfen yeşil renkli müsait saatlerden birini seçiniz.`);
      return;
    }

    const docObj = liveDoctors.find((d) => d.id === bookDoctorId) || liveDoctors[0] || DOCTORS_DATA[0];

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: activePatient.id,
          patientIdentityNo: activePatient.identityNo,
          doctorId: docObj.id,
          slotTime: `${bookDate}T${bookSlot}:00.000Z`,
          timeStr: bookSlot,
          dateStr: bookDate,
          notes: "Hasta portalı randevusu",
          patient: {
            fullName: activePatient.fullName,
            phone: activePatient.phone,
            identityNo: activePatient.identityNo,
            bloodType: activePatient.bloodType
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setBookErrorMsg(data.error || "Randevu oluşturulamadı.");
        return;
      }

      const newQueueNo = data.queueNumber || (activePatient.appointments.length + 1) * 2;
      const newAppointment = {
        id: data.id || `app-${Date.now()}`,
        doctorName: docObj.fullName,
        slotTime: `${bookDate} ${bookSlot}`,
        queueNumber: newQueueNo,
        status: "CONFIRMED" as const
      };

      const updatedPatient: PatientProfile = {
        ...activePatient,
        appointments: [newAppointment, ...activePatient.appointments]
      };

      setActivePatient(updatedPatient);

      setBookingSuccessMsg(
        locale === "ar"
          ? `تم تأكيد موعدك بنجاح مع ${docObj.fullName} في ${bookDate} الساعة ${bookSlot}. رقم الدور: #${newQueueNo}`
          : `${docObj.fullName} için ${bookDate} saat ${bookSlot} randevunuz başarıyla oluşturuldu! (Sıra Numaranız: #${newQueueNo})`
      );

      // Refresh doctor blocked slots
      loadDoctorSchedule(docObj.id);
    } catch {
      setBookErrorMsg("Sunucuya bağlanırken hata oluştu.");
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(qrTargetUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] flex flex-col font-sans selection:bg-[#EFE8DC]">
      
      {/* 1. TOP HEADER & NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5DCD0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo & Back to Home */}
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-3 group text-left rtl:text-right"
                title={locale === "ar" ? "العودة للموقع الرئيسي" : locale === "en" ? "Back to Main Website" : "Ana Web Sitesine Dön"}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border border-[#D5C7B3] shadow-md shadow-[#4A2E1B]/15 group-hover:scale-105 transition-transform bg-[#FAF7F2] flex items-center justify-center p-0.5">
                  <img src="/logo.png" alt="Mena Clinic Logo" className="w-full h-full object-contain rounded-full" />
                </div>
                <div>
                  <div className="text-xl font-bold tracking-tight text-[#2C1810] font-serif group-hover:text-[#6E492D] transition-colors">
                    {tCommon("clinicName")}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-[#8A6445] font-semibold flex items-center gap-1.5">
                    <span>{t("badge")}</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right Tools: Business Card QR Button, Language, Logout */}
            <div className="flex items-center gap-2.5">
              
              {/* VİZİT KARTI QR MODAL BUTONU */}
              <button
                type="button"
                onClick={() => setBusinessCardModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F5EFEB] text-[#4A2E1B] text-xs font-bold border border-[#D5C7B3] shadow-sm transition-all hover:scale-105"
              >
                <QrCode className="w-4 h-4 text-[#8A5F35]" />
                <span className="hidden md:inline">{t("businessCardBtn")}</span>
                <span className="md:hidden">QR Kart</span>
              </button>

              {/* Language Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangDropdown(!langDropdown)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E5DCD0] text-[#4E3D30] hover:text-[#2C1810] text-xs font-medium transition-colors shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5 text-[#8A6445]" />
                  <FlagIcon code={currentLang.code} />
                  <span className="hidden sm:inline font-semibold">{currentLang.label}</span>
                  <ChevronDown className="w-3 h-3 text-[#8A796D]" />
                </button>

                {langDropdown && (
                  <div
                    onMouseLeave={() => setLangDropdown(false)}
                    className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-36 bg-white border border-[#E5DCD0] rounded-2xl shadow-xl py-1 z-50 animate-fadeIn"
                  >
                    {languages.map((l) => (
                      <Link
                        key={l.code}
                        href={pathname}
                        locale={l.code}
                        onClick={() => setLangDropdown(false)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left rtl:text-right hover:bg-[#FAF7F2] transition-colors ${
                          locale === l.code ? "text-[#4A2E1B] font-bold bg-[#F3EDE2]" : "text-[#4E3D30]"
                        }`}
                      >
                        <FlagIcon code={l.code} />
                        <span>{l.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Patient Logout if loaded */}
              {activePatient && (
                <button
                  type="button"
                  onClick={() => {
                    setActivePatient(null);
                    setSearchInput("");
                    setNotFoundIdentity(null);
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("mena_auth_user");
                      localStorage.removeItem("mena_auth_token");
                      void fetch("/api/auth/logout", { method: "POST" });
                    }
                  }}
                  className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-[#E5DCD0] hover:border-rose-300 transition-colors shadow-sm"
                  title={tCommon("logout")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}

            </div>

          </div>
        </div>
      </header>

      {/* 2. MAIN BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* HERO TITLE & QR NOTICE */}
        <div className="bg-gradient-to-r from-[#F5EFEB] via-[#FAF7F2] to-[#F5EFEB] border border-[#E5DCD0] rounded-3xl p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE7DA] border border-[#D5C7B3] text-[#6E492D] text-xs font-semibold">
              <QrCode className="w-3.5 h-3.5 text-[#B8860B]" />
              <span>{t("badge")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2C1810] font-serif tracking-tight">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm text-[#6A584A] leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* BOOKING INTENT BANNER */}
        {isBookingIntent && !activePatient && (
          <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-[#EFE8DC] border border-[#D5C7B3] text-[#3B2215] flex items-center gap-3 text-xs shadow-sm">
            <Calendar className="w-5 h-5 text-[#8A5F35] shrink-0" />
            <div>
              <p className="font-bold text-sm text-[#2C1810]">
                {locale === "ar" ? "حجز موعد فوري مع الأطباء" : locale === "en" ? "Instant Physician Appointment Booking" : "Hızlı Hekim Randevusu Alma"}
              </p>
              <p className="text-[11px] text-[#6A584A] mt-0.5">
                {locale === "ar" 
                  ? "لإتمام حجز الموعد وتثبيت الدور، يرجى إدخال رقمك الوطني أو إنشاء حساب مريض جديد في ثوانٍ."
                  : locale === "en"
                  ? "To confirm your slot and receive your queue ticket, please verify your National ID or register a new chart below."
                  : "Randevunuzu tamamlamak ve sıra numaranızı almak için lütfen T.C. kimlik numaranızı giriniz veya yeni hasta kartı oluşturunuz."}
              </p>
            </div>
          </div>
        )}

        {/* 3. PATIENT LOOKUP / LOGIN FORM (Strict National ID / Phone + Password) */}
        <div className="max-w-2xl mx-auto bg-white border border-[#E5DCD0] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#4A2E1B]/5 space-y-5">
          <div className="border-b border-[#E5DCD0] pb-3 text-left rtl:text-right">
            <h2 className="text-lg font-bold text-[#2C1810] font-serif flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#8A5F35]" />
              <span>{locale === "ar" ? "تسجيل دخول المريض الآمن" : locale === "en" ? "Secure Patient Login" : "Güvenli Hasta Girişi"}</span>
            </h2>
            <p className="text-xs text-[#7D6E63] mt-1">
              {locale === "ar"
                ? "لحماية سرية بياناتك الطبية، لا يمكن الدخول بالاسم. يرجى إدخال الرقم الوطني أو رقم الهاتف مع كلمة المرور."
                : locale === "en"
                ? "To protect clinical confidentiality, name search is not permitted. Please enter your National ID or Phone Number with your password."
                : "Hasta mahremiyetini korumak için isim ile giriş yapılamaz. Lütfen Kimlik Numaranızı veya Telefon Numaranızı şifrenizle birlikte giriniz."}
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-4">
            {/* Field 1: National ID or Phone Number */}
            <div className="space-y-1.5 text-left rtl:text-right">
              <label className="block text-xs font-bold text-[#4E3D30] uppercase tracking-wider">
                {t("searchLabel")} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setLoginErrorMsg(null);
                  }}
                  placeholder={t("searchPlaceholder")}
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#DDD2C1] text-[#2C1810] placeholder-[#9E8E81] text-sm focus:outline-none focus:bg-white focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B] transition-all font-mono"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div className="space-y-1.5 text-left rtl:text-right">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#4E3D30] uppercase tracking-wider">
                  {t("passwordLabel")}
                </label>
                <span className="text-[10px] text-[#8A6445] font-medium">
                  {t("passwordHint")}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showSearchPassword ? "text" : "password"}
                  required
                  value={searchPassword}
                  onChange={(e) => {
                    setSearchPassword(e.target.value);
                    setLoginErrorMsg(null);
                  }}
                  placeholder={t("passwordPlaceholder")}
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#DDD2C1] text-[#2C1810] placeholder-[#9E8E81] text-sm focus:outline-none focus:bg-white focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B] transition-all font-mono pr-10 rtl:pr-4 rtl:pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSearchPassword(!showSearchPassword)}
                  className="absolute inset-y-0 right-3 rtl:right-auto rtl:left-3 flex items-center text-[#8A796D] hover:text-[#2C1810] transition-colors"
                >
                  {showSearchPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {loginErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{loginErrorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs shadow-md shadow-[#4A2E1B]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t("btnSearchLoading")}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-200" />
                  <span>{t("btnSearch")}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 4. SCENARIO A: USER NOT FOUND -> SHOW REGISTRATION FORM */}
        {notFoundIdentity && !activePatient && (
          <div className="max-w-2xl mx-auto bg-white border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-xl animate-fadeIn space-y-6">
            
            {/* Alert Header */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1 text-left rtl:text-right">
                <h3 className="font-bold text-sm text-amber-950">{t("userNotFoundTitle")}</h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {t("userNotFoundDesc")}
                </p>
                <div className="text-[11px] font-mono text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded inline-block">
                  {t("searchedIdText")} <bdi dir="ltr">{notFoundIdentity}</bdi>
                </div>
              </div>
            </div>

            {/* Quick Registration Form */}
            <form onSubmit={handleRegisterNewPatient} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E5DCD0]">
                <UserPlus className="w-4 h-4 text-[#8A5F35]" />
                <h4 className="text-base font-bold text-[#2C1810] font-serif">{t("registerNewUser")}</h4>
              </div>

              {regSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{regSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="space-y-1.5 text-left rtl:text-right">
                  <label className="text-xs font-semibold text-[#4E3D30]">{t("regFullNameLabel")}</label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder={t("regFullNamePlaceholder")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1] text-xs text-[#2C1810] focus:bg-white focus:outline-none focus:border-[#4A2E1B]"
                  />
                </div>

                {/* Identity No */}
                <div className="space-y-1.5 text-left rtl:text-right">
                  <label className="text-xs font-semibold text-[#4E3D30]">{t("regIdentityNoLabel")}</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={regIdentityNo}
                    onChange={(e) => setRegIdentityNo(e.target.value)}
                    placeholder={t("regIdentityNoPlaceholder")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1] text-xs text-[#2C1810] font-mono focus:bg-white focus:outline-none focus:border-[#4A2E1B]"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Phone */}
                <div className="space-y-1.5 text-left rtl:text-right">
                  <label className="text-xs font-semibold text-[#4E3D30]">{t("regPhoneLabel")}</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder={t("regPhonePlaceholder")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1] text-xs text-[#2C1810] font-mono focus:bg-white focus:outline-none focus:border-[#4A2E1B]"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5 text-left rtl:text-right">
                  <label className="text-xs font-semibold text-[#4E3D30]">{t("regEmailLabel")}</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={t("regEmailPlaceholder")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1] text-xs text-[#2C1810] font-mono focus:bg-white focus:outline-none focus:border-[#4A2E1B]"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Blood Type */}
                <div className="space-y-1.5 text-left rtl:text-right">
                  <label className="text-xs font-semibold text-[#4E3D30]">{t("regBloodTypeLabel")}</label>
                  <select
                    value={regBloodType}
                    onChange={(e) => setRegBloodType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1] text-xs text-[#2C1810] focus:bg-white focus:outline-none"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>

                {/* Password */}
                <div className="space-y-1.5 text-left rtl:text-right">
                  <label className="text-xs font-semibold text-[#4E3D30]">{t("regPasswordLabel")}</label>
                  <input
                    type="password"
                    required
                    dir="ltr"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder={t("regPasswordPlaceholder")}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1] text-xs text-[#2C1810] focus:bg-white focus:outline-none"
                  />
                </div>

              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs shadow-md shadow-[#4A2E1B]/20 transition-all flex items-center justify-center gap-2"
              >
                {regLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-amber-200" />
                    <span>{t("btnRegister")}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* 5. SCENARIO B: USER FOUND -> SHOW COMPLETE MEDICAL DOSSIER & ACTIONS */}
        {activePatient && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Patient Header Card */}
            <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6E492D] to-[#382112] text-amber-200 flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
                  <User className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{t("userFound")}</span>
                    </span>
                    <span className="text-xs text-[#8A5F35] font-semibold">ID: #{activePatient.id}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#2C1810] font-serif">
                    {activePatient.fullName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#6A584A]">
                    <span>{locale === "ar" ? "الرقم الوطني: " : "T.C. / Kimlik: "}<bdi dir="ltr" className="font-mono font-semibold">{activePatient.identityNo}</bdi></span>
                    <span>•</span>
                    <span>{locale === "ar" ? "الهاتف: " : "Tel: "}<bdi dir="ltr" className="font-mono font-semibold">{activePatient.phone}</bdi></span>
                    <span>•</span>
                    <span className="font-semibold text-rose-800">{locale === "ar" ? "فصيلة الدم: " : "Kan: "}{activePatient.bloodType}</span>
                    {activePatient.emergencyContact && (
                      <>
                        <span>•</span>
                        <span className="text-[#8A5F35] font-medium">{locale === "ar" ? "جهة الطوارئ: " : "Acil: "}{activePatient.emergencyContact}</span>
                      </>
                    )}
                    {activePatient.email && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[#7D6E63]">{activePatient.email}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Tab Switcher Button & Booking Trigger */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("book")}
                  className="px-5 py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs shadow-md shadow-[#4A2E1B]/20 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-amber-200" />
                  <span>{t("tabNewAppointment")}</span>
                </button>
              </div>

            </div>

            {/* TAB SELECTOR STRIP */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5DCD0]">
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "history"
                    ? "bg-[#4A2E1B] text-white shadow-sm"
                    : "bg-white text-[#6A584A] hover:bg-[#F5EFEB] border border-[#E5DCD0]"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{t("tabMedicalHistory")}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                  {activePatient.consultations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("prescriptions")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "prescriptions"
                    ? "bg-[#4A2E1B] text-white shadow-sm"
                    : "bg-white text-[#6A584A] hover:bg-[#F5EFEB] border border-[#E5DCD0]"
                }`}
              >
                <Pill className="w-4 h-4" />
                <span>{t("tabPrescriptions")}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("labs")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "labs"
                    ? "bg-[#4A2E1B] text-white shadow-sm"
                    : "bg-white text-[#6A584A] hover:bg-[#F5EFEB] border border-[#E5DCD0]"
                }`}
              >
                <FlaskConical className="w-4 h-4" />
                <span>{t("tabLabResults")}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("doctors")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "doctors"
                    ? "bg-[#4A2E1B] text-white shadow-sm"
                    : "bg-white text-[#6A584A] hover:bg-[#F5EFEB] border border-[#E5DCD0]"
                }`}
              >
                <Stethoscope className="w-4 h-4 text-amber-500" />
                <span>{locale === "ar" ? "أطباؤنا الاستشاريون" : locale === "en" ? "Our Specialist Doctors" : "Hekim Kadromuz"}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                  {liveDoctors.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("book")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "book"
                    ? "bg-[#4A2E1B] text-white shadow-sm"
                    : "bg-white text-[#6A584A] hover:bg-[#F5EFEB] border border-[#E5DCD0]"
                }`}
              >
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>{t("tabNewAppointment")}</span>
              </button>
            </div>

            {/* TAB CONTENT 1: MEDICAL CONSULTATION HISTORY */}
            {activeTab === "history" && (
              <div className="space-y-4">
                {activePatient.consultations.length === 0 ? (
                  <div className="p-8 text-center bg-white border border-[#E5DCD0] rounded-2xl text-xs text-[#7D6E63]">
                    {t("noHistory")}
                  </div>
                ) : (
                  activePatient.consultations.map((c) => (
                    <div
                      key={c.id}
                      className="p-6 rounded-2xl bg-white border border-[#E5DCD0] shadow-sm space-y-4 text-left rtl:text-right"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5DCD0]/60">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] text-[#8A5F35] flex items-center justify-center font-bold">
                            <Stethoscope className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[#2C1810] font-serif">{c.doctorName}</h3>
                            <p className="text-[11px] text-[#8A5F35]">{c.specialty}</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-semibold text-[#6E492D] bg-[#FAF7F2] px-2.5 py-1 rounded-lg self-start sm:self-auto border border-[#E5DCD0]">
                          Tarih: {c.date}
                        </span>
                      </div>

                      {/* Diagnosis */}
                      <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-1">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-[#8A5F35]">
                          Teşhis & ICD-10 Tanı Kodu:
                        </div>
                        <div className="text-xs font-bold text-[#2C1810]">
                          {c.diagnosis}
                        </div>
                      </div>

                      {/* SOAP Notes */}
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-[#8A5F35]">
                          Hekim Muayene & Klinik Notları (SOAP):
                        </div>
                        <pre className="text-xs text-[#4E3D30] font-sans whitespace-pre-line leading-relaxed bg-[#FDFBF7] p-3 rounded-xl border border-[#E5DCD0]/60">
                          {c.clinicalNotes}
                        </pre>
                      </div>

                      {/* Prescriptions preview */}
                      {c.prescriptions.length > 0 && (
                        <div className="pt-2 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold text-[#6E492D] flex items-center gap-1">
                            <Pill className="w-3.5 h-3.5 text-[#8A5F35]" />
                            <span>Reçete:</span>
                          </span>
                          {c.prescriptions.map((p, idx) => (
                            <span key={idx} className="text-xs bg-[#EFE8DC] text-[#3B2215] px-2.5 py-1 rounded-lg border border-[#D5C7B3] font-medium">
                              {p.itemName} ({p.dosage})
                            </span>
                          ))}
                        </div>
                      )}

                      {/* PDF Report Export Button */}
                      <div className="pt-3 border-t border-[#E5DCD0]/60 flex items-center justify-between">
                        <span className="text-[11px] text-[#7D6E63] font-medium">
                          {locale === "ar"
                            ? "تقرير طبي رسمي معتمد من المركز (HIS/EMR)"
                            : locale === "en"
                            ? "Official Certified Medical Examination Report"
                            : "Klinik Onaylı Resmi Muayene Raporu"}
                        </span>
                        <a
                          href={`/api/medical-records/${c.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#4A2E1B] text-[#4A2E1B] hover:text-white border border-[#E5DCD0] text-xs font-bold transition-all shadow-sm group"
                        >
                          <Download className="w-3.5 h-3.5 text-[#8A5F35] group-hover:text-amber-200 transition-colors" />
                          <span>
                            {locale === "ar"
                              ? "تحميل التقرير كـ PDF"
                              : locale === "en"
                              ? "Download PDF Report"
                              : "PDF Raporu İndir"}
                          </span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT 2: PRESCRIPTIONS */}
            {activeTab === "prescriptions" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activePatient.consultations.flatMap((c) => c.prescriptions).map((pr, idx) => (
                    <div key={idx} className="p-5 bg-white border border-[#E5DCD0] rounded-2xl shadow-sm space-y-2 text-left rtl:text-right">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-[#4A2E1B]">
                          <Pill className="w-4 h-4 text-[#8A5F35]" />
                          <span>{pr.itemName}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          E-Reçete Aktif
                        </span>
                      </div>
                      <p className="text-xs text-[#6A584A]">Dozaj: <bdi className="font-semibold text-[#2C1810]">{pr.dosage}</bdi></p>
                      <p className="text-xs text-[#6A584A]">Kutu Adedi: <bdi className="font-semibold text-[#2C1810]">{pr.quantity} Kutu</bdi></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: LAB RESULTS */}
            {activeTab === "labs" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {activePatient.consultations.flatMap((c) => c.labTests).map((lab, idx) => (
                    <div key={idx} className="p-5 bg-white border border-[#E5DCD0] rounded-2xl shadow-sm space-y-2 text-left rtl:text-right">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-[#2C1810]">
                          <FlaskConical className="w-4 h-4 text-[#3E6B48]" />
                          <span>{lab.testName}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {lab.status}
                        </span>
                      </div>
                      {lab.resultData && (
                        <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs font-mono text-[#4A2E1B] border border-[#E5DCD0]">
                          Sonuç: {lab.resultData}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: BOOK NEW APPOINTMENT */}
            {activeTab === "book" && (
              <div className="max-w-2xl mx-auto bg-white border border-[#E5DCD0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                <div className="space-y-1 text-left rtl:text-right">
                  <h3 className="text-xl font-bold text-[#2C1810] font-serif">{t("tabNewAppointment")}</h3>
                  <p className="text-xs text-[#6A584A]">
                    {activePatient.fullName} için hızlı poliklinik randevusu oluşturun.
                  </p>
                </div>

                {bookingSuccessMsg && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-950">{bookingSuccessMsg}</p>
                      <p className="text-[11px] text-emerald-800">Randevunuz hekim takvimine ve klinik yönetim paneline işlendi.</p>
                    </div>
                  </div>
                )}

                {bookErrorMsg && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="font-bold text-red-950">{bookErrorMsg}</p>
                  </div>
                )}

                <form onSubmit={handleBookAppointment} className="space-y-5">
                  
                  {/* Select Doctor */}
                  <div className="space-y-1.5 text-left rtl:text-right">
                    <label className="text-xs font-bold text-[#4E3D30] uppercase tracking-wider">
                      {tBooking("stepDoctor")}
                    </label>
                    <select
                      value={bookDoctorId}
                      onChange={(e) => setBookDoctorId(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#DDD2C1] text-xs font-semibold text-[#2C1810] focus:bg-white focus:outline-none focus:border-[#4A2E1B]"
                    >
                      {liveDoctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.fullName} ({d.specialty || d.department?.name || "Poliklinik"}) • {d.fee || `${d.consultationFee || 1000} SYP`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Date & Interactive Time Slots */}
                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left rtl:text-right">
                      <label className="text-xs font-bold text-[#4E3D30] uppercase tracking-wider">
                        Randevu Tarihi *
                      </label>
                      <input
                        type="date"
                        required
                        min={clinicDate()}
                        value={bookDate}
                        onChange={(e) => setBookDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] border border-[#DDD2C1] text-xs font-mono text-[#2C1810] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2 text-left rtl:text-right">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="text-xs font-bold text-[#4E3D30] uppercase tracking-wider">
                          Saat Dilimi Seçimi *
                        </label>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Müsait
                          </span>
                          <span className="flex items-center gap-1 text-red-700 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Müsait Değil
                          </span>
                        </div>
                      </div>

                      {/* Interactive Slot Buttons */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                        {[
                          "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                          "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
                          "15:00", "15:30", "16:00", "16:30"
                        ].map((slot) => {
                          const isBlocked = blockedSlots.includes(slot);
                          const isSelected = bookSlot === slot;

                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isBlocked}
                              onClick={() => {
                                setBookSlot(slot);
                                setBookErrorMsg("");
                              }}
                              className={`py-2 px-1.5 rounded-xl text-xs font-mono font-bold transition-all border text-center ${
                                isBlocked
                                  ? "bg-red-50 text-red-500 border-red-200 cursor-not-allowed opacity-60 line-through"
                                  : isSelected
                                  ? "bg-[#4A2E1B] text-white border-[#4A2E1B] shadow-md scale-105"
                                  : "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 hover:scale-102"
                              }`}
                              title={isBlocked ? `${slot} Hekim Müsait Değil (Seçilemez)` : `${slot} Hekim Müsait (Seç)`}
                            >
                              <span>{slot}</span>
                              {isBlocked ? (
                                <span className="block text-[8px] font-sans no-underline opacity-80">Müsait Değil</span>
                              ) : isSelected ? (
                                <span className="block text-[8px] font-sans text-amber-200">Seçildi ✓</span>
                              ) : (
                                <span className="block text-[8px] font-sans text-emerald-700">Müsait</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs shadow-lg shadow-[#4A2E1B]/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-amber-200" />
                    <span>{t("btnBookAppointment")}</span>
                  </button>

                </form>

                {/* Patient Active Appointments */}
                {activePatient.appointments.length > 0 && (
                  <div className="pt-4 border-t border-[#E5DCD0] space-y-3">
                    <h4 className="text-xs font-bold text-[#4E3D30] uppercase tracking-wider text-left rtl:text-right">
                      Aktif Randevularınız ({activePatient.appointments.length})
                    </h4>
                    <div className="space-y-2">
                      {activePatient.appointments.map((app) => (
                        <div key={app.id} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-[#2C1810]">{app.doctorName}</span>
                            <div className="text-[11px] text-[#7D6E63] font-mono">{app.slotTime}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold font-mono text-[10px]">
                              Sıra #{app.queueNumber}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {app.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB CONTENT 5: OUR SPECIALIST DOCTORS */}
            {activeTab === "doctors" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5DCD0] gap-2">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-[#2C1810]">
                      {locale === "ar" ? "أطباؤنا الاستشاريون والعيادات التخصصية" : locale === "en" ? "Our Specialist Doctors & Polyclinics" : "Uzman Hekim Kadromuz & Poliklinikler"}
                    </h3>
                    <p className="text-xs text-[#7D6E63]">
                      {locale === "ar"
                        ? "تعرف على أطبائنا وأوقات دوامهم وأجور المعاينة مع إمكانية الحجز المباشر"
                        : locale === "en"
                        ? "Browse our specialist physicians, clinic rooms, and consultation fees"
                        : "Doktorlarımızın branşlarını, muayene ücretlerini inceleyebilir ve doğrudan randevu alabilirsiniz."}
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DCD0] text-xs font-bold text-[#4A2E1B] self-start sm:self-auto">
                    {liveDoctors.length} {locale === "ar" ? "طبيب" : "Hekim"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveDoctors.map((doc) => {
                    const docName = locale === "ar" ? (doc.fullNameAr || doc.fullName) : locale === "en" ? (doc.fullNameEn || doc.fullName) : doc.fullName;
                    const docSpec = locale === "ar" ? (doc.specialtyAr || doc.specialty) : locale === "en" ? (doc.specialtyEn || doc.specialty) : doc.specialty;

                    return (
                      <div
                        key={doc.id}
                        className="bg-white border border-[#E5DCD0] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] text-[#4A2E1B] flex items-center justify-center font-bold">
                              <Stethoscope className="w-5 h-5 text-[#8A5F35]" />
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                              ★ {doc.rating || 4.98}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-[#2C1810] font-serif">{docName}</h4>
                            <p className="text-xs text-[#8A5F35] font-medium mt-0.5">{docSpec}</p>
                            <span className="text-[10px] text-[#7D6E63] block font-mono mt-1">{doc.room} • {doc.phone}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#E5DCD0] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#7D6E63] block">{locale === "ar" ? "أجرة المعاينة" : "Muayene Ücreti"}</span>
                            <strong className="text-xs font-bold text-[#4A2E1B]">{doc.fee || `${doc.consultationFee} TL`}</strong>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setBookDoctorId(doc.id);
                              setActiveTab("book");
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-amber-200 hover:text-white text-xs font-bold transition-all shadow-xs"
                          >
                            {locale === "ar" ? "احجز موعداً" : locale === "en" ? "Book Visit" : "Randevu Al"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* 6. BUSINESS CARD QR MODAL & STATIC IP GENERATOR */}
      {businessCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-[#E5DCD0] rounded-3xl shadow-2xl overflow-hidden text-[#2C1810]">
            
            {/* Header */}
            <div className="p-6 border-b border-[#E5DCD0] bg-gradient-to-r from-[#F5EFEB] via-[#FAF7F2] to-[#FAF7F2] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4A2E1B] text-amber-200 flex items-center justify-center font-bold shadow-sm">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2C1810] font-serif">{t("businessCardModalTitle")}</h3>
                  <p className="text-xs text-[#8A5F35] font-semibold">{t("businessCardModalDesc")}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBusinessCardModalOpen(false)}
                className="p-2 rounded-full text-[#7D6E63] hover:text-[#2C1810] hover:bg-[#FAF7F2]"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
              
              {/* Static IP / Domain Configuration Input */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-2 text-left rtl:text-right">
                <label className="text-xs font-bold text-[#4E3D30] uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#8A5F35]" />
                  <span>{t("fixedIpNotice")}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    value={customOrigin}
                    onChange={(e) => setCustomOrigin(e.target.value)}
                    placeholder="Örn: http://192.168.0.13:3000 veya https://mena-clinic.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD2C1] text-xs font-mono text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="shrink-0 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F3EDE2] border border-[#DDD2C1] text-xs font-semibold text-[#4A2E1B] flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Kopyalandı!" : "Kopyala"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#7D6E63]">
                  {t("fixedIpHelp")}
                </p>
              </div>

              {/* Business Card Preview (85mm x 55mm Ratio) */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#4E3D30] uppercase tracking-wider text-left rtl:text-right">
                  Vizit Kartı Baskı Önizlemesi (85mm x 55mm):
                </div>

                <div 
                  id="printableBusinessCard"
                  className="w-full max-w-lg mx-auto bg-gradient-to-br from-[#FAF7F2] via-white to-[#F5EFEB] border-2 border-[#D5C7B3] rounded-2xl p-6 shadow-md shadow-[#4A2E1B]/10 flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                  {/* Left: Brand & Doctor info */}
                  <div className="space-y-2 text-left rtl:text-right">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full border border-[#D5C7B3] p-0.5 bg-white">
                        <img src="/logo.png" alt="Mena Clinic Logo" className="w-full h-full object-contain rounded-full" />
                      </div>
                      <div>
                        <div className="text-base font-bold text-[#2C1810] font-serif leading-tight">
                          {tCommon("clinicName")}
                        </div>
                        <div className="text-[9px] uppercase tracking-wider text-[#8A5F35] font-semibold">
                          Tıp Merkezi & Poliklinikler
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-[#5A483B] space-y-0.5">
                      <p className="font-semibold text-[#2C1810]">Hasta Portalı & E-Nabız QR</p>
                      <p className="text-[10px] text-[#7D6E63]">Kameranızla okutarak geçmişinize erişin</p>
                      <p className="text-[9px] font-mono text-[#8A5F35] truncate max-w-[200px]" dir="ltr">
                        {qrTargetUrl}
                      </p>
                    </div>

                    <div className="pt-1 text-[9px] text-[#8C6D53]">
                      Santral: +963 (21) 222 3344
                    </div>
                  </div>

                  {/* Right: Sharp QR Code */}
                  <div className="shrink-0 p-2.5 bg-white rounded-2xl border-2 border-[#D5C7B3] shadow-sm flex flex-col items-center gap-1.5">
                    <img 
                      src={qrImageSrc} 
                      alt="Mena Clinic Patient QR Code" 
                      className="w-32 h-32 object-contain"
                    />
                    <span className="text-[9px] font-bold tracking-widest uppercase text-[#8A5F35]">
                      Mena QR Check-in
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#E5DCD0]">
                <a
                  href={qrImageSrc}
                  download="mena_clinic_patient_qr.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#4A2E1B] text-xs font-semibold border border-[#E5DCD0] flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#8A5F35]" />
                  <span>{t("downloadQr")}</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.print();
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white text-xs font-bold shadow-md shadow-[#4A2E1B]/20 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-amber-200" />
                  <span>{t("printCard")}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 7. FOOTER */}
      <footer className="py-6 border-t border-[#E5DCD0] text-center text-xs text-[#8A796D] bg-white">
        © {new Date().getFullYear()} {tCommon("clinicName")} • {tCommon("clinicLocation")} • {t("badge")}
      </footer>

    </div>
  );
}
