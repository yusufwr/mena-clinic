import React, { useState } from "react";
import {
  Stethoscope,
  Search,
  Calendar,
  Clock,
  User,
  X,
  CheckCircle2,
  ChevronRight,
  Filter,
  Plus,
  ShieldCheck,
  Lock,
  AlertCircle,
  Phone,
  Mail,
  Users,
  Edit3,
} from "lucide-react";
import { AdminTranslations, tr3 } from "../i18n";
import { DoctorModel, apiFetch, API_URL } from "../apiClient";

interface DoctorsHubProps {
  doctors: DoctorModel[];
  staffList?: any[];
  appointments: any[];
  patients: any[];
  t: AdminTranslations;
  lang: string;
  canCreateDoctor?: boolean;
  onDoctorAdded?: () => void;
  onStaffUpdated?: () => void;
  onSwitchDoctor?: (doc: DoctorModel) => void;
}

type RoleCategory =
  | "ALL"
  | "DOCTOR"
  | "RECEPTIONIST"
  | "PHARMACIST"
  | "ACCOUNTANT"
  | "LAB_TECH"
  | "ADMIN";

const ROLE_LABELS: Record<Exclude<RoleCategory, "ALL">, { tr: string; ar: string; en: string; badge: string }> = {
  DOCTOR: {
    tr: "Hekim / Doktor",
    ar: "طبيب أخصائي",
    en: "Doctor / Physician",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  RECEPTIONIST: {
    tr: "Resepsiyon / Danışma",
    ar: "استقبال واستعلامات",
    en: "Receptionist",
    badge: "bg-blue-50 text-blue-800 border-blue-200",
  },
  PHARMACIST: {
    tr: "Eczacı",
    ar: "صيدلي",
    en: "Pharmacist",
    badge: "bg-purple-50 text-purple-800 border-purple-200",
  },
  ACCOUNTANT: {
    tr: "Muhasebeci",
    ar: "محاسب مالي",
    en: "Accountant",
    badge: "bg-amber-50 text-amber-900 border-amber-200",
  },
  LAB_TECH: {
    tr: "Laborant",
    ar: "فني مختبر",
    en: "Lab Technician",
    badge: "bg-cyan-50 text-cyan-900 border-cyan-200",
  },
  ADMIN: {
    tr: "Yönetici (Admin)",
    ar: "مدير النظام",
    en: "Administrator",
    badge: "bg-rose-50 text-rose-800 border-rose-200",
  },
};

const ALL_TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
];

export const DoctorsHub: React.FC<DoctorsHubProps> = ({
  doctors,
  staffList = [],
  appointments,
  t,
  lang,
  canCreateDoctor = false,
  onDoctorAdded,
  onStaffUpdated,
  onSwitchDoctor,
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorModel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedRoleTab, setSelectedRoleTab] = useState<RoleCategory>(canCreateDoctor ? "ALL" : "DOCTOR");

  // Doctor Profile + Credentials + Shift Edit States inside Drill-Down Modal
  const [editDocName, setEditDocName] = useState("");
  const [editDocEmail, setEditDocEmail] = useState("");
  const [editDocPhone, setEditDocPhone] = useState("");
  const [editDocSpecialty, setEditDocSpecialty] = useState("");
  const [editDocFee, setEditDocFee] = useState<number>(1000);
  const [editDocPassword, setEditDocPassword] = useState("");
  const [editHours, setEditHours] = useState("09:00 - 17:00");
  const [editRoom, setEditRoom] = useState("Poliklinik 101");
  const [editStatus, setEditStatus] = useState<"AVAILABLE" | "EVENING_SHIFT" | "ON_LEAVE" | "EMERGENCY_ONLY">("AVAILABLE");
  const [editNote, setEditNote] = useState("");
  const [editBlockedSlots, setEditBlockedSlots] = useState<string[]>([]);
  const [scheduleSaveMsg, setScheduleSaveMsg] = useState("");

  // Non-Doctor Staff Edit Modal State (Admin only)
  const [editingStaffMember, setEditingStaffMember] = useState<any | null>(null);
  const [editStaffPassword, setEditStaffPassword] = useState("");
  const [staffSaveMsg, setStaffSaveMsg] = useState("");

  // Add Any Staff / Doctor Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Form Fields for New Staff / Doctor
  const [formRole, setFormRole] = useState<Exclude<RoleCategory, "ALL">>("DOCTOR");
  const [formName, setFormName] = useState("");
  const [formSpecialty, setFormSpecialty] = useState("Genel Poliklinik • طب عام");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("123");
  const [formPhone, setFormPhone] = useState("0989111242");
  const [formIdentityNo, setFormIdentityNo] = useState("");
  const [formRoom, setFormRoom] = useState("Poliklinik 112");
  const [formFee, setFormFee] = useState(1000);
  const [formHours, setFormHours] = useState("09:00 - 17:00");
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>(["12:00", "12:30"]);

  const departments = Array.from(new Set(doctors.map((d) => d.department?.name).filter(Boolean)));

  // Filtered doctors
  const showDoctorsSection = !canCreateDoctor || selectedRoleTab === "ALL" || selectedRoleTab === "DOCTOR";
  const filteredDoctors = showDoctorsSection
    ? doctors.filter((doc) => {
        const q = searchQuery.toLocaleLowerCase("tr-TR");
        const matchesSearch =
          doc.fullName.toLocaleLowerCase("tr-TR").includes(q) ||
          doc.email.toLowerCase().includes(q) ||
          (doc.phone || "").includes(q) ||
          (doc.department?.name || "").toLocaleLowerCase("tr-TR").includes(q);
        const matchesDept = selectedDept === "ALL" || doc.department?.name === selectedDept;
        return matchesSearch && matchesDept;
      })
    : [];

  // Filtered non-doctor staff (for Admin unified role management)
  const nonDoctorStaff = staffList.filter((s) => {
    const r = s.role === "FINANCE" ? "ACCOUNTANT" : s.role;
    if (r === "DOCTOR") return false;
    if (selectedRoleTab !== "ALL" && r !== selectedRoleTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLocaleLowerCase("tr-TR");
    return (
      (s.fullName || "").toLocaleLowerCase("tr-TR").includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.phone || "").includes(q) ||
      r.toLowerCase().includes(q)
    );
  });

  const toggleSlotAvailability = (slot: string) => {
    if (unavailableSlots.includes(slot)) {
      setUnavailableSlots(unavailableSlots.filter((s) => s !== slot));
    } else {
      setUnavailableSlots([...unavailableSlots, slot]);
    }
  };

  const openDoctorModal = (doc: DoctorModel) => {
    setSelectedDoctor(doc);
    setEditDocName(doc.fullName || "");
    setEditDocEmail(doc.email || "");
    setEditDocPhone(doc.phone || "");
    setEditDocSpecialty(doc.department?.name || (doc as any).specialty || "Poliklinik");
    setEditDocFee(doc.consultationFee ?? 1000);
    setEditDocPassword("");
    setEditHours(doc.hours || "09:00 - 17:00");
    setEditRoom(doc.room || "Poliklinik 101");
    setEditStatus(doc.availabilityStatus || "AVAILABLE");
    setEditNote(doc.availabilityNote || "");
    setEditBlockedSlots(Array.isArray(doc.unavailableSlots) ? [...doc.unavailableSlots] : []);
    setScheduleSaveMsg("");
    setSubmitError("");
  };

  const toggleEditBlockedSlot = (slot: string) => {
    if (editBlockedSlots.includes(slot)) {
      setEditBlockedSlots(editBlockedSlots.filter((s) => s !== slot));
    } else {
      setEditBlockedSlots([...editBlockedSlots, slot]);
    }
  };

  const handleSaveDoctorAllDetails = async () => {
    if (!selectedDoctor) return;
    setScheduleSaveMsg("");
    setSubmitError("");
    try {
      const payload: Record<string, any> = {
        hours: editHours,
        room: editRoom,
        availabilityStatus: editStatus,
        availabilityNote: editNote,
        unavailableSlots: editBlockedSlots,
      };
      if (canCreateDoctor) {
        payload.fullName = editDocName.trim();
        payload.email = editDocEmail.trim().toLowerCase();
        payload.phone = editDocPhone.trim();
        payload.specialty = editDocSpecialty.trim();
        payload.consultationFee = Number(editDocFee);
        if (editDocPassword.trim()) {
          payload.password = editDocPassword.trim();
        }
      }

      const response = await apiFetch(`${API_URL}/doctors/` + encodeURIComponent(selectedDoctor.id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || tr3(lang, "Bilgiler kaydedilemedi", "تعذر حفظ البيانات", "Could not save details"));
      setSelectedDoctor({ ...selectedDoctor, ...data });
      setEditDocPassword("");
      setScheduleSaveMsg(
        tr3(
          lang,
          "Hekimin tüm bilgileri (ad, e-posta, telefon, muayene ücreti, şifre ve mesai durumu) başarıyla güncellendi!",
          "تم حفظ جميع بيانات الطبيب، أجرة المعاينة، كلمة المرور والدوام بنجاح!",
          "All doctor details (name, email, phone, consultation fee, password, and shift status) updated successfully!"
        )
      );
      onDoctorAdded?.();
      onStaffUpdated?.();
    } catch (error: any) {
      setSubmitError(error.message || tr3(lang, "Kaydetme hatası", "خطأ في الحفظ", "Save error"));
    }
  };

  const handleCreateStaffOrDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      if (formRole === "DOCTOR") {
        const res = await apiFetch(`${API_URL}/doctors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formName.trim(),
            specialty: formSpecialty.trim(),
            departmentName: formSpecialty.split("•")[0].trim(),
            email: formEmail.trim().toLowerCase(),
            password: formPassword.trim(),
            phone: formPhone.trim(),
            room: formRoom.trim(),
            consultationFee: Number(formFee) || 1000,
            fee: `${Number(formFee).toLocaleString("tr-TR")} SYP`,
            hours: formHours.trim(),
            unavailableSlots,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || data.message || tr3(lang, "Doktor eklenirken hata oluştu.", "حدث خطأ أثناء إضافة الطبيب.", "Error adding doctor."));
      } else {
        const res = await apiFetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formName.trim(),
            email: formEmail.trim().toLowerCase(),
            password: formPassword.trim(),
            phone: formPhone.trim(),
            identityNo: formIdentityNo.trim(),
            role: formRole,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || data.error || tr3(lang, "Personel eklenirken hata oluştu.", "حدث خطأ أثناء إضافة الموظف.", "Error adding staff member."));
      }

      const roleMeta = ROLE_LABELS[formRole];
      const roleName = roleMeta ? tr3(lang, roleMeta.tr, roleMeta.ar, roleMeta.en) : formRole;
      setSubmitSuccess(
        tr3(
          lang,
          `${roleName} hesabı (${formName}) başarıyla oluşturuldu ve yetkilendirildi!`,
          `تم إنشاء وتفويض حساب ${roleName} (${formName}) بنجاح!`,
          `${roleName} account (${formName}) created and authorized successfully!`
        )
      );
      onDoctorAdded?.();
      onStaffUpdated?.();

      setTimeout(() => {
        setShowAddModal(false);
        setSubmitSuccess("");
        setFormName("");
        setFormEmail("");
        setFormIdentityNo("");
      }, 1000);
    } catch (err: any) {
      setSubmitError(err.message || tr3(lang, "Bağlantı hatası.", "خطأ في الاتصال.", "Connection error."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStaffMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffMember) return;
    setStaffSaveMsg("");
    setSubmitError("");
    try {
      const payload: Record<string, any> = {
        fullName: editingStaffMember.fullName,
        email: editingStaffMember.email,
        phone: editingStaffMember.phone || "",
        identityNo: editingStaffMember.identityNo || "",
        role: editingStaffMember.role,
        status: editingStaffMember.status || "ACTIVE",
      };
      if (editStaffPassword.trim()) {
        payload.password = editStaffPassword.trim();
      }
      if (editingStaffMember.role === "DOCTOR" && editingStaffMember.consultationFee !== undefined) {
        payload.consultationFee = Number(editingStaffMember.consultationFee);
      }

      const res = await apiFetch(`${API_URL}/users/${encodeURIComponent(editingStaffMember.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || tr3(lang, "Güncelleme başarısız", "فشل التحديث", "Update failed"));

      setStaffSaveMsg(tr3(lang, "Personel bilgileri ve giriş yetkileri başarıyla kaydedildi!", "تم حفظ بيانات الموظف وصلاحياته بنجاح!", "Staff details and credentials saved successfully!"));
      setEditStaffPassword("");
      onStaffUpdated?.();
      onDoctorAdded?.();
      setTimeout(() => {
        setEditingStaffMember(null);
        setStaffSaveMsg("");
      }, 900);
    } catch (err: any) {
      setSubmitError(err.message || tr3(lang, "Hata oluştu", "حدث خطأ", "An error occurred"));
    }
  };

  const roleCounts = {
    ALL: doctors.length + staffList.filter((s) => s.role !== "DOCTOR").length,
    DOCTOR: doctors.length,
    RECEPTIONIST: staffList.filter((s) => s.role === "RECEPTIONIST").length,
    PHARMACIST: staffList.filter((s) => s.role === "PHARMACIST").length,
    ACCOUNTANT: staffList.filter((s) => s.role === "ACCOUNTANT" || s.role === "FINANCE").length,
    LAB_TECH: staffList.filter((s) => s.role === "LAB_TECH").length,
    ADMIN: staffList.filter((s) => s.role === "ADMIN").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DCD0] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFE8DC] border border-[#E5DCD0] text-[#4A2E1B] text-[11px] font-semibold uppercase mb-1">
            <Stethoscope className="w-3 h-3 text-[#B8860B]" />
            <span>
              {canCreateDoctor
                ? tr3(lang, "360° Personel, Roller & Hekim Yetkilendirme Merkezi", "إدارة جميع الموظفين والأطباء والصلاحيات", "360° Staff, Roles & Physician Authorization Hub")
                : `360° ${t.menuDoctorsHub}`}
            </span>
          </div>
          <h3 className="text-xl font-bold font-serif text-[#2C1810]">
            {canCreateDoctor
              ? tr3(lang, "Hekimler & Tüm Klinik Görev Kategorileri Yönetimi", "إدارة الأطباء، الاستقبال، الصيدلية، المحاسبة والمختبر", "Physicians & All Clinic Role Categories Management")
              : t.doctorsTitle}
          </h3>
          <p className="text-xs text-[#5A483B]">
            {canCreateDoctor
              ? tr3(lang, "Doktor, Danışma, Eczacı, Muhasebeci, Laborant veya Yönetici ekleyin; şifre, Gmail, telefon, muayene ücreti (SYP) ve mesai saatlerini düzenleyin.", "إضافة وتعديل حسابات الأطباء، الاستقبال، الصيدلية، المحاسبة، المختبر والإدارة مع كلمات المرور وأجور المعاينة والدوام.", "Add or edit Doctors, Receptionists, Pharmacists, Accountants, Lab Technicians, or Admins, including passwords, emails, phones, fees (SYP), and shifts.")
              : t.doctorsSubtitle}
          </p>
        </div>

        {/* Action Button: Add Any Role (Admin) */}
        {canCreateDoctor && (
          <button
            type="button"
            onClick={() => {
              setSubmitError("");
              setSubmitSuccess("");
              if (selectedRoleTab !== "ALL") setFormRole(selectedRoleTab);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white text-xs font-bold shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>
              {tr3(lang, "+ Yeni Personel / Hekim Ekle & Yetkilendir", "+ إضافة موظف / طبيب جديد وتفويضه", "+ Add & Authorize Staff / Doctor")}
            </span>
          </button>
        )}
      </div>

      {/* ADMIN ROLE CATEGORY TABS */}
      {canCreateDoctor && (
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "ALL", label: tr3(lang, `Tüm Kategoriler (${roleCounts.ALL})`, `جميع الفئات (${roleCounts.ALL})`, `All Categories (${roleCounts.ALL})`) },
              { id: "DOCTOR", label: tr3(lang, `Doktorlar (${roleCounts.DOCTOR})`, `الأطباء (${roleCounts.DOCTOR})`, `Doctors (${roleCounts.DOCTOR})`) },
              { id: "RECEPTIONIST", label: tr3(lang, `Resepsiyon / Danışma (${roleCounts.RECEPTIONIST})`, `الاستقبال (${roleCounts.RECEPTIONIST})`, `Reception (${roleCounts.RECEPTIONIST})`) },
              { id: "PHARMACIST", label: tr3(lang, `Eczacı (${roleCounts.PHARMACIST})`, `الصيدلية (${roleCounts.PHARMACIST})`, `Pharmacist (${roleCounts.PHARMACIST})`) },
              { id: "ACCOUNTANT", label: tr3(lang, `Muhasebeci (${roleCounts.ACCOUNTANT})`, `المحاسبة (${roleCounts.ACCOUNTANT})`, `Accountant (${roleCounts.ACCOUNTANT})`) },
              { id: "LAB_TECH", label: tr3(lang, `Laboratuvar (${roleCounts.LAB_TECH})`, `المختبر (${roleCounts.LAB_TECH})`, `Laboratory (${roleCounts.LAB_TECH})`) },
              { id: "ADMIN", label: tr3(lang, `Yönetici (${roleCounts.ADMIN})`, `الإدارة (${roleCounts.ADMIN})`, `Admin (${roleCounts.ADMIN})`) },
            ] as { id: RoleCategory; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedRoleTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedRoleTab === tab.id
                  ? "bg-[#4A2E1B] text-white border-[#4A2E1B] shadow-xs"
                  : "bg-white text-[#6E492D] border-[#E5DCD0] hover:bg-[#FAF7F2]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-[#E5DCD0] rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-grow w-full">
          <Search className="w-4 h-4 text-[#8A6445] absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              canCreateDoctor
                ? tr3(lang, "Ad soyad, Gmail/e-posta, telefon veya branş ile ara...", "البحث بالاسم، البريد الإلكتروني، الهاتف أو التخصص...", "Search by name, Gmail/email, phone, or department...")
                : t.searchDoctorPlaceholder
            }
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl text-xs text-[#2C1810] placeholder-[#8A796D] focus:outline-none focus:border-[#4A2E1B]"
          />
        </div>

        {showDoctorsSection && (
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
        )}
      </div>

      {/* DOCTORS GRID */}
      {showDoctorsSection && filteredDoctors.length > 0 && (
        <div className="space-y-3">
          {canCreateDoctor && selectedRoleTab === "ALL" && (
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E492D]">
              {tr3(lang, `Uzman Hekim Kadrosu (${filteredDoctors.length})`, `الكادر الطبي الاستشاري (${filteredDoctors.length})`, `Specialist Physicians (${filteredDoctors.length})`)}
            </h4>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
            {filteredDoctors.map((doc) => {
              const docApps = appointments.filter(
                (a) =>
                  a.doctorId === doc.id ||
                  a.doctor?.fullName === doc.fullName ||
                  a.doctor?.email === doc.email
              );
              const activeQueueCount = docApps.filter(
                (a) => a.status === "WAITING" || a.status === "CONFIRMED"
              ).length;

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
                        <span className="inline-block px-2 py-0.5 mb-1 rounded-full text-[9px] font-bold border bg-emerald-50 text-emerald-800 border-emerald-200 uppercase">
                          {tr3(lang, "DOKTOR", "طبيب", "DOCTOR")}
                        </span>
                        <h4 className="text-sm font-bold text-[#2C1810] font-serif truncate">{doc.fullName}</h4>
                        <p className="text-[11px] font-semibold text-[#8A6445] truncate">
                          {doc.department?.name || (doc as any).specialty || tr3(lang, "Poliklinik", "عيادة", "Clinic")}
                        </p>
                        <p className="text-[10px] text-[#7D6E63] font-mono truncate mt-0.5">{doc.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2 py-3 border-y border-[#E5DCD0] text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[#7D6E63]">{t.consultationFee}:</span>
                        <strong className="text-emerald-700 font-mono font-bold">
                          {(doc.consultationFee || 1000).toLocaleString("tr-TR")} {t.currency}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#7D6E63]">{t.scheduleHours}:</span>
                        <span className="text-[#2C1810] font-medium font-mono text-[11px]">
                          {doc.hours || "09:00 - 17:00"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#7D6E63]">{tr3(lang, "Durum:", "الحالة:", "Status:")}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            doc.availabilityStatus === "ON_LEAVE"
                              ? "bg-red-50 text-red-800 border-red-200"
                              : doc.availabilityStatus === "EVENING_SHIFT"
                              ? "bg-purple-50 text-purple-900 border-purple-200"
                              : doc.availabilityStatus === "EMERGENCY_ONLY"
                              ? "bg-amber-50 text-amber-900 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {doc.availabilityStatus === "ON_LEAVE"
                            ? tr3(lang, "İzinli / Raporlu", "في إجازة / غير متاح", "On Leave")
                            : doc.availabilityStatus === "EVENING_SHIFT"
                            ? tr3(lang, "Akşam Mesaisinde", "مناوبة مسائية", "Evening Shift")
                            : doc.availabilityStatus === "EMERGENCY_ONLY"
                            ? tr3(lang, "Sadece Acil", "طوارئ فقط", "Emergency Only")
                            : tr3(lang, "Müsait • Aktif", "متاح • نشط", "Available • Active")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#7D6E63]">{t.doctorQueueToday}:</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          {activeQueueCount} {t.activePatients}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openDoctorModal(doc)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-sm"
                    >
                      <span>{canCreateDoctor ? tr3(lang, "Bilgi / Ücret / Şifre Düzenle", "تعديل البيانات والأجرة وكلمة المرور", "Edit Info / Fee / Password") : t.inspectDoctor}</span>
                      <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                    {onSwitchDoctor && (
                      <button
                        type="button"
                        onClick={() => onSwitchDoctor(doc)}
                        title={tr3(lang, "Bu Hekim Olarak Muayene Ekranına Geç", "فتح شاشة معاينة هذا الطبيب", "Open Consultation Workspace as This Doctor")}
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
        </div>
      )}

      {/* NON-DOCTOR STAFF CARDS (RECEPTIONIST, PHARMACIST, ACCOUNTANT, LAB_TECH, ADMIN) */}
      {canCreateDoctor && selectedRoleTab !== "DOCTOR" && nonDoctorStaff.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E492D] flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#B8860B]" />
            <span>
              {tr3(lang, `Klinik Operasyon, Danışma, Eczane, Muhasebe & Yönetim Kadrosu (${nonDoctorStaff.length})`, `كادر الاستقبال، الصيدلية، المحاسبة، المختبر والإدارة (${nonDoctorStaff.length})`, `Reception, Pharmacy, Accounting, Lab & Admin Staff (${nonDoctorStaff.length})`)}
            </span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {nonDoctorStaff.map((st) => {
              const normRole = (st.role === "FINANCE" ? "ACCOUNTANT" : st.role) as Exclude<RoleCategory, "ALL">;
              const meta = ROLE_LABELS[normRole] || {
                tr: st.role,
                ar: st.role,
                en: st.role,
                badge: "bg-stone-100 text-stone-800 border-stone-200",
              };
              return (
                <div
                  key={st.id}
                  className="bg-white border border-[#E5DCD0] hover:border-[#B8860B]/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.badge}`}>
                        {tr3(lang, meta.tr, meta.ar, meta.en)}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          st.status === "SUSPENDED" ? "text-red-600" : "text-emerald-700"
                        }`}
                      >
                        {st.status === "SUSPENDED" ? tr3(lang, "Askıda", "معلق", "Suspended") : tr3(lang, "Aktif", "نشط", "Active")}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold font-serif text-[#2C1810]">{st.fullName}</h4>
                    <div className="text-[11px] text-[#6E492D] font-mono space-y-0.5 pt-1 border-t border-[#F3EDE2]">
                      <div className="truncate" title={st.email}>
                        ✉️ {st.email}
                      </div>
                      <div>📞 {st.phone || "0989111242"}</div>
                      {st.identityNo && <div>🪪 {st.identityNo}</div>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitError("");
                      setStaffSaveMsg("");
                      setEditStaffPassword("");
                      setEditingStaffMember({
                        ...st,
                        role: st.role === "FINANCE" ? "ACCOUNTANT" : st.role,
                      });
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{tr3(lang, "Bilgileri & Şifreyi Düzenle", "تعديل البيانات وكلمة المرور", "Edit Profile & Password")}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD ANY STAFF ROLE OR DOCTOR */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#2C1810]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E5DCD0] rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-5 shadow-2xl relative animate-fadeIn my-8">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 rtl:right-auto rtl:left-5 top-5 p-1.5 rounded-full bg-[#FAF7F2] text-[#6E492D] hover:bg-[#EFE8DC] transition-colors border border-[#E5DCD0]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#E5DCD0] pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFE8DC] border border-[#E5DCD0] text-[#4A2E1B] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-[#B8860B]" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-[#2C1810]">
                  {tr3(lang, "Yeni Personel / Hekim Ekle & Kategoriye Göre Yetkilendir", "إضافة موظف / طبيب جديد وتفويضه حسب الفئة", "Add New Staff / Physician & Authorize by Role Category")}
                </h3>
                <p className="text-xs text-[#7D6E63]">
                  {tr3(lang, "Doktor, Resepsiyon/Danışma, Eczacı, Muhasebeci, Laborant veya Yönetici hesabını tek tek açın.", "إنشاء حساب طبيب، استقبال، صيدلي، محاسب، فني مختبر أو مدير نظام.", "Create an account for a Doctor, Receptionist, Pharmacist, Accountant, Lab Technician, or Administrator.")}
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

            <form onSubmit={handleCreateStaffOrDoctor} className="space-y-4">
              {/* Role Category Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#4A2E1B]">
                  {tr3(lang, "1. Görev Kategorisi / Sistem Rolü Seçin *", "1. اختر الفئة الوظيفية / صلاحية النظام *", "1. Select Role Category *")}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      "DOCTOR",
                      "RECEPTIONIST",
                      "PHARMACIST",
                      "ACCOUNTANT",
                      "LAB_TECH",
                      "ADMIN",
                    ] as Exclude<RoleCategory, "ALL">[]
                  ).map((rKey) => (
                    <button
                      key={rKey}
                      type="button"
                      onClick={() => setFormRole(rKey)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-left rtl:text-right ${
                        formRole === rKey
                          ? "bg-[#4A2E1B] text-white border-[#4A2E1B] shadow-sm"
                          : "bg-[#FAF7F2] text-[#4A2E1B] border-[#E5DCD0] hover:bg-[#EFE8DC]"
                      }`}
                    >
                      {tr3(lang, ROLE_LABELS[rKey].tr, ROLE_LABELS[rKey].ar, ROLE_LABELS[rKey].en)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Identity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#4A2E1B] font-bold mb-1">{tr3(lang, "Ad Soyad *", "الاسم الكامل *", "Full Name *")}</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={formRole === "DOCTOR" ? tr3(lang, "Örn: Dr. Kerem Aksoy", "مثال: د. كريم آقصوي", "e.g., Dr. Kerem Aksoy") : tr3(lang, "Örn: Ayşe Yılmaz", "مثال: عائشة يلماز", "e.g., Ayse Yilmaz")}
                    className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl text-xs text-[#2C1810]"
                  />
                </div>
                {formRole === "DOCTOR" ? (
                  <div>
                    <label className="block text-[#4A2E1B] font-bold mb-1">{tr3(lang, "Uzmanlık Alanı / Branş *", "التخصص الطبي *", "Medical Specialty *")}</label>
                    <input
                      type="text"
                      required
                      value={formSpecialty}
                      onChange={(e) => setFormSpecialty(e.target.value)}
                      placeholder={tr3(lang, "Örn: Kardiyoloji", "مثال: القلبية", "e.g., Cardiology")}
                      className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl text-xs text-[#2C1810]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[#4A2E1B] font-bold mb-1">{tr3(lang, "Kimlik No (İsteğe Bağlı)", "الرقم الوطني (اختياري)", "National ID (Optional)")}</label>
                    <input
                      type="text"
                      value={formIdentityNo}
                      onChange={(e) => setFormIdentityNo(e.target.value)}
                      placeholder="1020304050"
                      className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl text-xs text-[#2C1810] font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Login Credentials & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0]">
                <div>
                  <label className="block text-[#4A2E1B] font-bold mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#B8860B]" />
                    <span>{tr3(lang, "Giriş E-postası / Gmail *", "البريد الإلكتروني / Gmail *", "Login Email / Gmail *")}</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@gmail.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-[#E5DCD0] rounded-lg text-xs text-[#2C1810] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#4A2E1B] font-bold mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#B8860B]" />
                    <span>{tr3(lang, "Giriş Şifresi *", "كلمة المرور *", "Login Password *")}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-[#E5DCD0] rounded-lg text-xs text-[#2C1810] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#4A2E1B] font-bold mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#B8860B]" />
                    <span>{t.phone}</span>
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-[#E5DCD0] rounded-lg text-xs text-[#2C1810] font-mono"
                  />
                </div>
              </div>

              {/* Doctor-Specific Fields */}
              {formRole === "DOCTOR" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[#4A2E1B] font-bold mb-1">{tr3(lang, "Poliklinik Oda No", "رقم غرفة العيادة", "Clinic Room No")}</label>
                      <input
                        type="text"
                        value={formRoom}
                        onChange={(e) => setFormRoom(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl text-xs text-[#2C1810]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4A2E1B] font-bold mb-1">{t.scheduleHours}</label>
                      <input
                        type="text"
                        value={formHours}
                        onChange={(e) => setFormHours(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl text-xs text-[#2C1810] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[#4A2E1B] font-bold mb-1">{t.consultationFee} ({t.currency}) *</label>
                      <input
                        type="number"
                        required
                        value={formFee}
                        onChange={(e) => setFormFee(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl text-xs text-[#2C1810] font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A2E1B]">
                        <Clock className="w-4 h-4 text-[#B8860B]" />
                        <span>{tr3(lang, "Saat Slotları Müsaitlik Yönetimi", "إدارة توفر الفترات الزمنية", "Time Slot Availability")}</span>
                      </div>
                      <span className="text-[10px] text-[#7D6E63]">{tr3(lang, "Kırmızı: Kapalı | Yeşil: Müsait", "أحمر: مغلق | أخضر: متاح", "Red: Closed | Green: Available")}</span>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-1">
                      {ALL_TIME_SLOTS.slice(0, 16).map((slot) => {
                        const isUnavailable = unavailableSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => toggleSlotAvailability(slot)}
                            className={`py-1.5 px-1 rounded-lg text-[11px] font-mono font-bold transition-all text-center border ${
                              isUnavailable
                                ? "bg-red-100 text-red-800 border-red-300 line-through"
                                : "bg-emerald-100 text-emerald-900 border-emerald-300"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5DCD0] text-xs font-semibold text-[#4A2E1B] hover:bg-[#FAF7F2]"
                >
                  {tr3(lang, "İptal", "إلغاء", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>
                    {isSubmitting
                      ? tr3(lang, "Kaydediliyor...", "جاري الحفظ...", "Saving...")
                      : tr3(
                          lang,
                          `${ROLE_LABELS[formRole].tr} Kaydet & Yetkilendir`,
                          `حفظ وتفويض ${ROLE_LABELS[formRole].ar}`,
                          `Save & Authorize ${ROLE_LABELS[formRole].en}`
                        )}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DOCTOR DRILL-DOWN & FULL ADMIN EDITOR */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-[#2C1810]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E5DCD0] rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative animate-fadeIn my-8 max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedDoctor(null)}
              className="absolute right-5 rtl:right-auto rtl:left-5 top-5 p-1.5 rounded-full bg-[#FAF7F2] text-[#6E492D] hover:bg-[#EFE8DC] transition-colors border border-[#E5DCD0]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-[#E5DCD0] pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EFE8DC] to-[#E5DCD0] flex items-center justify-center text-[#4A2E1B] shrink-0 font-bold border border-[#E5DCD0]">
                <User className="w-7 h-7" />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold font-serif text-[#2C1810]">{selectedDoctor.fullName}</h3>
                <p className="text-xs text-[#8A6445] font-semibold">
                  {selectedDoctor.department?.name || (selectedDoctor as any).specialty}
                </p>
                <p className="text-[11px] text-[#7D6E63] font-mono">
                  {selectedDoctor.email} • {selectedDoctor.phone} • {(selectedDoctor.consultationFee || 1000).toLocaleString("tr-TR")} {t.currency}
                </p>
              </div>
            </div>

            {scheduleSaveMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{scheduleSaveMsg}</span>
              </div>
            )}
            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* ADMIN FULL PROFILE, GMAIL, PHONE, FEE & PASSWORD EDITOR */}
            {canCreateDoctor && (
              <div className="p-4 bg-[#FAF7F2] border border-[#E5DCD0] rounded-2xl space-y-3 text-xs">
                <div className="font-bold text-[#4A2E1B] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#B8860B]" />
                  <span>{tr3(lang, "Hekim Kimlik, Gmail, Telefon, Muayene Ücreti (SYP) & Giriş Şifresi Yönetimi", "إدارة بيانات الطبيب، البريد، الهاتف، أجرة المعاينة (ل.س) وكلمة المرور", "Physician Identity, Gmail, Phone, Consultation Fee (SYP) & Password Management")}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Ad Soyad", "الاسم الكامل", "Full Name")}</label>
                    <input
                      type="text"
                      value={editDocName}
                      onChange={(e) => setEditDocName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD2C1]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Uzmanlık / Branş", "التخصص الطبي", "Specialty / Department")}</label>
                    <input
                      type="text"
                      value={editDocSpecialty}
                      onChange={(e) => setEditDocSpecialty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD2C1]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Giriş E-postası / Gmail", "البريد الإلكتروني / Gmail", "Login Email / Gmail")}</label>
                    <input
                      type="email"
                      value={editDocEmail}
                      onChange={(e) => setEditDocEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD2C1] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#4A2E1B] mb-1">{t.phone}</label>
                    <input
                      type="text"
                      value={editDocPhone}
                      onChange={(e) => setEditDocPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD2C1] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-800 mb-1">{t.consultationFee} ({t.currency})</label>
                    <input
                      type="number"
                      min={0}
                      value={editDocFee}
                      onChange={(e) => setEditDocFee(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 font-mono font-bold text-emerald-900"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <label className="block text-[10px] font-bold text-[#4A2E1B] mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>{tr3(lang, "Yeni Giriş Şifresi Belirle (Değiştirmek istemiyorsanız boş bırakın)", "تعيين كلمة مرور جديدة (اتركه فارغاً للإبقاء على الحالية)", "Set New Login Password (leave blank to keep current)")}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={tr3(lang, "Yeni şifre yazın...", "أدخل كلمة المرور الجديدة...", "Enter new password...")}
                    value={editDocPassword}
                    onChange={(e) => setEditDocPassword(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-amber-300 font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {/* Interactive Shift, Sick Leave & Availability Editor */}
            <div className="p-4 bg-[#FAF7F2] border border-[#E5DCD0] rounded-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#4A2E1B]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#B8860B]" />
                  <span>{tr3(lang, "Canlı Mesai, İzin/Hastalık & Ziyaretçi Sitesi Müsaitlik Yönetimi", "إدارة الدوام والإجازات وحالة التوفر في موقع الزوار", "Live Shift, Leave & Visitor Portal Availability Management")}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEditStatus("AVAILABLE");
                    if (editHours.includes("21:00")) setEditHours("09:00 - 17:00");
                  }}
                  className={`p-2.5 rounded-xl border font-bold transition-all text-center ${
                    editStatus === "AVAILABLE"
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                      : "bg-white text-emerald-900 border-[#E5DCD0] hover:bg-emerald-50"
                  }`}
                >
                  ✓ {tr3(lang, "Normal Mesai", "دوام اعتيادي", "Regular Shift")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditStatus("EVENING_SHIFT");
                    setEditHours("09:00 - 21:00");
                    if (!editNote) setEditNote(tr3(lang, "Akşam 21:00'e kadar mesai açık", "الدوام المسائي مفتوح حتى 21:00", "Evening shift open until 21:00"));
                  }}
                  className={`p-2.5 rounded-xl border font-bold transition-all text-center ${
                    editStatus === "EVENING_SHIFT"
                      ? "bg-purple-700 text-white border-purple-700 shadow-sm"
                      : "bg-white text-purple-900 border-[#E5DCD0] hover:bg-purple-50"
                  }`}
                >
                  🌙 {tr3(lang, "Akşam Mesaisi", "مناوبة مسائية", "Evening Shift")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditStatus("ON_LEAVE");
                    if (!editNote) setEditNote(tr3(lang, "Hekimimiz bugün hastalık/izin nedeniyle müsait değildir", "الطبيب في إجازة اليوم وغير متاح للمعاينة", "Doctor is currently on leave today"));
                  }}
                  className={`p-2.5 rounded-xl border font-bold transition-all text-center ${
                    editStatus === "ON_LEAVE"
                      ? "bg-red-700 text-white border-red-700 shadow-sm"
                      : "bg-white text-red-900 border-[#E5DCD0] hover:bg-red-50"
                  }`}
                >
                  ⛔ {tr3(lang, "Hasta / İzinli", "مريض / في إجازة", "Sick / On Leave")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditStatus("EMERGENCY_ONLY");
                    if (!editNote) setEditNote(tr3(lang, "Ameliyatta / Sadece acil vaka", "في العمليات / للحالات الإسعافية فقط", "In Surgery / Emergency Only"));
                  }}
                  className={`p-2.5 rounded-xl border font-bold transition-all text-center ${
                    editStatus === "EMERGENCY_ONLY"
                      ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                      : "bg-white text-amber-900 border-[#E5DCD0] hover:bg-amber-50"
                  }`}
                >
                  ⚠️ {tr3(lang, "Sadece Acil", "طوارئ فقط", "Emergency Only")}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-[#4A2E1B] mb-1">{t.scheduleHours}</label>
                  <input
                    type="text"
                    value={editHours}
                    onChange={(e) => setEditHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD2C1] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Poliklinik Oda", "غرفة العيادة", "Clinic Room")}</label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD2C1] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Ziyaretçi Bilgi Notu", "ملاحظة للزوار والمرضى", "Visitor Status Note")}</label>
                  <input
                    type="text"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD2C1] text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-[#6E492D]">
                  {tr3(lang, "Saat Saat Aç / Kapat (Yeşil: Müsait • Kırmızı: Kapalı):", "فتح / إغلاق الساعات (أخضر: متاح • أحمر: مغلق):", "Toggle Individual Hours (Green: Available • Red: Closed):")}
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {(editStatus === "EVENING_SHIFT" ? ALL_TIME_SLOTS : ALL_TIME_SLOTS.slice(0, 16)).map((slot) => {
                    const blocked = editBlockedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleEditBlockedSlot(slot)}
                        className={`py-1.5 rounded-lg text-[11px] font-mono font-bold border transition-all ${
                          blocked
                            ? "bg-red-100 text-red-800 border-red-300 line-through"
                            : "bg-emerald-100 text-emerald-900 border-emerald-300"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveDoctorAllDetails}
                  className="px-6 py-2.5 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs shadow-md transition-all"
                >
                  {tr3(lang, "Tüm Bilgileri, Ücreti & Mesai Durumunu Kaydet", "حفظ جميع البيانات والأجرة وحالة الدوام", "Save All Details, Fee & Shift Status")}
                </button>
              </div>
            </div>

            {/* Footer Modal Action */}
            <div className="pt-4 border-t border-[#E5DCD0] flex flex-wrap items-center justify-between gap-2">
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
                  <span>{tr3(lang, "Bu Doktor Olarak Giriş Yap & Muayene Ekranını Aç", "الدخول كطبيب وفتح شاشة المعاينة", "Act as This Doctor & Open Consultation Workspace")}</span>
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

      {/* MODAL 3: EDIT NON-DOCTOR STAFF (RECEPTIONIST, PHARMACIST, ACCOUNTANT, LAB_TECH, ADMIN) */}
      {editingStaffMember && (
        <div className="fixed inset-0 z-50 bg-[#2C1810]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5DCD0] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setEditingStaffMember(null)}
              className="absolute right-4 rtl:right-auto rtl:left-4 top-4 p-1.5 rounded-full bg-[#FAF7F2] text-[#6E492D]"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-serif font-bold text-[#2C1810]">
                {tr3(lang, "Personel Bilgileri, Rolü & Giriş Şifresini Düzenle", "تعديل بيانات الموظف والصلاحية وكلمة المرور", "Edit Staff Details, Role & Login Password")}
              </h3>
              <p className="text-xs text-[#7D6E63]">
                {tr3(lang, "Ad soyad, Gmail/e-posta, telefon, kimlik, kategori ve şifreyi güncelleyin.", "تحديث الاسم، البريد الإلكتروني، الهاتف، الرقم الوطني، الفئة وكلمة المرور.", "Update full name, Gmail/email, phone, national ID, role category, and password.")}
              </p>
            </div>

            {staffSaveMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                {staffSaveMsg}
              </div>
            )}
            {submitError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold">
                {submitError}
              </div>
            )}

            <form onSubmit={handleUpdateStaffMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Ad Soyad *", "الاسم الكامل *", "Full Name *")}</label>
                <input
                  type="text"
                  required
                  value={editingStaffMember.fullName || ""}
                  onChange={(e) =>
                    setEditingStaffMember({ ...editingStaffMember, fullName: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Gmail / E-posta *", "البريد الإلكتروني *", "Gmail / Email *")}</label>
                  <input
                    type="email"
                    required
                    value={editingStaffMember.email || ""}
                    onChange={(e) =>
                      setEditingStaffMember({ ...editingStaffMember, email: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#4A2E1B] mb-1">{t.phone}</label>
                  <input
                    type="text"
                    value={editingStaffMember.phone || ""}
                    onChange={(e) =>
                      setEditingStaffMember({ ...editingStaffMember, phone: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Görev Kategorisi", "الفئة الوظيفية", "Role Category")}</label>
                  <select
                    value={editingStaffMember.role}
                    onChange={(e) =>
                      setEditingStaffMember({ ...editingStaffMember, role: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1] font-bold"
                  >
                    <option value="RECEPTIONIST">{t.roleReceptionist}</option>
                    <option value="PHARMACIST">{t.rolePharmacist}</option>
                    <option value="ACCOUNTANT">{t.roleAccountant}</option>
                    <option value="LAB_TECH">{t.roleLabTech}</option>
                    <option value="DOCTOR">{t.roleDoctor}</option>
                    <option value="ADMIN">{t.roleAdmin}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#4A2E1B] mb-1">{tr3(lang, "Durum", "الحالة", "Status")}</label>
                  <select
                    value={editingStaffMember.status || "ACTIVE"}
                    onChange={(e) =>
                      setEditingStaffMember({ ...editingStaffMember, status: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1] font-bold"
                  >
                    <option value="ACTIVE">{tr3(lang, "Aktif", "نشط", "Active")}</option>
                    <option value="SUSPENDED">{tr3(lang, "Askıda / Kapalı", "معلق", "Suspended")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4A2E1B] mb-1">{t.identityNo}</label>
                <input
                  type="text"
                  value={editingStaffMember.identityNo || ""}
                  onChange={(e) =>
                    setEditingStaffMember({ ...editingStaffMember, identityNo: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1] font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <label className="block font-bold text-[#4A2E1B] mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>{tr3(lang, "Yeni Giriş Şifresi (Değiştirmek için yazın)", "كلمة مرور جديدة (اكتبها للتغيير)", "New Login Password (type to change)")}</span>
                </label>
                <input
                  type="text"
                  placeholder={tr3(lang, "Boş bırakılırsa mevcut şifre korunur...", "اتركه فارغاً للإبقاء على كلمة المرور الحالية...", "Leave blank to keep current password...")}
                  value={editStaffPassword}
                  onChange={(e) => setEditStaffPassword(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white border border-amber-300 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs shadow-md transition-all"
              >
                {tr3(lang, "Değişiklikleri Kaydet", "حفظ التغييرات", "Save Changes")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
