import React, { useState } from "react";
import { X, Lock, Mail, User, Phone, Shield, HeartPulse, Stethoscope, ArrowRight } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { apiRequest } from "../../shared/api";
import { AuthUser, AuthResponse } from "./auth.types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser, token: string) => void;
  defaultRoleHint?: "PATIENT" | "DOCTOR";
  noticeMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultRoleHint = "PATIENT",
  noticeMessage,
}) => {
  const { t, isRTL } = useTranslation();
  const [tab, setTab] = useState<"login" | "register" | "demo">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register form
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("+963 9");
  const [regIdentityNo, setRegIdentityNo] = useState("");
  const [regBloodType, setRegBloodType] = useState("A+");
  const [regEmergencyContact, setRegEmergencyContact] = useState("");
  const [regInsurance, setRegInsurance] = useState("");

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const data = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("mena_auth_token", data.token);
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Giriş başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const data = await apiRequest<AuthResponse>("/auth/register-patient", {
        method: "POST",
        body: JSON.stringify({
          fullName: regFullName,
          email: regEmail,
          password: regPassword,
          phone: regPhone,
          identityNo: regIdentityNo,
          bloodType: regBloodType,
          emergencyContact: regEmergencyContact,
          insuranceInfo: regInsurance,
        }),
      });
      localStorage.setItem("mena_auth_token", data.token);
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Kayıt işlemi başarısız.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setErrorMsg("");
    setLoading(true);
    try {
      const data = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: demoEmail, password: "Password123" }),
      });
      localStorage.setItem("mena_auth_token", data.token);
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Hızlı giriş yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C1810]/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-[#E5DCD0] rounded-2xl shadow-2xl overflow-hidden text-[#2C1810]">
        
        {/* Header */}
        <div className="relative p-6 border-b border-[#E5DCD0] bg-[#FAF7F2]">
          <button
            onClick={onClose}
            className={`absolute top-5 ${isRTL ? "left-5" : "right-5"} p-1.5 rounded-full text-[#6E492D] hover:text-[#2C1810] hover:bg-[#EFE8DC] transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A2E1B] to-[#2C1810] flex items-center justify-center text-white font-bold shadow-md">
              <HeartPulse className="w-6 h-6 text-[#EFE8DC]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#2C1810] font-serif">{t.authModalTitle}</h3>
              <p className="text-xs text-[#B8860B] font-medium">{t.clinicName}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 mt-5 p-1 bg-[#F3EDE2] rounded-xl border border-[#E5DCD0]">
            <button
              onClick={() => { setTab("login"); setErrorMsg(""); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === "login"
                  ? "bg-[#4A2E1B] text-white shadow-sm font-bold"
                  : "text-[#4E3D30] hover:text-[#2C1810]"
              }`}
            >
              {t.authLoginTab}
            </button>
            <button
              onClick={() => { setTab("register"); setErrorMsg(""); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === "register"
                  ? "bg-[#4A2E1B] text-white shadow-sm font-bold"
                  : "text-[#4E3D30] hover:text-[#2C1810]"
              }`}
            >
              {t.authRegisterTab}
            </button>
            <button
              onClick={() => { setTab("demo"); setErrorMsg(""); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === "demo"
                  ? "bg-[#2E7D32] text-white shadow-sm font-bold"
                  : "text-[#4E3D30] hover:text-[#2C1810]"
              }`}
            >
              {t.authDoctorDemoTab}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {noticeMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-[#4A2E1B] text-xs font-semibold flex items-center gap-2.5 shadow-sm">
              <HeartPulse className="w-4 h-4 text-[#B8860B] shrink-0" />
              <span>{noticeMessage}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C1810] mb-1.5">{t.email}</label>
                <div className="relative">
                  <Mail className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} w-4 h-4 text-[#8A5F35]`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@menaclinic.com"
                    className={`w-full bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl py-2.5 ${isRTL ? "pr-10 pl-3" : "pl-10 pr-3"} text-sm text-[#2C1810] focus:outline-none focus:border-[#4A2E1B] transition-colors`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1810] mb-1.5">{t.password}</label>
                <div className="relative">
                  <Lock className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} w-4 h-4 text-[#8A5F35]`} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl py-2.5 ${isRTL ? "pr-10 pl-3" : "pl-10 pr-3"} text-sm text-[#2C1810] focus:outline-none focus:border-[#4A2E1B] transition-colors`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-sm rounded-xl shadow-md shadow-[#4A2E1B]/15 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "..." : t.loginBtn}
                <ArrowRight className="w-4 h-4 text-[#EFE8DC]" />
              </button>

              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => setTab("demo")}
                  className="text-xs text-[#8A5F35] hover:text-[#4A2E1B] font-semibold hover:underline"
                >
                  ⚡ {t.demoStaff}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER (PATIENT) */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2C1810] mb-1">{t.fullName} *</label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Zeynep Kaya / محمد الحلبي"
                  className="w-full bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl py-2 px-3 text-sm text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2C1810] mb-1">{t.identityNo} *</label>
                  <input
                    type="text"
                    required
                    value={regIdentityNo}
                    onChange={(e) => setRegIdentityNo(e.target.value)}
                    placeholder="99988877766"
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl py-2 px-3 text-sm text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C1810] mb-1">{t.bloodType}</label>
                  <select
                    value={regBloodType}
                    onChange={(e) => setRegBloodType(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl py-2 px-3 text-sm text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
                  >
                    <option value="A+">A Rh (+)</option>
                    <option value="A-">A Rh (-)</option>
                    <option value="B+">B Rh (+)</option>
                    <option value="B-">B Rh (-)</option>
                    <option value="AB+">AB Rh (+)</option>
                    <option value="AB-">AB Rh (-)</option>
                    <option value="0+">0 Rh (+)</option>
                    <option value="0-">0 Rh (-)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2C1810] mb-1">{t.phone}</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl py-2 px-3 text-sm text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C1810] mb-1">{t.email} *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="hasta@gmail.com"
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl py-2 px-3 text-sm text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C1810] mb-1">{t.password} *</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="w-full bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl py-2 px-3 text-sm text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2C1810] mb-1">{t.emergencyContact}</label>
                  <input
                    type="text"
                    value={regEmergencyContact}
                    onChange={(e) => setRegEmergencyContact(e.target.value)}
                    placeholder="Yakını & Tel"
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl py-2 px-3 text-xs text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C1810] mb-1">{t.insuranceInfo}</label>
                  <input
                    type="text"
                    value={regInsurance}
                    onChange={(e) => setRegInsurance(e.target.value)}
                    placeholder="SGK / Özel Sigorta"
                    className="w-full bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl py-2 px-3 text-xs text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-sm rounded-xl shadow-md transition-all"
              >
                {loading ? "..." : t.registerBtn}
              </button>
            </form>
          )}

          {/* TAB 3: ONE-CLICK DEMO LOGIN (DOCTOR & PATIENT) */}
          {tab === "demo" && (
            <div className="space-y-4">
              <p className="text-xs text-[#4E3D30] leading-relaxed">
                Test ve inceleme için önceden tanımlanmış hesaplardan birini seçerek anında tek tıkla giriş yapabilirsiniz:
              </p>

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-[#2E7D32] uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Doktor Rolleri (Kardiyoloji & Dermatoloji)</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleQuickDemo("cardio@menaclinic.com")}
                  className="w-full p-3 bg-[#FAF7F2] border border-[#E5DCD0] hover:border-[#2E7D32] rounded-xl text-left rtl:text-right flex items-center justify-between group transition-all shadow-sm"
                >
                  <div>
                    <div className="text-sm font-bold text-[#2C1810]">Dr. Selim Yılmaz</div>
                    <div className="text-xs text-[#4E3D30]">Kardiyoloji / Cardiology • cardio@menaclinic.com</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-[#E8F5E9] text-[#2E7D32] font-semibold rounded group-hover:bg-[#2E7D32] group-hover:text-white transition-colors">
                    Doktor Girişi →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo("derma@menaclinic.com")}
                  className="w-full p-3 bg-[#FAF7F2] border border-[#E5DCD0] hover:border-[#2E7D32] rounded-xl text-left rtl:text-right flex items-center justify-between group transition-all shadow-sm"
                >
                  <div>
                    <div className="text-sm font-bold text-[#2C1810]">Dr. Leyla Demir</div>
                    <div className="text-xs text-[#4E3D30]">Dermatoloji / Dermatology • derma@menaclinic.com</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-[#E8F5E9] text-[#2E7D32] font-semibold rounded group-hover:bg-[#2E7D32] group-hover:text-white transition-colors">
                    Doktor Girişi →
                  </span>
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E5DCD0]">
                <div className="text-[11px] font-bold text-[#B8860B] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Kayıtlı Hasta Rolleri</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickDemo("patient1@menaclinic.com")}
                  className="w-full p-3 bg-[#FAF7F2] border border-[#E5DCD0] hover:border-[#4A2E1B] rounded-xl text-left rtl:text-right flex items-center justify-between group transition-all shadow-sm"
                >
                  <div>
                    <div className="text-sm font-bold text-[#2C1810]">Zeynep Kaya</div>
                    <div className="text-xs text-[#4E3D30]">Hasta Profili (A+) • patient1@menaclinic.com</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-[#EFE8DC] text-[#4A2E1B] font-semibold rounded group-hover:bg-[#4A2E1B] group-hover:text-white transition-colors">
                    Hasta Girişi →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo("patient2@menaclinic.com")}
                  className="w-full p-3 bg-[#FAF7F2] border border-[#E5DCD0] hover:border-[#4A2E1B] rounded-xl text-left rtl:text-right flex items-center justify-between group transition-all shadow-sm"
                >
                  <div>
                    <div className="text-sm font-bold text-[#2C1810]">Ömer Çelik</div>
                    <div className="text-xs text-[#4E3D30]">Hasta Profili (0-) • patient2@menaclinic.com</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-[#EFE8DC] text-[#4A2E1B] font-semibold rounded group-hover:bg-[#4A2E1B] group-hover:text-white transition-colors">
                    Hasta Girişi →
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
