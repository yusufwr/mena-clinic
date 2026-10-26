"use client";

import React, { useState } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { Globe, Calendar, User, ChevronDown, QrCode, ExternalLink } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { FlagIcon } from "./FlagIcon";

interface NavbarProps {
  onOpenBooking?: () => void;
  onOpenPatientPortal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking, onOpenPatientPortal }) => {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [langDropdown, setLangDropdown] = useState(false);

  const languages: { code: "tr" | "ar" | "en"; label: string }[] = [
    { code: "tr", label: "Türkçe" },
    { code: "ar", label: "العربية" },
    { code: "en", label: "English" },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5DCD0] transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group text-left rtl:text-right">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#D5C7B3] shadow-md shadow-[#4A2E1B]/15 group-hover:scale-105 transition-transform bg-[#FAF7F2] flex items-center justify-center p-0.5">
              <img src="/logo.png" alt="Mena Clinic Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-[#2C1810] font-serif group-hover:text-[#6E492D] transition-colors">
                {t("clinicName")}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#8A6445] font-semibold">
                {t("clinicLocation")}
              </div>
            </div>
          </Link>

          {/* Public Corporate Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F0E9DD] p-1.5 rounded-full border border-[#E0D5C3] text-xs font-semibold">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-full transition-all ${pathname === "/"
                  ? "bg-[#4A2E1B] text-white font-bold shadow-sm"
                  : "text-[#5A483B] hover:text-[#2C1810] hover:bg-[#E5DAC8]"
                }`}
            >
              {t("home")}
            </Link>
            <a href="#about" className="px-3.5 py-1.5 rounded-full text-[#5A483B] hover:text-[#2C1810] hover:bg-[#E5DAC8] transition-all">
              {t("about")}
            </a>
            <a href="#departments" className="px-3.5 py-1.5 rounded-full text-[#5A483B] hover:text-[#2C1810] hover:bg-[#E5DAC8] transition-all">
              {t("departments")}
            </a>
            <a href="#doctors" className="px-3.5 py-1.5 rounded-full text-[#5A483B] hover:text-[#2C1810] hover:bg-[#E5DAC8] transition-all">
              {t("doctors")}
            </a>
            <a href="#testimonials" className="px-3.5 py-1.5 rounded-full text-[#5A483B] hover:text-[#2C1810] hover:bg-[#E5DAC8] transition-all">
              {t("testimonials")}
            </a>
            <a href="#contact" className="px-3.5 py-1.5 rounded-full text-[#5A483B] hover:text-[#2C1810] hover:bg-[#E5DAC8] transition-all">
              {t("contact")}
            </a>
          </nav>

          {/* Action Buttons: Language, Patient Portal, Booking */}
          <div className="flex items-center gap-2.5">

            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdown(!langDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5DCD0] text-[#4E3D30] hover:text-[#2C1810] text-xs font-medium transition-colors shadow-sm"
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
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left rtl:text-right hover:bg-[#FAF7F2] transition-colors ${locale === l.code ? "text-[#4A2E1B] font-bold bg-[#F3EDE2]" : "text-[#4E3D30]"
                        }`}
                    >
                      <FlagIcon code={l.code} />
                      <span>{l.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Hasta Portalı / Giriş Yap - Ayrı Sekmede Açılır (QR & E-Nabız) */}
            <Link
              href="/patient"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EFE8DC] hover:bg-[#E5DAC9] text-[#3B2215] text-xs font-semibold border border-[#D5C7B3] transition-all shadow-sm hover:scale-105 group"
              title={locale === "ar" ? "فتح بوابة المريض في علامة تبويب جديدة" : locale === "en" ? "Open Patient Portal in New Tab" : "Hasta Portalını Ayrı Sekmede Aç"}
            >
              <QrCode className="w-3.5 h-3.5 text-[#6E492D] group-hover:text-[#4A2E1B]" />
              <span>{t("patientPortal")}</span>
              <ExternalLink className="w-3 h-3 text-[#8A6445] opacity-70 group-hover:opacity-100" />
            </Link>

            {/* Taskbar: Randevu Al CTA - Giriş / Hasta Portalı Sekmesine Yönlendirir */}
            <Link
              href="/patient?tab=book"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs rounded-xl shadow-md shadow-[#4A2E1B]/20 transition-all hover:scale-105 active:scale-95"
              title={locale === "ar" ? "حجز موعد عبر بوابة المريض (علامة تبويب جديدة)" : locale === "en" ? "Book appointment via Patient Portal" : "Hasta Portalında Randevu Al (Ayrı Sekme)"}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-200" />
              <span>{t("bookAppointment")}</span>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
};
