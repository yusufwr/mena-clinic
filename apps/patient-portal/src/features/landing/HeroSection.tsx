import React from "react";
import { Calendar, PhoneCall, ShieldCheck, Star, Users, Sparkles, CheckCircle2 } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";

interface HeroSectionProps {
  onOpenBooking: () => void;
  onExploreDepartments: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBooking,
  onExploreDepartments,
}) => {
  const { t, isRTL } = useTranslation();

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:py-24 border-b border-[#E5DCD0] bg-gradient-to-b from-[#F5EFEB] via-[#FAF7F2] to-[#FAF7F2]">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#C5A880]/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left rtl:lg:text-right">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE7DA] border border-[#D5C7B3] text-[#6E492D] text-xs font-semibold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#B8860B] animate-pulse" />
              <span>{t.heroBadge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#2C1810] font-serif tracking-tight leading-[1.15]">
              {t.heroTitle1}{" "}
              <span className="text-[#8A5F35] underline decoration-[#C59B27]/40">
                {t.heroTitleAccent}
              </span>
              <br />
              <span className="text-[#5A483B] text-3xl sm:text-4xl lg:text-5xl font-medium">
                {t.heroTitle2}
              </span>
            </h1>

            {/* Description */}
            <p className="text-[#5A483B] text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed mx-auto lg:mx-0">
              {t.heroDescription}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#4A2E1B]/20 transition-all hover:scale-105 flex items-center justify-center gap-2.5 active:scale-95"
              >
                <Calendar className="w-4 h-4 text-amber-200" />
                <span>{t.bookAppointment}</span>
              </button>

              <button
                onClick={onExploreDepartments}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#F3EDE2] text-[#2C1810] font-semibold text-sm rounded-xl border border-[#E5DCD0] shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>{t.viewSpecialties}</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-[#E5DCD0] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#5A483B]">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#3E6B48]" />
                <span>Akredite Poliklinikler</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#3E6B48]" />
                <span>Anında Sıra & E-Randevu</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#3E6B48]" />
                <span>Çok Dilli Sağlık Ekibi</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Card & Highlights */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-white border border-[#E5DCD0] rounded-3xl p-6 shadow-xl shadow-[#4A2E1B]/5 space-y-6">
              
              {/* Top Banner inside card */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5DCD0]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFE7DA] border border-[#D5C7B3] flex items-center justify-center text-[#6E492D]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-[#7D6E63] font-medium">Mena Clinic</div>
                    <div className="text-sm font-bold text-[#2C1810] font-serif">Merkez Sağlık Kampüsü</div>
                  </div>
                </div>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
              </div>

              {/* Patient Satisfaction / Rating */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[#B8860B] mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#B8860B]" />
                    ))}
                  </div>
                  <div className="text-xs font-semibold text-[#2C1810]">4.9 / 5.0 (2,400+ Değerlendirme)</div>
                </div>
                <div className="text-right rtl:text-left">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                    %99 Memnuniyet
                  </span>
                </div>
              </div>

              {/* Quick Emergency Box */}
              <div className="p-4 rounded-2xl bg-[#FDF4F2] border border-[#F5C7C1] space-y-2">
                <div className="flex items-center gap-2 text-[#9A2C27] font-bold text-xs uppercase tracking-wider">
                  <PhoneCall className="w-4 h-4 animate-bounce" />
                  <span>{t.emergencyHotline}</span>
                </div>
                <div className="text-xl font-mono font-black text-[#6B1B17]">
                  <bdi dir="ltr">+963 (21) 222 3344</bdi>
                </div>
                <div className="text-[11px] text-[#7D4845]">
                  Ambulans ve acil müdahale ünitesi kesintisiz hizmet vermektedir.
                </div>
              </div>

              {/* Instant Appointment Fast Action */}
              <button
                onClick={onOpenBooking}
                className="w-full py-3.5 bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs rounded-xl shadow-md shadow-[#4A2E1B]/20 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-amber-200" />
                <span>{t.quickBooking} →</span>
              </button>

            </div>
          </div>

        </div>

        {/* Bottom Numbers Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white border border-[#E5DCD0] rounded-2xl shadow-sm">
          <div className="text-center p-3 border-r border-[#E5DCD0] last:border-none">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#4A2E1B] font-serif">45+</div>
            <div className="text-xs text-[#7D6E63] mt-1 font-medium">{t.statsDoctors}</div>
          </div>
          <div className="text-center p-3 border-r border-[#E5DCD0] last:border-none">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#4A2E1B] font-serif">9</div>
            <div className="text-xs text-[#7D6E63] mt-1 font-medium">{t.statsDepartments}</div>
          </div>
          <div className="text-center p-3 border-r border-[#E5DCD0] last:border-none">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#4A2E1B] font-serif">15,000+</div>
            <div className="text-xs text-[#7D6E63] mt-1 font-medium">{t.statsPatients}</div>
          </div>
          <div className="text-center p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#3E6B48] font-serif">24/7</div>
            <div className="text-xs text-[#7D6E63] mt-1 font-medium">{t.statsEmergency}</div>
          </div>
        </div>

      </div>
    </section>
  );
};
