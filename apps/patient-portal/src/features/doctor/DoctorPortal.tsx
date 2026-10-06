import React, { useState, useEffect } from "react";
import { Stethoscope, Calendar, Users, FileText, CheckCircle } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { AuthUser } from "../auth/auth.types";
import { apiRequest } from "../../shared/api";
import { DoctorHeader } from "./components/DoctorHeader";
import { DoctorTodayQueue } from "./components/DoctorTodayQueue";
import { DoctorPatientRoster } from "./components/DoctorPatientRoster";
import { MedicalRecordEntryModal } from "./components/MedicalRecordEntryModal";
import { PastRecordsModal } from "./components/PastRecordsModal";

interface DoctorPortalProps {
  currentUser: AuthUser;
  onSwitchDoctorUser: (user: AuthUser, token: string) => void;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({
  currentUser,
  onSwitchDoctorUser,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"queue" | "patients">("queue");

  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Record Entry Modal State
  const [activeConsultationApp, setActiveConsultationApp] = useState<any>(null);
  const [selectedPatientForRecord, setSelectedPatientForRecord] = useState<any>(null);

  // Past Records Modal State
  const [historyPatientId, setHistoryPatientId] = useState<string | null>(null);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const [appsData, patientsData] = await Promise.all([
        apiRequest<any>(`/appointments?doctorId=${currentUser.id}&pageSize=200`).then((result) => result.data || []).catch(() => []),
        apiRequest<any>("/patients?pageSize=100").then((result) => result.data || []).catch(() => []),
      ]);

      setAppointments(appsData || []);
      setPatients(patientsData || []);
    } catch (err) {
      console.error("Doctor data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, [currentUser]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiRequest(`/appointments/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      fetchDoctorData();
    } catch (err) {
      alert("Durum güncellenemedi.");
    }
  };

  const handleQuickSwitchDoctor = async (email: string) => {
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: "Password123" }),
      });
      localStorage.setItem("mena_auth_token", data.token);
      onSwitchDoctorUser(data.user, data.token);
    } catch (err) {
      alert("Doktor değiştirilemedi.");
    }
  };

  const pendingCount = appointments.filter((a) => a.status === "CONFIRMED" || a.status === "PENDING").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header & KPI Stats */}
      <DoctorHeader
        doctor={currentUser}
        stats={{
          totalToday: appointments.length,
          pendingCount,
          completedCount,
          totalPatients: patients.length,
        }}
        onQuickSwitchDoctor={handleQuickSwitchDoctor}
      />

      {/* Tabs Menu */}
      <div className="flex flex-col gap-2 border-b border-white/5 pb-3 sm:flex-row sm:flex-wrap" role="tablist" aria-label={t.doctorDashboardTitle}>
        <button
          onClick={() => setActiveTab("queue")}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "queue"
              ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
              : "text-stone-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t.todayAgenda} ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("patients")}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "patients"
              ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
              : "text-stone-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.myPatients} ({patients.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center text-stone-500 text-xs animate-pulse">
          Doktor randevu ajandası ve hasta verileri yükleniyor...
        </div>
      ) : (
        <div>
          {activeTab === "queue" && (
            <DoctorTodayQueue
              appointments={appointments}
              onStartConsultation={(app) => {
                setActiveConsultationApp(app);
                setSelectedPatientForRecord(app.patient);
              }}
              onUpdateStatus={handleUpdateStatus}
              onViewPatientHistory={(pId) => setHistoryPatientId(pId)}
            />
          )}

          {activeTab === "patients" && (
            <DoctorPatientRoster
              patients={patients}
              onSelectPatientForRecord={(patient) => {
                setActiveConsultationApp(null);
                setSelectedPatientForRecord(patient);
              }}
              onViewPatientHistory={(pId) => setHistoryPatientId(pId)}
            />
          )}
        </div>
      )}

      {/* Medical Record / Consultation Entry Modal */}
      {selectedPatientForRecord && (
        <MedicalRecordEntryModal
          isOpen={true}
          onClose={() => {
            setSelectedPatientForRecord(null);
            setActiveConsultationApp(null);
          }}
          patient={selectedPatientForRecord}
          appointmentId={activeConsultationApp?.id}
          onSuccess={() => {
            fetchDoctorData();
          }}
        />
      )}

      {/* Patient Past Medical Records Modal */}
      {historyPatientId && (
        <PastRecordsModal
          isOpen={true}
          onClose={() => setHistoryPatientId(null)}
          patientId={historyPatientId}
        />
      )}

    </div>
  );
};
