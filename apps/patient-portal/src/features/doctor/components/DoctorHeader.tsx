import React from "react";
import { Stethoscope, Calendar, Clock, CheckCircle, Users } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";
import { AuthUser } from "../../auth/auth.types";

interface DoctorHeaderProps {
  doctor: AuthUser;
  stats: {
    totalToday: number;
    pendingCount: number;
    completedCount: number;
    totalPatients: number;
  };
  onQuickSwitchDoctor: (email: string) => void;
}

export const DoctorHeader: React.FC<DoctorHeaderProps> = ({
  doctor,
  stats,
  onQuickSwitchDoctor,
}) => {
  const { t } = useTranslation();

  const isCardio = doctor.email.includes("cardio") || doctor.fullName.toLowerCase().includes("selim");

  return (
    <div className="bg-[#141412] border border-clinicBorder rounded-3xl p-6 sm:p-8 space-y-6">
      
      {/* Top Bar with Doctor Info and Quick Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-5">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-700 p-0.5 shadow-xl shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-[#181815] rounded-[14px] flex items-center justify-center text-emerald-400">
              <Stethoscope className="w-10 h-10" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono uppercase mb-1">
              <span>{isCardio ? "Kardiyoloji Uzmanı" : "Dermatoloji Uzmanı"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              {doctor.fullName}
            </h2>
            <div className="text-xs text-stone-400 mt-1">
              {doctor.email} • Poliklinik Oda No: {isCardio ? "Kat 2, B-204" : "Kat 1, A-102"}
            </div>
          </div>
        </div>

        {/* Doctor Demo Fast-Switch Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 bg-black/40 rounded-2xl border border-white/5">
          <span className="text-[11px] text-stone-500 font-mono px-2">Doktor Değiştir:</span>
          <button
            onClick={() => onQuickSwitchDoctor("cardio@menaclinic.com")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isCardio
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "text-stone-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Dr. Selim (Cardio)
          </button>
          <button
            onClick={() => onQuickSwitchDoctor("derma@menaclinic.com")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !isCardio
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "text-stone-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Dr. Leyla (Derma)
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold">{t.totalAppointmentsToday}</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{stats.totalToday}</div>
          <span className="text-[10px] text-stone-500">Bugünkü toplam sıra</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold">{t.pendingConsultations}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{stats.pendingCount}</div>
          <span className="text-[10px] text-amber-400/70">Muayene bekleyen</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold">{t.completedToday}</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{stats.completedCount}</div>
          <span className="text-[10px] text-emerald-400/70">Tamamlanan teşhis</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold">{t.myPatients}</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono">{stats.totalPatients}</div>
          <span className="text-[10px] text-stone-500">Takipteki toplam hasta</span>
        </div>

      </div>

    </div>
  );
};
