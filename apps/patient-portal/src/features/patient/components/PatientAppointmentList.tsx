import React from "react";
import { Calendar, Clock, User, CheckCircle, AlertCircle, XCircle, Ticket } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";

interface AppointmentItem {
  id: string;
  slotTime: string;
  status: string;
  queueNumber: number;
  doctor?: { fullName: string };
}

interface PatientAppointmentListProps {
  appointments: AppointmentItem[];
  onCancelAppointment: (id: string) => void;
  onOpenBooking: () => void;
}

export const PatientAppointmentList: React.FC<PatientAppointmentListProps> = ({
  appointments,
  onCancelAppointment,
  onOpenBooking,
}) => {
  const { t } = useTranslation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{t.statusConfirmed}</span>
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{t.statusCompleted}</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>{t.statusCancelled}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.statusPending}</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#2C1810] font-serif">{t.myAppointments}</h3>
          <p className="text-xs text-[#4E3D30] mt-1">
            Gelecek randevularınız ve klinik muayene sıranız
          </p>
        </div>
        <button
          onClick={onOpenBooking}
          className="px-4 py-2 bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          + {t.newAppointmentBtn}
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-4">
          <Calendar className="w-12 h-12 text-[#8A5F35] mx-auto" />
          <p className="text-[#4E3D30] text-sm">{t.noAppointmentsYet}</p>
          <button
            onClick={onOpenBooking}
            className="px-6 py-2.5 bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            {t.bookAppointment}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((app) => {
            const dateObj = new Date(app.slotTime);
            const dateStr = dateObj.toLocaleDateString("tr-TR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] hover:border-[#B8860B]/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E5DCD0] flex flex-col items-center justify-center text-[#4A2E1B] font-mono shrink-0 shadow-sm">
                    <Ticket className="w-4 h-4 mb-0.5 text-[#B8860B]" />
                    <span className="text-xs font-black">#{app.queueNumber}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-bold text-[#2C1810]">
                        {app.doctor?.fullName || "Klinik Uzmanı"}
                      </h4>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#4E3D30]">
                      <span className="flex items-center gap-1 text-[#2C1810] font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#B8860B]" />
                        <span>{dateStr}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[#4A2E1B] font-mono font-bold">
                        <Clock className="w-3.5 h-3.5 text-[#B8860B]" />
                        <span>{timeStr}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[#E5DCD0]">
                  {app.status === "CONFIRMED" && (
                    <button
                      onClick={() => onCancelAppointment(app.id)}
                      className="px-3.5 py-2 rounded-xl bg-[#FAF0F0] hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition-colors"
                    >
                      {t.cancelAppointment}
                    </button>
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
