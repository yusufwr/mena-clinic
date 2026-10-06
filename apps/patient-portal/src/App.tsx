import React, { useState, useEffect } from "react";
import { LanguageProvider, useTranslation } from "./features/i18n/LanguageContext";
import { Navbar } from "./shared/Navbar";
import { Footer } from "./shared/Footer";
import { apiRequest } from "./shared/api";
import { AuthUser } from "./features/auth/auth.types";
import { AuthModal } from "./features/auth/AuthModal";
import { LandingPage } from "./features/landing/LandingPage";
import { DoctorData } from "./features/landing/DoctorsShowcase";
import { MOCK_DOCTORS } from "./shared/mockData";
import { PatientPortal } from "./features/patient/PatientPortal";
import { DoctorPortal } from "./features/doctor/DoctorPortal";
import { AppointmentBookingModal } from "./features/patient/components/AppointmentBookingModal";
import { Stethoscope, User, Calendar, Shield, Sparkles } from "lucide-react";

function MainContent() {
  const { t, isRTL } = useTranslation();

  // Navigation View
  const [activeView, setActiveView] = useState<"landing" | "patient" | "doctor">("landing");

  // Auth & User State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRoleHint, setAuthRoleHint] = useState<"PATIENT" | "DOCTOR">("PATIENT");

  // Doctors data for booking & showcase
  const [doctors, setDoctors] = useState<DoctorData[]>([]);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [preselectedDoctor, setPreselectedDoctor] = useState<DoctorData | null>(null);
  const [preselectedDept, setPreselectedDept] = useState<string | null>(null);
  const [pendingBooking, setPendingBooking] = useState<{ doc?: DoctorData | null; deptId?: string | null } | null>(null);
  const [authNotice, setAuthNotice] = useState<string>("");

  // Check auth session on load
  useEffect(() => {
    const token = localStorage.getItem("mena_auth_token");
    if (token) {
      apiRequest<{ user: AuthUser }>("/auth/me")
        .then((res) => {
          setCurrentUser(res.user);
        })
        .catch(() => {
          localStorage.removeItem("mena_auth_token");
          setCurrentUser(null);
        });
    }
  }, []);

  // Fetch doctors list
  const fetchDoctors = () => {
    apiRequest<DoctorData[]>("/doctors")
      .then((data) => setDoctors(Array.isArray(data) && data.length > 0 ? data : MOCK_DOCTORS))
      .catch((err) => {
        console.error("Error fetching doctors:", err);
        setDoctors(MOCK_DOCTORS);
      });
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("mena_auth_token");
    localStorage.removeItem("mena_auth_user");
    setCurrentUser(null);
    setActiveView("landing");
  };

  const handleOpenBooking = (doc?: DoctorData, deptId?: string) => {
    if (!currentUser) {
      // Require Login/Register first!
      setPendingBooking({ doc: doc || null, deptId: deptId || null });
      setAuthNotice(t.bookingRequiresAuthNotice);
      setAuthRoleHint("PATIENT");
      setAuthModalOpen(true);
      return;
    }
    setPreselectedDoctor(doc || null);
    setPreselectedDept(deptId || null);
    setBookingModalOpen(true);
  };

  const handleAuthSuccess = (user: AuthUser, token: string) => {
    setCurrentUser(user);
    if (pendingBooking) {
      const pDoc = pendingBooking.doc;
      const pDept = pendingBooking.deptId;
      setPendingBooking(null);
      setAuthNotice("");
      setPreselectedDoctor(pDoc || null);
      setPreselectedDept(pDept || null);
      setBookingModalOpen(true);
      return;
    }
    if (user.role === "DOCTOR") {
      setActiveView("doctor");
    } else if (user.role === "PATIENT") {
      setActiveView("patient");
    }
  };

  return (
    <div className={`min-h-screen bg-clinicBg text-[#2C1810] flex flex-col font-sans ${isRTL ? "rtl" : "ltr"}`}>
      
      {/* Top Notification / Role Switcher Strip */}
      <div className="bg-[#F3EDE2] border-b border-[#E5DCD0] px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#5A483B]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8860B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8A5F35]"></span>
            </span>
            <span className="text-[#4A2E1B] font-bold">{t.clinicName} HIS:</span>
            <span>{t.topBarTagline}</span>
          </div>

          {/* Quick Portal Switch Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[#7D6E63] hidden md:inline font-medium">{t.quickJump}</span>
            <button
              onClick={() => setActiveView("landing")}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                activeView === "landing" ? "bg-[#4A2E1B] text-white font-bold" : "text-[#5A483B] hover:text-[#2C1810]"
              }`}
            >
              {t.landingCorporate}
            </button>
            <button
              onClick={() => {
                if (!currentUser) {
                  setAuthNotice("");
                  setAuthRoleHint("PATIENT");
                  setAuthModalOpen(true);
                  return;
                }
                setActiveView("patient");
              }}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                activeView === "patient" ? "bg-[#4A2E1B] text-white font-bold" : "text-[#5A483B] hover:text-[#2C1810]"
              }`}
            >
              <User className="w-3 h-3 text-[#8A5F35]" />
              <span>{t.patientPortal}</span>
            </button>
            <button
              onClick={() => {
                if (!currentUser || currentUser.role !== "DOCTOR") {
                  setAuthNotice("");
                  setAuthRoleHint("DOCTOR");
                  setAuthModalOpen(true);
                  return;
                }
                setActiveView("doctor");
              }}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                activeView === "doctor" ? "bg-[#4A2E1B] text-white font-bold" : "text-[#5A483B] hover:text-[#2C1810]"
              }`}
            >
              <Stethoscope className="w-3 h-3 text-[#8A5F35]" />
              <span>{t.doctorPortal}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <Navbar
        activeView={activeView}
        onNavigate={(view) => {
          if (view === "patient" && !currentUser) {
            setAuthNotice("");
            setAuthRoleHint("PATIENT");
            setAuthModalOpen(true);
            return;
          }
          if (view === "doctor" && (!currentUser || currentUser.role !== "DOCTOR")) {
            setAuthNotice("");
            setAuthRoleHint("DOCTOR");
            setAuthModalOpen(true);
            return;
          }
          setActiveView(view);
        }}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthNotice("");
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === "landing" && (
          <LandingPage
            doctors={doctors}
            onOpenBooking={handleOpenBooking}
            onExploreDepartments={() => {
              const el = document.getElementById("departments");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        )}

        {activeView === "patient" && (
          <>
            {currentUser && currentUser.role === "PATIENT" ? (
              <PatientPortal
                currentUser={currentUser}
                onOpenBooking={() => handleOpenBooking()}
              />
            ) : (
              <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-[#E5DCD0] rounded-3xl text-center space-y-6 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-[#EFE8DC] text-[#4A2E1B] flex items-center justify-center mx-auto shadow-sm">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2C1810] font-serif">{t.patientPortal}</h2>
                  <p className="text-xs text-[#5A483B] mt-2 leading-relaxed">
                    {t.bookingRequiresAuthNotice}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => { setAuthRoleHint("PATIENT"); setAuthModalOpen(true); }}
                    className="py-3 px-6 bg-[#4A2E1B] hover:bg-[#382112] text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                  >
                    {t.login} / {t.register}
                  </button>
                  <button
                    onClick={() => setActiveView("landing")}
                    className="py-3 px-6 bg-[#FAF7F2] hover:bg-[#EFE8DC] text-[#4A2E1B] text-xs font-semibold rounded-xl border border-[#E5DCD0]"
                  >
                    {t.home}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeView === "doctor" && (
          <>
            {currentUser && currentUser.role === "DOCTOR" ? (
              <DoctorPortal
                currentUser={currentUser}
                onSwitchDoctorUser={(newUser, newToken) => handleAuthSuccess(newUser, newToken)}
              />
            ) : (
              <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-[#E5DCD0] rounded-3xl text-center space-y-6 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-[#EFE8DC] text-[#4A2E1B] flex items-center justify-center mx-auto shadow-sm">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2C1810] font-serif">{t.doctorPortal}</h2>
                  <p className="text-xs text-[#5A483B] mt-2 leading-relaxed">
                    {t.doctorSpecialtyBadge} - {t.todayAgenda}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => { setAuthRoleHint("DOCTOR"); setAuthModalOpen(true); }}
                    className="py-3 px-6 bg-[#4A2E1B] hover:bg-[#382112] text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
                  >
                    {t.demoStaff}
                  </button>
                  <button
                    onClick={() => setActiveView("landing")}
                    className="py-3 px-6 bg-[#FAF7F2] hover:bg-[#EFE8DC] text-[#4A2E1B] text-xs font-semibold rounded-xl border border-[#E5DCD0]"
                  >
                    {t.home}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        doctors={doctors}
        currentUser={currentUser}
        onRequireAuth={() => {
          setBookingModalOpen(false);
          setAuthRoleHint("PATIENT");
          setAuthModalOpen(true);
        }}
        initialDoctor={preselectedDoctor}
        initialDepartment={preselectedDept}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthNotice("");
        }}
        onAuthSuccess={handleAuthSuccess}
        defaultRoleHint={authRoleHint}
        noticeMessage={authNotice}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainContent />
    </LanguageProvider>
  );
}
