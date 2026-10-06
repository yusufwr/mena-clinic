"use client";

import React from "react";
import { Ticket, Clock, Check, X, Phone, Calendar } from "lucide-react";
import { Appointment } from "../appointments.types";

interface AppointmentQueueListProps {
  appointments: Appointment[];
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  showActions?: boolean;
}

export const AppointmentQueueList: React.FC<AppointmentQueueListProps> = ({
  appointments,
  onComplete,
  onCancel,
  showActions = false,
}) => {
  return (
    <div className="space-y-4">
      {appointments.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-black/40 border border-white/5 text-stone-500 text-xs">
          Henüz kayıtlı bir randevu bulunmamaktadır.
        </div>
      ) : (
        appointments.map((app) => {
          const dateObj = new Date(app.slotTime);
          const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const dateStr = dateObj.toLocaleDateString("tr-TR");

          return (
            <div
              key={app.id}
              className="p-5 rounded-2xl bg-black/50 border border-clinicBorder hover:border-amber-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex flex-col items-center justify-center text-amber-400 font-mono shrink-0">
                  <Ticket className="w-4 h-4" />
                  <span className="text-xs font-black">#{app.queueNumber}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white">
                      {app.patient?.user?.fullName || app.doctor?.fullName || "Klinik Randevusu"}
                    </h4>
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

                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <span className="flex items-center gap-1 text-stone-300">
                      <Calendar className="w-3.5 h-3.5 text-stone-500" />
                      <span>{dateStr}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-300 font-mono font-bold">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{timeStr}</span>
                    </span>
                    {app.patient?.user?.phone && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-500" />
                          <span>{app.patient.user.phone}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {showActions && app.status !== "COMPLETED" && app.status !== "CANCELLED" && (
                <div className="flex items-center gap-2 self-end md:self-auto">
                  {onComplete && (
                    <button
                      type="button"
                      onClick={() => onComplete(app.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Tamamla</span>
                    </button>
                  )}
                  {onCancel && (
                    <button
                      type="button"
                      onClick={() => onCancel(app.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-950/40 text-red-300 border border-red-800 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>İptal</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
