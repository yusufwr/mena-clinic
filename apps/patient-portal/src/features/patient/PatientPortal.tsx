import React, { useState, useEffect } from "react";
import { User, Calendar, FileText, Pill, FlaskConical, Plus } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import { AuthUser } from "../auth/auth.types";
import { apiRequest } from "../../shared/api";
import { PatientProfileCard } from "./components/PatientProfileCard";
import { PatientAppointmentList } from "./components/PatientAppointmentList";
import { ConsultationHistoryDetails } from "./components/ConsultationHistoryDetails";

interface PatientPortalProps {
  currentUser: AuthUser;
  onOpenBooking: () => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  currentUser,
  onOpenBooking,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"appointments" | "records" | "prescriptions" | "labs" | "profile">("appointments");

  const [appointments, setAppointments] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const [appData, prescData, labData] = await Promise.all([
        apiRequest<any>("/appointments/patient?pageSize=100").then((result) => result.data || []).catch(() => []),
        apiRequest<any[]>("/prescriptions/patient").catch(() => []),
        apiRequest<any[]>("/lab-orders/patient").catch(() => []),
      ]);

      setAppointments(appData || []);
      setPrescriptions(prescData || []);
      setLabOrders(labData || []);

      const pId = currentUser.patientId || currentUser.id || "pat-1";
      const recordsData = await apiRequest<any>(`/medical-records/patient/${pId}?pageSize=50`).then((result) => result.data || []).catch(() => []);
      setMedicalRecords(recordsData || []);
    } catch (err) {
      console.error("Error loading patient data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [currentUser]);

  const handleCancelAppointment = async (id: string) => {
    try {
      await apiRequest(`/appointments/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      fetchPatientData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Patient Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5DCD0]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE8DC] border border-[#E5DCD0] text-[#4A2E1B] text-xs font-semibold mb-2 shadow-sm">
            <span>{t.patientPortalNotice}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#2C1810] font-serif tracking-tight">
            {t.patientDashboardTitle}
          </h1>
          <p className="text-[#4E3D30] text-xs sm:text-sm mt-1">
            {currentUser.fullName} • {t.safeCareGuarantee}
          </p>
        </div>

        <button
          onClick={onOpenBooking}
          className="px-6 py-3.5 bg-[#4A2E1B] hover:bg-[#382112] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-[#4A2E1B]/15 transition-all hover:scale-105 flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-[#EFE8DC]" />
          <span>{t.newAppointmentBtn}</span>
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-col gap-2 pb-3 border-b border-[#E5DCD0] sm:flex-row sm:flex-wrap sm:items-center" role="tablist" aria-label={t.patientDashboardTitle}>
        <button
          onClick={() => setActiveTab("appointments")}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "appointments"
              ? "bg-[#4A2E1B] text-white shadow-md"
              : "text-[#4E3D30] hover:text-[#2C1810] hover:bg-[#EFE8DC]"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t.myAppointments} ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("records")}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "records"
              ? "bg-[#4A2E1B] text-white shadow-md"
              : "text-[#4E3D30] hover:text-[#2C1810] hover:bg-[#EFE8DC]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t.consultationHistory} ({medicalRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("prescriptions")}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "prescriptions"
              ? "bg-[#4A2E1B] text-white shadow-md"
              : "text-[#4E3D30] hover:text-[#2C1810] hover:bg-[#EFE8DC]"
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>{t.prescriptions} ({prescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("labs")}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "labs"
              ? "bg-[#4A2E1B] text-white shadow-md"
              : "text-[#4E3D30] hover:text-[#2C1810] hover:bg-[#EFE8DC]"
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>{t.labResults} ({labOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "profile"
              ? "bg-[#4A2E1B] text-white shadow-md"
              : "text-[#4E3D30] hover:text-[#2C1810] hover:bg-[#EFE8DC]"
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t.patientProfile}</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div className="py-20 text-center text-[#6E492D] text-xs animate-pulse">
          Hasta kayıtları ve tıbbi geçmiş yükleniyor...
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === "appointments" && (
            <PatientAppointmentList
              appointments={appointments}
              onCancelAppointment={handleCancelAppointment}
              onOpenBooking={onOpenBooking}
            />
          )}

          {activeTab === "records" && (
            <ConsultationHistoryDetails records={medicalRecords} />
          )}

          {activeTab === "prescriptions" && (
            <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div>
                <h3 className="text-xl font-bold text-[#2C1810] font-serif">{t.prescriptions}</h3>
                <p className="text-xs text-[#4E3D30] mt-1">
                  Klinik hekiminiz tarafından yazılan e-reçeteleriniz ve ilaç teslim durumları
                </p>
              </div>

              {prescriptions.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] text-[#6E492D] text-sm">
                  {t.noPrescriptionsYet}
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((pr) => (
                    <div key={pr.id} className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E5DCD0] text-xs">
                        <span className="font-bold text-[#4A2E1B]">
                          Dr. {pr.record?.doctor?.fullName || "Klinik Hekimi"}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full font-bold font-mono text-[11px] ${
                          pr.status === "DISPENSED" ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#EFE8DC] text-[#4A2E1B]"
                        }`}>
                          {pr.status === "DISPENSED" ? "TESLİM EDİLDİ" : "ECZANEDE BEKLİYOR"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {pr.items.map((item: any) => (
                          <div key={item.id} className="p-3 rounded-xl bg-white border border-[#E5DCD0] text-xs">
                            <strong className="text-[#2C1810] block">{item.itemName}</strong>
                            <span className="text-[#4E3D30]">{item.dosage} • {item.quantity} Adet</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "labs" && (
            <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div>
                <h3 className="text-xl font-bold text-[#2C1810] font-serif">{t.labResults}</h3>
                <p className="text-xs text-[#4E3D30] mt-1">
                  Klinik biyokimya, hemogram ve hormon testleri
                </p>
              </div>

              {labOrders.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] text-[#6E492D] text-sm">
                  {t.noLabOrdersYet}
                </div>
              ) : (
                <div className="space-y-3">
                  {labOrders.map((lo) => (
                    <div key={lo.id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-[#2C1810]">{lo.testName}</div>
                        <div className="text-xs text-[#4E3D30] mt-0.5">
                          İsteyen Hekim: {lo.record?.doctor?.fullName || "Klinik Hekimi"}
                        </div>
                        {lo.resultData && (
                          <div className="mt-1 text-xs text-[#2E7D32] font-mono font-semibold">
                            Sonuç: {lo.resultData}
                          </div>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                        lo.status === "COMPLETED" ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#EFE8DC] text-[#4A2E1B]"
                      }`}>
                        {lo.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <PatientProfileCard
              user={currentUser}
              stats={{
                appointmentsCount: appointments.length,
                recordsCount: medicalRecords.length,
                prescriptionsCount: prescriptions.length,
                labCount: labOrders.length,
              }}
            />
          )}
        </div>
      )}

    </div>
  );
};
