import React, { useState } from "react";
import { Users, Search, Droplet, Phone, Shield, FileText, Plus, Stethoscope } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";

interface DoctorPatientRosterProps {
  patients: any[];
  onSelectPatientForRecord: (patient: any) => void;
  onViewPatientHistory: (patientId: string) => void;
}

export const DoctorPatientRoster: React.FC<DoctorPatientRosterProps> = ({
  patients,
  onSelectPatientForRecord,
  onViewPatientHistory,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    const name = p.user?.fullName?.toLowerCase() || "";
    const idNo = p.user?.identityNo?.toLowerCase() || "";
    const phone = p.user?.phone?.toLowerCase() || "";
    return name.includes(term) || idNo.includes(term) || phone.includes(term);
  });

  return (
    <div className="bg-[#141412] border border-clinicBorder rounded-3xl p-6 sm:p-8 space-y-6">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xl font-bold text-white font-serif">{t.myPatients}</h3>
          <p className="text-xs text-stone-400 mt-1">{t.myPatientsSubtitle}</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute top-3 left-3 rtl:left-auto rtl:right-3 w-4 h-4 text-stone-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPatient}
            className="w-full bg-black/60 border border-stone-800 rounded-xl py-2 pl-9 pr-4 rtl:pr-9 rtl:pl-4 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Patient Cards */}
      {filteredPatients.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-black/40 border border-white/5 text-stone-500 text-sm">
          Arama kriterine uygun kayıtlı hasta bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map((patient) => {
            const userName = patient.user?.fullName || "Hasta";
            const userPhone = patient.user?.phone || "-";
            const userIdNo = patient.user?.identityNo || "-";

            return (
              <div
                key={patient.id}
                className="p-5 rounded-2xl bg-black/50 border border-clinicBorder hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white font-serif">{userName}</h4>
                      <span className="text-[11px] text-stone-500 font-mono">T.C./Pas: {userIdNo}</span>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-mono font-bold">
                      <Droplet className="w-3 h-3" />
                      <span>{patient.bloodType || "A+"}</span>
                    </span>
                  </div>

                  <div className="text-xs text-stone-400 space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-500" />
                      <span>{userPhone}</span>
                    </div>
                    {patient.insuranceInfo && (
                      <div className="flex items-center gap-2 text-stone-400">
                        <Shield className="w-3.5 h-3.5 text-amber-500" />
                        <span>{patient.insuranceInfo}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => onViewPatientHistory(patient.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t.viewHistory}</span>
                  </button>

                  <button
                    onClick={() => onSelectPatientForRecord(patient)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 transition-all"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Yeni Muayene</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
