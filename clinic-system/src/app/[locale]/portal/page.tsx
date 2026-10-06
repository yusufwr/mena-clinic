"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { 
  Stethoscope, 
  ShieldAlert, 
  Clock, 
  X, 
  FileText, 
  Pill, 
  FlaskConical, 
  ArrowLeft,
  Lock,
  Save,
  CheckCircle2,
  LogOut,
  User
} from "lucide-react";

interface PortalAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientIdNo: string;
  doctorId: string;
  doctorName: string;
  slotTime: string;
  queueNumber: number;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED";
  consultationNote?: {
    illnessReason: string;
    soapNotes: string;
    prescription?: string;
    labTest?: string;
    updatedAt: string;
  };
}

const INITIAL_PORTAL_DATA: PortalAppointment[] = [
  {
    id: "app-101",
    patientId: "pat-1",
    patientName: "Zeynep Kaya",
    patientPhone: "+963 992 334455",
    patientIdNo: "99999999996",
    doctorId: "doc-cardio",
    doctorName: "Dr. Selim Yılmaz",
    slotTime: "10:00",
    queueNumber: 1,
    status: "CONFIRMED",
    consultationNote: {
      illnessReason: "I20.9 - Angina Pektoris (Eforla gelen göğüs ağrısı)",
      soapNotes: "TA: 135/85 mmHg, Nabız: 74 bpm. EKG: Sinüs ritmi. Efor testi ve kolesterol takibi yapıldı.",
      prescription: "Lipitor 10mg (Günde 1 kez) + Coraspin 100mg",
      labTest: "Lipid Paneli, Troponin I",
      updatedAt: "2026-09-27 10:25"
    }
  },
  {
    id: "app-102",
    patientId: "pat-2",
    patientName: "Ömer Çelik",
    patientPhone: "+963 992 556677",
    patientIdNo: "99999999997",
    doctorId: "doc-cardio",
    doctorName: "Dr. Selim Yılmaz",
    slotTime: "10:30",
    queueNumber: 2,
    status: "CONFIRMED",
  },
  {
    id: "app-103",
    patientId: "pat-3",
    patientName: "Fatima Al-Hassan",
    patientPhone: "+963 993 112233",
    patientIdNo: "99999999998",
    doctorId: "doc-derma",
    doctorName: "Dr. Leyla Demir",
    slotTime: "11:00",
    queueNumber: 1,
    status: "CONFIRMED",
    consultationNote: {
      illnessReason: "L20.9 - Atopik Egzama ve Kutanöz Lezyonlar",
      soapNotes: "Kollarda kaşıntılı eritematöz plaklar. Alerjen temas öyküsü mevcut.",
      prescription: "Advantan Krem (Günde 1 kez)",
      labTest: "Total IgE Paneli",
      updatedAt: "2026-09-27 11:15"
    }
  },
  {
    id: "app-104",
    patientId: "pat-4",
    patientName: "Hasan Mansour",
    patientPhone: "+963 993 445566",
    patientIdNo: "99999999999",
    doctorId: "doc-derma",
    doctorName: "Dr. Leyla Demir",
    slotTime: "11:30",
    queueNumber: 2,
    status: "CONFIRMED",
  }
];

export default function ManagementPortalPage() {
  const t = useTranslations("portal");

  const [role, setRole] = useState<"DOCTOR" | "ADMIN">("DOCTOR");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("doc-cardio");
  const [appointments, setAppointments] = useState<PortalAppointment[]>(INITIAL_PORTAL_DATA);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Sync session on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mena_auth_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          setCurrentUser(u);
          if (u.role === "ADMIN") {
            setRole("ADMIN");
          } else {
            setRole("DOCTOR");
            if (u.email?.includes("derma") || u.email?.includes("leyla")) {
              setSelectedDoctorId("doc-derma");
            } else {
              setSelectedDoctorId("doc-cardio");
            }
          }
        } catch {}
      }
    }
  }, []);

  // Active consultation editor modal state
  const [editingApp, setEditingApp] = useState<PortalAppointment | null>(null);
  const [illnessReason, setIllnessReason] = useState("");
  const [soapNotes, setSoapNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [labTest, setLabTest] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter: If DOCTOR role, show ONLY this doctor's appointments
  const displayedAppointments = role === "ADMIN" 
    ? appointments 
    : appointments.filter((a) => a.doctorId === selectedDoctorId);

  const handleOpenConsultationModal = (app: PortalAppointment) => {
    setEditingApp(app);
    setIllnessReason(app.consultationNote?.illnessReason || "");
    setSoapNotes(app.consultationNote?.soapNotes || "");
    setPrescription(app.consultationNote?.prescription || "");
    setLabTest(app.consultationNote?.labTest || "");
    setSaveSuccess(false);
  };

  const handleSaveConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    const updated = appointments.map((a) => {
      if (a.id === editingApp.id) {
        return {
          ...a,
          status: "COMPLETED" as const,
          consultationNote: {
            illnessReason,
            soapNotes,
            prescription,
            labTest,
            updatedAt: new Date().toLocaleString("tr-TR"),
          }
        };
      }
      return a;
    });

    setAppointments(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setEditingApp(null);
      setSaveSuccess(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] flex flex-col font-sans">
      
      {/* Top Bar */}
      <header className="bg-[#F3EDE2] border-b border-[#DDD2C1] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#4E3D30] hover:text-[#2C1810] border border-[#E5DCD0] transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180 text-[#8A5F35]" />
              <span>Web Sitesine Dön</span>
            </Link>

            <div className="h-6 w-px bg-[#DDD2C1] hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#4A2E1B] text-amber-200 flex items-center justify-center font-bold shadow-sm">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[#2C1810] font-serif">{t("title")}</h1>
                <p className="text-[10px] text-[#8A5F35] font-semibold">Yetkili Klinik Personel & Hekim Girişi</p>
              </div>
            </div>
          </div>

          {/* Role Switcher Pill */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#E5DCD0] shadow-sm">
            <button
              type="button"
              onClick={() => setRole("DOCTOR")}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                role === "DOCTOR"
                  ? "bg-[#4A2E1B] text-white shadow-sm"
                  : "text-[#6A584A] hover:text-[#2C1810]"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{t("doctorView")}</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("ADMIN")}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                role === "ADMIN"
                  ? "bg-[#4A2E1B] text-white shadow-sm"
                  : "text-[#6A584A] hover:text-[#2C1810]"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t("adminView")}</span>
            </button>
          </div>

          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E5DCD0] shadow-sm">
                <User className="w-3.5 h-3.5 text-[#8A5F35]" />
                <span className="text-xs font-bold text-[#2C1810]">{currentUser.fullName}</span>
                <span className="text-[10px] text-[#8A6445] font-mono">({currentUser.role})</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("mena_auth_token");
                  localStorage.removeItem("mena_auth_user");
                  window.location.href = "/";
                }}
                className="p-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-[#E5DCD0] hover:border-rose-300 transition-colors shadow-sm"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8 w-full">
        
        {/* Banner with Strict Privacy Rule */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DCD0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#4A2E1B] font-bold uppercase tracking-wider text-[11px]">
              <Lock className="w-4 h-4 text-[#8A5F35]" />
              <span>Strict Role-Based Access Control (RBAC) & Hasta Mahremiyeti</span>
            </div>
            <p className="text-[#5A483B]">
              {role === "DOCTOR"
                ? "Hekim Kuralı: Yalnızca kendi polikliniğinize gelen hastaların randevularını ve muayene notlarını görebilirsiniz."
                : "Admin Kuralı: Klinik genel akışını, tüm randevuları ve poliklinikleri denetleme yetkisine sahipsiniz."}
            </p>
          </div>

          {/* If Doctor View: Select Which Doctor */}
          {role === "DOCTOR" && (
            <div className="flex items-center gap-2 shrink-0 bg-[#FAF7F2] p-1.5 rounded-xl border border-[#E5DCD0]">
              <span className="text-[11px] text-[#7D6E63] font-semibold">Aktif Hekim:</span>
              <button
                type="button"
                onClick={() => setSelectedDoctorId("doc-cardio")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedDoctorId === "doc-cardio" ? "bg-[#4A2E1B] text-white font-bold" : "text-[#6A584A] hover:text-[#2C1810]"
                }`}
              >
                Dr. Selim (Kardiyo)
              </button>
              <button
                type="button"
                onClick={() => setSelectedDoctorId("doc-derma")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedDoctorId === "doc-derma" ? "bg-[#4A2E1B] text-white font-bold" : "text-[#6A584A] hover:text-[#2C1810]"
                }`}
              >
                Dr. Leyla (Derma)
              </button>
            </div>
          )}
        </div>

        {/* Appointments Queue & Actions */}
        <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5DCD0]">
            <div>
              <h2 className="text-xl font-bold text-[#2C1810] font-serif">
                {role === "DOCTOR" ? "Poliklinik Randevu Akışı & Muayene Defteri" : "Tüm Poliklinikler Randevu İzleme"}
              </h2>
              <p className="text-xs text-[#7D6E63] mt-0.5">
                {role === "DOCTOR" 
                  ? "Hastanın görüşmesini not edebilir, teşhis koyabilir ve e-reçete gönderebilirsiniz."
                  : "Sistemdeki tüm hekimlerin o günkü hasta randevu akışı."}
              </p>
            </div>
            <span className="px-3 py-1 bg-[#FAF7F2] border border-[#E5DCD0] text-[#6E492D] text-xs font-bold rounded-xl">
              {displayedAppointments.length} Kayıtlı Randevu
            </span>
          </div>

          <div className="space-y-4">
            {displayedAppointments.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] hover:border-[#B8860B]/60 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-sm"
              >
                {/* Left: Patient Details & Queue No */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5DCD0] flex flex-col items-center justify-center text-[#4A2E1B] font-mono shrink-0 shadow-sm">
                    <span className="text-[10px] text-[#7D6E63] uppercase">Sıra</span>
                    <span className="text-base font-black">#{app.queueNumber}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-[#2C1810] font-serif">{app.patientName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        app.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800"
                          : app.status === "CANCELLED"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#6A584A]">
                      <span className="text-[#8A5F35] font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#8A5F35]" />
                        <span>Saat: {app.slotTime}</span>
                      </span>
                      <span>•</span>
                      <span>T.C.: {app.patientIdNo}</span>
                      <span>•</span>
                      <span>Tel: {app.patientPhone}</span>
                      {role === "ADMIN" && (
                        <>
                          <span>•</span>
                          <span className="text-[#4A2E1B] font-semibold">{app.doctorName}</span>
                        </>
                      )}
                    </div>

                    {/* If note already recorded, show preview */}
                    {app.consultationNote && (
                      <div className="mt-2 p-2.5 rounded-xl bg-white border border-[#E5DCD0] text-xs space-y-1 shadow-sm">
                        <div className="text-[#6E492D] font-semibold flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#8A5F35]" />
                          <span>Teşhis: {app.consultationNote.illnessReason}</span>
                        </div>
                        <p className="text-[#6A584A] text-[11px] line-clamp-1">
                          Not: {app.consultationNote.soapNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end lg:self-auto">
                  <button
                    type="button"
                    onClick={() => handleOpenConsultationModal(app)}
                    className="py-2.5 px-4 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#4A2E1B]/20 transition-all hover:scale-105"
                  >
                    <Stethoscope className="w-4 h-4 text-amber-200" />
                    <span>{app.consultationNote ? "Notu Güncelle / İncele" : "Görüşmeyi Not Et"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* MODAL: DOCTOR CONSULTATION NOTE & DIAGNOSIS ENTRY */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border border-[#E5DCD0] rounded-3xl shadow-2xl overflow-hidden text-[#2C1810]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E5DCD0] bg-gradient-to-r from-[#F5EFEB] via-[#FAF7F2] to-[#FAF7F2] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4A2E1B] text-amber-200 flex items-center justify-center font-bold shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2C1810] font-serif">{t("doctorNotes")}</h3>
                  <p className="text-xs text-[#8A5F35] font-semibold">
                    Hasta: {editingApp.patientName} (Sıra #{editingApp.queueNumber}) • {editingApp.doctorName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingApp(null)}
                className="p-2 rounded-full text-[#7D6E63] hover:text-[#2C1810] hover:bg-[#FAF7F2] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveConsultation} className="p-6 max-h-[75vh] overflow-y-auto space-y-5 bg-white">
              
              {saveSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Klinik not ve teşhis başarıyla kaydedildi!</span>
                </div>
              )}

              {/* 1. Hastalığın Sebebi & Teşhis (ICD-10) */}
              <div>
                <label className="block text-xs font-bold text-[#4E3D30] uppercase tracking-wider mb-1.5">
                  1. {t("illnessReason")} *
                </label>
                <input
                  type="text"
                  required
                  value={illnessReason}
                  onChange={(e) => setIllnessReason(e.target.value)}
                  placeholder="Örn: I20.9 - Angina Pektoris (Retrosternal göğüs baskısı) / L20.9 - Atopik Egzama"
                  className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl py-2.5 px-3.5 text-sm text-[#2C1810] placeholder-[#9E8E81] focus:bg-white focus:outline-none focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B] transition-colors"
                />
              </div>

              {/* 2. Doktor Muayene Notu (SOAP Bulguları) */}
              <div>
                <label className="block text-xs font-bold text-[#4E3D30] uppercase tracking-wider mb-1.5">
                  2. {t("consultationNotes")} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={soapNotes}
                  onChange={(e) => setSoapNotes(e.target.value)}
                  placeholder="S: Hastanın anlattığı şikayet ve semptomlar...&#10;O: Fizik muayene, nabız, tansiyon, steteskop dinleme bulguları...&#10;A: Klinik değerlendirme ve tanı gerekçesi...&#10;P: Tedavi planı, istirahat ve takip randevusu..."
                  className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl p-3 text-xs text-[#2C1810] placeholder-[#9E8E81] focus:bg-white focus:outline-none focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B] font-mono leading-relaxed transition-colors"
                />
              </div>

              {/* 3. Reçete Yaz (E-Reçete) */}
              <div>
                <label className="block text-xs font-bold text-[#6E492D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-[#8A5F35]" />
                  <span>3. {t("prescribe")}</span>
                </label>
                <input
                  type="text"
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="Örn: Lipitor 10mg (1x1 Akşam) - 1 Kutu, Coraspin 100mg (1x1 Tok) - 1 Kutu"
                  className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl py-2 px-3 text-xs text-[#2C1810] placeholder-[#9E8E81] focus:bg-white focus:outline-none focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B] transition-colors"
                />
              </div>

              {/* 4. Tahlil İste */}
              <div>
                <label className="block text-xs font-bold text-[#2F5E3D] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-[#3E6B48]" />
                  <span>4. {t("orderLab")}</span>
                </label>
                <input
                  type="text"
                  value={labTest}
                  onChange={(e) => setLabTest(e.target.value)}
                  placeholder="Örn: Lipid Paneli, Hemogram, Troponin I, Karaciğer Enzimleri"
                  className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl py-2 px-3 text-xs text-[#2C1810] placeholder-[#9E8E81] focus:bg-white focus:outline-none focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B] transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5DCD0]">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="py-2.5 px-4 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#4E3D30] text-xs font-semibold border border-[#E5DCD0]"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#4A2E1B]/20"
                >
                  <Save className="w-4 h-4 text-amber-200" />
                  <span>Muayene Notunu Kaydet</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
