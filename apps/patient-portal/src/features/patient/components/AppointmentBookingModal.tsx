import React, { useState, useEffect } from "react";
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Sparkles,
  Ticket
} from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";
import { apiRequest } from "../../../shared/api";
import { AuthUser } from "../../auth/auth.types";
import { DoctorData } from "../../landing/DoctorsShowcase";
import { DEPARTMENTS } from "../../landing/DepartmentGrid";

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: DoctorData[];
  currentUser: AuthUser | null;
  onRequireAuth: () => void;
  initialDoctor?: DoctorData | null;
  initialDepartment?: string | null;
  onBookingSuccessCallback?: () => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  doctors,
  currentUser,
  onRequireAuth,
  initialDoctor = null,
  initialDepartment = null,
  onBookingSuccessCallback,
}) => {
  const { t, language, isRTL } = useTranslation();

  // Selection states
  const [selectedDept, setSelectedDept] = useState<string>(initialDepartment || "");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialDoctor?.id || "");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to today or tomorrow
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // Loaded slots
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<any>(null);

  // Sync initial props
  useEffect(() => {
    if (initialDoctor) {
      setSelectedDoctorId(initialDoctor.id);
    }
    if (initialDepartment) {
      setSelectedDept(initialDepartment);
    }
  }, [initialDoctor, initialDepartment]);

  // Set default doctor if none selected and doctors available
  useEffect(() => {
    if (!selectedDoctorId && doctors.length > 0) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId]);

  // Calculate doctor slots dynamically from backend
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return;

    setLoadingSlots(true);
    setErrorMsg("");

    apiRequest<{ schedules: any[]; bookedSlots: string[] }>(
      `/doctors/${selectedDoctorId}/schedule?date=${selectedDate}`
    )
      .then((data) => {
        const { schedules, bookedSlots } = data;
        const targetDateObj = new Date(selectedDate);
        const dayOfWeek = targetDateObj.getDay(); // 0 = Sun, 1 = Mon ...

        // Find schedule for that day
        const daySchedule = schedules.find((s) => s.dayOfWeek === dayOfWeek) || schedules[0];

        if (!daySchedule) {
          // If no specific schedule, standard 09:00 - 17:00
          generateTimeSlots("09:00", "17:00", "12:00", "13:00", bookedSlots, targetDateObj);
        } else {
          generateTimeSlots(
            daySchedule.startTime || "09:00",
            daySchedule.endTime || "17:00",
            daySchedule.breakStart || "12:00",
            daySchedule.breakEnd || "13:00",
            bookedSlots,
            targetDateObj
          );
        }
      })
      .catch((err) => {
        console.error("Schedule error:", err);
        // Fallback default slots
        generateTimeSlots("09:00", "17:00", "12:00", "13:00", [], new Date(selectedDate));
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDoctorId, selectedDate]);

  const generateTimeSlots = (
    start: string,
    end: string,
    breakStart: string,
    breakEnd: string,
    booked: string[],
    dateObj: Date
  ) => {
    const slots: string[] = [];
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const [bStartH, bStartM] = breakStart.split(":").map(Number);
    const [bEndH, bEndM] = breakEnd.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const breakStartMinutes = bStartH * 60 + bStartM;
    const breakEndMinutes = bEndH * 60 + bEndM;

    for (let m = startMinutes; m < endMinutes; m += 30) {
      // Skip lunch break
      if (m >= breakStartMinutes && m < breakEndMinutes) continue;

      const h = Math.floor(m / 60);
      const min = m % 60;
      const slotTimeStr = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;

      // Check if slot is in booked list
      const slotIsoDateTime = new Date(dateObj);
      slotIsoDateTime.setHours(h, min, 0, 0);

      const isBooked = booked.some((b) => {
        const bookedDate = new Date(b);
        return (
          bookedDate.getHours() === h &&
          bookedDate.getMinutes() === min &&
          bookedDate.toDateString() === dateObj.toDateString()
        );
      });

      if (!isBooked) {
        slots.push(slotTimeStr);
      }
    }

    setAvailableSlots(slots);
    if (slots.length > 0 && !slots.includes(selectedSlot)) {
      setSelectedSlot(slots[0]);
    }
  };

  const handleConfirmAppointment = async () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (!selectedDoctorId || !selectedDate || !selectedSlot) {
      setErrorMsg("Lütfen doktor, tarih ve saat seçimini tamamlayınız.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const [h, m] = selectedSlot.split(":").map(Number);
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(h, m, 0, 0);

      const response = await apiRequest("/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          slotTime: slotDateTime.toISOString(),
          patientId: currentUser.patientId,
        }),
      });

      setSuccessData(response);
      if (onBookingSuccessCallback) {
        onBookingSuccessCallback();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Randevu alınırken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentDoctorObj = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C1810]/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white border border-[#E5DCD0] rounded-3xl shadow-2xl overflow-hidden text-[#2C1810]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E5DCD0] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A2E1B] text-white flex items-center justify-center font-bold shadow-md">
              <Calendar className="w-5 h-5 text-[#EFE8DC]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#2C1810] font-serif">{t.bookingModalTitle}</h3>
              <p className="text-xs text-[#B8860B] font-semibold">Mena Clinic Aleppo HIS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#6E492D] hover:text-[#2C1810] hover:bg-[#EFE8DC] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Screen */}
          {successData ? (
            <div className="py-6 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-[#E8F5E9] border border-emerald-400 text-[#2E7D32] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-[#2C1810] font-serif">
                  {t.bookingSuccessTitle}
                </h4>
                <p className="text-[#4E3D30] text-xs max-w-sm mx-auto mt-1 leading-relaxed">
                  {t.bookingSuccessDesc}
                </p>
              </div>

              {/* Ticket Card */}
              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] text-left rtl:text-right space-y-3 relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E5DCD0] pb-3">
                  <span className="text-xs font-semibold text-[#4A2E1B] uppercase tracking-wider flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-[#B8860B]" />
                    <span>E-Randevu Bileti</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8F5E9] text-[#2E7D32] font-mono font-bold">
                    ONAYLANDI
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#6E492D] block text-[11px] font-medium">{t.doctor}:</span>
                    <strong className="text-[#2C1810] text-sm">{currentDoctorObj?.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[#6E492D] block text-[11px] font-medium">{t.timeSlot}:</span>
                    <strong className="text-[#4A2E1B] text-sm font-mono font-bold">
                      {selectedDate} • {selectedSlot}
                    </strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5DCD0] flex items-center justify-between">
                  <span className="text-xs text-[#4E3D30] font-medium">{t.yourQueueNumberIs}:</span>
                  <span className="text-2xl font-black text-[#4A2E1B] font-mono px-3 py-1 bg-[#EFE8DC] border border-[#E5DCD0] rounded-lg">
                    #{successData.queueNumber}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSuccessData(null);
                  onClose();
                }}
                className="w-full py-3 bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs rounded-xl transition-all shadow-md"
              >
                Kapat
              </button>
            </div>
          ) : (
            <>
              {/* Doctor / Specialty Selection */}
              <div>
                <label className="block text-xs font-bold text-[#4A2E1B] uppercase tracking-wider mb-2">
                  {t.selectDoctor}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doctors.map((doc) => {
                    const isSelected = selectedDoctorId === doc.id;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setSelectedDoctorId(doc.id)}
                        className={`p-3.5 rounded-2xl border text-left rtl:text-right transition-all flex items-center gap-3 ${
                          isSelected
                            ? "bg-[#EFE8DC] border-[#4A2E1B] text-[#2C1810] shadow-sm"
                            : "bg-[#FAF7F2] border-[#E5DCD0] text-[#4E3D30] hover:border-[#B8860B]/50"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isSelected ? "bg-[#4A2E1B] text-white" : "bg-white text-[#4A2E1B] border border-[#E5DCD0]"
                        }`}>
                          <User className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${isSelected ? "text-[#2C1810]" : "text-[#4E3D30]"}`}>
                            {doc.fullName}
                          </div>
                          <div className="text-[11px] text-[#8A5F35] font-semibold truncate">
                            {doc.email.includes("cardio") ? "Kardiyoloji" : "Dermatoloji"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold text-[#4A2E1B] uppercase tracking-wider mb-2">
                  {t.selectDate}
                </label>
                <div className="relative">
                  <Calendar className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} w-4 h-4 text-[#8A5F35]`} />
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`w-full bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl py-2.5 ${isRTL ? "pr-10 pl-3" : "pl-10 pr-3"} text-sm text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]`}
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#4A2E1B] uppercase tracking-wider">
                    {t.selectTimeSlot}
                  </label>
                  {loadingSlots && (
                    <span className="text-[11px] text-[#8A5F35] font-mono animate-pulse">
                      Saatler güncelleniyor...
                    </span>
                  )}
                </div>

                {availableSlots.length === 0 && !loadingSlots ? (
                  <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] text-[#6E492D] text-xs text-center">
                    {t.noSlotsAvailable}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                            isSelected
                              ? "bg-[#4A2E1B] text-white shadow-md scale-105"
                              : "bg-[#FAF7F2] border border-[#E5DCD0] text-[#2C1810] hover:border-[#4A2E1B]"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* User login state indicator */}
              {!currentUser ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-[#4A2E1B] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#B8860B] shrink-0" />
                    <span className="font-semibold">{t.bookingRequiresAuthNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={onRequireAuth}
                    className="w-full sm:w-auto px-4 py-2 bg-[#4A2E1B] text-white font-bold rounded-xl hover:bg-[#382112] transition-colors shadow-sm shrink-0"
                  >
                    {t.loginToBookBtn}
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#EFE8DC]/60 border border-[#E5DCD0] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#4A2E1B]">
                    <User className="w-4 h-4 text-[#8A5F35]" />
                    <span className="font-semibold">{currentUser.fullName}</span>
                    <span className="text-[#6E492D]">({currentUser.phone || "+963 992 334455"})</span>
                  </div>
                  <span className="text-[10px] text-[#2E7D32] bg-emerald-100 font-bold px-2 py-0.5 rounded">
                    {t.statusConfirmed}
                  </span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                disabled={submitting || !selectedSlot || !currentUser}
                onClick={handleConfirmAppointment}
                className="w-full py-3.5 bg-[#4A2E1B] hover:bg-[#382112] text-white font-extrabold text-sm rounded-xl shadow-md shadow-[#4A2E1B]/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {!currentUser ? t.loginToBookBtn : submitting ? "..." : t.confirmBooking}
                <ChevronRight className="w-4 h-4 rtl:rotate-180 text-[#EFE8DC]" />
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
