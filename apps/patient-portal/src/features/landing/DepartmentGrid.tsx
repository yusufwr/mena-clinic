import React from "react";
import { 
  Heart, 
  Sparkles, 
  Baby, 
  Activity, 
  Smile, 
  FlaskConical, 
  Pill, 
  Ambulance, 
  Bone, 
  ArrowRight 
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";

export interface DepartmentItem {
  id: string;
  nameKey: { tr: string; ar: string; en: string };
  descKey: { tr: string; ar: string; en: string };
  icon: any;
  color: string;
}

export const DEPARTMENTS: DepartmentItem[] = [
  {
    id: "cardio",
    nameKey: { tr: "Kardiyoloji Kliniği", ar: "عيادة القلبية والأوعية", en: "Cardiology Center" },
    descKey: { 
      tr: "Eforlu EKG, ekokardiyografi, ritim holter ve koroner risk taramaları.", 
      ar: "فحوصات القلب الشاملة، تخطيط الجهد، ومراقبة هولتر وضغط الدم.", 
      en: "Comprehensive echocardiography, stress ECG, and cardiac diagnostics." 
    },
    icon: Heart,
    color: "from-rose-500/20 to-red-600/10 text-rose-400 border-rose-800/30",
  },
  {
    id: "derma",
    nameKey: { tr: "Dermatoloji & Estetik", ar: "قسم الأمراض الجلدية والتجميل", en: "Dermatology & Aesthetics" },
    descKey: { 
      tr: "Medikal cilt tedavileri, saç mezoterapisi ve dermatolojik cerrahi.", 
      ar: "علاجات البشرة الطبية، الليزر، علاج تساقط الشعر، والعمليات الجلدية.", 
      en: "Clinical dermatology, skin aesthetics, and laser procedures." 
    },
    icon: Sparkles,
    color: "from-amber-500/20 to-yellow-600/10 text-amber-400 border-amber-800/30",
  },
  {
    id: "ortho",
    nameKey: { tr: "Ortopedi ve Travmatoloji", ar: "جراحة العظام والمفاصل", en: "Orthopedics & Trauma" },
    descKey: { 
      tr: "Eklem artroskopisi, kırık/çıkık tedavisi ve sporcu yaralanmaları.", 
      ar: "جراحة المفاصل والكسور، علاج الإصابات الرياضية وهشاشة العظام.", 
      en: "Joint arthroscopy, fracture repair, and musculoskeletal trauma care." 
    },
    icon: Bone,
    color: "from-blue-500/20 to-indigo-600/10 text-blue-400 border-blue-800/30",
  },
  {
    id: "pediatrics",
    nameKey: { tr: "Çocuk Sağlığı (Pediatri)", ar: "قسم طب الأطفال ورعاية الرضع", en: "Pediatrics & Child Health" },
    descKey: { 
      tr: "Yenidoğan takibi, rutin aşı takvimi ve çocukluk çağı hastalıkları.", 
      ar: "متابعة نمو حديثي الولادة، جدول اللقاحات، وعلاج أمراض الطفولة.", 
      en: "Newborn care, immunization programs, and pediatric consultations." 
    },
    icon: Baby,
    color: "from-emerald-500/20 to-teal-600/10 text-emerald-400 border-emerald-800/30",
  },
  {
    id: "dental",
    nameKey: { tr: "Ağız ve Diş Sağlığı", ar: "قسم طب وجراحة الأسنان", en: "Dental Medicine & Surgery" },
    descKey: { 
      tr: "İmplant cerrahisi, estetik gülüş tasarımı ve panoramik röntgen.", 
      ar: "زراعة الأسنان، تجميل الابتسامة، والتقويم بأحدث التقنيات الرقمية.", 
      en: "Advanced implantology, aesthetic veneers, and panoramic imaging." 
    },
    icon: Smile,
    color: "from-cyan-500/20 to-sky-600/10 text-cyan-400 border-cyan-800/30",
  },
  {
    id: "physio",
    nameKey: { tr: "Fizik Tedavi & Rehabilitasyon", ar: "العلاج الفيزيائي وإعادة التأهيل", en: "Physical Therapy & Rehab" },
    descKey: { 
      tr: "Spine traction robotu, elektroterapi ve nörolojik rehabilitasyon.", 
      ar: "أجهزة شد الفقرات المتطورة، العلاج الحركي، وتأهيل ما بعد العمليات.", 
      en: "Robotic spinal decompression, stroke recovery, and electrotherapy." 
    },
    icon: Activity,
    color: "from-violet-500/20 to-purple-600/10 text-violet-400 border-violet-800/30",
  },
  {
    id: "lab",
    nameKey: { tr: "Klinik Biyokimya & Laboratuvar", ar: "مخبر التحاليل الطبية والدم", en: "Diagnostic Clinical Laboratory" },
    descKey: { 
      tr: "Lipid paneli, hormon tahlilleri, tam kan ve dijital sonuç raporlama.", 
      ar: "تحاليل الدم الشاملة، الهرمونات، والوظائف الحيوية بنتائج فورية رقمية.", 
      en: "High-precision lipid panels, endocrine assays, and complete hematology." 
    },
    icon: FlaskConical,
    color: "from-teal-500/20 to-emerald-600/10 text-teal-400 border-teal-800/30",
  },
  {
    id: "pharmacy",
    nameKey: { tr: "Mena Klinik Eczanesi", ar: "صيدلية المجمع المتكاملة", en: "Mena In-House Pharmacy" },
    descKey: { 
      tr: "Reçeteli ilaçlarda hastalarımıza %10 indirim ve danışmanlık.", 
      ar: "صرف الوصفات الطبية مع حسم 10% لمرضى المجمع مع الإرشاد الدوائي.", 
      en: "Direct electronic fulfillment with 10% patient discount benefit." 
    },
    icon: Pill,
    color: "from-fuchsia-500/20 to-pink-600/10 text-fuchsia-400 border-fuchsia-800/30",
  },
  {
    id: "emergency",
    nameKey: { tr: "7/24 Acil & Ambulans Servisi", ar: "طوارئ وإسعاف 24 ساعة", en: "24/7 Emergency & Triage" },
    descKey: { 
      tr: "Hızlı müdahale, cerrahi ilk yardım ve donanımlı ambulans filosu.", 
      ar: "جاهزية تامة على مدار 24 ساعة للحالات الحرجة مع سيارات إسعاف حديثة.", 
      en: "Round-the-clock rapid response trauma care and mobile ICU fleet." 
    },
    icon: Ambulance,
    color: "from-red-600/20 to-amber-700/10 text-red-400 border-red-800/30",
  },
];

interface DepartmentGridProps {
  onSelectDepartment: (deptId: string) => void;
}

export const DepartmentGrid: React.FC<DepartmentGridProps> = ({ onSelectDepartment }) => {
  const { t, language } = useTranslation();

  return (
    <section id="departments" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE7DA] border border-[#D5C7B3] text-[#6E492D] text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <span>{t.specialtiesBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2C1810] font-serif tracking-tight mb-4">
            {t.departmentsTitle}
          </h2>
          <p className="text-[#5A483B] text-sm sm:text-base leading-relaxed">
            {t.departmentsSubtitle}
          </p>
        </div>

        {/* 9 Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS.map((dept) => {
            const Icon = dept.icon;
            const deptName = dept.nameKey[language] || dept.nameKey.en;
            const deptDesc = dept.descKey[language] || dept.descKey.en;

            return (
              <div
                key={dept.id}
                className="group relative bg-white hover:bg-[#FDFBF7] border border-[#E5DCD0] hover:border-[#B8860B]/60 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#4A2E1B]/5 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] text-[#6E492D] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#2C1810] mb-2 font-serif group-hover:text-[#6E492D] transition-colors">
                    {deptName}
                  </h3>
                  <p className="text-[#6A584A] text-xs leading-relaxed mb-6">
                    {deptDesc}
                  </p>
                </div>

                <button
                  onClick={() => onSelectDepartment(dept.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FAF7F2] hover:bg-[#4A2E1B] text-[#4A2E1B] hover:text-white font-bold text-xs flex items-center justify-between border border-[#E5DCD0] hover:border-[#4A2E1B] transition-all shadow-sm"
                >
                  <span>{t.bookAppointment}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
