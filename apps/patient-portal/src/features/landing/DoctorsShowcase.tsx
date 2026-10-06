import React from "react";
import { User, Calendar, Clock, Stethoscope, Star, Globe2 } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";

export interface DoctorData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  schedules?: any[];
}

interface DoctorsShowcaseProps {
  doctors: DoctorData[];
  onSelectDoctorForBooking: (doctor: DoctorData) => void;
}

export const DoctorsShowcase: React.FC<DoctorsShowcaseProps> = ({
  doctors,
  onSelectDoctorForBooking,
}) => {
  const { t, language } = useTranslation();

  // Helper to format doctor title and branch
  const getDoctorBranch = (name: string, email: string) => {
    if (email.includes("cardio") || name.toLowerCase().includes("cardio") || name.toLowerCase().includes("kardiyo")) {
      return { tr: "Kardiyoloji & Kalp Cerrahisi", ar: "أمراض القلب وجراحة الأوعية", en: "Cardiology & Vascular" };
    }
    if (email.includes("derma") || name.toLowerCase().includes("derma") || name.toLowerCase().includes("demir")) {
      return { tr: "Dermatoloji & Medikal Estetik", ar: "الأمراض الجلدية والتجميل", en: "Dermatology & Aesthetics" };
    }
    return { tr: "Genel Uzman Hekim", ar: "طبيب استشاري عام", en: "General Medical Specialist" };
  };

  return (
    <section id="doctors" className="py-20 bg-[#FAF7F2] border-b border-[#E5DCD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE8DC] border border-[#E5DCD0] text-[#4A2E1B] text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
            <Stethoscope className="w-3.5 h-3.5 text-[#B8860B]" />
            <span>{t.doctorConsultantsBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2C1810] font-serif tracking-tight mb-4">
            {t.ourDoctorsTitle}
          </h2>
          <p className="text-[#4E3D30] text-sm sm:text-base leading-relaxed">
            {t.ourDoctorsSubtitle}
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8">
          {doctors.map((doc) => {
            const branch = getDoctorBranch(doc.fullName, doc.email);

            return (
              <div
                key={doc.id}
                className="min-w-0 bg-white border border-[#E5DCD0] hover:border-[#B8860B]/60 rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#4A2E1B]/5 flex flex-col justify-between shadow-sm"
              >
                <div>
                  {/* Doctor Profile Head */}
                  <div className="flex flex-col items-start gap-3 mb-6 sm:flex-row sm:gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EFE8DC] to-[#E5DCD0] p-0.5 shadow-md shrink-0 border border-[#E5DCD0]">
                      <div className="w-full h-full bg-[#FAF7F2] rounded-[14px] flex items-center justify-center text-[#4A2E1B]">
                        <User className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="min-w-0 break-words">
                      <h3 className="text-lg font-bold text-[#2C1810] font-serif leading-snug">
                        {doc.fullName}
                      </h3>
                      <div className="text-xs font-semibold text-[#8A5F35] mt-1">
                        {branch[language] || branch.en}
                      </div>
                      <div className="flex items-center gap-1 text-[#6E492D]/80 text-[11px] mt-1.5 font-medium">
                        <Globe2 className="w-3.5 h-3.5 text-[#B8860B]" />
                        <span>العربية • Türkçe • English</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges / Rating */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] mb-6 text-xs">
                    <div className="flex items-center gap-1.5 text-[#B8860B]">
                      <Star className="w-3.5 h-3.5 fill-[#B8860B]" />
                      <span className="font-bold text-[#2C1810]">4.95</span>
                      <span className="text-[#6E492D]/70">(150+ {t.statsPatients})</span>
                    </div>
                    <span className="text-[#2E7D32] font-semibold text-[11px] text-right">
                      09:00 - 17:00
                    </span>
                  </div>

                  {/* Brief Info */}
                  <p className="text-[#4E3D30] text-xs leading-relaxed mb-6">
                    {t.doctorBioDefault}
                  </p>
                </div>

                {/* Booking Button */}
                <button
                  onClick={() => onSelectDoctorForBooking(doc)}
                  className="w-full py-3 px-4 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#4A2E1B]/15 transition-all hover:scale-[1.02]"
                >
                  <Calendar className="w-4 h-4 text-[#EFE8DC]" />
                  <span>{t.bookWithDoctor}</span>
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
