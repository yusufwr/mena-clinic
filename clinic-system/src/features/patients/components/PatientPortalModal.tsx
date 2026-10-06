"use client";

import React, { useState } from "react";
import { X, User, ShieldCheck, Stethoscope, Pill, FlaskConical, LogOut, UserPlus, Lock, Mail, Phone, Hash } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { AuthUser } from "../../auth/auth.types";
import { LoginForm } from "../../auth/components/LoginForm";
import { registerPatient } from "../../auth/auth.service";
import { MedicalRecord } from "../patients.types";

interface PatientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onLoginSuccess: (user: AuthUser, token: string) => void;
  onLogout: () => void;
}

// Sample consultations specifically belonging to this patient
const PATIENT_CONSULTATIONS: Record<string, MedicalRecord[]> = {
  default: [
    {
      id: "med-1",
      patientId: "pat-1",
      doctorId: "doc-cardio",
      diagnosis: "I20.9 - Angina Pectoris (ICD-10)",
      clinicalNotes: "S: Retrosternal pressure on exertion for the past 4 weeks.\nO: BP: 135/85 mmHg, HR: 74 bpm. ECG: Normal sinus rhythm with mild ST changes in V4-V6.\nA: Stable angina suspected.\nP: Lipitor 10mg & follow-up cardiac ECHO scheduled.",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      doctor: { fullName: "Dr. Selim Yılmaz (Cardiology)" },
      prescriptions: [
        {
          id: "pr-1",
          status: "DISPENSED",
          items: [
            { itemName: "Lipitor 10mg", dosage: "1x daily (evening)", quantity: 1 },
            { itemName: "Aspirin 100mg", dosage: "1x daily with meal", quantity: 1 }
          ]
        }
      ],
      labOrders: [
        { id: "lab-1", testName: "Lipid Profile (Total Cholesterol, HDL, LDL)", status: "COMPLETED", resultData: "LDL: 142 mg/dL, HDL: 44 mg/dL" },
        { id: "lab-2", testName: "Troponin I & CK-MB", status: "COMPLETED", resultData: "Negative (<0.01 ng/mL)" }
      ]
    },
    {
      id: "med-2",
      patientId: "pat-1",
      doctorId: "doc-derma",
      diagnosis: "L20.9 - Atopic Dermatitis (ICD-10)",
      clinicalNotes: "S: Pruritus and flexural dryness with seasonal exacerbation.\nO: Mild erythema without secondary infection.\nA: Atopic eczema flare.\nP: Emollient cream and topical treatment prescribed.",
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      doctor: { fullName: "Dr. Leyla Demir (Dermatology)" },
      prescriptions: [
        {
          id: "pr-2",
          status: "DISPENSED",
          items: [
            { itemName: "Advantan 0.1% Cream", dosage: "Apply thin layer once daily", quantity: 1 },
            { itemName: "Medical Moisturizer Balm", dosage: "3x daily as needed", quantity: 2 }
          ]
        }
      ]
    }
  ]
};

export const PatientPortalModal: React.FC<PatientPortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const tModal = useTranslations("patientModal");
  const tAuth = useTranslations("auth");
  const locale = useLocale();

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [activeTab, setActiveTab] = useState<"records" | "profile">("records");

  // Registration Form State
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regIdentityNo, setRegIdentityNo] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regBloodType, setRegBloodType] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  if (!isOpen) return null;

  const isPatientLoggedIn = currentUser && currentUser.role === "PATIENT";
  const records = PATIENT_CONSULTATIONS.default;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");

    try {
      const res = await registerPatient({
        fullName: regFullName,
        email: regEmail,
        phone: regPhone,
        identityNo: regIdentityNo,
        password: regPassword,
      });
      onLoginSuccess(res.user, res.token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : tAuth("allFieldsRequired");
      setRegError(msg);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-[#E5DCD0] rounded-3xl shadow-2xl overflow-hidden text-[#2C1810]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E5DCD0] bg-gradient-to-r from-[#F5EFEB] via-[#FAF7F2] to-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A2E1B] text-amber-200 flex items-center justify-center font-bold shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#2C1810] font-serif">
                {isPatientLoggedIn ? `${tModal("welcome")}, ${currentUser.fullName}` : tModal("loginTitle")}
              </h3>
              <p className="text-xs text-[#8A5F35] font-semibold">
                {isPatientLoggedIn ? tModal("subtitleLoggedIn") : tModal("subtitleLoggedOut")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPatientLoggedIn && (
              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs transition-colors flex items-center gap-1.5 font-semibold"
                title={tModal("logout")}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{tModal("logout")}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[#7D6E63] hover:text-[#2C1810] hover:bg-[#FAF7F2] transition-colors"
              title={tModal("close")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 bg-white">
          
          {!isPatientLoggedIn ? (
            <div className="space-y-6">
              {/* Privacy Notice Banner */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] text-xs text-[#5A483B] leading-relaxed space-y-1">
                <strong className="text-[#4A2E1B] block font-semibold">{tModal("privacyBadge")}</strong>
                <p>{tModal("privacyDesc")}</p>
              </div>

              {/* Mode Switch Tabs: Login vs Register */}
              <div className="grid grid-cols-2 p-1 bg-[#F3EDE2] rounded-2xl border border-[#E5DCD0]">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    authMode === "login"
                      ? "bg-[#4A2E1B] text-white shadow-sm"
                      : "text-[#6A584A] hover:text-[#2C1810]"
                  }`}
                >
                  {tModal("tabLogin")}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    authMode === "register"
                      ? "bg-[#4A2E1B] text-white shadow-sm"
                      : "text-[#6A584A] hover:text-[#2C1810]"
                  }`}
                >
                  {tModal("tabRegister")}
                </button>
              </div>

              {authMode === "login" ? (
                <LoginForm
                  onSuccess={(user, token) => {
                    onLoginSuccess(user, token);
                  }}
                  onSwitchToRegister={() => setAuthMode("register")}
                />
              ) : (
                /* Complete Patient Registration Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {regError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                      {regError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4E3D30] mb-1.5">{tAuth("fullName")}</label>
                      <div className="relative">
                        <User className="absolute top-3 left-3 rtl:left-auto rtl:right-3 w-4 h-4 text-[#8A5F35]" />
                        <input
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder={tAuth("fullNamePlaceholder")}
                          className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl py-2.5 pl-10 pr-3 rtl:pr-10 rtl:pl-3 text-sm text-[#2C1810] placeholder-[#9E8E81] focus:bg-white focus:outline-none focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4E3D30] mb-1.5">{tAuth("identityNo")}</label>
                      <div className="relative">
                        <Hash className="absolute top-3 left-3 rtl:left-auto rtl:right-3 w-4 h-4 text-[#8A5F35]" />
                        <input
                          type="text"
                          required
                          value={regIdentityNo}
                          onChange={(e) => setRegIdentityNo(e.target.value)}
                          placeholder={tAuth("identityPlaceholder")}
                          className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl py-2.5 pl-10 pr-3 rtl:pr-10 rtl:pl-3 text-sm text-[#2C1810] placeholder-[#9E8E81] focus:bg-white focus:outline-none focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4E3D30] mb-1.5">{tAuth("phone")}</label>
                      <div className="relative">
                        <Phone className="absolute top-3 left-3 rtl:left-auto rtl:right-3 w-4 h-4 text-[#8A5F35]" />
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder={tAuth("phonePlaceholder")}
                          className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl py-2.5 pl-10 pr-3 rtl:pr-10 rtl:pl-3 text-sm text-[#2C1810] placeholder-[#9E8E81] focus:bg-white focus:outline-none focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4E3D30] mb-1.5">{tAuth("bloodType")}</label>
                      <select
                        value={regBloodType}
                        onChange={(e) => setRegBloodType(e.target.value)}
                        className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl py-2.5 px-3 text-sm text-[#2C1810] focus:bg-white focus:outline-none focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B]"
                      >
                        <option value="">{tAuth("selectBloodType")}</option>
                        <option value="A+">A Rh (+)</option>
                        <option value="A-">A Rh (-)</option>
                        <option value="B+">B Rh (+)</option>
                        <option value="B-">B Rh (-)</option>
                        <option value="AB+">AB Rh (+)</option>
                        <option value="AB-">AB Rh (-)</option>
                        <option value="O+">O Rh (+)</option>
                        <option value="O-">O Rh (-)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4E3D30] mb-1.5">{tAuth("email")}</label>
                    <div className="relative">
                      <Mail className="absolute top-3 left-3 rtl:left-auto rtl:right-3 w-4 h-4 text-[#8A5F35]" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder={tAuth("emailPlaceholder")}
                        className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl py-2.5 pl-10 pr-3 rtl:pr-10 rtl:pl-3 text-sm text-[#2C1810] placeholder-[#9E8E81] focus:bg-white focus:outline-none focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4E3D30] mb-1.5">{tAuth("password")}</label>
                    <div className="relative">
                      <Lock className="absolute top-3 left-3 rtl:left-auto rtl:right-3 w-4 h-4 text-[#8A5F35]" />
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder={tAuth("passwordPlaceholder")}
                        className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl py-2.5 pl-10 pr-3 rtl:pr-10 rtl:pl-3 text-sm text-[#2C1810] placeholder-[#9E8E81] focus:bg-white focus:outline-none focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-3 bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-sm rounded-xl shadow-md shadow-[#4A2E1B]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4 text-amber-200" />
                    <span>{regLoading ? tAuth("loading") : tAuth("registerButton")}</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className="text-xs text-[#4A2E1B] hover:text-[#6E492D] font-semibold hover:underline"
                    >
                      {tAuth("alreadyHaveAccount")} <span className="font-bold">{tAuth("goToLogin")}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Privacy Badge Guarantee */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{tModal("hipaaNotice")}</span>
              </div>

              {/* Navigation Sub-Tabs */}
              <div className="flex items-center gap-2 border-b border-[#E5DCD0] pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("records")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "records"
                      ? "bg-[#4A2E1B] text-white shadow-sm"
                      : "text-[#6A584A] hover:text-[#2C1810] hover:bg-[#FAF7F2]"
                  }`}
                >
                  {tModal("tabRecords")} ({records.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "profile"
                      ? "bg-[#4A2E1B] text-white shadow-sm"
                      : "text-[#6A584A] hover:text-[#2C1810] hover:bg-[#FAF7F2]"
                  }`}
                >
                  {tModal("tabProfile")}
                </button>
              </div>

              {activeTab === "records" ? (
                <div className="space-y-5">
                  {records.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-4 shadow-sm"
                    >
                      {/* Doctor & Date */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#E5DCD0] text-xs">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-[#3E6B48]" />
                          <strong className="text-[#2C1810] text-sm">{rec.doctor?.fullName}</strong>
                        </div>
                        <span className="text-[#7D6E63] font-medium">
                          {new Date(rec.createdAt).toLocaleDateString(locale === "ar" ? "ar-SY" : locale === "tr" ? "tr-TR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                      </div>

                      {/* Illness Reason & Diagnosis */}
                      <div className="p-3.5 rounded-xl bg-white border border-[#E5DCD0] space-y-1 shadow-sm">
                        <span className="text-[10px] font-bold text-[#8A5F35] uppercase tracking-wider block">
                          {tModal("diagnosisTitle")}
                        </span>
                        <div className="text-sm font-bold text-[#2C1810]">
                          {rec.diagnosis}
                        </div>
                      </div>

                      {/* Clinical Notes */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#7D6E63] uppercase tracking-wider block">
                          {tModal("clinicalNotesTitle")}
                        </span>
                        <div className="p-3.5 rounded-xl bg-white border border-[#E5DCD0] text-xs text-[#4E3D30] font-sans leading-relaxed whitespace-pre-wrap">
                          {rec.clinicalNotes}
                        </div>
                      </div>

                      {/* Prescriptions */}
                      {rec.prescriptions && rec.prescriptions.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-[#F6F0EA] border border-[#E5DCD0] space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#6E492D]">
                            <Pill className="w-4 h-4 text-[#8A5F35]" />
                            <span>{tModal("prescriptionsTitle")}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {rec.prescriptions[0].items.map((item, idx) => (
                              <div key={idx} className="p-2.5 rounded-lg bg-white border border-[#E5DCD0] text-xs">
                                <strong className="text-[#2C1810] block">{item.itemName}</strong>
                                <span className="text-[#6E492D] text-[11px] font-medium">{item.dosage} • {item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lab Orders */}
                      {rec.labOrders && rec.labOrders.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-[#F0F5F2] border border-[#D0E0D6] space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#2F5E3D]">
                            <FlaskConical className="w-4 h-4 text-[#3E6B48]" />
                            <span>{tModal("labResultsTitle")}</span>
                          </div>
                          <div className="space-y-1.5">
                            {rec.labOrders.map((lab) => (
                              <div key={lab.id} className="p-2 rounded-lg bg-white border border-[#D0E0D6] text-xs flex items-center justify-between">
                                <span className="text-[#2C1810] font-medium">{lab.testName}</span>
                                <span className="text-[#2F5E3D] font-bold text-[11px]">{lab.resultData}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white border border-[#E5DCD0]">
                      <span className="text-[#7D6E63] block text-[10px]">{tModal("fullName")}</span>
                      <strong className="text-[#2C1810] text-sm">{currentUser.fullName}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-[#E5DCD0]">
                      <span className="text-[#7D6E63] block text-[10px]">{tModal("identityNo")}</span>
                      <strong className="text-[#2C1810] text-sm font-mono">{currentUser.identityNo || "99999999996"}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-[#E5DCD0]">
                      <span className="text-[#7D6E63] block text-[10px]">{tModal("bloodType")}</span>
                      <strong className="text-rose-600 text-sm font-mono">A Rh (+)</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-[#E5DCD0]">
                      <span className="text-[#7D6E63] block text-[10px]">{tModal("insurance")}</span>
                      <strong className="text-[#4A2E1B] text-sm">Mena Healthcare / Active</strong>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
