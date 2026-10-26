"use client";

import React from "react";
import { User, Calendar, Star, Globe } from "lucide-react";
import { Doctor } from "../doctors.types";
import { useTranslations, useLocale } from "next-intl";

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBook }) => {
  const t = useTranslations("common");
  const locale = useLocale();

  // Multilingual specialty & name resolution
  const specialty = locale === "ar"
    ? (doctor.specialtyAr || doctor.specialty || "استشاري طبي")
    : locale === "en"
    ? (doctor.specialtyEn || doctor.specialty || "Medical Specialist")
    : (doctor.specialty || "Uzman Hekim");

  const doctorName = locale === "ar"
    ? (doctor.fullNameAr || doctor.fullName)
    : locale === "en"
    ? (doctor.fullNameEn || doctor.fullName)
    : doctor.fullName;

  // Working hours
  const workingHours = locale === "ar"
    ? "أيام الأسبوع 09:00 - 17:00"
    : locale === "en"
    ? "Mon - Fri 09:00 - 17:00"
    : "Hafta içi 09:00 - 17:00";

  // Languages supported
  const languagesText = locale === "ar"
    ? "اللغات: العربية • Türkçe • English"
    : locale === "en"
    ? "Languages: English • العربية • Türkçe"
    : "Diller: Türkçe • العربية • English";

  return (
    <div className="bg-white border border-[#E5DCD0] hover:border-[#B8860B]/60 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#4A2E1B]/5 flex flex-col justify-between">
      <div>
        <div className="flex items-start gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6E492D] to-[#4A2E1B] p-0.5 shadow-md shadow-[#4A2E1B]/20 shrink-0">
            <div className="w-full h-full bg-[#FAF7F2] rounded-[14px] flex items-center justify-center text-[#6E492D]">
              <User className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2C1810] font-serif">{doctorName}</h3>
            <div className="text-xs text-[#8A6445] font-semibold mt-1">
              {specialty}
            </div>
            <div className="text-[11px] text-[#7D6E63] mt-0.5">
              {doctor.email}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] mb-5 text-xs">
          <div className="flex items-center gap-1.5 text-[#B8860B]">
            <Star className="w-3.5 h-3.5 fill-[#B8860B]" />
            <span className="font-bold text-[#2C1810]">4.95</span>
          </div>
          <span className="text-[#3E6B48] font-semibold text-[11px]">
            {workingHours}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#7D6E63] text-xs mb-6 font-medium">
          <Globe className="w-3.5 h-3.5 text-[#8A6445]" />
          <span>{languagesText}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onBook(doctor)}
        className="w-full py-3 px-4 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#4A2E1B]/15 transition-all hover:scale-[1.02]"
      >
        <Calendar className="w-4 h-4 text-amber-200" />
        <span>{t("bookAppointment")}</span>
      </button>
    </div>
  );
};
