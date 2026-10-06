import React from "react";
import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";

export const Footer: React.FC = () => {
  const t = useTranslations("common");

  return (
    <footer className="bg-[#F3EDE2] border-t border-[#DDD2C1] text-[#6A584A] text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-[#D5C7B3] shadow-sm bg-[#FAF7F2] p-0.5">
              <img src="/logo.png" alt="Mena Clinic Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <div className="text-base font-bold text-[#2C1810] font-serif">{t("clinicName")}</div>
              <div className="text-[10px] text-[#8A6445] font-semibold">{t("clinicLocation")}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#4E3D30] font-medium">
            <Phone className="w-4 h-4 text-[#8A6445] shrink-0" />
            <span className="flex items-center gap-1.5 flex-wrap">
              <span>{t("emergency").split(":")[0]}:</span>
              <bdi dir="ltr" className="font-mono font-bold tracking-tight text-[#2C1810]">+963 (21) 222 3344</bdi>
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-[#E0D5C3] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7D6E63] gap-4">
          <div>
            © {new Date().getFullYear()} {t("clinicName")}. {t("clinicLocation")}
          </div>
          <div className="flex items-center gap-4 text-[#6A584A] font-medium">
            <span>العربية • Türkçe • English</span>
            <span>•</span>
            <span>{t("patientPortal")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
