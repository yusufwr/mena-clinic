import React from "react";
import { HeartPulse, Phone, Mail, MapPin, Clock, ShieldCheck, Award } from "lucide-react";
import { useTranslation } from "../features/i18n/LanguageContext";

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#F3EDE2] border-t border-[#E5DCD0] text-[#4E3D30] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-[#D5C7B3] shadow-sm bg-[#FAF7F2] p-0.5">
                <img src="/logo.png" alt="Mena Clinic Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <div className="text-lg font-bold text-[#2C1810] font-serif">{t.clinicName}</div>
                <div className="text-[10px] text-[#B8860B] font-semibold">مجمع مينا الطبي</div>
              </div>
            </div>
            <p className="text-[#4E3D30] leading-relaxed">
              {t.clinicTagline}
            </p>
            <div className="flex items-center gap-2 text-[#2C1810]">
              <Award className="w-4 h-4 text-[#B8860B]" />
              <span className="text-[11px] font-medium">ISO 9001 & JCI Clinical Standards</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#2C1810] font-serif tracking-wide">{t.phone} & {t.emergencyHotline}</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-[#4E3D30]">
                <Phone className="w-4 h-4 text-[#B8860B] shrink-0" />
                <bdi dir="ltr" className="font-mono font-medium">+963 (21) 222 3344 / 55</bdi>
              </li>
              <li className="flex items-center gap-2 text-[#4E3D30]">
                <Mail className="w-4 h-4 text-[#B8860B] shrink-0" />
                <span>contact@menaclinic.sy</span>
              </li>
              <li className="flex items-start gap-2 text-[#4E3D30]">
                <MapPin className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                <span>Al-Mouhafaza District, Main Health Avenue, Aleppo, Syria</span>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#2C1810] font-serif tracking-wide">{t.workingHours}</h4>
            <div className="p-3.5 rounded-xl bg-white border border-[#E5DCD0] space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-[#4A2E1B] font-semibold text-[11px]">
                <Clock className="w-4 h-4 text-[#B8860B]" />
                <span>{t.scheduleHoursValue}</span>
              </div>
              <p className="text-[11px] text-[#4E3D30]">
                {t.emergencyHotline} • {t.statsEmergency}
              </p>
            </div>
          </div>

          {/* Security & Strict Compliance */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#2C1810] font-serif tracking-wide">
              {t.safeCareGuarantee}
            </h4>
            <p className="text-[#4E3D30] leading-relaxed text-[11px]">
              {t.feat1Desc}
            </p>
            <div className="flex items-center gap-2 text-[#2E7D32]">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[11px] font-semibold">HIPAA & GDPR Standards • 256-bit SSL</span>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-[#E5DCD0] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6E492D] gap-4">
          <div>
            © {new Date().getFullYear()} {t.clinicName}. {t.allRightsReserved}
          </div>
          <div className="flex items-center gap-4 text-[#6E492D]">
            <span>Strict Vertical Slice Architecture</span>
            <span>•</span>
            <span>Aleppo EMR System</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
