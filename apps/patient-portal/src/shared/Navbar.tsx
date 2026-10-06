import React, { useState } from "react";
import { 
  HeartPulse, 
  Globe, 
  Calendar, 
  User, 
  Stethoscope, 
  LogOut, 
  Menu, 
  X,
  ChevronDown
} from "lucide-react";
import { useTranslation } from "../features/i18n/LanguageContext";
import { Language } from "../features/i18n/types";
import { AuthUser } from "../features/auth/auth.types";

interface NavbarProps {
  activeView: "landing" | "patient" | "doctor";
  onNavigate: (view: "landing" | "patient" | "doctor") => void;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenBooking,
}) => {
  const { t, language, setLanguage, isRTL } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "tr", label: "Türkçe", flag: "🇹🇷" },
    { code: "ar", label: "العربية", flag: "🇸🇾" },
    { code: "en", label: "English", flag: "🇬🇧" },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E5DCD0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <button 
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-3 group text-left rtl:text-right"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#D5C7B3] shadow-md bg-[#FAF7F2] flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Mena Clinic Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-[#2C1810] font-serif group-hover:text-[#4A2E1B] transition-colors">
                Mena Clinic
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#B8860B] font-semibold">
                Medical Center • مجمع مينا الطبي
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F3EDE2] p-1.5 rounded-full border border-[#E5DCD0]">
            <button
              onClick={() => onNavigate("landing")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeView === "landing"
                  ? "bg-[#4A2E1B] text-white shadow-md font-bold"
                  : "text-[#4E3D30] hover:text-[#2C1810] hover:bg-white/60"
              }`}
            >
              {t.home}
            </button>
            <button
              onClick={() => onNavigate("patient")}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === "patient"
                  ? "bg-[#4A2E1B] text-white shadow-md font-bold"
                  : "text-[#4E3D30] hover:text-[#2C1810] hover:bg-white/60"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.patientPortal}</span>
            </button>
            <button
              onClick={() => onNavigate("doctor")}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === "doctor"
                  ? "bg-[#2E7D32] text-white shadow-md font-bold"
                  : "text-[#4E3D30] hover:text-[#2C1810] hover:bg-white/60"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{t.doctorPortal}</span>
            </button>
          </nav>

          {/* Right Actions: Lang Switcher, CTA, Auth */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5DCD0] text-[#2C1810] hover:text-[#4A2E1B] text-xs font-medium transition-colors shadow-sm"
              >
                <Globe className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>{currentLangObj.flag}</span>
                <span>{currentLangObj.label}</span>
                <ChevronDown className="w-3 h-3 text-[#6E492D]" />
              </button>

              {langDropdownOpen && (
                <div 
                  className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-36 bg-white border border-[#E5DCD0] rounded-xl shadow-xl py-1 z-50 animate-fadeIn`}
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left rtl:text-right hover:bg-[#FAF7F2] transition-colors ${
                        language === lang.code ? "text-[#4A2E1B] font-bold bg-[#EFE8DC]" : "text-[#2C1810]"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Book Appointment CTA */}
            <button
              onClick={onOpenBooking}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs rounded-xl shadow-md shadow-[#4A2E1B]/15 transition-all hover:scale-[1.02]"
            >
              <Calendar className="w-3.5 h-3.5 text-[#EFE8DC]" />
              <span>{t.bookAppointment}</span>
            </button>

            {/* Auth / Profile Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E5DCD0] rtl:pl-0 rtl:pr-2 rtl:border-l-0 rtl:border-r">
                <div className="text-right rtl:text-left">
                  <div className="text-xs font-semibold text-[#2C1810] leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-[#B8860B] uppercase font-mono font-bold">
                    {currentUser.role}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title={t.logout}
                  className="p-2 rounded-lg bg-[#FAF0F0] text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F3EDE2] text-[#2C1810] hover:text-[#4A2E1B] text-xs font-medium border border-[#E5DCD0] transition-colors shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>{t.login}</span>
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onOpenBooking()}
              className="p-2 rounded-lg bg-[#4A2E1B] text-white font-bold text-xs"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#2C1810] hover:text-[#4A2E1B] bg-white border border-[#E5DCD0]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E5DCD0] space-y-3 animate-fadeIn">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { onNavigate("landing"); setMobileMenuOpen(false); }}
                className={`py-2 text-center text-xs font-semibold rounded-lg ${
                  activeView === "landing" ? "bg-[#4A2E1B] text-white" : "bg-[#F3EDE2] text-[#2C1810]"
                }`}
              >
                {t.home}
              </button>
              <button
                onClick={() => { onNavigate("patient"); setMobileMenuOpen(false); }}
                className={`py-2 text-center text-xs font-semibold rounded-lg ${
                  activeView === "patient" ? "bg-[#4A2E1B] text-white" : "bg-[#F3EDE2] text-[#2C1810]"
                }`}
              >
                {t.patientPortal}
              </button>
              <button
                onClick={() => { onNavigate("doctor"); setMobileMenuOpen(false); }}
                className={`py-2 text-center text-xs font-semibold rounded-lg ${
                  activeView === "doctor" ? "bg-[#2E7D32] text-white" : "bg-[#F3EDE2] text-[#2C1810]"
                }`}
              >
                {t.doctorPortal}
              </button>
            </div>

            {/* Language Selection Mobile */}
            <div className="flex items-center justify-around py-2 bg-[#F3EDE2] rounded-xl border border-[#E5DCD0]">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-3 py-1 text-xs rounded-md ${
                    language === l.code ? "bg-[#4A2E1B] text-white font-bold" : "text-[#4E3D30]"
                  }`}
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>

            {/* Mobile Auth button */}
            {currentUser ? (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#E5DCD0]">
                <div>
                  <div className="text-xs font-semibold text-[#2C1810]">{currentUser.fullName}</div>
                  <div className="text-[10px] text-[#B8860B]">{currentUser.role}</div>
                </div>
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="px-3 py-1.5 bg-[#FAF0F0] text-red-600 text-xs rounded-lg border border-red-200"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <button
                onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 bg-[#4A2E1B] text-white text-xs font-semibold rounded-xl"
              >
                {t.login} / {t.register}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
