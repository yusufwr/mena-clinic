"use client";

import React, { useState } from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { registerPatient } from "@/features/auth";
import { 
  HeartPulse, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  CreditCard, 
  Droplet, 
  ShieldAlert, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  ChevronDown,
  Sparkles
} from "lucide-react";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const isRtl = locale === "ar";

  const [fullName, setFullName] = useState("");
  const [identityNo, setIdentityNo] = useState("");
  const [phone, setPhone] = useState("+963 ");
  const [email, setEmail] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [langDropdown, setLangDropdown] = useState(false);

  const languages: { code: "tr" | "ar" | "en"; label: string; flag: string }[] = [
    { code: "tr", label: "Türkçe", flag: "🇹🇷" },
    { code: "ar", label: "العربية", flag: "🇸🇾" },
    { code: "en", label: "English", flag: "🇬🇧" },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!fullName.trim() || !identityNo.trim() || !email.trim() || !password) {
      setErrorMsg(t("allFieldsRequired"));
      return;
    }

    if (password.length < 6) {
      setErrorMsg(t("passwordTooShort"));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(t("passwordsDoNotMatch"));
      return;
    }

    setIsLoading(true);

    try {
      const data = await registerPatient({
        fullName: fullName.trim(),
        identityNo: identityNo.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        bloodType: bloodType || undefined,
        emergencyContact: emergencyContact.trim() || undefined,
      });

      // Save user session
      if (typeof window !== "undefined") {
        localStorage.setItem("mena_auth_token", data.token);
        localStorage.setItem("mena_auth_user", JSON.stringify(data.user));
      }

      setSuccessMsg(t("registerSuccessDesc"));

      // Redirect to home or login
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message || t("errorTitle"));
      } else {
        setErrorMsg(t("errorTitle"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFullName(locale === "ar" ? "طارق الأحمد" : "Tarek Al-Ahmad");
    setIdentityNo(`99${randomSuffix}443`);
    setPhone("+963 933 554422");
    setEmail(`tarek.${randomSuffix}@example.com`);
    setBloodType("O+");
    setEmergencyContact(locale === "ar" ? "الأخ: عمر - 0944112233" : "Kardeşi: Omar - 0944112233");
    setPassword("PatientPass123!");
    setConfirmPassword("PatientPass123!");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#EFE8DC] selection:text-[#2C1810]">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#EFE8DC]/60 via-[#F3EDE2]/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#C5A880]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#8A5F35]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header / Language & Back */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#5A483B] hover:text-[#2C1810] text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-[#E5DCD0] hover:border-[#D5C7B3] transition-all shadow-sm group"
        >
          {isRtl ? (
            <ArrowRight className="w-4 h-4 text-[#8A5F35] group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <ArrowLeft className="w-4 h-4 text-[#8A5F35] group-hover:-translate-x-0.5 transition-transform" />
          )}
          <span>{t("backToHome")}</span>
        </Link>

        {/* Language Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangDropdown(!langDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FDFBF7] border border-[#E5DCD0] text-xs font-medium text-[#4E3D30] transition-colors shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-[#8A5F35]" />
            <span>{currentLang.flag}</span>
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
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left rtl:text-right hover:bg-[#FAF7F2] transition-colors ${
                    locale === l.code ? "text-[#4A2E1B] font-bold bg-[#F3EDE2]" : "text-[#4E3D30]"
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Card */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-4 py-6">
        <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 sm:p-8 shadow-xl shadow-[#4A2E1B]/5 relative">
          
          {/* Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6E492D] via-[#4A2E1B] to-[#361F10] text-amber-200 shadow-md shadow-[#4A2E1B]/20">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#2C1810] tracking-tight font-serif">
                {t("registerTitle")}
              </h1>
              <p className="text-xs text-[#6A584A] mt-1 leading-relaxed max-w-md mx-auto">
                {t("registerSubtitle")}
              </p>
            </div>

            {/* Quick Demo Fill Helper */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDemoFill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#E5DCD0] text-[#4A2E1B] text-xs font-semibold transition-all hover:scale-105 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>Örnek Hasta Bilgilerini Otomatik Doldur (Test)</span>
              </button>
            </div>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{t("registerSuccessTitle")}</p>
                <p className="text-[11px] text-emerald-700">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5 text-left rtl:text-right">
                <label className="text-xs font-semibold text-[#4E3D30] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#8A5F35]" />
                  <span>{t("fullName")} *</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("fullNamePlaceholder")}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#DDD2C1] text-[#2C1810] placeholder-[#9E8E81] text-xs focus:outline-none focus:bg-white focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B] transition-all text-left rtl:text-right"
                />
              </div>

              {/* National Identity No */}
              <div className="space-y-1.5 text-left rtl:text-right">
                <label className="text-xs font-semibold text-[#4E3D30] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#8A5F35]" />
                  <span>{t("identityNo")} *</span>
                </label>
                <input
                  type="text"
                  value={identityNo}
                  onChange={(e) => setIdentityNo(e.target.value)}
                  placeholder={t("identityPlaceholder")}
                  required
                  dir="ltr"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#DDD2C1] text-[#2C1810] placeholder-[#9E8E81] text-xs focus:outline-none focus:bg-white focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B] transition-all text-left rtl:text-right"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Phone */}
              <div className="space-y-1.5 text-left rtl:text-right">
                <label className="text-xs font-semibold text-[#4E3D30] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#8A5F35]" />
                  <span>{t("phone")}</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("phonePlaceholder")}
                  dir="ltr"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#DDD2C1] text-[#2C1810] placeholder-[#9E8E81] text-xs focus:outline-none focus:bg-white focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B] transition-all text-left rtl:text-right"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5 text-left rtl:text-right">
                <label className="text-xs font-semibold text-[#4E3D30] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8A5F35]" />
                  <span>{t("email")} *</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  required
                  dir="ltr"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#DDD2C1] text-[#2C1810] placeholder-[#9E8E81] text-xs focus:outline-none focus:bg-white focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B] transition-all text-left rtl:text-right"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Blood Type */}
              <div className="space-y-1.5 text-left rtl:text-right">
                <label className="text-xs font-semibold text-[#4E3D30] flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t("bloodType")}</span>
                </label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#DDD2C1] text-[#2C1810] text-xs focus:outline-none focus:bg-white focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B] transition-all"
                >
                  <option value="">{t("selectBloodType")}</option>
                  {bloodTypes.map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-1.5 text-left rtl:text-right">
                <label className="text-xs font-semibold text-[#4E3D30] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#8A5F35]" />
                  <span>{t("emergencyContact")}</span>
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder={t("emergencyContactPlaceholder")}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#DDD2C1] text-[#2C1810] placeholder-[#9E8E81] text-xs focus:outline-none focus:bg-white focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B] transition-all text-left rtl:text-right"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Password */}
              <div className="space-y-1.5 text-left rtl:text-right">
                <label className="text-xs font-semibold text-[#4E3D30] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#8A5F35]" />
                  <span>{t("password")} *</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("passwordPlaceholder")}
                    required
                    dir="ltr"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#DDD2C1] text-[#2C1810] placeholder-[#9E8E81] text-xs focus:outline-none focus:bg-white focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B] transition-all text-left rtl:text-right ltr:pr-10 rtl:pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 ltr:right-3 rtl:left-3 flex items-center text-[#8A796D] hover:text-[#2C1810] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5 text-left rtl:text-right">
                <label className="text-xs font-semibold text-[#4E3D30] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#8A5F35]" />
                  <span>{t("confirmPassword")} *</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  required
                  dir="ltr"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#DDD2C1] text-[#2C1810] placeholder-[#9E8E81] text-xs focus:outline-none focus:bg-white focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B] transition-all text-left rtl:text-right"
                />
              </div>

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 px-4 rounded-2xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-sm shadow-md shadow-[#4A2E1B]/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t("loading")}</span>
                </>
              ) : (
                <>
                  <span>{t("registerButton")}</span>
                  {isRtl ? (
                    <ArrowLeft className="w-4 h-4 text-amber-200" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-amber-200" />
                  )}
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 pt-4 border-t border-[#E5DCD0] text-center text-xs text-[#6A584A]">
            <span>{t("alreadyHaveAccount")}{" "}</span>
            <Link
              href="/login"
              className="text-[#4A2E1B] hover:text-[#6E492D] font-bold hover:underline transition-colors ml-1 rtl:mr-1"
            >
              {t("goToLogin")}
            </Link>
          </div>

        </div>

        {/* Security Notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#7D6E63] text-center font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3E6B48] shrink-0" />
          <span>{t("secureNotice")}</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-[#8E7D6F]">
        © {new Date().getFullYear()} {tCommon("clinicName")} • {tCommon("clinicLocation")}
      </footer>
    </div>
  );
}
