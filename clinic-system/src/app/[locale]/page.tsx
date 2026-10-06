"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DoctorCard, Doctor } from "@/features/doctors";
import { AppointmentBookingModal } from "@/features/appointments";
import { PatientPortalModal } from "@/features/patients";
import { AuthUser } from "@/features/auth";
import { 
  Sparkles, 
  Calendar, 
  Stethoscope, 
  Clock, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Award, 
  Heart, 
  Smile, 
  Baby, 
  Bone, 
  Activity, 
  FlaskConical, 
  Pill, 
  Ambulance, 
  Star, 
  Quote, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";

// Mock Doctors Data for presentation
const DOCTORS_DATA: Doctor[] = [
  {
    id: "doc-cardio",
    fullName: "Dr. Selim Yılmaz",
    email: "cardio@menaclinic.com",
    phone: "+963 991 112233",
    rating: 4.95,
  },
  {
    id: "doc-derma",
    fullName: "Dr. Leyla Demir",
    email: "derma@menaclinic.com",
    phone: "+963 991 112234",
    rating: 4.92,
  },
  {
    id: "doc-ortho",
    fullName: "Dr. Fadi Al-Halabi",
    email: "ortho@menaclinic.com",
    phone: "+963 991 112235",
    rating: 4.98,
  }
];

// 9 Comprehensive Medical Departments
const DEPARTMENTS_DATA = [
  {
    id: "cardio",
    titleTr: "Kardiyoloji Kliniği",
    titleAr: "عيادة القلبية والأوعية",
    titleEn: "Cardiology Center",
    descTr: "Ekokardiyografi, ritim holter, eforlu EKG ve koroner risk taramaları.",
    descAr: "فحوصات القلب الشاملة، تخطيط الجهد، ومراقبة هولتر وضغط الدم.",
    descEn: "Comprehensive echocardiography, stress ECG, and cardiac diagnostics.",
    icon: Heart,
    color: "from-rose-500/20 to-red-600/10 text-rose-400 border-rose-800/30",
  },
  {
    id: "derma",
    titleTr: "Dermatoloji & Estetik",
    titleAr: "قسم الأمراض الجلدية والتجميل",
    titleEn: "Dermatology & Aesthetics",
    descTr: "Cilt hastalıkları, mezoterapi, lazer tedavileri ve cerrahi dermatoonkoloji.",
    descAr: "علاجات البشرة الطبية، الليزر، علاج تساقط الشعر، والعمليات الجلدية.",
    descEn: "Clinical dermatology, skin aesthetics, and laser procedures.",
    icon: Sparkles,
    color: "from-amber-500/20 to-yellow-600/10 text-amber-400 border-amber-800/30",
  },
  {
    id: "ortho",
    titleTr: "Ortopedi ve Travmatoloji",
    titleAr: "جراحة العظام والمفاصل",
    titleEn: "Orthopedics & Trauma",
    descTr: "Eklem artroskopisi, kırık/çıkık tedavisi ve sporcu yaralanmaları cerrahisi.",
    descAr: "جراحة المفاصل والكسور، علاج الإصابات الرياضية وهشاشة العظام.",
    descEn: "Joint arthroscopy, fracture repair, and musculoskeletal trauma care.",
    icon: Bone,
    color: "from-blue-500/20 to-indigo-600/10 text-blue-400 border-blue-800/30",
  },
  {
    id: "pediatrics",
    titleTr: "Çocuk Sağlığı (Pediatri)",
    titleAr: "قسم طب الأطفال ورعاية الرضع",
    titleEn: "Pediatrics & Child Health",
    descTr: "Yenidoğan takibi, rutin aşı takvimi ve çocukluk çağı enfeksiyonları.",
    descAr: "متابعة حديثي الولادة، جدول اللقاحات، وعلاج أمراض الطفولة الشائعة.",
    descEn: "Newborn care, routine vaccination schedule, and childhood pediatrics.",
    icon: Baby,
    color: "from-emerald-500/20 to-teal-600/10 text-emerald-400 border-emerald-800/30",
  },
  {
    id: "dental",
    titleTr: "Ağız ve Diş Sağlığı",
    titleAr: "قسم طب وجراحة الأسنان",
    titleEn: "Dental Medicine & Surgery",
    descTr: "İmplant cerrahisi, estetik gülüş tasarımı ve dijital panoramik röntgen.",
    descAr: "زراعة الأسنان، تصميم الابتسامة التجميلية، والتصوير البانورامي الرقمي.",
    descEn: "Implant surgery, aesthetic smile design, and digital panoramic X-ray.",
    icon: Smile,
    color: "from-cyan-500/20 to-sky-600/10 text-cyan-400 border-cyan-800/30",
  },
  {
    id: "physio",
    titleTr: "Fizik Tedavi & Rehabilitasyon",
    titleAr: "العلاج الفيزيائي وإعادة التأهيل",
    titleEn: "Physical Therapy & Rehab",
    descTr: "Spine traction robotu, elektroterapi ve felç sonrası nörolojik rehabilitasyon.",
    descAr: "أجهزة شد الفقرات الروبوتية، العلاج الكهربائي، وإعادة التأهيل العصبي.",
    descEn: "Spine robotic traction, electrotherapy, and neurological rehabilitation.",
    icon: Activity,
    color: "from-violet-500/20 to-purple-600/10 text-violet-400 border-violet-800/30",
  },
  {
    id: "lab",
    titleTr: "Klinik Biyokimya & Laboratuvar",
    titleAr: "مخبر التحاليل الطبية والدم",
    titleEn: "Clinical Laboratory",
    descTr: "Lipid paneli, hormon tahlilleri, tam kan ve dijital sonuç raporlama.",
    descAr: "أحدث أجهزة فحص الدم والهرمونات والبيوكيمياء بنتائج دقيقة وسريعة.",
    descEn: "Lipid profile, hormone tests, CBC, and digital diagnostic reporting.",
    icon: FlaskConical,
    color: "from-teal-500/20 to-emerald-600/10 text-teal-400 border-teal-800/30",
  },
  {
    id: "pharmacy",
    titleTr: "Mena Klinik Eczanesi",
    titleAr: "صيدلية المجمع المتكاملة",
    titleEn: "Mena In-House Pharmacy",
    descTr: "Klinik hastalarımıza özel reçeteli ilaçlarda %10 indirim avantajı.",
    descAr: "خصم خاص 10% لمرضى المجمع على الأدوية والمستلزمات الطبية الموصوفة.",
    descEn: "10% privilege discount on prescribed medications for clinic patients.",
    icon: Pill,
    color: "from-fuchsia-500/20 to-pink-600/10 text-fuchsia-400 border-fuchsia-800/30",
  },
  {
    id: "emergency",
    titleTr: "7/24 Acil & Ambulans Servisi",
    titleAr: "طوارئ وإسعاف 24 ساعة",
    titleEn: "24/7 Emergency Care",
    descTr: "Kesintisiz ilk müdahale, acil triyaj ve tam donanımlı ambulans filosu.",
    descAr: "تدخل سريع، إسعاف جراحي فوري، وأسطول سيارات إسعاف مجهز بالكامل.",
    descEn: "24/7 continuous rapid triage, trauma resuscitation, and ambulances.",
    icon: Ambulance,
    color: "from-red-600/20 to-amber-700/10 text-red-400 border-red-800/30",
  },
];

// Localized Patient Testimonials
const TESTIMONIALS_DATA: Record<string, Array<{ name: string; role: string; comment: string; rating: number; date: string }>> = {
  ar: [
    {
      name: "فاطمة المحمد",
      role: "مريضة عيادة القلبية",
      comment: "بفضل اهتمام د. سليم وفحوصاته الدقيقة تحسنت حالتي الصحية تماماً. ميزة الاطلاع على نتائج التحاليل إلكترونياً ممتازة وتوفر وقتاً كبيراً.",
      rating: 5,
      date: "آب 2026",
    },
    {
      name: "عمر شيخ الشباب",
      role: "مريض عيادة الجلدية",
      comment: "النظافة الفائقة ودقة مواعيد المعاينة متميزة جداً. لم أنتظر بفضل نظام حجز الدور الرقمي التلقائي.",
      rating: 5,
      date: "أيلول 2026",
    },
    {
      name: "نور الحسن",
      role: "مريضة العلاج الفيزيائي",
      comment: "أجهزة شد الفقرات والعلاج الطبيعي خففت آلام الظهر تماماً. أفضل مركز طبي متطور في حلب.",
      rating: 5,
      date: "أيلول 2026",
    },
  ],
  en: [
    {
      name: "Zeynep Kaya",
      role: "Cardiology Patient",
      comment: "Thanks to Dr. Selim's dedicated care and detailed findings, my symptoms resolved completely. Viewing lab results online is an outstanding experience.",
      rating: 5,
      date: "August 2026",
    },
    {
      name: "Omar Al-Cheikh",
      role: "Dermatology Patient",
      comment: "Clinic cleanliness and punctuality of appointment slots are unmatched. The queue assignment system was seamless with zero wait time.",
      rating: 5,
      date: "September 2026",
    },
    {
      name: "Fatima Al-Hassan",
      role: "Physical Therapy Patient",
      comment: "The spinal traction equipment and physical therapy team eliminated my back pain. The highest quality medical facility in Aleppo.",
      rating: 5,
      date: "September 2026",
    },
  ],
  tr: [
    {
      name: "Zeynep Kaya",
      role: "Kardiyoloji Hastası",
      comment: "Dr. Selim Bey'in ilgisi ve detaylı muayene notları sayesinde şikayetlerim tamamen geçti. Laboratuvar sonuçlarımı sisteme girip hemen görebilmek harika bir konfor.",
      rating: 5,
      date: "Ağustos 2026",
    },
    {
      name: "Ömer Çelik",
      role: "Dermatoloji Hastası",
      comment: "Kliniğin temizliği ve randevu saatinin dakikliği mükemmel. Sıra numarası sistemiyle hiç beklemeden muayeneye alındım.",
      rating: 5,
      date: "Eylül 2026",
    },
    {
      name: "Fatima Al-Hassan",
      role: "Fizik Tedavi Hastası",
      comment: "Spine traction cihazları ve fizyoterapi ekibinin desteğiyle bel ağrılarımdan kurtuldum. Halep'teki en kaliteli sağlık merkezi.",
      rating: 5,
      date: "Eylül 2026",
    },
  ],
};

export default function LocalizedHomePage() {
  const tCommon = useTranslations("common");
  const tHero = useTranslations("hero");
  const tAbout = useTranslations("about");
  const tDepts = useTranslations("departments");
  const tDoctors = useTranslations("doctors");
  const tTestimonials = useTranslations("testimonials");
  const tContact = useTranslations("contact");
  const tStats = useTranslations("stats");
  const locale = useLocale();

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [patientPortalOpen, setPatientPortalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Sync session on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mena_auth_user");
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch {}
      }
    }
  }, []);

  const handleOpenBooking = (doc?: Doctor) => {
    setSelectedDoctorForBooking(doc || null);
    if (!currentUser) {
      setPatientPortalOpen(true);
      return;
    }
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2C1810]">
      
      {/* Navbar with Taskbar: Book Appointment, Patient Portal, Language */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenPatientPortal={() => setPatientPortalOpen(true)}
      />

      <main className="flex-1">
        
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden py-20 md:py-28 border-b border-[#E5DCD0] bg-gradient-to-b from-[#F5EFEB] via-[#FAF7F2] to-[#FAF7F2]">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#C5A880]/15 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left rtl:lg:text-right">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE7DA] border border-[#D5C7B3] text-[#6E492D] text-xs font-semibold shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#B8860B] animate-pulse" />
                  <span>{tHero("badge")}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#2C1810] font-serif tracking-tight leading-[1.15]">
                  {tHero("title1")}{" "}
                  <span className="text-[#8A5F35] underline decoration-[#C59B27]/40">
                    {tHero("titleAccent")}
                  </span>
                  <br />
                  <span className="text-[#5A483B] text-3xl sm:text-4xl lg:text-5xl font-medium">
                    {tHero("title2")}
                  </span>
                </h1>

                <p className="text-[#5A483B] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  {tHero("desc")}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenBooking()}
                    className="w-full sm:w-auto px-7 py-3.5 bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#4A2E1B]/20 transition-all hover:scale-105 flex items-center justify-center gap-2.5 active:scale-95"
                  >
                    <Calendar className="w-4 h-4 text-amber-200" />
                    <span>{tHero("quickBook")}</span>
                  </button>

                  <a
                    href="#doctors"
                    className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#F3EDE2] text-[#2C1810] font-semibold text-sm rounded-xl border border-[#E5DCD0] shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>{tHero("exploreDoctors")}</span>
                  </a>
                </div>

                <div className="pt-6 border-t border-[#E5DCD0] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#5A483B]">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#3E6B48]" />
                    <span>{tHero("accreditedClinics")}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#3E6B48]" />
                    <span>{tHero("instantQueue")}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#3E6B48]" />
                    <span>{tHero("confidentialRecords")}</span>
                  </div>
                </div>
              </div>

              {/* Right: Quick Action Card */}
              <div className="lg:col-span-5 relative">
                <div className="mx-auto max-w-md bg-white border border-[#E5DCD0] rounded-3xl p-6 shadow-xl shadow-[#4A2E1B]/5 space-y-6">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-[#E5DCD0]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EFE7DA] border border-[#D5C7B3] flex items-center justify-center text-[#6E492D] font-bold">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-[#7D6E63] font-medium">{tCommon("clinicName")}</div>
                        <div className="text-sm font-bold text-[#2C1810] font-serif">{tHero("mainCampus")}</div>
                      </div>
                    </div>
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FDF4F2] border border-[#F5C7C1] space-y-2">
                    <div className="flex items-center gap-2 text-[#9A2C27] font-bold text-xs uppercase tracking-wider">
                      <Phone className="w-4 h-4 animate-bounce" />
                      <span>{tHero("emergency247")}</span>
                    </div>
                    <div className="text-xl font-mono font-black text-[#6B1B17] tracking-tight">
                      <bdi dir="ltr">+963 (21) 222 3344</bdi>
                    </div>
                    <div className="text-[11px] text-[#7D4845]">
                      {tHero("emergencyDesc")}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenBooking()}
                    className="w-full py-3.5 bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs rounded-xl shadow-md shadow-[#4A2E1B]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-amber-200" />
                    <span>{tHero("bookNow")}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Stats Bar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white border border-[#E5DCD0] rounded-2xl shadow-sm">
              <div className="text-center p-3 border-r border-[#E5DCD0] last:border-none">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#4A2E1B] font-serif">{tStats("doctors")}</div>
                <div className="text-xs text-[#7D6E63] mt-1 font-medium">{tStats("subCertified")}</div>
              </div>
              <div className="text-center p-3 border-r border-[#E5DCD0] last:border-none">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#4A2E1B] font-serif">{tStats("departments")}</div>
                <div className="text-xs text-[#7D6E63] mt-1 font-medium">{tStats("subFullClinic")}</div>
              </div>
              <div className="text-center p-3 border-r border-[#E5DCD0] last:border-none">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#4A2E1B] font-serif">{tStats("patients")}</div>
                <div className="text-xs text-[#7D6E63] mt-1 font-medium">{tStats("subTreated")}</div>
              </div>
              <div className="text-center p-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#3E6B48] font-serif">{tStats("emergency")}</div>
                <div className="text-xs text-[#7D6E63] mt-1 font-medium">{tStats("subTriage")}</div>
              </div>
            </div>

          </div>
        </section>

        {/* 2. HAKKIMIZDA (ABOUT US) */}
        <section id="about" className="py-20 bg-[#F3EDE2] border-b border-[#DDD2C1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5DAC8] border border-[#D5C7B3] text-[#6E492D] text-xs font-semibold uppercase tracking-wider">
                <span>{tAbout("badge")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2C1810] font-serif tracking-tight">
                {tAbout("title")}
              </h2>
              <p className="text-[#5A483B] text-sm sm:text-base leading-relaxed">
                {tAbout("desc")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-[#E5DCD0] shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] flex items-center justify-center text-[#8A5F35] font-bold">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#2C1810] font-serif">{tAbout("f1Title")}</h3>
                <p className="text-[#6A584A] text-xs leading-relaxed">{tAbout("f1Desc")}</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E5DCD0] shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] flex items-center justify-center text-[#3E6B48] font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#2C1810] font-serif">{tAbout("f2Title")}</h3>
                <p className="text-[#6A584A] text-xs leading-relaxed">{tAbout("f2Desc")}</p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E5DCD0] shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] flex items-center justify-center text-[#4A2E1B] font-bold">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#2C1810] font-serif">{tAbout("f3Title")}</h3>
                <p className="text-[#6A584A] text-xs leading-relaxed">{tAbout("f3Desc")}</p>
              </div>
            </div>

          </div>
        </section>

        {/* 3. ALANLARIMIZ / BRANŞLAR (DEPARTMENTS) */}
        <section id="departments" className="py-20 bg-[#FAF7F2] border-b border-[#E5DCD0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE7DA] border border-[#D5C7B3] text-[#6E492D] text-xs font-semibold uppercase tracking-wider">
                <span>{tDepts("badge")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2C1810] font-serif tracking-tight">
                {tDepts("title")}
              </h2>
              <p className="text-[#5A483B] text-sm sm:text-base leading-relaxed">
                {tDepts("desc")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEPARTMENTS_DATA.map((dept) => {
                const Icon = dept.icon;
                const title = locale === "ar" ? dept.titleAr : locale === "en" ? dept.titleEn : dept.titleTr;
                const desc = locale === "ar" ? dept.descAr : locale === "en" ? dept.descEn : dept.descTr;

                return (
                  <div
                    key={dept.id}
                    className="group bg-white hover:bg-[#FDFBF7] border border-[#E5DCD0] hover:border-[#B8860B]/60 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#4A2E1B]/5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] text-[#6E492D] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-[#2C1810] mb-2 font-serif group-hover:text-[#6E492D] transition-colors">
                        {title}
                      </h3>
                      <p className="text-[#6A584A] text-xs leading-relaxed mb-6">
                        {desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenBooking()}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#FAF7F2] hover:bg-[#4A2E1B] text-[#4A2E1B] hover:text-white font-bold text-xs flex items-center justify-between border border-[#E5DCD0] hover:border-[#4A2E1B] transition-all shadow-sm"
                    >
                      <span>{tCommon("bookAppointment")}</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* 4. DOKTORLARIMIZ (OUR DOCTORS) */}
        <section id="doctors" className="py-20 bg-[#F3EDE2] border-b border-[#DDD2C1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5DAC8] border border-[#D5C7B3] text-[#6E492D] text-xs font-semibold uppercase tracking-wider">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{tDoctors("badge")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2C1810] font-serif tracking-tight">
                {tDoctors("title")}
              </h2>
              <p className="text-[#5A483B] text-sm sm:text-base leading-relaxed">
                {tDoctors("desc")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DOCTORS_DATA.map((doc) => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  onBook={(d) => handleOpenBooking(d)}
                />
              ))}
            </div>

          </div>
        </section>

        {/* 5. ÖNCEKİ HASTALARIMIZ / YORUMLAR (TESTIMONIALS) */}
        <section id="testimonials" className="py-20 bg-[#FAF7F2] border-b border-[#E5DCD0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE7DA] border border-[#D5C7B3] text-[#6E492D] text-xs font-semibold uppercase tracking-wider">
                <Quote className="w-3.5 h-3.5" />
                <span>{tTestimonials("badge")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2C1810] font-serif tracking-tight">
                {tTestimonials("title")}
              </h2>
              <p className="text-[#5A483B] text-sm sm:text-base leading-relaxed">
                {tTestimonials("desc")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(TESTIMONIALS_DATA[locale] || TESTIMONIALS_DATA.ar).map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-[#E5DCD0] shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-[#B8860B]">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#B8860B]" />
                      ))}
                    </div>
                    <p className="text-[#4E3D30] text-xs leading-relaxed italic">
                      &quot;{item.comment}&quot;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5DCD0] flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-[#2C1810] block font-serif">{item.name}</strong>
                      <span className="text-[#7D6E63] text-[11px]">{item.role}</span>
                    </div>
                    <span className="text-[#9E8E81] text-[10px]">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 6. İLETİŞİM & KONUM (CONTACT) */}
        <section id="contact" className="py-20 bg-[#F3EDE2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5DAC8] border border-[#D5C7B3] text-[#6E492D] text-xs font-semibold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>{tContact("badge")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2C1810] font-serif tracking-tight">
                {tContact("title")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-[#E5DCD0] shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#8A5F35] flex items-center justify-center font-bold mb-3 border border-[#E5DCD0]">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#2C1810] font-serif">{tContact("addressTitle")}</h3>
                <p className="text-[#6A584A] text-xs leading-relaxed">{tContact("addressValue")}</p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#E5DCD0] shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#3E6B48] flex items-center justify-center font-bold mb-3 border border-[#E5DCD0]">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#2C1810] font-serif">{tContact("hoursTitle")}</h3>
                <p className="text-[#6A584A] text-xs leading-relaxed">{tContact("hoursValue")}</p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#E5DCD0] shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#9A2C27] flex items-center justify-center font-bold mb-3 border border-[#E5DCD0]">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#2C1810] font-serif">{tContact("phoneTitle")}</h3>
                <p className="text-[#6A584A] text-xs leading-relaxed space-y-1">
                  <span className="block">
                    <span>{locale === "ar" ? "المقسم: " : locale === "en" ? "Central: " : "Santral: "}</span>
                    <bdi dir="ltr" className="font-mono font-bold tracking-tight text-[#2C1810]">+963 (21) 222 3344 / 55</bdi>
                  </span>
                  <span className="block">
                    <span>{locale === "ar" ? "واتساب الطوارئ: " : locale === "en" ? "Emergency WhatsApp: " : "Acil WhatsApp: "}</span>
                    <bdi dir="ltr" className="font-mono font-bold tracking-tight text-[#2C1810]">+963 991 223 344</bdi>
                  </span>
                </p>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Appointment Booking Modal (Opened from Taskbar or Doctor Cards) */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        doctors={DOCTORS_DATA}
        initialDoctor={selectedDoctorForBooking}
        onBookSuccess={() => {
          // Keep state synced
        }}
      />

      {/* Patient Personal Portal Modal (Strictly Patient's Own Consultations & Notes) */}
      <PatientPortalModal
        isOpen={patientPortalOpen}
        onClose={() => setPatientPortalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
        onLogout={() => {
          setCurrentUser(null);
        }}
      />

      <Footer />

    </div>
  );
}
