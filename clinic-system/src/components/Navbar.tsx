"use client";

import React, { useState } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { Globe, Calendar, ChevronDown, QrCode, ExternalLink, Menu, X, LogIn } from "lucide-react";
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const languages: { code: "tr" | "ar" | "en"; label: string }[] = [
    { code: "tr", label: "Türkçe" },
    { code: "ar", label: "العربية" },
    { code: "en", label: "English" },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const navLinks = [
    { href: "/", label: t("home"), isRoute: true },
    { href: "#about", label: t("about"), isRoute: false },
    { href: "#departments", label: t("departments"), isRoute: false },
    { href: "#doctors", label: t("doctors"), isRoute: false },
    { href: "#testimonials", label: t("testimonials"), isRoute: false },
    { href: "#contact", label: t("contact"), isRoute: false },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5DCD0] transition-colors shadow-sm">
      <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1920px] tv:max-w-[2400px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group text-left rtl:text-right shrink-0 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#D5C7B3] shadow-md shadow-[#4A2E1B]/15 group-hover:scale-105 transition-transform bg-[#FAF7F2] flex items-center justify-center p-0.5 shrink-0">
              <img src="/logo.png" alt="Mena Clinic Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-xl font-bold tracking-tight text-[#2C1810] font-serif group-hover:text-[#6E492D] transition-colors leading-tight truncate">
                {t("clinicName")}
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#8A6445] font-semibold truncate">
                {t("clinicLocation")}
              </div>
            </div>
          </Link>

          {/* Public Corporate Navigation Links - Desktop & TV */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F0E9DD] p-1.5 rounded-full border border-[#E0D5C3] text-xs font-semibold">
            {navLinks.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-full transition-all ${
                    pathname === "/"
                      ? "bg-[#4A2E1B] text-white font-bold shadow-sm"
                      : "text-[#5A483B] hover:text-[#2C1810] hover:bg-[#E5DAC8]"
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-3.5 py-1.5 rounded-full text-[#5A483B] hover:text-[#2C1810] hover:bg-[#E5DAC8] transition-all"
                >
                  {item.label}
                </a>
              )
            )}
          </nav>

          {/* Action Buttons Container */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdown(!langDropdown)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-white border border-[#E5DCD0] text-[#4E3D30] hover:text-[#2C1810] text-xs font-medium transition-colors shadow-xs"
                title={locale === "ar" ? "اللغة" : locale === "en" ? "Language" : "Dil"}
                aria-label={locale === "ar" ? "اختيار اللغة" : locale === "en" ? "Select language" : "Dil seçimi"}
              >
                <Globe className="w-3.5 h-3.5 text-[#8A6445] hidden xs:inline" />
                <FlagIcon code={currentLang.code} />
                <span className="hidden md:inline font-semibold">{currentLang.label}</span>
                <span className="md:hidden font-semibold uppercase text-[10px]">{currentLang.code}</span>
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

            {/* Hasta Portalı / Giriş Yap (Visible on tablet & desktop: md:flex; tucked into Hamburger menu on mobile) */}
            <Link
              href="/patient"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EFE8DC] hover:bg-[#E5DAC9] text-[#3B2215] text-xs font-semibold border border-[#D5C7B3] transition-all shadow-xs hover:scale-105 group"
              title={locale === "ar" ? "فتح بوابة المريض في علامة تبويب جديدة" : locale === "en" ? "Open Patient Portal in New Tab" : "Hasta Portalını Ayrı Sekmede Aç"}
            >
              <QrCode className="w-3.5 h-3.5 text-[#6E492D] group-hover:text-[#4A2E1B]" />
              <span>{t("patientPortal")}</span>
              <ExternalLink className="w-3 h-3 text-[#8A6445] opacity-70 group-hover:opacity-100" />
            </Link>

            {/* Randevu Al CTA (Visible on tablet & desktop: md:flex; tucked into Hamburger menu on mobile) */}
            <Link
              href="/patient?tab=book"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs rounded-xl shadow-md shadow-[#4A2E1B]/20 transition-all hover:scale-105 active:scale-95 shrink-0"
              title={locale === "ar" ? "حجز موعد عبر بوابة المريض" : locale === "en" ? "Book appointment" : "Randevu Al"}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-200" />
              <span>{t("bookAppointment")}</span>
            </Link>

            {/* Mobile / Tablet Hamburger Toggle Button (3 Çizgi Menü) */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-xl bg-white border border-[#D5C7B3] text-[#4A2E1B] hover:bg-[#FAF7F2] transition-colors shadow-xs flex items-center justify-center gap-1"
              aria-label={locale === "ar" ? "القائمة" : locale === "en" ? "Menu" : "Menü"}
              title={locale === "ar" ? "القائمة" : locale === "en" ? "Menu" : "Menü"}
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer (Tüm sekmeler, Hasta Portalı & Giriş Yap, Randevu Al ve Dil Seçenekleri burada toplanır) */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-[#E5DCD0] py-3.5 space-y-2.5 bg-white/98 backdrop-blur-md rounded-b-3xl shadow-xl px-3 pb-5 animate-fadeIn">
            
            {/* 1. HASTA PORTALI & GİRİŞ YAP KARTI (Mobil Öncelikli) */}
            <Link
              href="/patient"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#F5EFEB] to-[#EFE8DC] border border-[#D5C7B3] text-[#2C1810] shadow-xs hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4A2E1B] text-amber-200 flex items-center justify-center shadow-xs shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="text-left rtl:text-right">
                  <div className="text-xs font-bold text-[#2C1810] flex items-center gap-1.5">
                    <span>{t("patientPortal")}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#4A2E1B]/10 text-[#4A2E1B] font-semibold">{t("login")}</span>
                  </div>
                  <div className="text-[10px] text-[#6E492D]">
                    {locale === "ar" ? "تسجيل الدخول، التحاليل والوصفات الطبية" : locale === "en" ? "Login, Lab Results, Rx & Medical Records" : "Giriş Yap, Tahliller, Reçeteler & Sonuçlar"}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#8A6445] group-hover:text-[#4A2E1B] shrink-0" />
            </Link>

            {/* 2. RANDEVU AL BÜYÜK BUTON (Mobil Öncelikli) */}
            <Link
              href="/patient?tab=book"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileNavOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#4A2E1B] hover:bg-[#382112] text-white text-xs font-bold shadow-md shadow-[#4A2E1B]/20 transition-all active:scale-98"
            >
              <Calendar className="w-4 h-4 text-amber-200" />
              <span>{t("bookAppointment")}</span>
            </Link>

            {/* Ayırıcı */}
            <div className="border-t border-[#E5DCD0]/70 my-2" />

            {/* 3. MENÜ LİNKLERİ */}
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#8A6445] px-2 tracking-wider">
                {locale === "ar" ? "صفحات الموقع" : locale === "en" ? "Site Pages" : "Sayfalar"}
              </div>
              {navLinks.map((item) =>
                item.isRoute ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`block px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      pathname === "/"
                        ? "bg-[#FAF7F2] text-[#4A2E1B] font-bold border border-[#E5DCD0]"
                        : "text-[#5A483B] hover:bg-[#FAF7F2]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-semibold text-[#5A483B] hover:bg-[#FAF7F2] transition-colors"
                  >
                    {item.label}
                  </a>
                )
              )}
            </div>

            {/* 4. MOBİL DİL DEĞİŞTİRME ALANI (3 Buton) */}
            <div className="pt-2 border-t border-[#E5DCD0]/70">
              <div className="text-[10px] uppercase font-bold text-[#8A6445] px-2 mb-1.5 tracking-wider">
                {locale === "ar" ? "اللغة" : locale === "en" ? "Language" : "Dil Seçimi"}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {languages.map((l) => (
                  <Link
                    key={l.code}
                    href={pathname}
                    locale={l.code}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      locale === l.code
                        ? "bg-[#4A2E1B] text-white border-[#4A2E1B] shadow-xs"
                        : "bg-[#FAF7F2] text-[#5A483B] border-[#E5DCD0] hover:bg-[#EFE8DC]"
                    }`}
                  >
                    <FlagIcon code={l.code} />
                    <span>{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </header>
  );
};
