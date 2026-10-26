import React, { useState } from "react";
import { Stethoscope, Search, Calendar, Clock, DollarSign, User, X, CheckCircle2, ChevronRight, Filter, Plus, ShieldCheck, Lock, AlertCircle, Phone, Mail, Building } from "lucide-react";
import { AdminTranslations } from "../i18n";
import { DoctorModel, apiFetch } from "../apiClient";

interface DoctorsHubProps {
  doctors: DoctorModel[];
  appointments: any[];
  patients: any[];
  t: AdminTranslations;
  lang: string;
  onDoctorAdded?: () => void;
  onSwitchDoctor?: (doc: DoctorModel) => void;
}

const ALL_TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30"
];

export const DoctorsHub: React.FC<DoctorsHubProps> = ({
  doctors,
  appointments,
  patients,
  t,
  lang,
  onDoctorAdded,
  onSwitchDoctor,
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorModel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [editingFee, setEditingFee] = useState<number | null>(null);
  const [feeDoctorId, setFeeDoctorId] = useState<string | null>(null);

  // Add Doctor Modal State
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Form Fields
  const [formName, setFormName] = useState("Dr. Kerem Aksoy");
  const [formSpecialty, setFormSpecialty] = useState("Nöroloji • جراحة المخ والأعصاب");
  const [formDepartment, setFormDepartment] = useState("Nöroloji Kliniği");
  const [formEmail, setFormEmail] = useState("kerem@menaclinic.com");
  const [formPassword, setFormPassword] = useState("Doktor123!");
  const [formPhone, setFormPhone] = useState("+963 995 778899");
  const [formRoom, setFormRoom] = useState("Poliklinik 204");
  const [formFee, setFormFee] = useState(1500);
  const [formHours, setFormHours] = useState("09:00 - 17:00");
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>(["12:00", "12:30", "15:00"]);

  // Departments list for filter
  const departments = Array.from(new Set(doctors.map((d) => d.department?.name).filter(Boolean)));

  // Filtered doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.department?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "ALL" || doc.department?.name === selectedDept;
    return matchesSearch && matchesDept;
  });

  const toggleSlotAvailability = (slot: string) => {
    if (unavailableSlots.includes(slot)) {
      setUnavailableSlots(unavailableSlots.filter((s) => s !== slot));
    } else {
      setUnavailableSlots([...unavailableSlots, slot]);
    }
  };

  const handleSaveFee = async (docId: string) => {
    if (editingFee === null || !selectedDoctor) return;
    try {
      const response = await apiFetch("http://localhost:3000/api/doctors/" + encodeURIComponent(docId), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consultationFee: editingFee }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Ücret kaydedilmedi");
      setSelectedDoctor({ ...selectedDoctor, ...data });
      setFeeDoctorId(null);
      onDoctorAdded?.();
    } catch (error: any) { setSubmitError(error.message); }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const payload = {
        fullName: formName,
        specialty: formSpecialty,
        departmentName: formDepartment,
        email: formEmail,
        password: formPassword,
        phone: formPhone,
        room: formRoom,
        consultationFee: Number(formFee) || 1200,
        fee: `${Number(formFee).toLocaleString()} SYP`,
        hours: formHours,
        unavailableSlots,
      };

      const res = await apiFetch("http://localhost:3000/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Doktor eklenirken hata oluştu.");
      }

      setSubmitSuccess(lang === "ar" ? "تم إضافة الطبيب وتحديد جدول المواعيد بنجاح!" : "Doktor başarıyla eklendi, yetkilendirildi ve mesai/müsaitlik saatleri kaydedildi!");
      if (onDoctorAdded) onDoctorAdded();

      setTimeout(() => {
        setShowAddDoctorModal(false);
        setSubmitSuccess("");
      }, 1200);
    } catch (err: any) {
      setSubmitError(err.message || "Bağlantı hatası.");
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Action Button: Add Doctor */}
        <button
          type="button"
          onClick={() => setShowAddDoctorModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white text-xs font-bold shadow-md transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>{lang === "ar" ? "+ إضافة طبيب وتحديد المواعيد" : lang === "en" ? "+ Add Doctor & Schedule" : "+ Yeni Doktor Ekle & Yetkilendir"}</span>
        </button>
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
          const docApps = appointments.filter((a) => a.doctorId === doc.id || a.doctor?.fullName === doc.fullName || a.doctor?.email === doc.email);
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
                    <p className="text-[11px] font-semibold text-[#8A6445] truncate">{doc.department?.name || (doc as any).specialty || "Poliklinik"}</p>
                    <span className="inline-block px-2 py-0.5 mt-1 rounded bg-[#FAF7F2] border border-[#E5DCD0] text-[10px] text-[#6E492D] font-mono">
                      {doc.room || "Poliklinik 101"}
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
                  {(doc as any).unavailableSlots && (doc as any).unavailableSlots.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-red-600 font-mono">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>Kapalı Saatler: {(doc as any).unavailableSlots.slice(0, 3).join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(doc)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-sm"
                >
                  <span>{t.inspectDoctor}</span>
                  <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </button>
                {onSwitchDoctor && (
                  <button
                    type="button"
                    onClick={() => onSwitchDoctor(doc)}
                    title="Bu Hekim Olarak Muayene Ekranına Geç"
                    className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DC] text-[#4A2E1B] border border-[#E5DCD0] transition-colors"
                  >
                    <Stethoscope className="w-4 h-4 text-[#B8860B]" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: ADD DOCTOR & PERMISSIONS & AVAILABILITY */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 bg-[#2C1810]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E5DCD0] rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-5 shadow-2xl relative animate-fadeIn my-8">
            <button
              type="button"
              onClick={() => setShowAddDoctorModal(false)}
              className="absolute right-5 rtl:right-auto rtl:left-5 top-5 p-1.5 rounded-full bg-[#FAF7F2] text-[#6E492D] hover:bg-[#EFE8DC] transition-colors border border-[#E5DCD0]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#E5DCD0] pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFE8DC] border border-[#E5DCD0] text-[#4A2E1B] flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5 text-[#B8860B]" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-[#2C1810]">
                  {lang === "ar" ? "إضافة طبيب جديد وصلاحيات الدخول" : "Yeni Doktor Ekle & Yetkilendir"}
                </h3>
                <p className="text-xs text-[#7D6E63]">
                  Hekim profili, giriş şifresi, uzmanlık alanı ve saat saat müsaitlik planlaması.
                </p>
              </div>
            </div>

            {submitSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{submitSuccess}</span>
              </div>
            )}
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDoctor} className="space-y-4">
              {/* Doctor Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#4A2E1B] font-bold mb-1">Doktor Adı Soyadı *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Örn: Dr. Kerem Aksoy"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl text-xs text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
                  />
                </div>
                <div>
                  <label className="block text-[#4A2E1B] font-bold mb-1">Uzmanlık Alanı / Branş *</label>
                  <input
                    type="text"
                    required
                    value={formSpecialty}
                    onChange={(e) => {
                      setFormSpecialty(e.target.value);
                      setFormDepartment(e.target.value.split("•")[0].trim() + " Kliniği");
                    }}
                    placeholder="Örn: Nöroloji • جراحة المخ والأعصاب"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl text-xs text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
                  />
                </div>
              </div>

              {/* Login Credentials & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0]">
                <div>
                  <label className="block text-[#4A2E1B] font-bold mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#B8860B]" />
                    <span>Giriş E-postası *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E5DCD0] rounded-lg text-xs text-[#2C1810] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#4A2E1B] font-bold mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#B8860B]" />
                    <span>Giriş Şifresi *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E5DCD0] rounded-lg text-xs text-[#2C1810] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#4A2E1B] font-bold mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#B8860B]" />
                    <span>Telefon Numarası</span>
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E5DCD0] rounded-lg text-xs text-[#2C1810] font-mono"
                  />
                </div>
              </div>

              {/* Room, Hours & Consultation Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[#4A2E1B] font-bold mb-1">Poliklinik Oda No</label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl text-xs text-[#2C1810]"
                  />
                </div>
                <div>
                  <label className="block text-[#4A2E1B] font-bold mb-1">Mesai Saatleri</label>
                  <input
                    type="text"
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl text-xs text-[#2C1810] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#4A2E1B] font-bold mb-1">Muayene Ücreti (SYP) *</label>
                  <input
                    type="number"
                    required
                    value={formFee}
                    onChange={(e) => setFormFee(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl text-xs text-[#2C1810] font-mono font-bold"
                  />
                </div>
              </div>

              {/* Interactive Availability Management (Saat Saat Müsait / Müsait Değil) */}
              <div className="space-y-2 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A2E1B]">
                    <Clock className="w-4 h-4 text-[#B8860B]" />
                    <span>Saat Slotları Müsaitlik Yönetimi</span>
                  </div>
                  <span className="text-[10px] text-[#7D6E63]">
                    Kırmızı: Müsait Değil | Yeşil: Müsait
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-1">
                  {ALL_TIME_SLOTS.map((slot) => {
                    const isUnavailable = unavailableSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleSlotAvailability(slot)}
                        className={`py-1.5 px-1 rounded-lg text-[11px] font-mono font-bold transition-all text-center border ${
                          isUnavailable
                            ? "bg-red-100 text-red-800 border-red-300 hover:bg-red-200 line-through"
                            : "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200"
                        }`}
                        title={isUnavailable ? `${slot} Müsait Değil (Tıkla ve Müsait Yap)` : `${slot} Müsait (Tıkla ve Kapat)`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 text-[10px]">
                  <span className="text-[#6E492D] font-bold">Hızlı Şablonlar:</span>
                  <button
                    type="button"
                    onClick={() => setUnavailableSlots(["12:00", "12:30"])}
                    className="px-2 py-0.5 rounded bg-white border border-[#E5DCD0] hover:bg-[#EFE8DC] text-[#4A2E1B]"
                  >
                    Öğle Molası (12:00-13:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnavailableSlots(["12:00", "12:30", "15:00", "15:30"])}
                    className="px-2 py-0.5 rounded bg-white border border-[#E5DCD0] hover:bg-[#EFE8DC] text-[#4A2E1B]"
                  >
                    Öğle + İkindi Ameliyatı (15:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnavailableSlots([])}
                    className="px-2 py-0.5 rounded bg-white border border-[#E5DCD0] hover:bg-[#EFE8DC] text-[#4A2E1B]"
                  >
                    Tüm Saatleri Aç
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5DCD0] text-xs font-semibold text-[#4A2E1B] hover:bg-[#FAF7F2]"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isSubmitting ? "Kaydediliyor..." : "Doktoru Kaydet & Yetkilendir"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DOCTOR DRILL-DOWN MODAL */}
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
                    Aktif Hekim
                  </span>
                </div>
                <p className="text-xs text-[#8A6445] font-semibold mt-0.5">{selectedDoctor.department?.name || (selectedDoctor as any).specialty}</p>
                <p className="text-[11px] text-[#7D6E63] mt-1 font-mono">{selectedDoctor.email} • {selectedDoctor.phone}</p>
              </div>

              {/* Consultation Fee Box */}
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
            <div className="p-4 bg-[#FAF7F2] border border-[#E5DCD0] rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#4A2E1B]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#B8860B]" />
                  <span>{t.doctorWeeklySchedule}</span>
                </div>
                <span className="text-[11px] font-mono text-[#6E492D]">Oda: {selectedDoctor.room || "Poliklinik 101"}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-[#E5DCD0]">
                  <span className="block text-[10px] text-[#7D6E63] font-medium">Mesai Günleri</span>
                  <strong className="text-[#2C1810]">Pazartesi - Cuma</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#E5DCD0]">
                  <span className="block text-[10px] text-[#7D6E63] font-medium">Çalışma Saatleri</span>
                  <strong className="text-[#2C1810] font-mono">{selectedDoctor.hours || "09:00 - 17:00"}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#E5DCD0] col-span-2">
                  <span className="block text-[10px] text-[#7D6E63] font-medium">Müsait Olmayan Saatler</span>
                  <span className="text-red-700 font-mono font-bold">
                    {(selectedDoctor as any).unavailableSlots && (selectedDoctor as any).unavailableSlots.length > 0
                      ? (selectedDoctor as any).unavailableSlots.join(", ")
                      : "Tüm saatler açık"}
                  </span>
                </div>
              </div>
            </div>

            {/* Doctor's Patients List & Appointments */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#2C1810] font-serif">{t.doctorPatientsList}</h4>
                <span className="text-xs text-[#8A6445] font-semibold">
                  {appointments.filter((a) => a.doctorId === selectedDoctor.id || a.doctor?.fullName === selectedDoctor.fullName || a.doctor?.email === selectedDoctor.email).length} Kayıtlı Randevu
                </span>
              </div>

              {appointments.filter((a) => a.doctorId === selectedDoctor.id || a.doctor?.fullName === selectedDoctor.fullName || a.doctor?.email === selectedDoctor.email).length === 0 ? (
                <div className="p-6 text-center bg-[#FAF7F2] border border-[#E5DCD0] rounded-2xl text-xs text-[#7D6E63]">
                  Bu doktora henüz randevu oluşturulmamış.
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
                      {appointments
                        .filter((a) => a.doctorId === selectedDoctor.id || a.doctor?.fullName === selectedDoctor.fullName || a.doctor?.email === selectedDoctor.email)
                        .map((app, idx) => (
                          <tr key={app.id || idx} className="hover:bg-[#FAF7F2]">
                            <td className="p-3 font-mono font-bold text-[#4A2E1B]">#{app.queueNumber || idx + 1}</td>
                            <td className="p-3 font-semibold text-[#2C1810]">
                              {app.patient?.fullName || app.patient?.user?.fullName || "Kayıtlı Hasta"}
                            </td>
                            <td className="p-3 font-mono text-[#6E492D]">
                              <bdi dir="ltr">{app.patient?.phone || app.patient?.user?.phone || "+963 992 334455"}</bdi>
                            </td>
                            <td className="p-3 font-mono text-[#5A483B]">
                              {app.timeStr || (app.slotTime ? new Date(app.slotTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "10:00")}
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
                                {app.status || "CONFIRMED"}
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
            <div className="pt-4 border-t border-[#E5DCD0] flex items-center justify-between">
              {onSwitchDoctor && (
                <button
                  type="button"
                  onClick={() => {
                    const doc = selectedDoctor;
                    setSelectedDoctor(null);
                    onSwitchDoctor(doc);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Stethoscope className="w-4 h-4 text-emerald-200" />
                  <span>Bu Doktor Olarak Giriş Yap & Muayene Ekranını Aç</span>
                </button>
              )}
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
