import React, { useState } from "react";
import { Stethoscope, Search, Calendar, Clock, DollarSign, User, X, CheckCircle2, ChevronRight, Filter } from "lucide-react";
import { AdminTranslations } from "../i18n";
import { DoctorModel } from "../apiClient";

interface DoctorsHubProps {
  doctors: DoctorModel[];
  appointments: any[];
  patients: any[];
  t: AdminTranslations;
  lang: string;
}

export const DoctorsHub: React.FC<DoctorsHubProps> = ({
  doctors,
  appointments,
  patients,
  t,
  lang,
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorModel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [editingFee, setEditingFee] = useState<number | null>(null);
  const [feeDoctorId, setFeeDoctorId] = useState<string | null>(null);

  // Departments list for filter
  const departments = Array.from(new Set(doctors.map((d) => d.department?.name).filter(Boolean)));

  // Filtered doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "ALL" || doc.department?.name === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Get appointments and patients for the selected doctor
  const doctorAppointments = selectedDoctor
    ? appointments.filter((a) => a.doctorId === selectedDoctor.id || a.doctor?.fullName === selectedDoctor.fullName)
    : [];

  const handleSaveFee = (docId: string) => {
    if (editingFee !== null && selectedDoctor) {
      selectedDoctor.consultationFee = editingFee;
    }
    setFeeDoctorId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DCD0] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFE8DC] border border-[#E5DCD0] text-[#4A2E1B] text-[11px] font-semibold uppercase mb-1">
            <Stethoscope className="w-3 h-3 text-[#B8860B]" />
            <span>360° {t.menuDoctorsHub}</span>
          </div>
          <h3 className="text-xl font-bold font-serif text-[#2C1810]">{t.doctorsTitle}</h3>
          <p className="text-xs text-[#5A483B]">{t.doctorsSubtitle}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-[#E5DCD0] rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-grow w-full">
          <Search className="w-4 h-4 text-[#8A6445] absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchDoctorPlaceholder}
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl text-xs text-[#2C1810] placeholder-[#8A796D] focus:outline-none focus:border-[#4A2E1B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <Filter className="w-4 h-4 text-[#8A6445] shrink-0" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl text-xs font-semibold text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
          >
            <option value="ALL">{t.allDepartments}</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredDoctors.map((doc) => {
          const docApps = appointments.filter((a) => a.doctorId === doc.id || a.doctor?.fullName === doc.fullName);
          const activeQueueCount = docApps.filter((a) => a.status === "WAITING" || a.status === "CONFIRMED").length;

          return (
            <div
              key={doc.id}
              className="bg-white border border-[#E5DCD0] hover:border-[#B8860B]/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#EFE8DC] to-[#E5DCD0] flex items-center justify-center text-[#4A2E1B] shrink-0 font-bold border border-[#E5DCD0]">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#2C1810] font-serif truncate">{doc.fullName}</h4>
                    <p className="text-[11px] font-semibold text-[#8A6445] truncate">{doc.department?.name}</p>
                    <span className="inline-block px-2 py-0.5 mt-1 rounded bg-[#FAF7F2] border border-[#E5DCD0] text-[10px] text-[#6E492D] font-mono">
                      {doc.room || "Poliklinik"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-[#E5DCD0] text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#7D6E63]">{t.consultationFee}:</span>
                    <strong className="text-emerald-700 font-mono font-bold">
                      {doc.consultationFee || 1000} {t.currency}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7D6E63]">{t.scheduleHours}:</span>
                    <span className="text-[#2C1810] font-medium">{doc.hours || "09:00 - 17:00"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7D6E63]">{t.doctorQueueToday}:</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                      {activeQueueCount} {t.activePatients}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDoctor(doc)}
                className="mt-4 w-full py-2.5 px-3 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>{t.inspectDoctor}</span>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          );
        })}
      </div>

      {/* DOCTOR DRILL-DOWN MODAL */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-[#2C1810]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E5DCD0] rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative animate-fadeIn my-8">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedDoctor(null)}
              className="absolute right-5 rtl:right-auto rtl:left-5 top-5 p-1.5 rounded-full bg-[#FAF7F2] text-[#6E492D] hover:bg-[#EFE8DC] transition-colors border border-[#E5DCD0]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Doctor Profile Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-[#E5DCD0] pb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EFE8DC] to-[#E5DCD0] flex items-center justify-center text-[#4A2E1B] shrink-0 font-bold border border-[#E5DCD0] shadow-sm">
                <User className="w-8 h-8" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold font-serif text-[#2C1810]">{selectedDoctor.fullName}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    Aktif
                  </span>
                </div>
                <p className="text-xs text-[#8A6445] font-semibold mt-0.5">{selectedDoctor.department?.name}</p>
                <p className="text-[11px] text-[#7D6E63] mt-1 font-mono">{selectedDoctor.email} • {selectedDoctor.phone}</p>
              </div>

              {/* Consultation Fee Box (Editable) */}
              <div className="p-3 bg-[#FAF7F2] border border-[#E5DCD0] rounded-2xl text-center sm:text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-[#8A6445] block">{t.consultationFee}</span>
                {feeDoctorId === selectedDoctor.id ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number"
                      value={editingFee ?? selectedDoctor.consultationFee}
                      onChange={(e) => setEditingFee(Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-white border border-[#B8860B] rounded text-xs font-bold text-[#2C1810]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveFee(selectedDoctor.id)}
                      className="px-2 py-1 bg-emerald-700 text-white rounded text-xs font-bold"
                    >
                      ✓
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center sm:justify-end gap-1.5 mt-0.5">
                    <span className="text-lg font-extrabold text-emerald-800 font-mono">
                      {selectedDoctor.consultationFee || 1000} {t.currency}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFeeDoctorId(selectedDoctor.id);
                        setEditingFee(selectedDoctor.consultationFee || 1000);
                      }}
                      className="text-[10px] text-[#8A6445] hover:underline"
                    >
                      (Değiştir)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule & Working Hours */}
            <div className="p-4 bg-[#FAF7F2] border border-[#E5DCD0] rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4A2E1B]">
                <Calendar className="w-4 h-4 text-[#B8860B]" />
                <span>{t.doctorWeeklySchedule}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-[#E5DCD0]">
                  <span className="block text-[10px] text-[#7D6E63] font-medium">Poliklinik Odası</span>
                  <strong className="text-[#2C1810]">{selectedDoctor.room || "Poliklinik 101"}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#E5DCD0]">
                  <span className="block text-[10px] text-[#7D6E63] font-medium">Mesai Günleri</span>
                  <strong className="text-[#2C1810]">Pazartesi - Cuma</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#E5DCD0]">
                  <span className="block text-[10px] text-[#7D6E63] font-medium">Çalışma Saatleri</span>
                  <strong className="text-[#2C1810] font-mono">{selectedDoctor.hours || "09:00 - 17:00"}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#E5DCD0]">
                  <span className="block text-[10px] text-[#7D6E63] font-medium">Muayene Süresi</span>
                  <strong className="text-[#2C1810]">30 Dakika / Slot</strong>
                </div>
              </div>
            </div>

            {/* Doctor's Patients List & Appointments */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#2C1810] font-serif">{t.doctorPatientsList}</h4>
                <span className="text-xs text-[#8A6445] font-semibold">
                  {doctorAppointments.length} Kayıtlı Randevu
                </span>
              </div>

              {doctorAppointments.length === 0 ? (
                <div className="p-6 text-center bg-[#FAF7F2] border border-[#E5DCD0] rounded-2xl text-xs text-[#7D6E63]">
                  {t.noPatientsForDoctor}
                </div>
              ) : (
                <div className="border border-[#E5DCD0] rounded-2xl overflow-hidden">
                  <table className="w-full text-left rtl:text-right text-xs">
                    <thead className="bg-[#FAF7F2] text-[#4A2E1B] border-b border-[#E5DCD0]">
                      <tr>
                        <th className="p-3 font-semibold">Sıra #</th>
                        <th className="p-3 font-semibold">{t.patientName}</th>
                        <th className="p-3 font-semibold">{t.phone}</th>
                        <th className="p-3 font-semibold">Randevu Saati</th>
                        <th className="p-3 font-semibold">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DCD0] bg-white">
                      {doctorAppointments.map((app, idx) => (
                        <tr key={app.id || idx} className="hover:bg-[#FAF7F2]">
                          <td className="p-3 font-mono font-bold text-[#4A2E1B]">#{app.queueNumber || idx + 1}</td>
                          <td className="p-3 font-semibold text-[#2C1810]">
                            {app.patient?.fullName || app.patient?.user?.fullName || "Kayıtlı Hasta"}
                          </td>
                          <td className="p-3 font-mono text-[#6E492D]">
                            <bdi dir="ltr">{app.patient?.phone || app.patient?.user?.phone || "+963 992 334455"}</bdi>
                          </td>
                          <td className="p-3 font-mono text-[#5A483B]">
                            {app.slotTime ? new Date(app.slotTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "09:30"}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                app.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : app.status === "IN_CONSULTATION"
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : "bg-blue-50 text-blue-800 border border-blue-200"
                              }`}
                            >
                              {app.status || "WAITING"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer Modal Action */}
            <div className="pt-4 border-t border-[#E5DCD0] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDoctor(null)}
                className="px-6 py-2 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs shadow-md transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
