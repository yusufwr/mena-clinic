"use client";
import { clinicDate } from "@/lib/clinicDate";
import React, { useState, useEffect, useCallback } from "react";
import { X, Calendar, Clock, CheckCircle2, AlertCircle, Ticket, ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
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
  const locale = useLocale();
  const L = (tr: string, ar: string, en: string) => (locale === "ar" ? ar : locale === "en" ? en : tr);

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialDoctor?.id || (doctors[0]?.id || ""));
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("09");
  const [identityNo, setIdentityNo] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(() => clinicDate());
  const [selectedSlot, setSelectedSlot] = useState("10:00");
  const [liveSlots, setLiveSlots] = useState<string[]>([]);
  const [liveBlockedSlots, setLiveBlockedSlots] = useState<string[]>([]);
  const [successApp, setSuccessApp] = useState<Appointment | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialDoctor?.id) {
      setSelectedDoctorId(initialDoctor.id);
    } else if (!selectedDoctorId && doctors[0]?.id) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [initialDoctor, doctors, selectedDoctorId]);

  const fetchLiveSchedule = useCallback(async (docId: string, dateVal: string) => {
    if (!docId || !dateVal) return;
    try {
      const res = await fetch(
        `/api/doctors/${encodeURIComponent(docId)}/schedule?date=${encodeURIComponent(dateVal)}&_t=${Date.now()}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.allStandardSlots) && data.allStandardSlots.length > 0) {
        setLiveSlots(data.allStandardSlots);
      }
      if (Array.isArray(data.allBlockedSlots)) {
        setLiveBlockedSlots(data.allBlockedSlots);
        setSelectedSlot((prev) => {
          if (data.allBlockedSlots.includes(prev)) {
            return Array.isArray(data.availableSlots) && data.availableSlots.length > 0
              ? data.availableSlots[0]
              : "";
          }
          return prev;
        });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !selectedDoctorId || !selectedDate) return;
    fetchLiveSchedule(selectedDoctorId, selectedDate);
    const timer = setInterval(() => {
      fetchLiveSchedule(selectedDoctorId, selectedDate);
    }, 6000);
    return () => clearInterval(timer);
  }, [isOpen, selectedDoctorId, selectedDate, fetchLiveSchedule]);

  if (!isOpen) return null;

  const currentDocObj = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  const isDocOnLeave = currentDocObj?.availabilityStatus === "ON_LEAVE";
  const isEveningShift = currentDocObj?.availabilityStatus === "EVENING_SHIFT";
  const DEFAULT_SLOTS = isEveningShift
    ? ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"]
    : ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
  const SLOTS = liveSlots.length > 0 ? liveSlots : DEFAULT_SLOTS;
  const unavailableSlots = currentDocObj?.unavailableSlots || [];

  const now = new Date();
  const currentHourMin = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  const todayStr = clinicDate(now);
  const isToday = selectedDate <= todayStr;

  const isSlotDisabled = (slot: string) => {
    if (isDocOnLeave) return true;
    if (unavailableSlots.includes(slot)) return true;
    if (liveBlockedSlots.includes(slot)) return true;
    if (isToday && slot <= currentHourMin) return true;
    return false;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!fullName || !identityNo || !selectedDoctorId || !selectedSlot) {
      setErrorMsg(tBooking("validationError"));
      return;
    }

    if (isSlotDisabled(selectedSlot)) {
      setErrorMsg(
        L(
          "Seçilen saat doludur (kırmızı). Lütfen yeşil renkli müsait bir saat seçiniz.",
          "الوقت المحدد محجوز (باللون الأحمر). يرجى اختيار وقت متاح باللون الأخضر.",
          "The selected time slot is booked (red). Please choose an available green slot."
        )
      );
      return;
    }

    try {
      const token = localStorage.getItem("mena_auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      };
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers,
        body: JSON.stringify({
          patientIdentityNo: identityNo.trim(),
          doctorId: selectedDoctorId,
          dateStr: selectedDate,
          timeStr: selectedSlot,
          slotTime: `${selectedDate}T${selectedSlot}:00`,
          patient: {
            fullName: fullName.trim(),
            identityNo: identityNo.trim(),
            phone: phone.trim(),
          },
        }),
      });
      const appointment = await response.json();
      if (!response.ok) {
        await fetchLiveSchedule(selectedDoctorId, selectedDate);
        throw new Error(
          L(
            "Bu saat az önce doldu, lütfen başka bir saat seçin.",
            "هذا الموعد تم حجزه للتو، يرجى اختيار وقت آخر.",
            "This time slot was just booked; please select another slot."
          )
        );
      }

      // Immediately turn booked slot RED and refresh
      setLiveBlockedSlots((prev) => Array.from(new Set([...prev, selectedSlot])));
      await fetchLiveSchedule(selectedDoctorId, selectedDate);
      setSuccessApp(appointment);
      onBookSuccess(appointment);
    } catch (error: any) {
      setErrorMsg(
        error.message ||
          L("Randevu kaydedilmedi", "تعذر تثبيت الموعد", "Could not save appointment")
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-[#E5DCD0] rounded-3xl shadow-2xl overflow-hidden text-[#2C1810] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#E5DCD0] bg-gradient-to-r from-[#F5EFEB] via-[#FAF7F2] to-[#FAF7F2] flex items-center justify-between shrink-0">
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
                    <strong className="text-[#2C1810]">
                      {successApp.patient?.user?.fullName || (successApp as any).patient?.fullName || fullName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#7D6E63] text-[10px] block font-medium">{tBooking("doctorLabel")}</span>
                    <strong className="text-[#2C1810]">{successApp.doctor?.fullName || currentDocObj?.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[#7D6E63] text-[10px] block font-medium">{tBooking("dateTimeLabel")}</span>
                    <strong className="text-[#8A5F35] font-mono">
                      {selectedDate} • {(successApp as any).timeStr || selectedSlot}
                    </strong>
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
              <div>
                <label className="block text-xs font-bold text-[#4E3D30] uppercase tracking-wider mb-1.5">
                  {tBooking("stepDoctor")}
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl py-2.5 px-3 text-sm text-[#2C1810] focus:outline-none focus:bg-white focus:border-[#4A2E1B]"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {locale === "ar" ? d.fullNameAr || d.fullName : locale === "en" ? d.fullNameEn || d.fullName : d.fullName}
                    </option>
                  ))}
                </select>
              </div>

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

              <div>
                <label className="block text-xs font-bold text-[#4E3D30] uppercase tracking-wider mb-1.5">
                  {tBooking("stepDateTime")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <input
                    type="date"
                    min={clinicDate()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl py-2 px-3 text-xs text-[#2C1810] focus:outline-none focus:bg-white focus:border-[#4A2E1B]"
                  />
                  <div className="flex items-center gap-1.5 text-[11px] text-[#7D6E63] p-2 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0]">
                    <Clock className="w-3.5 h-3.5 text-[#8A5F35]" />
                    <span className="text-emerald-700 font-bold">● {L("Müsait", "متاح", "Available")}</span>
                    <span className="text-red-700 font-bold ml-1">● {L("Dolu", "محجوز", "Booked")}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {SLOTS.map((slot) => {
                    const disabled = isSlotDisabled(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={disabled}
                        onClick={() => !disabled && setSelectedSlot(slot)}
                        title={disabled ? L("Dolu", "غير متاح", "Unavailable") : L("Müsait", "متاح", "Available")}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                          disabled
                            ? "cursor-not-allowed bg-red-100 text-red-800 line-through border-red-300 opacity-85"
                            : selectedSlot === slot
                            ? "bg-[#4A2E1B] text-white border-[#4A2E1B] ring-2 ring-emerald-400 scale-105"
                            : "bg-emerald-100 border-emerald-300 text-emerald-900 hover:bg-emerald-200"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedSlot || isSlotDisabled(selectedSlot)}
                className="w-full py-3 bg-[#4A2E1B] hover:bg-[#382112] disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md shadow-[#4A2E1B]/20 transition-all flex items-center justify-center gap-2"
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
