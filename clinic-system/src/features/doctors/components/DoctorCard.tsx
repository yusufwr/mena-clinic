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

  const availabilityStatus = doctor.availabilityStatus || "AVAILABLE";
  const isOnLeave = availabilityStatus === "ON_LEAVE";

  // Live working hours & room localized
  const rawHours = doctor.hours || "09:00 - 17:00";
  const workingHours = locale === "ar"
    ? `الدوام: ${rawHours}`
    : locale === "en"
    ? `Shift: ${rawHours}`
    : `Mesai: ${rawHours}`;

  const localizedRoom = (() => {
    const r = doctor.room || "";
    if (!r) return "";
    if (locale === "ar") return r.replace(/Poliklinik/gi, "عيادة");
    if (locale === "en") return r.replace(/Poliklinik/gi, "Clinic");
    return r;
  })();

  const localizeNote = (note?: string) => {
    if (!note) return "";
    if (locale === "tr") return note;
    if (locale === "ar") {
      if (note.includes("21:00")) return "المناوبة المسائية مفتوحة حتى الساعة 21:00";
      if (note.includes("izin") || note.includes("hastalık")) return "الطبيب في إجازة اليوم";
      if (note.includes("acil")) return "الحالات الطارئة فقط";
    }
    if (locale === "en") {
      if (note.includes("21:00")) return "Evening shift open until 21:00";
      if (note.includes("izin") || note.includes("hastalık")) return "Physician on leave today";
      if (note.includes("acil")) return "Emergency cases only";
    }
    return note;
  };

  const statusBadge = (() => {
    if (availabilityStatus === "ON_LEAVE") {
      return {
        label: locale === "ar" ? "في إجازة / غير متاح اليوم" : locale === "en" ? "On Leave / Unavailable" : "İzinli / Raporlu (Müsait Değil)",
        cls: "bg-red-50 text-red-800 border-red-200",
        dot: "bg-red-500",
      };
    }
    if (availabilityStatus === "EVENING_SHIFT") {
      return {
        label: locale === "ar" ? "مناوبة مسائية مفتوحة" : locale === "en" ? "Evening Shift Open" : "Akşam Mesaisinde (Açık)",
        cls: "bg-purple-50 text-purple-900 border-purple-200",
        dot: "bg-purple-600",
      };
    }
    if (availabilityStatus === "EMERGENCY_ONLY") {
      return {
        label: locale === "ar" ? "في العمليات / طوارئ فقط" : locale === "en" ? "In Surgery / Emergency Only" : "Ameliyatta / Sadece Acil",
        cls: "bg-amber-50 text-amber-900 border-amber-200",
        dot: "bg-amber-500",
      };
    }
    return {
      label: locale === "ar" ? "متاح للحجز والمعاينة" : locale === "en" ? "Available for Booking" : "Müsait • Hasta Kabulünde",
      cls: "bg-emerald-50 text-emerald-900 border-emerald-200",
      dot: "bg-emerald-500",
    };
  })();

  // Languages supported
  const languagesText = locale === "ar"
    ? "اللغات: العربية • التركية • الإنجليزية"
    : locale === "en"
    ? "Languages: English • Arabic • Turkish"
    : "Diller: Türkçe • Arapça • İngilizce";

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

        {/* Live Availability Status Badge */}
        <div className={`flex flex-col gap-1 px-3 py-2 rounded-xl border mb-3 text-xs ${statusBadge.cls}`}>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-bold text-[11px]">
              <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
              <span>{statusBadge.label}</span>
            </span>
            {localizedRoom && <span className="text-[10px] font-mono opacity-80">{localizedRoom}</span>}
          </div>
          {doctor.availabilityNote && (
            <p className="text-[11px] opacity-90 font-medium">{localizeNote(doctor.availabilityNote)}</p>
          )}
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] mb-3 text-xs">
          <div className="flex items-center gap-1.5 text-[#B8860B]">
            <Star className="w-3.5 h-3.5 fill-[#B8860B]" />
            <span className="font-bold text-[#2C1810]">{doctor.rating || 4.95}</span>
          </div>
          <span className="text-[#3E6B48] font-semibold text-[11px] font-mono">
            {workingHours}
          </span>
        </div>

        {/* Consultation Fee Display */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#F6F0E6] border border-[#E5DCD0] mb-3 text-xs">
          <span className="text-[11px] font-semibold text-[#7D6E63]">
            {locale === "ar" ? "أجرة المعاينة:" : locale === "en" ? "Consultation Fee:" : "Muayene Ücreti:"}
          </span>
          <strong className="font-bold text-[#4A2E1B] font-mono">
            {locale === "ar"
              ? `${(doctor.consultationFee || 1000).toLocaleString("tr-TR")} ل.س`
              : `${(doctor.consultationFee || 1000).toLocaleString("tr-TR")} SYP`}
          </strong>
        </div>

        <div className="flex items-center gap-2 text-[#7D6E63] text-xs mb-5 font-medium">
          <Globe className="w-3.5 h-3.5 text-[#8A6445]" />
          <span>{languagesText}</span>
        </div>
      </div>

      <button
        type="button"
        disabled={isOnLeave}
        onClick={() => !isOnLeave && onBook(doctor)}
        className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
          isOnLeave
            ? "bg-stone-200 text-stone-500 cursor-not-allowed border border-stone-300"
            : "bg-[#4A2E1B] hover:bg-[#382112] text-white shadow-md shadow-[#4A2E1B]/15 hover:scale-[1.02]"
        }`}
      >
        <Calendar className={`w-4 h-4 ${isOnLeave ? "text-stone-400" : "text-amber-200"}`} />
        <span>
          {isOnLeave
            ? locale === "ar"
              ? "الطبيب في إجازة حالياً"
              : locale === "en"
              ? "Doctor Currently On Leave"
              : "Hekim Şu An İzinli"
            : t("bookAppointment")}
        </span>
      </button>
    </div>
  );
};
