"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, CheckCircle2, AlertCircle, Ticket, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Doctor } from "../../doctors/doctors.types";
import { Appointment } from "../appointments.types";

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  onBookSuccess: (newAppointment: Appointment) => void;
  initialDoctor?: Doctor | null;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  doctors,
  onBookSuccess,
  initialDoctor = null,
}) => {
  const tBooking = useTranslations("booking");

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialDoctor?.id || (doctors[0]?.id || ""));
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+963 9");
  const [identityNo, setIdentityNo] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState("10:00");
  const [successApp, setSuccessApp] = useState<Appointment | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !identityNo || !selectedDoctorId || !selectedSlot) {
      setErrorMsg(tBooking("validationError"));
      return;
    }

    const docObj = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
    const queueNum = Math.floor(Math.random() * 8) + 1;

    const newAppointment: Appointment = {
      id: `app-${Date.now()}`,
      patientId: `pat-${identityNo}`,
      doctorId: selectedDoctorId,
      slotTime: `${selectedDate}T${selectedSlot}:00`,
      status: "CONFIRMED",
      queueNumber: queueNum,
      doctor: { id: docObj.id, fullName: docObj.fullName },
      patient: { user: { fullName, phone, identityNo } },
    };

    setSuccessApp(newAppointment);
    onBookSuccess(newAppointment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-[#E5DCD0] rounded-3xl shadow-2xl overflow-hidden text-[#2C1810]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E5DCD0] bg-gradient-to-r from-[#F5EFEB] via-[#FAF7F2] to-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A2E1B] text-amber-200 flex items-center justify-center font-bold shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#2C1810] font-serif">{tBooking("title")}</h3>
              <p className="text-xs text-[#8A5F35] font-semibold">{tBooking("subtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#7D6E63] hover:text-[#2C1810] hover:bg-[#FAF7F2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5 bg-white">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successApp ? (
            <div className="py-6 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-[#2C1810] font-serif">{tBooking("successTitle")}</h4>
                <p className="text-[#6A584A] text-xs max-w-sm mx-auto mt-1 leading-relaxed">
                  {tBooking("successDesc")}
                </p>
              </div>

              {/* Ticket Card */}
              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] text-left rtl:text-right space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E5DCD0] pb-2 text-xs">
                  <span className="font-bold text-[#6E492D] flex items-center gap-1.5">
                    <Ticket className="w-4 h-4" />
                    <span>{tBooking("ticketTitle")}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                    {tBooking("confirmedBadge")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#7D6E63] text-[10px] block font-medium">{tBooking("patientLabel")}</span>
                    <strong className="text-[#2C1810]">{successApp.patient?.user?.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[#7D6E63] text-[10px] block font-medium">{tBooking("doctorLabel")}</span>
                    <strong className="text-[#2C1810]">{successApp.doctor?.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[#7D6E63] text-[10px] block font-medium">{tBooking("dateTimeLabel")}</span>
                    <strong className="text-[#8A5F35] font-mono">{selectedDate} • {selectedSlot}</strong>
                  </div>
                  <div>
                    <span className="text-[#7D6E63] text-[10px] block font-medium">{tBooking("queueLabel")}</span>
                    <strong className="text-2xl font-mono text-[#4A2E1B]">#{successApp.queueNumber}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSuccessApp(null);
                  onClose();
                }}
                className="w-full py-3 bg-[#FAF7F2] hover:bg-[#F3EDE2] text-[#2C1810] border border-[#E5DCD0] font-bold text-xs rounded-xl transition-colors"
              >
                {tBooking("close")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              
              {/* Doctor Select */}
              <div>
                <label className="block text-xs font-bold text-[#4E3D30] uppercase tracking-wider mb-1.5">
                  {tBooking("stepDoctor")}
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl py-2.5 px-3 text-sm text-[#2C1810] focus:outline-none focus:bg-white focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B]"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Personal Info Required before booking */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-3">
                <span className="text-[11px] font-bold text-[#4E3D30] uppercase tracking-wider block">
                  {tBooking("stepPatient")}
                </span>

                <div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={tBooking("fullNamePlaceholder")}
                    className="w-full bg-white border border-[#DDD2C1] rounded-xl py-2 px-3 text-xs text-[#2C1810] placeholder-[#9E8E81] focus:outline-none focus:border-[#4A2E1B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={identityNo}
                    onChange={(e) => setIdentityNo(e.target.value)}
                    placeholder={tBooking("identityPlaceholder")}
                    className="w-full bg-white border border-[#DDD2C1] rounded-xl py-2 px-3 text-xs text-[#2C1810] placeholder-[#9E8E81] focus:outline-none focus:border-[#4A2E1B]"
                  />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={tBooking("phonePlaceholder")}
                    className="w-full bg-white border border-[#DDD2C1] rounded-xl py-2 px-3 text-xs text-[#2C1810] placeholder-[#9E8E81] focus:outline-none focus:border-[#4A2E1B]"
                  />
                </div>
              </div>

              {/* Date & Time Slot */}
              <div>
                <label className="block text-xs font-bold text-[#4E3D30] uppercase tracking-wider mb-1.5">
                  {tBooking("stepDateTime")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl py-2 px-3 text-xs text-[#2C1810] focus:outline-none focus:bg-white focus:border-[#4A2E1B]"
                  />
                  <div className="flex items-center gap-1.5 text-xs text-[#7D6E63] p-2 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0]">
                    <Clock className="w-3.5 h-3.5 text-[#8A5F35]" />
                    <span>{tBooking("availableSlots")}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        selectedSlot === slot
                          ? "bg-[#4A2E1B] text-white shadow-sm scale-105"
                          : "bg-[#FAF7F2] border border-[#DDD2C1] text-[#4E3D30] hover:bg-[#F3EDE2] hover:border-[#4A2E1B]"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs rounded-xl shadow-md shadow-[#4A2E1B]/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{tBooking("submitButton")}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 text-amber-200" />
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
