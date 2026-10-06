import React from "react";
import { Clock, Ticket, User, Check, X, Stethoscope, Phone, Calendar } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";

interface DoctorTodayQueueProps {
  appointments: any[];
  onStartConsultation: (appointment: any) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onViewPatientHistory: (patientId: string) => void;
}

export const DoctorTodayQueue: React.FC<DoctorTodayQueueProps> = ({
  appointments,
  onStartConsultation,
  onUpdateStatus,
  onViewPatientHistory,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-[#141412] border border-clinicBorder rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-bold text-white font-serif">{t.todayAgenda}</h3>
          <p className="text-xs text-stone-400 mt-1">{t.todayQueueSubtitle}</p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold self-start sm:self-auto">
          {appointments.length} Hasta Sırası
        </span>
      </div>

      {appointments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <Calendar className="w-12 h-12 text-stone-600 mx-auto" />
          <p className="text-stone-400 text-sm">Bugün için bekleyen randevu bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((app) => {
            const timeStr = new Date(app.slotTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const patientName = app.patient?.user?.fullName || "Hasta";
            const patientPhone = app.patient?.user?.phone || "-";
            const patientIdNo = app.patient?.user?.identityNo || "-";

            return (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-black/50 border border-clinicBorder hover:border-emerald-500/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left: Queue Number & Patient Details */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex flex-col items-center justify-center text-emerald-400 font-mono shrink-0">
                    <Ticket className="w-4 h-4 mb-0.5" />
                    <span className="text-sm font-black">#{app.queueNumber}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-base font-bold text-white font-serif">{patientName}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        app.status === "COMPLETED"
                          ? "bg-blue-500/20 text-blue-400"
                          : app.status === "CANCELLED"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
                      <span className="flex items-center gap-1 text-amber-300 font-mono font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{timeStr}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-stone-500" />
                        <span>{patientPhone}</span>
                      </span>
                      <span>•</span>
                      <span className="text-stone-500 font-mono">T.C./Pas: {patientIdNo}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5">
                  <button
                    onClick={() => onViewPatientHistory(app.patientId)}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors"
                  >
                    {t.viewHistory}
                  </button>

                  {app.status !== "COMPLETED" && app.status !== "CANCELLED" && (
                    <>
                      <button
                        onClick={() => onStartConsultation(app)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>{t.startConsultation}</span>
                      </button>

                      <button
                        onClick={() => onUpdateStatus(app.id, "COMPLETED")}
                        title="Muayene Tamamlandı Olarak İşaretle"
                        className="p-2 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-800/40 text-xs transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onUpdateStatus(app.id, "CANCELLED")}
                        title="Randevuyu İptal Et"
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
