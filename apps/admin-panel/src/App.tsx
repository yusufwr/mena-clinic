import { clinicDate } from "./clinicDate";
import { apiFetch, API_URL } from "./apiClient";
import { SyrianFlag, TurkishFlag, UkFlag } from "./components/FlagIcon";
import React, { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Calendar as CalendarIcon,
  FileText,
  Package,
  Layers,
  Activity,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Plus,
  RefreshCw,
  Search,
  Check,
  X,
  FileDigit,
  LogOut,
  Upload,
  Lock,
  Clock,
  ShieldAlert,
  Stethoscope,
  Globe,
  PieChart,
  HeartPulse,
  Receipt,
  FileDown,
  Menu
} from "lucide-react";
import { adminTranslations, AdminLang, tr3 } from "./i18n";
import { DoctorsHub } from "./components/DoctorsHub";
import { AccountantHub } from "./components/AccountantHub";
import { DoctorWorkspace } from "./components/DoctorWorkspace";
import { LegacyDataBackup } from "./components/LegacyDataBackup";
import { SystemBackupRestore } from "./components/SystemBackupRestore";
import { CashierHub } from "./components/CashierHub";
import { PatientSearchSelect } from "./components/PatientSearchSelect";
import { LaboratoryHub } from "./components/LaboratoryHub";

export const DOCTOR_ACCOUNTS_LIST = [
  { role: "DOCTOR", nameTr: "Dr. Rustam Horo", nameAr: "د. رستم هورو", nameEn: "Dr. Rustam Horo", email: "gastro.horo@menaclinic.com", specTr: "Gastroenteroloji", specAr: "الهضمية", specEn: "Gastroenterology", room: "Poliklinik 101" },
  { role: "DOCTOR", nameTr: "Dr. Abdulrahman Al-Shebb", nameAr: "د. عبدالرحمن الشب", nameEn: "Dr. Abdulrahman Al-Shebb", email: "cardio.shebb@menaclinic.com", specTr: "Kardiyoloji", specAr: "القلبية", specEn: "Cardiology", room: "Poliklinik 102" },
  { role: "DOCTOR", nameTr: "Dr. Barkhadan Horo", nameAr: "د. برخدان هورو", nameEn: "Dr. Barkhadan Horo", email: "cardio.horo@menaclinic.com", specTr: "Kardiyoloji", specAr: "القلبية", specEn: "Cardiology", room: "Poliklinik 103" },
  { role: "DOCTOR", nameTr: "Dr. Fouad Takko", nameAr: "د. فؤاد طكو", nameEn: "Dr. Fouad Takko", email: "ortho.takko@menaclinic.com", specTr: "Ortopedi", specAr: "العظمية", specEn: "Orthopedics", room: "Poliklinik 104" },
  { role: "DOCTOR", nameTr: "Dr. Ahmad Abdulrazzaq", nameAr: "د. احمد عبدالرزاق", nameEn: "Dr. Ahmad Abdulrazzaq", email: "uro.razzaq@menaclinic.com", specTr: "Üroloji", specAr: "البولية", specEn: "Urology", room: "Poliklinik 105" },
  { role: "DOCTOR", nameTr: "Dr. Abdulatif Qadi", nameAr: "د. عبداللطيف قاضي", nameEn: "Dr. Abdulatif Qadi", email: "uro.qadi@menaclinic.com", specTr: "Üroloji", specAr: "البولية", specEn: "Urology", room: "Poliklinik 106" },
  { role: "DOCTOR", nameTr: "Dr. Lodia Haddad", nameAr: "د. لوديا حداد", nameEn: "Dr. Lodia Haddad", email: "derma.haddad@menaclinic.com", specTr: "Dermatoloji", specAr: "الجلدية", specEn: "Dermatology", room: "Poliklinik 107" },
  { role: "DOCTOR", nameTr: "Dr. Ibrahim Al-Masri", nameAr: "د. ابراهيم المصري", nameEn: "Dr. Ibrahim Al-Masri", email: "dental.masri@menaclinic.com", specTr: "Diş Cerrahisi", specAr: "جراحة الأسنان وتجميلها", specEn: "Dental Surgery", room: "Poliklinik 108" },
  { role: "DOCTOR", nameTr: "Dr. Hussein Al-Ahmad", nameAr: "د. حسين الاحمد", nameEn: "Dr. Hussein Al-Ahmad", email: "ped.ahmad@menaclinic.com", specTr: "Çocuk Sağlığı", specAr: "الأطفال", specEn: "Pediatrics", room: "Poliklinik 109" },
  { role: "DOCTOR", nameTr: "Dr. Ahmad Azzawi", nameAr: "د. احمد عزاوي", nameEn: "Dr. Ahmad Azzawi", email: "pedcardio.azzawi@menaclinic.com", specTr: "Çocuk Kardiyoloji", specAr: "قلبية أطفال", specEn: "Pediatric Cardiology", room: "Poliklinik 110" },
  { role: "DOCTOR", nameTr: "Dr. Majid Shamoun", nameAr: "د. ماجد شمعون", nameEn: "Dr. Majid Shamoun", email: "dental.shamoun@menaclinic.com", specTr: "Ağız ve Çene Cerrahisi", specAr: "جراحة الفم والوجه والفكين", specEn: "Oral & Maxillofacial Surgery", room: "Poliklinik 111" },
  { role: "ADMIN", nameTr: "Yönetici Ahmet", nameAr: "المدير أحمد", nameEn: "Admin Ahmet", email: "admin@menaclinic.com", specTr: "Genel Yönetim", specAr: "الإدارة العامة", specEn: "General Administration", room: "Yönetim 301" }
];

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("staff_token"));
  const [user, setUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [lang, setLang] = useState<AdminLang>(() => (localStorage.getItem("admin_lang") as AdminLang) || "tr");
  const t = adminTranslations[lang] || adminTranslations.tr;

  const handleLanguageChange = (newLang: AdminLang) => {
    setLang(newLang);
    localStorage.setItem("admin_lang", newLang);
  };

  // Login Form
  const [loginForm, setLoginForm] = useState({ email: "", password: "123" });

  // Common Lists
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [financeReport, setFinanceReport] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Forms / Actions States
  // 1. Receptionist
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    fullName: "", phone: "", identityNo: "", email: "", bloodType: "A+", emergencyContact: "", insuranceInfo: ""
  });
  const [showAddApp, setShowAddApp] = useState(false);
  const [newApp, setNewApp] = useState({ patientId: "", doctorId: "", slotTime: "" });
  const [doctorSlots, setDoctorSlots] = useState<string[]>([]);
  const [doctorAllSlots, setDoctorAllSlots] = useState<string[]>([]);
  const [doctorBlockedSlots, setDoctorBlockedSlots] = useState<string[]>([]);
  const [slotDate, setSlotDate] = useState("");
  const [patientDirectoryQuery, setPatientDirectoryQuery] = useState("");
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>("ALL");

  // 2. Doctor
  const [selectedQueueApp, setSelectedQueueApp] = useState<any>(null);
  const [soapNotes, setSoapNotes] = useState({ diagnosis: "", clinicalNotes: "" });
  const [prescDrugs, setPrescDrugs] = useState<any[]>([]);
  const [reqTests, setReqTests] = useState<string[]>([]);
  const [drugInput, setDrugInput] = useState({ itemName: "", dosage: "", quantity: 1 });
  const [testInput, setTestInput] = useState("");
  const [pastRecords, setPastRecords] = useState<any[]>([]);
  const [amendmentText, setAmendmentText] = useState("");
  const [showAmendmentId, setShowAmendmentId] = useState<string | null>(null);

  // 3. Pharmacist
  const [searchPresc, setSearchPresc] = useState("");

  // 4. Lab Tech
  const [selectedLabOrder, setSelectedLabOrder] = useState<any>(null);
  const [labResultText, setLabResultText] = useState("");

  // 5. Admin & Multi-Doctor Override
  const [selectedDoctorOverrideId, setSelectedDoctorOverrideId] = useState<string>("");
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    email: "",
    password: "123",
    fullName: "",
    phone: "0989111242",
    identityNo: "",
    role: "RECEPTIONIST",
    consultationFee: 1000,
    specialty: "Genel Poliklinik",
  });
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [editingStaffPassword, setEditingStaffPassword] = useState<string>("");
  const [showEditItem, setShowEditItem] = useState<any>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ itemName: "", SKU: "", stockQuantity: 100, supplierPrice: 0, retailPrice: 0, expiryDate: "" });

  // Get current user details
  useEffect(() => {
    if (token) {
      apiFetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setUser(data.user);
        // Set initial menu based on role
        const role = data.user.role;
        if (role === "RECEPTIONIST") setActiveMenu("reception");
        else if (role === "DOCTOR") setActiveMenu("doctor");
        else if (role === "PHARMACIST") setActiveMenu("pharmacy");
        else if (role === "LAB_TECH") setActiveMenu("lab");
        else if (role === "ACCOUNTANT") setActiveMenu("accountant");
        else if (role === "ADMIN") setActiveMenu("admin_overview");
        else if (role === "FINANCE") setActiveMenu("accountant");
      })
      .catch(() => handleLogout());
    }
  }, [token]);

  // Load menu-based datasets
  useEffect(() => {
    if (!token || !user) return;

    if (activeMenu === "reception" || activeMenu === "cashier") {
      fetchPatients();
      fetchDoctors();
      fetchAppointments();
    } else if (activeMenu === "doctor") {
      fetchAppointments();
      fetchDoctors();
      fetchPatients();
      fetchLabOrders();
    } else if (activeMenu === "doctors_hub" && user.role !== "ADMIN") {
      fetchDoctors();
      fetchAppointments();
      fetchPatients();
    } else if (activeMenu === "pharmacy") {
      fetchPrescriptions();
      fetchInventory();
    } else if (activeMenu === "lab") {
      fetchLabOrders();
      fetchPatients();
      fetchDoctors();
    } else if (activeMenu === "admin_fin") {
      fetchFinanceReport();
      fetchAuditLogs();
      fetchInventory();
      fetchStaffList();
    } else if (activeMenu === "accountant" && user.role !== "ADMIN") {
      fetchDoctors(); fetchAppointments(); fetchInventory(); fetchPrescriptions(); fetchFinanceReport();
    } else if (activeMenu === "admin_overview" || activeMenu === "doctors_hub" || activeMenu === "accountant") {
      fetchDoctors();
      fetchAppointments();
      fetchPatients();
      fetchInventory();
      fetchPrescriptions();
      fetchFinanceReport();
      fetchAuditLogs();
      fetchStaffList();
    }
  }, [token, user, activeMenu]);

  // Fetch functions
  const fetchPatients = () => {
    apiFetch(`${API_URL}/patients`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => { if (!res.ok) throw new Error((await res.json()).message); return res.json(); }).then(data => { if (Array.isArray(data)) setPatients(data); }).catch(err => setErrorMsg(err.message));
  };
  const fetchDoctors = () => {
    apiFetch(`${API_URL}/doctors`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => { if (!res.ok) throw new Error((await res.json()).message); return res.json(); }).then(data => { if (Array.isArray(data)) setDoctors(data); }).catch(err => setErrorMsg(err.message));
  };
  const fetchAppointments = () => {
    apiFetch(`${API_URL}/appointments`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => { if (!res.ok) throw new Error((await res.json()).message); return res.json(); }).then(data => { if (Array.isArray(data)) setAppointments(data); }).catch(err => setErrorMsg(err.message));
  };
  const fetchPrescriptions = () => {
    apiFetch(`${API_URL}/prescriptions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => { if (!res.ok) throw new Error((await res.json()).message); return res.json(); }).then(data => { if (Array.isArray(data)) setPrescriptions(data); }).catch(err => setErrorMsg(err.message));
  };
  const fetchInventory = () => {
    apiFetch(`${API_URL}/inventory`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => { if (!res.ok) throw new Error((await res.json()).message); return res.json(); }).then(data => { if (Array.isArray(data)) setInventory(data); }).catch(err => setErrorMsg(err.message));
  };
  const fetchLabOrders = () => {
    apiFetch(`${API_URL}/lab-orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => { if (!res.ok) throw new Error((await res.json()).message); return res.json(); }).then(data => { if (Array.isArray(data)) setLabOrders(data); }).catch(err => setErrorMsg(err.message));
  };
  const fetchFinanceReport = () => {
    apiFetch(`${API_URL}/finance/report`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => { if (!res.ok) throw new Error((await res.json()).message); return res.json(); }).then(setFinanceReport).catch(err => setErrorMsg(err.message));
  };
  const fetchAuditLogs = () => {
    apiFetch(`${API_URL}/audit-logs`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => { if (!res.ok) throw new Error((await res.json()).message); return res.json(); }).then(data => { if (Array.isArray(data)) setAuditLogs(data); }).catch(err => setErrorMsg(err.message));
  };
  const fetchStaffList = () => {
    apiFetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => { if (!res.ok) throw new Error((await res.json()).message); return res.json(); }).then(data => { if (Array.isArray(data)) setStaffList(data); }).catch(err => setErrorMsg(err.message));
  };

  // Auth operations
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    apiFetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm)
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || tr3(lang, "Giriş başarısız.", "فشل تسجيل الدخول.", "Sign in failed."));
      return data;
    })
    .then(data => {
      if (data.user.role === "PATIENT") {
        throw new Error(tr3(lang, "Hastalar personel paneline giriş yapamaz. Lütfen hasta portalını kullanın.", "لا يمكن للمرضى الدخول إلى لوحة الموظفين. يرجى استخدام بوابة المريض.", "Patients cannot sign in to the staff panel. Please use the Patient Portal."));
      }
      localStorage.setItem("staff_token", data.token);
      localStorage.setItem("staff_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      const role = data.user.role;
      if (role === "DOCTOR") setActiveMenu("doctor");
      else if (role === "ADMIN") setActiveMenu("admin_overview");
      else if (role === "RECEPTIONIST") setActiveMenu("reception");
      else if (role === "PHARMACIST") setActiveMenu("pharmacy");
      else if (role === "LAB_TECH") setActiveMenu("lab");
      else if (role === "ACCOUNTANT" || role === "FINANCE") setActiveMenu("accountant");

      fetchDoctors();
      fetchAppointments();
      fetchPatients();
      setSuccessMsg(tr3(lang, "Giriş başarılı!", "تم تسجيل الدخول بنجاح!", "Signed in successfully!"));
    })
    .catch(err => setErrorMsg(err.message));
  };

  const quickLogin = (email: string) => {
    setLoginForm({ email, password: "Password123" });
    setErrorMsg("");
    apiFetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "Password123" })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    })
    .then(data => {
      localStorage.setItem("staff_token", data.token);
      setToken(data.token);
      setUser(data.user);
    })
    .catch(err => setErrorMsg(err.message));
  };

  const handleLogout = () => {
    localStorage.removeItem("staff_token");
    setToken(null);
    setUser(null);
    setActiveMenu("");
    setAppointments([]);
    setPatients([]);
    setDoctors([]);
    setInventory([]);
    setAuditLogs([]);
    setPrescriptions([]);
    setLabOrders([]);
    setFinanceReport(null);
    setStaffList([]);
  };

  const handleSwitchDoctor = (doc: any) => {
    setSelectedDoctorOverrideId(doc.id);
    setActiveMenu("doctor");
    setSuccessMsg(
      tr3(
        lang,
        `${doc.fullName} polikliniği seçildi. Kendi yetkinizle muayene, reçete ve ek ücret işlemi yapabilirsiniz.`,
        `تم اختيار عيادة ${doc.fullName}. يمكنك إجراء المعاينة والوصفة والرسوم الإضافية بصلاحيتك.`,
        `Switched to ${doc.fullName}'s clinic. You can manage consultations, prescriptions, and extra charges.`
      )
    );
  };

  // Receptionist actions
  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    apiFetch(`${API_URL}/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(newPatient)
    })
    .then(async res => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      return res.json();
    })
    .then(() => {
      setSuccessMsg(tr3(lang, "Hasta başarıyla kaydedildi.", "تم تسجيل المريض بنجاح.", "Patient registered successfully."));
      setNewPatient({ fullName: "", phone: "", identityNo: "", email: "", bloodType: "A+", emergencyContact: "", insuranceInfo: "" });
      setShowAddPatient(false);
      fetchPatients();
    })
    .catch(err => setErrorMsg(err.message));
  };

  const refreshDoctorSlotGrid = (docId: string, dStr: string) => {
    if (!docId || !dStr) return;
    apiFetch(`${API_URL}/doctors/${docId}/schedule?date=${encodeURIComponent(dStr)}&_t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        const all = Array.isArray(data.allStandardSlots) ? data.allStandardSlots : [];
        const avail = Array.isArray(data.availableSlots) ? data.availableSlots : [];
        const blocked = Array.isArray(data.allBlockedSlots) ? data.allBlockedSlots : [];
        setDoctorAllSlots(all);
        setDoctorSlots(avail);
        setDoctorBlockedSlots(blocked);
      })
      .catch(() => {
        setDoctorAllSlots([]);
        setDoctorSlots([]);
        setDoctorBlockedSlots([]);
      });
  };

  // Fetch slots for receptionist appointment creation
  useEffect(() => {
    if (newApp.doctorId && slotDate) {
      refreshDoctorSlotGrid(newApp.doctorId, slotDate);
    } else {
      setDoctorAllSlots([]);
      setDoctorSlots([]);
      setDoctorBlockedSlots([]);
    }
  }, [newApp.doctorId, slotDate]);

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!newApp.patientId || !newApp.doctorId || !slotDate || !newApp.slotTime) {
      setErrorMsg(tr3(lang, "Lütfen hasta, doktor, tarih ve yeşil renkli müsait bir saat seçiniz.", "يرجى اختيار المريض والطبيب والتاريخ ووقت متاح باللون الأخضر.", "Please select a patient, doctor, date, and an available green time slot."));
      return;
    }
    if (doctorBlockedSlots.includes(newApp.slotTime)) {
      setErrorMsg(tr3(lang, "Seçilen saat doludur (kırmızı). Lütfen yeşil renkli müsait saatlerden birini seçiniz.", "الوقت المحدد محجوز (أحمر). يرجى اختيار وقت متاح باللون الأخضر.", "The selected time slot is booked (red). Please choose an available green slot."));
      return;
    }

    const bookedDocId = newApp.doctorId;
    const bookedDate = slotDate;
    const bookedSlot = newApp.slotTime;

    apiFetch(`${API_URL}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        patientId: newApp.patientId,
        doctorId: bookedDocId,
        dateStr: bookedDate,
        timeStr: bookedSlot,
        slotTime: `${bookedDate}T${bookedSlot}:00`,
      })
    })
    .then(async res => {
      const d = await res.json();
      if (!res.ok) {
        refreshDoctorSlotGrid(bookedDocId, bookedDate);
        throw new Error(d.message || d.error || tr3(lang, "Randevu oluşturulamadı", "تعذر إنشاء الموعد", "Could not create appointment"));
      }
      return d;
    })
    .then(() => {
      // Immediately mark slot red in local state + re-sync
      setDoctorBlockedSlots((prev) => Array.from(new Set([...prev, bookedSlot])));
      refreshDoctorSlotGrid(bookedDocId, bookedDate);
      setSuccessMsg(tr3(lang, "Randevu başarıyla oluşturuldu ve seçilen saat kırmızı (Dolu) olarak kapatıldı.", "تم إنشاء الموعد بنجاح وتحويل الوقت المحدد إلى اللون الأحمر (محجوز).", "Appointment created successfully and the selected slot is now marked red (Booked)."));
      setNewApp({ patientId: "", doctorId: "", slotTime: "" });
      setSlotDate("");
      setShowAddApp(false);
      fetchAppointments();
    })
    .catch(err => setErrorMsg(err.message));
  };

  const handleUpdateAppStatus = (id: string, status: string) => {
    apiFetch(`${API_URL}/appointments/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    })
    .then(() => {
      fetchAppointments();
      setSuccessMsg(tr3(lang, "Randevu durumu güncellendi.", "تم تحديث حالة الموعد.", "Appointment status updated."));
    });
  };

  // Doctor actions
  const selectActivePatient = (app: any) => {
    setSelectedQueueApp(app);
    setSoapNotes({ diagnosis: "", clinicalNotes: "" });
    setPrescDrugs([]);
    setReqTests([]);
    setPastRecords([]);

    // Load patient's past medical history
    apiFetch(`${API_URL}/medical-records/patient/${app.patientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setPastRecords(data))
    .catch(err => console.log(err));
  };

  const addDrug = () => {
    if (!drugInput.itemName) return;
    setPrescDrugs([...prescDrugs, { ...drugInput }]);
    setDrugInput({ itemName: "", dosage: "", quantity: 1 });
  };

  const removeDrug = (index: number) => {
    setPrescDrugs(prescDrugs.filter((_, i) => i !== index));
  };

  const addTest = () => {
    if (!testInput) return;
    setReqTests([...reqTests, testInput]);
    setTestInput("");
  };

  const removeTest = (index: number) => {
    setReqTests(reqTests.filter((_, i) => i !== index));
  };

  const handleSaveSOAP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soapNotes.diagnosis || !soapNotes.clinicalNotes) {
      setErrorMsg("Tanı ve SOAP notları boş bırakılamaz.");
      return;
    }

    apiFetch(`${API_URL}/medical-records`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        patientId: selectedQueueApp.patientId,
        doctorId: selectedQueueApp.doctorId,
        appointmentId: selectedQueueApp.id,
        diagnosis: soapNotes.diagnosis,
        clinicalNotes: soapNotes.clinicalNotes,
        prescriptionItems: prescDrugs,
        labTests: reqTests.map(testName => ({ testName, status: "PENDING" }))
      })
    })
    .then(async res => {
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      return d;
    })
    .then(() => {
      // Mark appointment as COMPLETED
      handleUpdateAppStatus(selectedQueueApp.id, "COMPLETED");
      setSuccessMsg("Tıbbi kayıt ve SOAP notları başarıyla kaydedildi.");
      setSelectedQueueApp(null);
    })
    .catch(err => setErrorMsg(err.message));
  };

  // Add Amendment to past record
  const handleAddAmendment = (recordId: string) => {
    if (!amendmentText) return;
    apiFetch(`${API_URL}/medical-records/${recordId}/amendments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ notes: amendmentText })
    })
    .then(async res => {
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      return d;
    })
    .then(() => {
      setSuccessMsg("Düzeltme/Ek not başarıyla kaydedildi.");
      setAmendmentText("");
      setShowAmendmentId(null);
      // Reload history
      if (selectedQueueApp) {
        selectActivePatient(selectedQueueApp);
      }
    })
    .catch(err => setErrorMsg(err.message));
  };

  // Pharmacist actions
  const handleDispense = (id: string) => {
    setErrorMsg("");
    apiFetch(`${API_URL}/prescriptions/${id}/dispense`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(async res => {
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      return d;
    })
    .then(() => {
      setSuccessMsg(tr3(lang, "Reçete ilaçları teslim edildi. Satış %10 hasta indirimiyle kaydedildi.", "تم صرف أدوية الوصفة وتسجيل المبيع بخصم 10% للمريض.", "Prescription dispensed and recorded with a 10% patient discount."));
      fetchPrescriptions();
      fetchInventory();
    })
    .catch(err => setErrorMsg(err.message));
  };

  // Lab Tech actions
  const handleSaveLabResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labResultText || !selectedLabOrder) return;

    const fileUrlSimulated = `/uploads/lab_report_${selectedLabOrder.id}_final.pdf`;

    apiFetch(`${API_URL}/lab-orders/${selectedLabOrder.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        resultData: labResultText,
        fileUrl: fileUrlSimulated
      })
    })
    .then(async res => {
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      return d;
    })
    .then(() => {
      setSuccessMsg(tr3(lang, "Laboratuvar sonucu ve analiz dosyası başarıyla kaydedildi.", "تم حفظ نتيجة التحليل المخبري بنجاح.", "Laboratory result saved successfully."));
      setSelectedLabOrder(null);
      setLabResultText("");
      fetchLabOrders();
    })
    .catch(err => setErrorMsg(err.message));
  };

  // Admin staff management
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    apiFetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(newStaff)
    })
    .then(async res => {
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      return d;
    })
    .then(() => {
      setSuccessMsg(tr3(lang, "Yeni personel / hekim hesabı açıldı.", "تم إنشاء حساب الموظف / الطبيب الجديد بنجاح.", "New staff / doctor account created."));
      setNewStaff({
        email: "",
        password: "123",
        fullName: "",
        phone: "0989111242",
        identityNo: "",
        role: "RECEPTIONIST",
        consultationFee: 1000,
        specialty: "Genel Poliklinik",
      });
      setShowAddStaff(false);
      fetchStaffList();
      fetchDoctors();
    })
    .catch(err => setErrorMsg(err.message));
  };

  const handleUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setErrorMsg("");
    const payload: any = {
      fullName: editingStaff.fullName,
      email: editingStaff.email,
      phone: editingStaff.phone || "",
      identityNo: editingStaff.identityNo || "",
      role: editingStaff.role,
      status: editingStaff.status,
    };
    if (editingStaff.role === "DOCTOR" && editingStaff.consultationFee !== undefined) {
      payload.consultationFee = Number(editingStaff.consultationFee);
    }
    if (editingStaffPassword.trim()) {
      payload.password = editingStaffPassword.trim();
    }

    apiFetch(`${API_URL}/users/${editingStaff.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const d = await res.json();
        if (!res.ok) throw new Error(d.message || tr3(lang, "Personel güncellenemedi", "تعذر تحديث بيانات الموظف", "Could not update staff member"));
        return d;
      })
      .then(() => {
        setSuccessMsg(
          editingStaffPassword.trim()
            ? tr3(lang, `${editingStaff.fullName} bilgileri ve giriş şifresi başarıyla güncellendi!`, `تم تحديث بيانات وكلمة مرور ${editingStaff.fullName} بنجاح!`, `${editingStaff.fullName}'s details and login password updated!`)
            : tr3(lang, `${editingStaff.fullName} rol/hesap bilgileri güncellendi!`, `تم تحديث حساب وصلاحية ${editingStaff.fullName} بنجاح!`, `${editingStaff.fullName}'s account details updated!`)
        );
        setEditingStaff(null);
        setEditingStaffPassword("");
        fetchStaffList();
        fetchDoctors();
      })
      .catch((err) => setErrorMsg(err.message));
  };

  // Admin inventory modifications
  const handleAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    apiFetch(`${API_URL}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(newItem)
    })
    .then(async res => {
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      return d;
    })
    .then(() => {
      setSuccessMsg(tr3(lang, "Stok kartı eklendi.", "تمت إضافة صنف المخزون بنجاح.", "Inventory item added."));
      setShowAddItem(false);
      setNewItem({ itemName: "", SKU: "", stockQuantity: 100, supplierPrice: 0, retailPrice: 0, expiryDate: "" });
      fetchInventory();
    })
    .catch(err => setErrorMsg(err.message));
  };

  const handleUpdateInventory = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    apiFetch(`${API_URL}/inventory/${showEditItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(showEditItem)
    })
    .then(async res => {
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      return d;
    })
    .then(() => {
      setSuccessMsg(tr3(lang, "Stok güncellendi.", "تم تحديث المخزون بنجاح.", "Inventory updated."));
      setShowEditItem(null);
      fetchInventory();
    })
    .catch(err => setErrorMsg(err.message));
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2C1810] font-sans transition-colors"
    >
      {user?.role === "ADMIN" && <LegacyDataBackup lang={lang} />}
      {/* HEADER */}
      <header className="border-b border-[#E5DCD0] bg-white/95 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3.5 flex justify-between items-center z-30 sticky top-0 shadow-xs gap-2">
        <div className="flex items-center gap-2 sm:gap-3.5">
          {token && user && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] text-[#4A2E1B] hover:bg-[#F3EDE2] transition-colors shadow-xs"
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          )}
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full p-0.5 bg-[#FAF7F2] border border-[#E5DCD0] flex items-center justify-center shadow-xs overflow-hidden shrink-0">
            <img
              src="/logo.png"
              alt="Mena Clinic Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0 max-w-[130px] xs:max-w-[200px] sm:max-w-none">
            <h1 className="text-xs sm:text-base font-serif font-bold tracking-wide text-[#2C1810] truncate">
              {t.clinicTitle}
            </h1>
            <p className="text-[8px] sm:text-[10px] tracking-widest text-[#8C6D53] font-sans font-semibold uppercase truncate">
              {t.panelSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          {/* Language Switcher */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-[#FAF7F2] p-0.5 sm:p-1 rounded-xl border border-[#E5DCD0]">
            <button
              onClick={() => handleLanguageChange("tr")}
              className={`px-1.5 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all flex items-center gap-1 sm:gap-1.5 ${
                lang === "tr"
                  ? "bg-[#4A2E1B] text-white shadow-xs"
                  : "text-[#6E492D] hover:bg-[#EFE8DC]"
              }`}
              title="Türkçe"
            >
              <TurkishFlag className="w-3.5 h-2 sm:w-4 sm:h-2.5" />
              <span className="hidden xs:inline">TR</span>
            </button>
            <button
              onClick={() => handleLanguageChange("ar")}
              className={`px-1.5 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all flex items-center gap-1 sm:gap-1.5 ${
                lang === "ar"
                  ? "bg-[#4A2E1B] text-white shadow-xs"
                  : "text-[#6E492D] hover:bg-[#EFE8DC]"
              }`}
              title="العربية"
            >
              <SyrianFlag className="w-3.5 h-2 sm:w-4 sm:h-2.5" />
              <span className="hidden xs:inline">AR</span>
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              className={`px-1.5 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all flex items-center gap-1 sm:gap-1.5 ${
                lang === "en"
                  ? "bg-[#4A2E1B] text-white shadow-xs"
                  : "text-[#6E492D] hover:bg-[#EFE8DC]"
              }`}
              title="English"
            >
              <UkFlag className="w-3.5 h-2 sm:w-4 sm:h-2.5" />
              <span className="hidden xs:inline">EN</span>
            </button>
          </div>

          {token && user && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <span className="block text-xs font-bold text-[#2C1810]">{user.fullName}</span>
                <span className="block text-[9px] text-[#8C6D53] uppercase font-semibold tracking-wider">
                  {user.role === "ADMIN"
                    ? t.roleAdmin
                    : user.role === "ACCOUNTANT"
                    ? t.roleAccountant
                    : user.role === "DOCTOR"
                    ? t.roleDoctor
                    : user.role === "RECEPTIONIST"
                    ? t.roleReceptionist
                    : user.role === "PHARMACIST"
                    ? t.rolePharmacist
                    : user.role === "LAB_TECH"
                    ? t.roleLabTech
                    : user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-1.5 text-xs text-[#4A2E1B] hover:text-red-700 hover:bg-red-50 border border-[#E5DCD0] px-2.5 sm:px-3 py-1.5 rounded-xl bg-white transition-all font-semibold shadow-xs"
                title={t.logout}
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">{t.logout}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* BODY SECTION */}
      {!token || !user ? (
        // LOGIN PAGE
        <div className="flex-grow flex items-center justify-center p-6 bg-gradient-to-tr from-[#F3EDE2] via-[#FAF7F2] to-[#EFE8DC]">
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

            <div className="space-y-6 text-left">
              <div className="w-20 h-20 rounded-2xl bg-white border border-[#E5DCD0] p-2 flex items-center justify-center shadow-md">
                <img
                  src="/logo.png"
                  alt="Mena Clinic Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-3xl font-serif text-[#2C1810] leading-tight font-bold">
                {t.clinicTitle} <br />
                <span className="text-[#8C6D53] font-sans text-base uppercase tracking-widest font-semibold">
                  {t.panelSubtitle}
                </span>
              </h2>
              <p className="text-[#6E492D] text-xs leading-relaxed max-w-sm">
                {lang === "ar"
                  ? "البوابة الإدارية والطبية لمجمع مينا الطبي، لإدارة المرضى، أجور المعاينات، عيادات الأطباء، الصيدلية، المختبر والتقارير المحاسبية المعتمدة."
                  : lang === "tr"
                  ? "Mena Clinic operasyonel personel portalı: hekim poliklinikleri, hasta kabul, muayene ücretleri, eczane ve doktor/eczane bazlı muhasebe raporları."
                  : "Mena Clinic staff portal for clinical workflows, doctor fees, patient management, pharmacy dispensing, and detailed accountant reports."}
              </p>

              {/* Doctor Login Options Reference Directory */}
              <div className="space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-[#4A2E1B] uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-[#8A5F35]" />
                    <span>{tr3(lang, "Doktor Giriş Seçenekleri & Bilgileri (Şifre: 123)", "بيانات دخول الأطباء (كلمة المرور: 123)", "Doctor Quick Sign-In Directory (Password: 123)")}</span>
                  </p>
                </div>

                <div className="max-h-56 overflow-y-auto rounded-2xl border border-[#E5DCD0] bg-white p-2 space-y-1.5 divide-y divide-[#F3EDE2]">
                  {DOCTOR_ACCOUNTS_LIST.map((doc) => {
                    const dispName = tr3(lang, doc.nameTr, doc.nameAr, doc.nameEn);
                    const dispSpec = tr3(lang, doc.specTr, doc.specAr, doc.specEn);
                    return (
                      <div
                        key={doc.email}
                        className="pt-1.5 first:pt-0 flex items-center justify-between text-xs hover:bg-[#FAF7F2] p-1.5 rounded-xl transition-colors"
                      >
                        <div>
                          <strong className="block text-[#2C1810] text-[11px]">{dispName}</strong>
                          <span className="text-[10px] text-[#7D6E63] font-mono">{doc.email} • {dispSpec}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginForm({ email: doc.email, password: "123" });
                            setErrorMsg("");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#DDD2C1] text-[#4A2E1B] text-[10px] font-bold transition-all shadow-xs"
                        >
                          {tr3(lang, "Seç", "اختيار", "Select")}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Login Form */}
            <div className="bg-white border border-[#E5DCD0] rounded-2xl p-8 shadow-xl space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full p-1 bg-[#FAF7F2] border border-[#E5DCD0]">
                  <img src="/logo.png" alt="Mena Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#2C1810]">
                  {tr3(lang, "Kullanıcı Girişi", "تسجيل الدخول للنظام", "Staff Sign In")}
                </h3>
                <p className="text-xs text-[#8C6D53]">
                  {tr3(lang, "Personel e-posta ve şifrenizi girin", "أدخل البريد الإلكتروني وكلمة المرور للموظف", "Enter your staff email and password")}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[11px] text-[#4A2E1B] uppercase font-semibold">
                    {tr3(lang, "E-posta", "البريد الإلكتروني", "Email")}
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full bg-[#FAF7F2] border border-[#D5C7B5] rounded-xl p-2.5 text-xs text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    value={loginForm.email}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] text-[#4A2E1B] uppercase font-semibold">
                    {tr3(lang, "Şifre", "كلمة المرور", "Password")}
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full bg-[#FAF7F2] border border-[#D5C7B5] rounded-xl p-2.5 text-xs text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#B8860B]"
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    value={loginForm.password}
                  />
                </div>

                {errorMsg && (
                  <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-xl flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#4A2E1B] hover:bg-[#382214] text-white shadow-md p-3 rounded-xl font-medium text-xs uppercase tracking-wider transition-all"
                >
                  {tr3(lang, "Oturum Aç", "دخول إلى النظام", "Sign In")}
                </button>
              </form>
            </div>

          </div>
        </div>
      ) : (
        // DASHBOARD INTERFACE
        <div className="flex-grow flex flex-col md:flex-row">

          {/* Mobile Fast Tab Pill Bar */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto p-2 bg-white border-b border-[#E5DCD0] no-scrollbar shadow-xs shrink-0">
            {user.role === "ADMIN" && (
              <>
                <button
                  onClick={() => { setActiveMenu("admin_overview"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "admin_overview"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <Activity size={13} className="text-[#D4AF37]" />
                  <span>{t.menuAdminOverview}</span>
                </button>
                <button
                  onClick={() => { setActiveMenu("doctors_hub"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "doctors_hub"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <Stethoscope size={13} className="text-[#B8860B]" />
                  <span>{t.menuDoctorsHub}</span>
                </button>
                <button
                  onClick={() => { setActiveMenu("doctor"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "doctor"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <HeartPulse size={13} className="text-rose-500" />
                  <span>{tr3(lang, "Poliklinik Muayene", "العيادة والمعاينة", "Outpatient Clinic")}</span>
                </button>
                <button
                  onClick={() => { setActiveMenu("reception"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "reception"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <UserCheck size={13} />
                  <span>{t.menuPatients}</span>
                </button>
                <button
                  onClick={() => { setActiveMenu("cashier"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "cashier"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <Receipt size={13} className="text-emerald-600" />
                  <span>{tr3(lang, "Kasa & Tahsilat", "الصندوق والتحصيل", "Cashier & Billing")}</span>
                </button>
                <button
                  onClick={() => { setActiveMenu("pharmacy"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "pharmacy"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <Package size={13} />
                  <span>{t.menuPharmacy}</span>
                </button>
                <button
                  onClick={() => { setActiveMenu("lab"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "lab"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <Layers size={13} />
                  <span>{t.menuLaboratory}</span>
                </button>
                <button
                  onClick={() => { setActiveMenu("accountant"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "accountant"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <DollarSign size={13} className="text-emerald-600" />
                  <span>{t.menuDoctorReports}</span>
                </button>
                <button
                  onClick={() => { setActiveMenu("admin_fin"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "admin_fin"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <TrendingUp size={13} />
                  <span>{t.menuFinance}</span>
                </button>
              </>
            )}
            {user.role === "ACCOUNTANT" && (
              <>
                <button
                  onClick={() => { setActiveMenu("accountant"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "accountant"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <DollarSign size={13} className="text-emerald-600" />
                  <span>{t.doctorFinancialReports}</span>
                </button>
                <button
                  onClick={() => { setActiveMenu("pharmacy"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "pharmacy"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <Package size={13} />
                  <span>{t.pharmacyFinancialReport}</span>
                </button>
                <button
                  onClick={() => { setActiveMenu("admin_fin"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "admin_fin"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <TrendingUp size={13} />
                  <span>{t.menuFinance}</span>
                </button>
              </>
            )}
            {user.role === "DOCTOR" && (
              <button
                onClick={() => { setActiveMenu("doctor"); setMobileMenuOpen(false); }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-[#4A2E1B] text-white shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Activity size={13} />
                <span>{t.roleDoctor}</span>
              </button>
            )}
            {user.role === "RECEPTIONIST" && (
              <>
                <button
                  onClick={() => { setActiveMenu("reception"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "reception"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <UserCheck size={13} />
                  <span>{t.roleReceptionist}</span>
                </button>
                <button
                  onClick={() => { setActiveMenu("cashier"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "cashier"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <Receipt size={13} className="text-emerald-600" />
                  <span>{tr3(lang, "Kasa & Tahsilat", "الصندوق والتحصيل", "Cashier & Billing")}</span>
                </button>
                <button
                  onClick={() => { setActiveMenu("doctors_hub"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "doctors_hub"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <Stethoscope size={13} className="text-[#B8860B]" />
                  <span>{tr3(lang, "Doktor Mesai & Durum", "دوام الأطباء", "Doctor Shifts & Status")}</span>
                </button>
                <button
                  onClick={() => { setActiveMenu("doctor"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "doctor"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <HeartPulse size={13} className="text-rose-500" />
                  <span>{tr3(lang, "Poliklinik Muayene", "العيادة والمعاينة", "Outpatient Clinic")}</span>
                </button>
                <button
                  onClick={() => { setActiveMenu("pharmacy"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "pharmacy"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <Package size={13} />
                  <span>{t.menuPharmacy}</span>
                </button>
                <button
                  onClick={() => { setActiveMenu("lab"); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    activeMenu === "lab"
                      ? "bg-[#4A2E1B] text-white shadow-xs"
                      : "text-[#6E492D] bg-[#FAF7F2] border border-[#E5DCD0]"
                  }`}
                >
                  <Layers size={13} />
                  <span>{t.menuLaboratory}</span>
                </button>
              </>
            )}
            {user.role === "PHARMACIST" && (
              <button
                onClick={() => { setActiveMenu("pharmacy"); setMobileMenuOpen(false); }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-[#4A2E1B] text-white shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Package size={13} />
                <span>{t.rolePharmacist}</span>
              </button>
            )}
            {user.role === "LAB_TECH" && (
              <button
                onClick={() => { setActiveMenu("lab"); setMobileMenuOpen(false); }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap bg-[#4A2E1B] text-white shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Layers size={13} />
                <span>{t.roleLabTech}</span>
              </button>
            )}
          </div>

          {/* Side Menu Drawer / Persistent on Desktop & TV */}
          <aside
            className={`border-r border-[#E5DCD0] bg-white p-4 sm:p-5 space-y-6 shrink-0 transition-all ${
              mobileMenuOpen
                ? "block w-full border-b"
                : "hidden md:block md:w-60 lg:w-64 xl:w-72 2xl:w-80 tv:w-96"
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider text-[#8C6D53] font-bold block">
              {t.roleSpecialScreens}
            </span>
            <nav className="space-y-1.5">
              {/* ADMIN HAS FULL 360° ACCESS TO ALL MODULES */}
              {user.role === "ADMIN" && (
                <>
                  <button
                    onClick={() => { setActiveMenu("admin_overview"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "admin_overview"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <Activity size={15} className="text-[#D4AF37]" />
                    <span>{t.menuAdminOverview}</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("doctors_hub"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "doctors_hub"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <Stethoscope size={15} className="text-[#B8860B]" />
                    <span>{t.menuDoctorsHub}</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("doctor"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "doctor"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <HeartPulse size={15} className="text-rose-500" />
                    <span>{tr3(lang, "Poliklinik & Muayene", "العيادة ومعاينة المرضى", "Outpatient Consultation")}</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("reception"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "reception"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <UserCheck size={15} />
                    <span>{t.menuPatients}</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("cashier"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "cashier"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <Receipt size={15} className="text-emerald-600" />
                    <span>{tr3(lang, "Kasa & Tahsilat", "الصندوق والتحصيل", "Cashier & Billing")}</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("pharmacy"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "pharmacy"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <Package size={15} />
                    <span>{t.menuPharmacy}</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("lab"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "lab"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <Layers size={15} />
                    <span>{t.menuLaboratory}</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("accountant"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "accountant"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <DollarSign size={15} className="text-emerald-600" />
                    <span>{t.menuDoctorReports}</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("admin_fin"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "admin_fin"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <TrendingUp size={15} />
                    <span>{t.menuFinance}</span>
                  </button>
                </>
              )}

              {/* ACCOUNTANT ROLE */}
              {user.role === "ACCOUNTANT" && (
                <>
                  <button
                    onClick={() => { setActiveMenu("accountant"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "accountant"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <DollarSign size={15} className="text-emerald-600" />
                    <span>{t.doctorFinancialReports}</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("pharmacy"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "pharmacy"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <Package size={15} />
                    <span>{t.pharmacyFinancialReport}</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("admin_fin"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "admin_fin"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <TrendingUp size={15} />
                    <span>{t.menuFinance}</span>
                  </button>
                </>
              )}

              {/* RECEPTIONIST (FULL OPERATIONAL ACCESS EXCEPT OVERALL ACCOUNTING & ADMIN SECRETS) */}
              {user.role === "RECEPTIONIST" && (
                <>
                  <button
                    onClick={() => { setActiveMenu("reception"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "reception"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <UserCheck size={15} />
                    <span>{t.roleReceptionist}</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("cashier"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "cashier"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <Receipt size={15} className="text-emerald-600" />
                    <span>{tr3(lang, "Kasa & Tahsilat", "الصندوق والتحصيل", "Cashier & Billing")}</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("doctors_hub"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "doctors_hub"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <Stethoscope size={15} className="text-[#B8860B]" />
                    <span>{tr3(lang, "Doktor Mesai & Durum", "دوام الأطباء والتوفر", "Doctor Shifts & Availability")}</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("doctor"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "doctor"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <HeartPulse size={15} className="text-rose-500" />
                    <span>{tr3(lang, "Poliklinik & Muayene", "العيادة ومعاينة المرضى", "Outpatient Consultation")}</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("pharmacy"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "pharmacy"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <Package size={15} />
                    <span>{t.menuPharmacy}</span>
                  </button>

                  <button
                    onClick={() => { setActiveMenu("lab"); setMobileMenuOpen(false); }}
                    className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                      activeMenu === "lab"
                        ? "bg-[#4A2E1B] text-white shadow-sm"
                        : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                    }`}
                  >
                    <Layers size={15} />
                    <span>{t.menuLaboratory}</span>
                  </button>
                </>
              )}

              {/* DOCTOR */}
              {user.role === "DOCTOR" && (
                <button
                  onClick={() => { setActiveMenu("doctor"); setMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                    activeMenu === "doctor"
                      ? "bg-[#4A2E1B] text-white shadow-sm"
                      : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                  }`}
                >
                  <Activity size={15} />
                  <span>{t.roleDoctor}</span>
                </button>
              )}

              {/* PHARMACIST */}
              {user.role === "PHARMACIST" && (
                <button
                  onClick={() => { setActiveMenu("pharmacy"); setMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                    activeMenu === "pharmacy"
                      ? "bg-[#4A2E1B] text-white shadow-sm"
                      : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                  }`}
                >
                  <Package size={15} />
                  <span>{t.rolePharmacist}</span>
                </button>
              )}

              {/* LAB TECH */}
              {user.role === "LAB_TECH" && (
                <button
                  onClick={() => { setActiveMenu("lab"); setMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                    activeMenu === "lab"
                      ? "bg-[#4A2E1B] text-white shadow-sm"
                      : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                  }`}
                >
                  <Layers size={15} />
                  <span>{t.roleLabTech}</span>
                </button>
              )}
            </nav>

            <div className="pt-6 border-t border-[#E5DCD0] text-[10px] text-[#8C6D53] space-y-1">
              <p>{t.currentSession}</p>
              <p className="text-[#2C1810] font-mono select-all truncate">{user.email}</p>
              <p className="text-[#B8860B] font-medium">{t.secureConnection}</p>
            </div>
          </aside>

          {/* Main workspace */}
          <main className="flex-grow p-3.5 sm:p-5 md:p-6 lg:p-8 2xl:p-10 space-y-6 sm:space-y-8 overflow-y-auto w-full max-w-[1920px] 2xl:max-w-[2400px] tv:max-w-[3200px] mx-auto">

            {/* Feedback Notifications */}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check size={14} />
                  <span>{successMsg}</span>
                </div>
                <button onClick={() => setSuccessMsg("")} className="text-emerald-400 hover:text-[#2C1810] font-bold">×</button>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>{errorMsg}</span>
                </div>
                <button onClick={() => setErrorMsg("")} className="text-red-400 hover:text-[#2C1810] font-bold">×</button>
              </div>
            )}

            {/* 0. ADMIN 360° OVERVIEW MODULE */}
            {activeMenu === "admin_overview" && (
              <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DCD0] pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFE8DC] border border-[#E5DCD0] text-[#4A2E1B] text-[11px] font-semibold uppercase mb-1">
                      <span>Mena Clinic</span> • <span>360° {t.roleAdmin}</span>
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-[#2C1810]">
                      {t.menuAdminOverview}
                    </h2>
                    <p className="text-xs text-[#8C6D53]">
                      {lang === "ar"
                        ? "الإشراف المتكامل على جميع أقسام المركز: الأطباء، المرضى، المعاينات، الصيدلية والمحاسبة."
                        : lang === "tr"
                        ? "Tüm klinik departmanları, hekim poliklinikleri, hasta akışı, eczane ve finansal tablolar."
                        : "Comprehensive 360° supervision across all clinical departments, doctors, pharmacy, and finances."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveMenu("doctors_hub")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4A2E1B] hover:bg-[#382214] text-white text-xs font-semibold shadow-xs transition-all"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{t.menuDoctorsHub}</span>
                    </button>
                    <button
                      onClick={() => setActiveMenu("accountant")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D5C7B5] hover:bg-[#FAF7F2] text-[#4A2E1B] text-xs font-semibold shadow-xs transition-all"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.menuDoctorReports}</span>
                    </button>
                  </div>
                </div>

                {/* 4 KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Doctors */}
                  <div
                    onClick={() => setActiveMenu("doctors_hub")}
                    className="bg-white border border-[#E5DCD0] hover:border-[#B8860B] rounded-2xl p-5 shadow-xs cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#8C6D53] mb-2 uppercase tracking-wide">
                      <span>{t.menuDoctorsHub}</span>
                      <Stethoscope className="w-4 h-4 text-[#B8860B] group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-serif font-bold text-[#2C1810]">
                      {doctors.length}{" "}
                      <span className="text-xs font-normal text-[#8C6D53]">
                        {lang === "ar" ? "أطباء مسجلون" : lang === "tr" ? "Uzman Hekim" : "Doctors"}
                      </span>
                    </div>
                    <div className="text-xs text-[#B8860B] font-medium mt-2 flex items-center gap-1">
                      <span>{t.inspectDoctor} →</span>
                    </div>
                  </div>

                  {/* Patients */}
                  <div
                    onClick={() => setActiveMenu("reception")}
                    className="bg-white border border-[#E5DCD0] hover:border-[#B8860B] rounded-2xl p-5 shadow-xs cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#8C6D53] mb-2 uppercase tracking-wide">
                      <span>{t.activePatients}</span>
                      <UsersIcon className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-serif font-bold text-[#2C1810]">
                      {patients.length > 0 ? patients.length : 24}{" "}
                      <span className="text-xs font-normal text-[#8C6D53]">
                        {lang === "ar" ? "مريض مسجل" : lang === "tr" ? "Hasta Kaydı" : "Patients"}
                      </span>
                    </div>
                    <div className="text-xs text-blue-700 font-medium mt-2">
                      <span>{appointments.length} {tr3(lang, "Randevu", "موعد اليوم", "Appointments")} →</span>
                    </div>
                  </div>

                  {/* Pharmacy */}
                  <div
                    onClick={() => setActiveMenu("pharmacy")}
                    className="bg-white border border-[#E5DCD0] hover:border-[#B8860B] rounded-2xl p-5 shadow-xs cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#8C6D53] mb-2 uppercase tracking-wide">
                      <span>{t.menuPharmacy}</span>
                      <Package className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-serif font-bold text-[#2C1810]">
                      {inventory.length}{" "}
                      <span className="text-xs font-normal text-[#8C6D53]">
                        {tr3(lang, "İlaç Kalemi", "أصناف دوائية", "Medications")}
                      </span>
                    </div>
                    <div className="text-xs text-purple-700 font-medium mt-2">
                      <span>{prescriptions.length} {tr3(lang, "Reçete", "وصفة تصرف", "Prescriptions")} →</span>
                    </div>
                  </div>

                  {/* Finance / Revenue */}
                  <div
                    onClick={() => setActiveMenu("accountant")}
                    className="bg-white border border-[#E5DCD0] hover:border-[#B8860B] rounded-2xl p-5 shadow-xs cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#8C6D53] mb-2 uppercase tracking-wide">
                      <span>{t.todayRevenue}</span>
                      <TrendingUp className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-serif font-bold text-emerald-700">
                      {(financeReport?.todayRevenue ?? 0).toLocaleString()}{" "}
                      <span className="text-xs font-normal text-emerald-700">{t.currency}</span>
                    </div>
                    <div className="text-xs text-emerald-700 font-medium mt-2">
                      <span>{t.doctorFinancialReports} →</span>
                    </div>
                  </div>
                </div>

                {/* Quick Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white border border-[#E5DCD0] rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] flex items-center justify-center text-[#4A2E1B]">
                      <Stethoscope className="w-5 h-5 text-[#B8860B]" />
                    </div>
                    <h4 className="text-base font-serif font-bold text-[#2C1810]">{t.doctorsTitle}</h4>
                    <p className="text-xs text-[#6E492D] leading-relaxed">
                      {lang === "ar"
                        ? "فلترة الأطباء حسب القسم الطبي، فحص مرضى كل طبيب على حدة، وتعديل أجور المعاينة والجدول الأسبوعي."
                        : lang === "tr"
                        ? "Tüm doktorları branşlarına göre filtreleyin, her bir hekimin hastalarını, muayene ücretini ve haftalık takvimini inceleyin."
                        : "Filter doctors by department, inspect each doctor's individual patients, consultation fee, and calendar."}
                    </p>
                    <button
                      onClick={() => setActiveMenu("doctors_hub")}
                      className="text-xs font-semibold text-[#4A2E1B] hover:text-[#B8860B] inline-flex items-center gap-1"
                    >
                      <span>{t.inspectDoctor}</span> →
                    </button>
                  </div>

                  <div className="bg-white border border-[#E5DCD0] rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] flex items-center justify-center text-[#4A2E1B]">
                      <Receipt className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <h4 className="text-base font-serif font-bold text-[#2C1810]">{t.accountantTitle}</h4>
                    <p className="text-xs text-[#6E492D] leading-relaxed">
                      {lang === "ar"
                        ? "تقارير مالية تفصيلية للإيرادات والمصاريف بالليرة السورية (نقداً)، وتحليلات الصيدلية والمستودع."
                        : lang === "tr"
                        ? "Suriye Lirası (SYP) üzerinden nakit muayene gelirleri, poliklinik giderleri ve eczane gelir-maliyet tabloları."
                        : "Consultation cash income, clinic expenses, and pharmacy financial reports in Syrian Pounds (SYP)."}
                    </p>
                    <button
                      onClick={() => setActiveMenu("accountant")}
                      className="text-xs font-semibold text-[#4A2E1B] hover:text-[#B8860B] inline-flex items-center gap-1"
                    >
                      <span>{t.doctorFinancialReports}</span> →
                    </button>
                  </div>

                  <div className="bg-white border border-[#E5DCD0] rounded-2xl p-6 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] flex items-center justify-center text-[#4A2E1B]">
                      <Package className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="text-base font-serif font-bold text-[#2C1810]">{t.menuPharmacy}</h4>
                    <p className="text-xs text-[#6E492D] leading-relaxed">
                      {lang === "ar"
                        ? "مراقبة مستودع الأدوية، صرف الوصفات الطبية للمرضى، وتنبيهات النقص الحاد في المخزون."
                        : lang === "tr"
                        ? "Eczane ilaç stoklarını, reçete teslimlerini, kritik seviye uyarılarını ve birim fiyatlarını denetleyin."
                        : "Inspect medication stocks, dispense prescriptions, and monitor critical inventory levels."}
                    </p>
                    <button
                      onClick={() => setActiveMenu("pharmacy")}
                      className="text-xs font-semibold text-[#4A2E1B] hover:text-[#B8860B] inline-flex items-center gap-1"
                    >
                      <span>{t.menuPharmacy}</span> →
                    </button>
                  </div>
                </div>

                {/* 5. DISASTER RECOVERY & SYSTEM BACKUP MODULE */}
                <SystemBackupRestore
                  token={token}
                  apiUrl={API_URL}
                  lang={lang}
                  onRefreshAll={() => {
                    fetchDoctors();
                    fetchPatients();
                    fetchAppointments();
                    fetchStaffList();
                  }}
                />
              </div>
            )}

            {/* DOCTORS 360° HUB MODULE */}
            {activeMenu === "doctors_hub" && (
              <DoctorsHub
                doctors={doctors}
                staffList={staffList}
                appointments={appointments}
                patients={patients}
                t={t}
                lang={lang}
                canCreateDoctor={user.role === "ADMIN"}
                onDoctorAdded={() => {
                  fetchDoctors();
                  fetchAppointments();
                }}
                onStaffUpdated={() => {
                  fetchStaffList();
                  fetchDoctors();
                }}
                onSwitchDoctor={handleSwitchDoctor}
              />
            )}

            {/* CASHIER / KASA & PARTIAL/FULL BILLING MODULE */}
            {activeMenu === "cashier" && (
              <CashierHub
                patients={patients}
                doctors={doctors}
                lang={lang}
                userRole={user.role}
              />
            )}

            {/* ACCOUNTANT FINANCIAL REPORTS MODULE */}
            {activeMenu === "accountant" && (
              <AccountantHub
                doctors={doctors}
                appointments={appointments}
                prescriptions={prescriptions}
                inventory={inventory}
                financialStats={
                  financeReport || {
                    todayRevenue: financeReport?.todayRevenue ?? 0,
                    pendingInvoices: 0,
                    totalPatients: patients.length,
                  }
                }
                t={t}
                lang={lang}
              />
            )}

            {/* 1. RECEPTIONIST MODULE */}
            {activeMenu === "reception" && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-clinicBorder pb-3 gap-3">
                  <div>
                    <h3 className="text-xl font-serif text-[#2C1810]">
                      {tr3(lang, "Danışma & Hasta Kabul", "الاستقبال وتسجيل المرضى", "Reception & Patient Admission")}
                    </h3>
                    <p className="text-xs text-[#4E3D30]">
                      {tr3(lang, "Hasta kaydı yapabilir, canlı randevu ve doktor kuyruğunu düzenleyebilirsiniz.", "يمكنك تسجيل المرضى الجدد وإدارة المواعيد وطوابير الأطباء مباشرة.", "Register new patients and manage live appointments and doctor queues.")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                      onClick={() => setShowAddPatient(true)}
                      className="flex items-center gap-1 bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm text-xs uppercase px-3 sm:px-4 py-2 rounded hover:bg-clinicGold hover:text-neutral-950 transition-all font-semibold"
                    >
                      <Plus size={12} /> {tr3(lang, "Hasta Kaydet", "تسجيل مريض", "Register Patient")}
                    </button>
                    <button
                      onClick={() => setShowAddApp(true)}
                      className="flex items-center gap-1 bg-[#FAF7F2] border border-clinicBorder text-[#2C1810] text-xs uppercase px-3 sm:px-4 py-2 rounded hover:text-white hover:border-clinicGold/40 transition-all font-semibold"
                    >
                      <Plus size={12} /> {tr3(lang, "Randevu Oluştur", "إنشاء موعد", "Create Appointment")}
                    </button>
                  </div>
                </div>

                {/* Queue Triage Board */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold">
                      {tr3(lang, "Günlük Muayene & Sıra Kuyruk Panosu", "لوحة طابور المعاينات والمواعيد اليومية", "Daily Consultation & Queue Triage Board")}
                    </h4>
                    <button onClick={fetchAppointments} title={tr3(lang, "Yenile", "تحديث", "Refresh")} className="p-1 bg-stone-900 border border-clinicBorder text-[#4E3D30] hover:text-[#2C1810] rounded">
                      <RefreshCw size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CONFIRMED QUEUE */}
                    <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg p-4 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 w-fit">
                        {tr3(lang, "Onaylı Bekleyenler", "المؤكدون في الانتظار", "Confirmed Waiting")}
                      </span>
                      <div className="space-y-2">
                        {appointments.filter(a => a.status === "CONFIRMED" && ((a.dateStr || (a.slotTime || "").slice(0, 10)) === clinicDate())).length === 0 ? (
                          <p className="text-[11px] text-stone-500 italic">
                            {tr3(lang, "Kuyrukta bekleyen hasta yok.", "لا يوجد مرضى في طابور الانتظار.", "No patients waiting in queue.")}
                          </p>
                        ) : (
                          appointments.filter(a => a.status === "CONFIRMED" && ((a.dateStr || (a.slotTime || "").slice(0, 10)) === clinicDate())).map(app => (
                            <div key={app.id} className="bg-white border border-clinicBorder p-3 rounded text-xs space-y-2">
                              <div className="flex justify-between">
                                <strong className="text-[#2C1810]">{app.patient?.user?.fullName || app.patient?.fullName}</strong>
                                <span className="text-clinicGold font-mono">{tr3(lang, "Sıra", "الدور", "Queue")} #{app.queueNumber}</span>
                              </div>
                              <p className="text-[10px] text-[#4E3D30]">{tr3(lang, "Dr:", "د:", "Dr:")} {app.doctor?.fullName}</p>
                              <p className="text-[9px] text-stone-500">{new Date(app.slotTime).toLocaleTimeString(lang === "ar" ? "ar-SY" : lang === "en" ? "en-US" : "tr-TR", {hour:"2-digit",minute:"2-digit"})}</p>
                              <div className="flex gap-2 pt-1.5 border-t border-clinicBorder">
                                <button
                                  onClick={() => handleUpdateAppStatus(app.id, "CANCELLED")}
                                  className="text-[9px] text-red-600 hover:underline font-semibold"
                                >
                                  {tr3(lang, "İptal Et", "إلغاء الموعد", "Cancel")}
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* PENDING REGISTER */}
                    <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg p-4 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1.5 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 w-fit">
                        {tr3(lang, "Teyit Bekleyen Randevular", "مواعيد بانتظار التأكيد", "Pending Confirmation")}
                      </span>
                      <div className="space-y-2">
                        {appointments.filter(a => a.status === "PENDING").length === 0 ? (
                          <p className="text-[11px] text-stone-500 italic">
                            {tr3(lang, "Teyit bekleyen randevu yok.", "لا توجد مواعيد بانتظار التأكيد.", "No unconfirmed appointments.")}
                          </p>
                        ) : (
                          appointments.filter(a => a.status === "PENDING").map(app => (
                            <div key={app.id} className="bg-white border border-clinicBorder p-3 rounded text-xs space-y-2">
                              <div className="flex justify-between">
                                <strong className="text-[#2C1810]">{app.patient?.user?.fullName || app.patient?.fullName}</strong>
                                <span className="text-amber-600 text-[10px] font-semibold">{tr3(lang, "Teyitsiz", "غير مؤكد", "Unconfirmed")}</span>
                              </div>
                              <p className="text-[10px] text-[#4E3D30]">{tr3(lang, "Dr:", "د:", "Dr:")} {app.doctor?.fullName}</p>
                              <p className="text-[9px] text-stone-500">{new Date(app.slotTime).toLocaleTimeString(lang === "ar" ? "ar-SY" : lang === "en" ? "en-US" : "tr-TR", {hour:"2-digit",minute:"2-digit"})}</p>
                              <div className="flex gap-2 pt-1.5 border-t border-clinicBorder">
                                <button
                                  onClick={() => handleUpdateAppStatus(app.id, "CONFIRMED")}
                                  className="text-[9px] text-emerald-700 hover:underline font-bold"
                                >
                                  {tr3(lang, "Onayla (Kuyruğa Al)", "تأكيد وإدخال للطابور", "Confirm & Queue")}
                                </button>
                                <button
                                  onClick={() => handleUpdateAppStatus(app.id, "CANCELLED")}
                                  className="text-[9px] text-stone-500 hover:underline"
                                >
                                  {tr3(lang, "İptal", "إلغاء", "Cancel")}
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* COMPLETED TODAY */}
                    <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg p-4 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-[#4E3D30] flex items-center gap-1.5 bg-stone-200/70 px-2 py-0.5 rounded border border-stone-300 w-fit">
                        {tr3(lang, "Bugün Tamamlananlar", "المكتملة اليوم", "Completed Today")}
                      </span>
                      <div className="space-y-2">
                        {appointments.filter(a => a.status === "COMPLETED" && ((a.dateStr || (a.slotTime || "").slice(0, 10)) === clinicDate())).length === 0 ? (
                          <p className="text-[11px] text-stone-500 italic">
                            {tr3(lang, "Bugün henüz tamamlanan olmadı.", "لا توجد معاينات مكتملة اليوم بعد.", "No consultations completed today yet.")}
                          </p>
                        ) : (
                          appointments.filter(a => a.status === "COMPLETED" && ((a.dateStr || (a.slotTime || "").slice(0, 10)) === clinicDate())).map(app => (
                            <div key={app.id} className="bg-white/50 border border-clinicBorder p-3 rounded text-xs space-y-1 opacity-70">
                              <div className="flex justify-between">
                                <strong className="text-[#2C1810]">{app.patient?.user?.fullName || app.patient?.fullName}</strong>
                                <span className="text-emerald-600 font-bold">✓</span>
                              </div>
                              <p className="text-[10px] text-stone-500">{tr3(lang, "Dr:", "د:", "Dr:")} {app.doctor?.fullName}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient List with Letter-by-Letter Prefix Filter */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold">
                      {tr3(lang, "Kayıtlı Klinik Hastaları", "المرضى المسجلون في المركز", "Registered Clinic Patients")}
                    </h4>
                    <div className="relative w-full sm:w-80">
                      <Search size={13} className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-[#8C6D53]" />
                      <input
                        type="text"
                        value={patientDirectoryQuery}
                        onChange={(e) => setPatientDirectoryQuery(e.target.value)}
                        placeholder={tr3(lang, "Harf harf hasta ara (Örn: Y, Yu, Yusuf)...", "ابحث عن المريض حرفاً بحرف...", "Filter patients letter by letter...")}
                        className="w-full pl-8 rtl:pl-3 rtl:pr-8 pr-3 py-1.5 rounded-xl bg-white border border-[#D5C7B5] text-xs text-[#2C1810] focus:outline-none focus:border-[#4A2E1B]"
                      />
                    </div>
                  </div>
                  <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left rtl:text-right text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-clinicBorder text-[#4E3D30] bg-[#FAF7F2]">
                          <th className="p-3">{t.patientName}</th>
                          <th className="p-3">{t.identityNo}</th>
                          <th className="p-3">{t.phone}</th>
                          <th className="p-3">{t.bloodType}</th>
                          <th className="p-3">{tr3(lang, "Sigorta Bilgisi", "التأمين الصحي", "Insurance")}</th>
                          <th className="p-3">{tr3(lang, "Acil Durum İrtibatı", "جهة اتصال الطوارئ", "Emergency Contact")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients
                          .filter((p) => {
                            const q = patientDirectoryQuery.trim().toLocaleLowerCase("tr-TR");
                            if (!q) return true;
                            const fn = (p.fullName || p.user?.fullName || "").toLocaleLowerCase("tr-TR");
                            const words = fn.split(/\s+/);
                            const idNo = (p.identityNo || p.user?.identityNo || "").toLowerCase();
                            const ph = (p.phone || p.user?.phone || "").toLowerCase();
                            return fn.startsWith(q) || words.some((w: string) => w.startsWith(q)) || idNo.startsWith(q) || ph.includes(q);
                          })
                          .map(p => (
                          <tr key={p.id} className="border-b border-clinicBorder hover:bg-[#FAF7F2]/80">
                            <td className="p-3 font-semibold text-[#2C1810]">{p.user?.fullName || p.fullName}</td>
                            <td className="p-3 font-mono">{p.user?.identityNo || p.identityNo}</td>
                            <td className="p-3 font-mono">{p.user?.phone || p.phone}</td>
                            <td className="p-3 text-red-500 font-bold">{p.bloodType || "—"}</td>
                            <td className="p-3 text-[#4E3D30]">{p.insuranceInfo || tr3(lang, "Özel / Genel", "خاص / عام", "Standard")}</td>
                            <td className="p-3 text-[#4E3D30] truncate max-w-[200px]" title={p.emergencyContact}>{p.emergencyContact || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MODAL: ADD PATIENT */}
                {showAddPatient && (
                  <div className="fixed inset-0 bg-[#2C1810]/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-white border border-clinicBorder rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                      <button onClick={() => setShowAddPatient(false)} className="absolute right-4 rtl:right-auto rtl:left-4 top-4 text-stone-500 hover:text-[#2C1810] text-lg">×</button>
                      <h4 className="text-lg font-serif text-clinicGold uppercase tracking-wider">
                        {tr3(lang, "Yeni Hasta Kayıt Formu", "نموذج تسجيل مريض جديد", "New Walk-In Patient Registration")}
                      </h4>
                      <form onSubmit={handleAddPatient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Ad Soyad *", "الاسم الكامل *", "Full Name *")}</label>
                          <input type="text" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewPatient({...newPatient, fullName: e.target.value})} value={newPatient.fullName} />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Kimlik No / Pasaport No *", "الرقم الوطني / جواز السفر *", "National ID / Passport *")}</label>
                          <input type="text" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewPatient({...newPatient, identityNo: e.target.value})} value={newPatient.identityNo} />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Telefon", "رقم الهاتف", "Phone Number")}</label>
                          <input type="text" className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewPatient({...newPatient, phone: e.target.value})} value={newPatient.phone} />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "E-posta (İsteğe Bağlı)", "البريد الإلكتروني (اختياري)", "Email (Optional)")}</label>
                          <input type="email" className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewPatient({...newPatient, email: e.target.value})} value={newPatient.email} />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{t.bloodType}</label>
                          <select className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewPatient({...newPatient, bloodType: e.target.value})} value={newPatient.bloodType}>
                            <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                            <option>AB+</option><option>AB-</option><option>0+</option><option>0-</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Sigorta Bilgileri", "بيانات التأمين", "Insurance Info")}</label>
                          <input type="text" className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewPatient({...newPatient, insuranceInfo: e.target.value})} value={newPatient.insuranceInfo} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Acil Durum İrtibat Kişisi & Telefon", "جهة اتصال الطوارئ ورقم الهاتف", "Emergency Contact Name & Phone")}</label>
                          <input type="text" className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewPatient({...newPatient, emergencyContact: e.target.value})} value={newPatient.emergencyContact} />
                        </div>
                        <button type="submit" className="md:col-span-2 w-full bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm py-2 rounded text-xs uppercase tracking-widest font-bold hover:bg-clinicGold hover:text-neutral-950 transition-all mt-2">
                          {tr3(lang, "Hastayı Kaydet", "حفظ بيانات المريض", "Save Patient")}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* MODAL: ADD APPOINTMENT (PREFIX PATIENT SEARCH + GREEN/RED LIVE SLOTS) */}
                {showAddApp && (
                  <div className="fixed inset-0 bg-[#2C1810]/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-white border border-clinicBorder rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                      <button onClick={() => setShowAddApp(false)} className="absolute right-4 rtl:right-auto rtl:left-4 top-4 text-stone-500 hover:text-[#2C1810] text-lg">×</button>
                      <h4 className="text-lg font-serif text-clinicGold uppercase tracking-wider">
                        {tr3(lang, "Randevu Planlama", "جدولة موعد جديد", "Schedule Appointment")}
                      </h4>
                      <form onSubmit={handleAddAppointment} className="space-y-3.5">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">
                            {tr3(lang, "Hasta Seçimi (Harf Harf Yazarak Filtreleyin) *", "اختيار المريض (ابحث حرفاً بحرف) *", "Select Patient (Type Letter-by-Letter) *")}
                          </label>
                          <PatientSearchSelect
                            patients={patients}
                            value={newApp.patientId}
                            onChange={(pid) => setNewApp({ ...newApp, patientId: pid })}
                            required
                            lang={lang}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Doktor Seçimi *", "اختيار الطبيب *", "Select Doctor *")}</label>
                          <select
                            required
                            className="w-full bg-[#FAF7F2] border border-clinicBorder rounded-xl p-2.5 text-xs"
                            onChange={(e) => setNewApp({ ...newApp, doctorId: e.target.value, slotTime: "" })}
                            value={newApp.doctorId}
                          >
                            <option value="">{tr3(lang, "-- Doktor Seçin --", "-- اختر الطبيب --", "-- Select Doctor --")}</option>
                            {doctors.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.fullName} ({(d.consultationFee || 1000).toLocaleString("tr-TR")} {t.currency})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Tarih *", "التاريخ *", "Date *")}</label>
                          <input
                            type="date"
                            required
                            min={clinicDate()}
                            className="w-full bg-[#FAF7F2] border border-clinicBorder rounded-xl p-2.5 text-xs"
                            onChange={(e) => {
                              setSlotDate(e.target.value);
                              setNewApp({ ...newApp, slotTime: "" });
                            }}
                            value={slotDate}
                          />
                        </div>
                        {slotDate && newApp.doctorId && (
                          <div className="space-y-2 p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0]">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-[#4A2E1B] uppercase">{tr3(lang, "Saat Seçimi *", "اختيار الوقت *", "Select Time *")}</span>
                              <span className="text-[#7D6E63]">
                                <span className="text-emerald-700">● {tr3(lang, "Yeşil: Müsait", "أخضر: متاح", "Green: Available")}</span>{" "}
                                <span className="text-red-700 ml-1">● {tr3(lang, "Kırmızı: Dolu", "أحمر: محجوز", "Red: Booked")}</span>
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                              {(doctorAllSlots.length > 0 ? doctorAllSlots : doctorSlots).map((s) => {
                                const isBlocked = doctorBlockedSlots.includes(s) || !doctorSlots.includes(s);
                                const isSelected = newApp.slotTime === s;
                                return (
                                  <button
                                    key={s}
                                    type="button"
                                    disabled={isBlocked}
                                    onClick={() => !isBlocked && setNewApp({ ...newApp, slotTime: s })}
                                    className={`py-2 px-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                                      isBlocked
                                        ? "bg-red-100 text-red-800 border-red-300 line-through cursor-not-allowed opacity-85"
                                        : isSelected
                                        ? "bg-[#4A2E1B] text-white border-[#4A2E1B] ring-2 ring-emerald-400 scale-105"
                                        : "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200"
                                    }`}
                                  >
                                    {s} {isBlocked ? tr3(lang, "(Dolu)", "(محجوز)", "(Booked)") : ""}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <button type="submit" className="w-full bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all mt-2">
                          {tr3(lang, "Randevuyu Kaydet & Saati Kapat", "حفظ الموعد وإغلاق الفترة", "Save Appointment & Lock Slot")}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* 2. DOCTOR MODULE */}
            {activeMenu === "doctor" && (
              <DoctorWorkspace
                currentUser={user}
                allDoctors={doctors}
                appointments={appointments}
                patients={patients}
                labOrders={labOrders}
                onRefreshLabs={fetchLabOrders}
                t={t}
                lang={lang}
                selectedDoctorOverrideId={selectedDoctorOverrideId}
                onChangeDoctorOverride={setSelectedDoctorOverrideId}
                onUpdateAppStatus={handleUpdateAppStatus}
                onAppointmentCreated={() => {
                  fetchAppointments();
                  fetchLabOrders();
                }}
                apiUrl={API_URL}
                token={token}
              />
            )}

            {/* 3. PHARMACIST MODULE */}
            {activeMenu === "pharmacy" && (
              <div className="space-y-8">
                <div className="border-b border-clinicBorder pb-3">
                  <h3 className="text-xl font-serif text-[#2C1810]">
                    {tr3(lang, "Eczane Reçete Teslim & Stok Kontrolü", "الصيدلية وصرف الوصفات ومراقبة المخزون", "Pharmacy Dispensing & Stock Control")}
                  </h3>
                  <p className="text-xs text-[#4E3D30]">
                    {tr3(lang, "Reçeteli ilaç çıkışı yapabilir, stok ve fiyat takibi gerçekleştirebilirsiniz.", "يمكنك صرف الوصفات الطبية للمرضى ومتابعة كميات وأسعار المستودع الدوائي.", "Dispense prescribed medications and track real-time stock quantities and pricing.")}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* Left Column: Pending Prescriptions */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-clinicBorder pb-2">
                      <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold">
                        {tr3(lang, "Bekleyen Reçeteler", "الوصفات قيد الانتظار", "Pending Prescriptions")}
                      </h4>
                      <input
                        type="text"
                        placeholder={tr3(lang, "Hasta adı ara...", "ابحث باسم المريض...", "Search patient...")}
                        className="bg-[#FAF7F2] border border-clinicBorder px-2.5 py-1 text-[11px] rounded focus:outline-none focus:border-clinicGold w-36"
                        value={searchPresc}
                        onChange={e => setSearchPresc(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      {prescriptions.filter(p => p.status === "PENDING" && (p.patient?.user?.fullName || p.patient?.fullName || "").toLowerCase().includes(searchPresc.toLowerCase())).length === 0 ? (
                        <p className="text-[11px] text-stone-500 italic">
                          {tr3(lang, "Bekleyen reçeteli ilaç istemi bulunmamaktadır.", "لا توجد وصفات طبية معلقة حالياً.", "No pending prescriptions at the moment.")}
                        </p>
                      ) : (
                        prescriptions.filter(p => p.status === "PENDING" && (p.patient?.user?.fullName || p.patient?.fullName || "").toLowerCase().includes(searchPresc.toLowerCase())).map(p => (
                          <div key={p.id} className="bg-[#FAF7F2] border border-clinicBorder p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <strong className="text-[#2C1810] text-xs block">{p.patient?.user?.fullName || p.patient?.fullName}</strong>
                                <span className="text-[9px] text-stone-500 block">{tr3(lang, "Hekim:", "الطبيب:", "Doctor:")} {p.record?.doctor?.fullName}</span>
                              </div>
                              <span className="text-[8px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-semibold uppercase">
                                {tr3(lang, "Bekliyor", "قيد الانتظار", "Pending")}
                              </span>
                            </div>

                            <ul className="list-disc pl-4 rtl:pl-0 rtl:pr-4 text-[11px] text-[#4E3D30] space-y-0.5">
                              {p.items.map((item: any) => (
                                <li key={item.id}>
                                  {item.itemName} - <span className="text-[#2C1810]">{item.dosage}</span> ({item.quantity} {tr3(lang, "Kutu", "علبة", "Box")})
                                </li>
                              ))}
                            </ul>

                            <button
                              onClick={() => handleDispense(p.id)}
                              className="w-full bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm py-1.5 rounded text-[10px] uppercase font-bold hover:bg-clinicGold hover:text-neutral-950 transition-all"
                            >
                              {tr3(lang, "İlaçları Teslim Et & Satış Yap (%10 İndirimli)", "صرف الأدوية وتسجيل المبيع (خصم 10%)", "Dispense & Record Sale (10% Discount)")}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Inventory List */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center border-b border-clinicBorder pb-2">
                      <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold">
                        {tr3(lang, "Klinik Eczane Stok Seviyeleri", "مستويات مخزون صيدلية المركز", "Clinic Pharmacy Stock Levels")}
                      </h4>
                      <span className="text-[9px] text-stone-500 uppercase">
                        {tr3(lang, "Yetki bazlı stok görünümü", "عرض المخزون حسب الصلاحية", "Role-based stock view")}
                      </span>
                    </div>

                    <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg overflow-x-auto">
                      <table className="w-full min-w-[650px] text-left rtl:text-right text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-clinicBorder text-[#4E3D30] bg-[#FAF7F2]">
                            <th className="p-3">{tr3(lang, "İlaç Adı", "اسم الدواء", "Medication Name")}</th>
                            <th className="p-3">SKU</th>
                            <th className="p-3 text-center">{tr3(lang, "Stok Adedi", "الكمية المتوفرة", "Stock Qty")}</th>
                            <th className="p-3">{tr3(lang, "Satış Fiyatı", "سعر البيع", "Retail Price")}</th>
                            <th className="p-3 text-red-600">{tr3(lang, "Alış Maliyeti", "تكلفة الشراء", "Supplier Cost")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventory.map(item => (
                            <tr key={item.id} className="border-b border-clinicBorder hover:bg-[#FAF7F2]/80">
                              <td className="p-3 font-semibold text-[#2C1810]">{item.itemName}</td>
                              <td className="p-3 font-mono">{item.SKU}</td>
                              <td className={`p-3 text-center font-bold ${item.stockQuantity < 20 ? "text-amber-600 animate-pulse" : "text-[#2C1810]"}`}>
                                {item.stockQuantity} {tr3(lang, "Kutu", "علبة", "Box")}
                              </td>
                              <td className="p-3 text-[#2C1810] font-mono">{(item.retailPrice ?? 0).toLocaleString("tr-TR")} {t.currency}</td>
                              <td className="p-3 text-red-600/80 font-mono">
                                {item.supplierPrice !== undefined ? `${(item.supplierPrice ?? 0).toLocaleString("tr-TR")} ${t.currency}` : (
                                  <span className="text-[10px] text-stone-600 flex items-center gap-1">
                                    <Lock size={10} /> {tr3(lang, "Gizli (Yetkisiz)", "مخفي (مقيد)", "Restricted")}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 4. LAB TECHNICIAN MODULE (STRUCTURED BLOOD/URINE PANELS, REFERENCE CHECK & PDF) */}
            {activeMenu === "lab" && (
              <LaboratoryHub
                currentUser={user}
                labOrders={labOrders}
                patients={patients}
                doctors={doctors}
                lang={lang}
                onRefresh={fetchLabOrders}
              />
            )}

            {/* 5. ADMIN & FINANCE MODULE */}
            {activeMenu === "admin_fin" && (
              <div className="space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-clinicBorder pb-3">
                  <div>
                    <h3 className="text-xl font-serif text-[#2C1810]">
                      {tr3(lang, "Yönetici & Finans Departmanı", "قسم الإدارة والمالية", "Administration & Finance Department")}
                    </h3>
                    <p className="text-xs text-[#4E3D30]">
                      {tr3(lang, "Sistem işlem günlüklerini okuyabilir, kasa bakiyesini ve personel hesaplarını yönetebilirsiniz.", "مراجعة سجلات النظام وإدارة الخزينة النقدية وحسابات الموظفين.", "Inspect system audit logs, manage cash balances, and configure staff accounts.")}
                    </p>
                  </div>
                  {user.role === "ADMIN" && (
                    <button
                      onClick={() => setShowAddStaff(true)}
                      className="flex items-center gap-1 bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm text-xs uppercase px-4 py-2 rounded hover:bg-clinicGold hover:text-neutral-950 transition-all font-semibold"
                    >
                      <Plus size={12} /> {tr3(lang, "Personel Ekle", "إضافة موظف", "Add Staff")}
                    </button>
                  )}
                </div>

                {/* Finance Report Widgets (100% SYP - Income, Expenses, Net Balance) */}
                {financeReport && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#FAF7F2] border border-clinicBorder p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-stone-500">{tr3(lang, "Toplam Nakit Gelir", "إجمالي الإيراد النقدي", "Total Cash Income")}</span>
                        <h4 className="text-lg font-bold text-emerald-700 font-mono">{(financeReport.totalRevenue ?? 0).toLocaleString("tr-TR")} {t.currency}</h4>
                      </div>
                      <TrendingUp size={24} className="text-emerald-500/40" />
                    </div>

                    <div className="bg-[#FAF7F2] border border-clinicBorder p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-stone-500">{tr3(lang, "Toplam Giderler (Klinik + İlaç)", "إجمالي المصاريف (المركز + الأدوية)", "Total Expenses (Clinic + Meds)")}</span>
                        <h4 className="text-lg font-bold text-rose-700 font-mono">-{(financeReport.totalExpenses ?? 0).toLocaleString("tr-TR")} {t.currency}</h4>
                      </div>
                      <DollarSign size={24} className="text-rose-500/40" />
                    </div>

                    <div className="bg-[#FAF7F2] border border-clinicBorder p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-stone-500">{tr3(lang, "Net Kasa Bakiyesi (Gelir - Gider)", "صافي الخزينة (الإيراد - المصاريف)", "Net Cash Balance (Income - Expense)")}</span>
                        <h4 className="text-lg font-bold text-[#2C1810] font-mono">{(financeReport.netBalance ?? financeReport.estimatedProfit ?? 0).toLocaleString("tr-TR")} {t.currency}</h4>
                      </div>
                      <TrendingUp size={24} className="text-clinicGold/40" />
                    </div>

                    <div className="bg-[#FAF7F2] border border-clinicBorder p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-stone-500">{tr3(lang, "Düşük Stok Alarmları", "تنبيهات نقص المخزون", "Low Stock Alerts")}</span>
                        <h4 className={`text-lg font-bold ${(financeReport.lowStockItemsCount ?? 0) > 0 ? "text-red-500 font-bold" : "text-[#4E3D30]"}`}>
                          {(financeReport.lowStockItemsCount ?? 0)} {tr3(lang, "Kalem", "صنف", "Items")}
                        </h4>
                      </div>
                      <AlertTriangle size={24} className={(financeReport.lowStockItemsCount ?? 0) > 0 ? "text-red-500/40 animate-bounce" : "text-stone-500/40"} />
                    </div>
                  </div>
                )}

                {/* Subsections Tab Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                  {/* Left Column: Audit Logs */}
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold border-b border-clinicBorder pb-2">
                      {tr3(lang, "Sistem İşlem Günlükleri", "سجل عمليات النظام", "System Audit Logs")}
                    </h4>
                    <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg p-3 max-h-96 overflow-y-auto space-y-2">
                      {auditLogs.map(log => (
                        <div key={log.id} className="bg-white/50 border border-clinicBorder p-2.5 rounded text-[10px] space-y-1">
                          <div className="flex justify-between items-center text-stone-500 border-b border-clinicBorder pb-1">
                            <span>{tr3(lang, "Kullanıcı:", "المستخدم:", "User:")} <strong className="text-[#2C1810]">{log.user?.fullName || "SYSTEM"}</strong></span>
                            <span>{new Date(log.timestamp).toLocaleString(lang === "ar" ? "ar-SY" : lang === "en" ? "en-US" : "tr-TR")}</span>
                          </div>
                          <div className="flex justify-between text-[#4E3D30]">
                            <span>{tr3(lang, "İşlem:", "الإجراء:", "Action:")} <strong className="text-clinicGold">{log.action}</strong></span>
                            <span>{tr3(lang, "Kaynak:", "المورد:", "Resource:")} {log.resource}</span>
                          </div>
                          {log.payload && (
                            <pre className="text-[9px] bg-stone-950 p-1.5 rounded text-stone-400 font-mono overflow-x-auto truncate max-w-full" title={log.payload}>
                              {log.payload}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Inventory Management (Prices & Admin stock addition) */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-clinicBorder pb-2">
                      <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold">
                        {tr3(lang, "Eczane Depo Katalogu & Maliyetleri", "دليل مستودع الصيدلية والتكاليف", "Pharmacy Inventory Catalog & Costs")}
                      </h4>
                      <button
                        onClick={() => setShowAddItem(true)}
                        className="text-[10px] bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm px-2.5 py-1 rounded hover:bg-clinicGold hover:text-neutral-950 transition-all font-semibold"
                      >
                        + {tr3(lang, "Yeni Stok Ekle", "إضافة صنف جديد", "Add Stock Item")}
                      </button>
                    </div>

                    <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg p-3 max-h-96 overflow-y-auto space-y-2">
                      {inventory.map(item => (
                        <div key={item.id} className="bg-white border border-clinicBorder p-3 rounded-lg flex justify-between items-center text-xs">
                          <div>
                            <strong className="text-[#2C1810] block">{item.itemName}</strong>
                            <span className="text-[10px] text-[#4E3D30]">SKU: {item.SKU} | {tr3(lang, "Stok:", "المخزون:", "Stock:")} <strong className="text-clinicGold">{item.stockQuantity}</strong></span>
                            <span className="block text-[10px] text-stone-500 font-mono">{tr3(lang, "Maliyet:", "التكلفة:", "Cost:")} {(item.supplierPrice ?? 0).toLocaleString("tr-TR")} {t.currency} | {tr3(lang, "Satış:", "البيع:", "Retail:")} {(item.retailPrice ?? 0).toLocaleString("tr-TR")} {t.currency}</span>
                          </div>
                          <button
                            onClick={() => setShowEditItem(item)}
                            className="text-[10px] bg-[#FAF7F2] text-[#2C1810] hover:bg-[#4A2E1B] hover:text-white px-2.5 py-1 rounded border border-clinicBorder font-semibold transition-colors"
                          >
                            {tr3(lang, "Düzenle", "تعديل", "Edit")}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Staff List with Category Filter */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold">
                      {tr3(lang, "Klinik Personel & Rol Kategorileri Listesi", "قائمة الموظفين وفئات الصلاحيات", "Clinic Staff & Role Categories Directory")}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: "ALL", label: tr3(lang, "Tümü", "الكل", "All") },
                        { id: "DOCTOR", label: tr3(lang, "Doktor", "طبيب", "Doctor") },
                        { id: "RECEPTIONIST", label: tr3(lang, "Danışma", "استقبال", "Reception") },
                        { id: "PHARMACIST", label: tr3(lang, "Eczacı", "صيدلي", "Pharmacist") },
                        { id: "ACCOUNTANT", label: tr3(lang, "Muhasebeci", "محاسب", "Accountant") },
                        { id: "LAB_TECH", label: tr3(lang, "Laborant", "مخبري", "Lab Tech") },
                        { id: "ADMIN", label: tr3(lang, "Yönetici", "مدير", "Admin") },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setStaffRoleFilter(cat.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                            staffRoleFilter === cat.id
                              ? "bg-[#4A2E1B] text-white border-[#4A2E1B]"
                              : "bg-white text-[#6E492D] border-[#E5DCD0]"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left rtl:text-right text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-clinicBorder text-[#4E3D30] bg-[#FAF7F2]">
                          <th className="p-3">{tr3(lang, "Ad Soyad", "الاسم الكامل", "Full Name")}</th>
                          <th className="p-3">{tr3(lang, "Gmail / E-posta", "البريد الإلكتروني", "Gmail / Email")}</th>
                          <th className="p-3">{t.phone}</th>
                          <th className="p-3">{tr3(lang, "Kategori / Rol", "الفئة / الصلاحية", "Category / Role")}</th>
                          <th className="p-3">{tr3(lang, "Durum", "الحالة", "Status")}</th>
                          <th className="p-3 text-right rtl:text-left">{tr3(lang, "Yetki, Bilgi & Şifre Yönetimi", "إدارة البيانات والصلاحية وكلمة المرور", "Credentials, Role & Fee")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffList
                          .filter((st) => {
                            if (staffRoleFilter === "ALL") return true;
                            if (staffRoleFilter === "ACCOUNTANT") return st.role === "ACCOUNTANT" || st.role === "FINANCE";
                            return st.role === staffRoleFilter;
                          })
                          .map(st => {
                            const roleLabel =
                              st.role === "ADMIN" ? t.roleAdmin :
                              st.role === "DOCTOR" ? t.roleDoctor :
                              st.role === "RECEPTIONIST" ? t.roleReceptionist :
                              st.role === "PHARMACIST" ? t.rolePharmacist :
                              st.role === "LAB_TECH" ? t.roleLabTech :
                              t.roleAccountant;
                            return (
                              <tr key={st.id} className="border-b border-clinicBorder hover:bg-[#FAF7F2]/80">
                                <td className="p-3 font-semibold text-[#2C1810]">{st.fullName}</td>
                                <td className="p-3 font-mono">{st.email}</td>
                                <td className="p-3 font-mono">{st.phone || "0989111242"}</td>
                                <td className="p-3">
                                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                                    st.role === "ADMIN" ? "bg-red-50 text-red-700 border-red-200" :
                                    st.role === "DOCTOR" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                                    st.role === "RECEPTIONIST" ? "bg-blue-50 text-blue-800 border-blue-200" :
                                    "bg-amber-50 text-[#4A2E1B] border-amber-200"
                                  }`}>
                                    {roleLabel}
                                  </span>
                                </td>
                                <td className={`p-3 font-bold ${st.status === "ACTIVE" ? "text-emerald-600" : "text-red-500"}`}>
                                  {st.status === "ACTIVE" ? tr3(lang, "Aktif", "نشط", "Active") : tr3(lang, "Askıda", "معلق", "Suspended")}
                                </td>
                                <td className="p-3 text-right rtl:text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const linkedDoc = doctors.find((d) => d.id === st.id || d.email === st.email);
                                      setEditingStaff({
                                        ...st,
                                        consultationFee: linkedDoc?.consultationFee ?? 1000,
                                      });
                                      setEditingStaffPassword("");
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-[#4A2E1B] hover:bg-[#382112] text-white text-[11px] font-bold shadow-xs transition-all inline-flex items-center gap-1"
                                  >
                                    <Lock size={11} className="text-[#D4AF37]" />
                                    <span>{tr3(lang, "Bilgi / Ücret / Şifre Düzenle", "تعديل البيانات والأجرة وكلمة المرور", "Edit Info / Fee / Password")}</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MODAL: EDIT STAFF ROLE, STATUS, FEE & PASSWORD */}
                {editingStaff && (
                  <div className="fixed inset-0 bg-[#2C1810]/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-white border border-clinicBorder rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                      <button onClick={() => { setEditingStaff(null); setEditingStaffPassword(""); }} className="absolute right-4 rtl:right-auto rtl:left-4 top-4 text-stone-500 hover:text-[#2C1810] text-lg">×</button>
                      <div>
                        <h4 className="text-lg font-serif text-[#2C1810] font-bold">
                          {tr3(lang, "Personel / Hekim Tüm Bilgileri Düzenle", "تعديل جميع بيانات الموظف / الطبيب", "Edit Staff / Doctor Profile & Credentials")}
                        </h4>
                        <p className="text-[11px] text-[#7D6E63]">
                          {tr3(lang, "Ad, Gmail, numara, kategori, muayene ücreti (SYP) ve giriş şifresini güncelleyin.", "تحديث الاسم، البريد، الهاتف، الفئة، أجرة المعاينة وكلمة المرور.", "Update full name, Gmail/email, phone, role category, consultation fee (SYP), and password.")}
                        </p>
                      </div>
                      <form onSubmit={handleUpdateStaff} className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Ad Soyad", "الاسم الكامل", "Full Name")}</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-[#FAF7F2] border border-clinicBorder rounded-xl p-2.5 text-xs"
                            value={editingStaff.fullName}
                            onChange={(e) => setEditingStaff({ ...editingStaff, fullName: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Gmail / E-posta", "البريد الإلكتروني", "Gmail / Email")}</label>
                            <input
                              type="email"
                              required
                              className="w-full bg-[#FAF7F2] border border-clinicBorder rounded-xl p-2.5 text-xs font-mono"
                              value={editingStaff.email}
                              onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{t.phone}</label>
                            <input
                              type="text"
                              className="w-full bg-[#FAF7F2] border border-clinicBorder rounded-xl p-2.5 text-xs font-mono"
                              value={editingStaff.phone || ""}
                              onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Kategori / Rol", "الفئة / الصلاحية", "Category / Role")}</label>
                            <select
                              className="w-full bg-[#FAF7F2] border border-clinicBorder rounded-xl p-2.5 text-xs font-bold"
                              value={editingStaff.role}
                              onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                            >
                              <option value="DOCTOR">{t.roleDoctor}</option>
                              <option value="RECEPTIONIST">{t.roleReceptionist}</option>
                              <option value="PHARMACIST">{t.rolePharmacist}</option>
                              <option value="LAB_TECH">{t.roleLabTech}</option>
                              <option value="ACCOUNTANT">{t.roleAccountant}</option>
                              <option value="ADMIN">{t.roleAdmin}</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Hesap Durumu", "حالة الحساب", "Account Status")}</label>
                            <select
                              className="w-full bg-[#FAF7F2] border border-clinicBorder rounded-xl p-2.5 text-xs font-bold"
                              value={editingStaff.status}
                              onChange={(e) => setEditingStaff({ ...editingStaff, status: e.target.value })}
                            >
                              <option value="ACTIVE">{tr3(lang, "Aktif", "نشط", "Active")}</option>
                              <option value="SUSPENDED">{tr3(lang, "Askıda", "معلق", "Suspended")}</option>
                            </select>
                          </div>
                        </div>
                        {editingStaff.role === "DOCTOR" && (
                          <div className="space-y-1">
                            <label className="block text-[10px] text-emerald-800 uppercase font-bold">{t.consultationFee} ({t.currency})</label>
                            <input
                              type="number"
                              min={0}
                              className="w-full bg-[#FAF7F2] border border-emerald-300 rounded-xl p-2.5 text-xs font-mono font-bold text-emerald-900"
                              value={editingStaff.consultationFee ?? 1000}
                              onChange={(e) => setEditingStaff({ ...editingStaff, consultationFee: Number(e.target.value) })}
                            />
                          </div>
                        )}
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                          <label className="block text-[10px] text-[#4A2E1B] uppercase font-bold flex items-center gap-1">
                            <Lock size={11} />
                            <span>{tr3(lang, "Yeni Giriş Şifresi Belirle", "تعيين كلمة مرور جديدة", "Set New Login Password")}</span>
                          </label>
                          <input
                            type="text"
                            placeholder={tr3(lang, "Boş bırakırsanız mevcut şifre korunur...", "اتركه فارغاً للإبقاء على كلمة المرور الحالية...", "Leave blank to keep current password...")}
                            className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs font-mono"
                            value={editingStaffPassword}
                            onChange={(e) => setEditingStaffPassword(e.target.value)}
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-[#4A2E1B] hover:bg-[#382112] text-white py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-md transition-all"
                        >
                          {tr3(lang, "Tüm Bilgileri & Şifreyi Kaydet", "حفظ جميع البيانات وكلمة المرور", "Save Profile & Password")}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* MODAL: ADD STAFF (ANY ROLE CATEGORY) */}
                {showAddStaff && (
                  <div className="fixed inset-0 bg-[#2C1810]/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-white border border-clinicBorder rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                      <button onClick={() => setShowAddStaff(false)} className="absolute right-4 rtl:right-auto rtl:left-4 top-4 text-stone-500 hover:text-[#2C1810] text-lg">×</button>
                      <h4 className="text-lg font-serif text-clinicGold uppercase tracking-wider font-semibold">
                        {tr3(lang, "Yeni Personel / Hekim Hesabı Ekle", "إضافة حساب موظف / طبيب جديد", "Add New Staff / Doctor Account")}
                      </h4>
                      <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Kategori / Görev Rolü *", "الفئة / الدور الوظيفي *", "Category / Role *")}</label>
                          <select className="w-full bg-[#FAF7F2] border border-clinicBorder rounded-xl p-2.5 text-xs font-bold" onChange={e => setNewStaff({...newStaff, role: e.target.value})} value={newStaff.role}>
                            <option value="RECEPTIONIST">{t.roleReceptionist}</option>
                            <option value="PHARMACIST">{t.rolePharmacist}</option>
                            <option value="ACCOUNTANT">{t.roleAccountant}</option>
                            <option value="LAB_TECH">{t.roleLabTech}</option>
                            <option value="DOCTOR">{t.roleDoctor}</option>
                            <option value="ADMIN">{t.roleAdmin}</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Ad Soyad *", "الاسم الكامل *", "Full Name *")}</label>
                          <input type="text" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded-xl p-2.5 text-xs" onChange={e => setNewStaff({...newStaff, fullName: e.target.value})} value={newStaff.fullName} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Gmail / E-posta *", "البريد الإلكتروني *", "Gmail / Email *")}</label>
                            <input type="email" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded-xl p-2.5 text-xs font-mono" onChange={e => setNewStaff({...newStaff, email: e.target.value})} value={newStaff.email} />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{t.phone}</label>
                            <input type="text" className="w-full bg-[#FAF7F2] border border-clinicBorder rounded-xl p-2.5 text-xs font-mono" onChange={e => setNewStaff({...newStaff, phone: e.target.value})} value={newStaff.phone} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Giriş Şifresi *", "كلمة المرور *", "Login Password *")}</label>
                            <input type="text" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded-xl p-2.5 text-xs font-mono" onChange={e => setNewStaff({...newStaff, password: e.target.value})} value={newStaff.password} />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{t.identityNo}</label>
                            <input type="text" className="w-full bg-[#FAF7F2] border border-clinicBorder rounded-xl p-2.5 text-xs font-mono" onChange={e => setNewStaff({...newStaff, identityNo: e.target.value})} value={newStaff.identityNo} />
                          </div>
                        </div>
                        {newStaff.role === "DOCTOR" && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Branş", "التخصص", "Specialty")}</label>
                              <input type="text" className="w-full bg-[#FAF7F2] border border-clinicBorder rounded-xl p-2.5 text-xs" onChange={e => setNewStaff({...newStaff, specialty: e.target.value})} value={newStaff.specialty} />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] text-emerald-800 uppercase font-bold">{t.consultationFee} ({t.currency})</label>
                              <input type="number" className="w-full bg-[#FAF7F2] border border-emerald-300 rounded-xl p-2.5 text-xs font-mono font-bold" onChange={e => setNewStaff({...newStaff, consultationFee: Number(e.target.value)})} value={newStaff.consultationFee} />
                            </div>
                          </div>
                        )}
                        <button type="submit" className="w-full bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-all mt-2">
                          {tr3(lang, "Personeli Kaydet & Yetkilendir", "حفظ الموظف وتفويضه", "Save & Authorize Staff")}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* MODAL: ADD INVENTORY */}
                {showAddItem && (
                  <div className="fixed inset-0 bg-[#2C1810]/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-white border border-clinicBorder rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                      <button onClick={() => setShowAddItem(false)} className="absolute right-4 rtl:right-auto rtl:left-4 top-4 text-stone-500 hover:text-[#2C1810] text-lg">×</button>
                      <h4 className="text-lg font-serif text-clinicGold uppercase tracking-wider font-semibold">
                        {tr3(lang, "Eczane Depo Yeni İlaç Ekle", "إضافة صنف دوائي جديد للمستودع", "Add New Pharmacy Stock Item")}
                      </h4>
                      <form onSubmit={handleAddInventory} className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "İlaç / Sarf Malzeme Adı", "اسم الدواء / المستحضر", "Medication / Supply Name")}</label>
                          <input type="text" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewItem({...newItem, itemName: e.target.value})} value={newItem.itemName} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">SKU</label>
                            <input type="text" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewItem({...newItem, SKU: e.target.value})} value={newItem.SKU} />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Stok Miktarı", "الكمية", "Stock Quantity")}</label>
                            <input type="number" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewItem({...newItem, stockQuantity: parseInt(e.target.value) || 0})} value={newItem.stockQuantity} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Maliyet (Alış Fiyatı)", "تكلفة الشراء", "Supplier Cost")} ({t.currency})</label>
                            <input type="number" step="0.01" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewItem({...newItem, supplierPrice: parseFloat(e.target.value) || 0})} value={newItem.supplierPrice} />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Satış Fiyatı", "سعر البيع", "Retail Price")} ({t.currency})</label>
                            <input type="number" step="0.01" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewItem({...newItem, retailPrice: parseFloat(e.target.value) || 0})} value={newItem.retailPrice} />
                          </div>
                        </div>
                        <button type="submit" className="w-full bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm py-2 rounded text-xs uppercase tracking-widest font-bold hover:bg-clinicGold hover:text-neutral-950 transition-all mt-2">
                          {tr3(lang, "Kaydet", "حفظ", "Save")}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* MODAL: EDIT INVENTORY ITEM */}
                {showEditItem && (
                  <div className="fixed inset-0 bg-[#2C1810]/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
                    <div className="bg-white border border-clinicBorder rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                      <button onClick={() => setShowEditItem(null)} className="absolute right-4 rtl:right-auto rtl:left-4 top-4 text-stone-500 hover:text-[#2C1810] text-lg">×</button>
                      <h4 className="text-lg font-serif text-clinicGold uppercase tracking-wider font-semibold">
                        {tr3(lang, "İlaç Stok Kartını Düzenle", "تعديل بطاقة صنف الدواء", "Edit Medication Stock Card")}
                      </h4>
                      <form onSubmit={handleUpdateInventory} className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "İlaç Adı", "اسم الدواء", "Medication Name")}</label>
                          <input type="text" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setShowEditItem({...showEditItem, itemName: e.target.value})} value={showEditItem.itemName} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">SKU</label>
                            <input type="text" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setShowEditItem({...showEditItem, SKU: e.target.value})} value={showEditItem.SKU} />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Mevcut Stok", "المخزون الحالي", "Current Stock")}</label>
                            <input type="number" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setShowEditItem({...showEditItem, stockQuantity: parseInt(e.target.value) || 0})} value={showEditItem.stockQuantity} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Alış Maliyeti", "تكلفة الشراء", "Supplier Cost")} ({t.currency})</label>
                            <input type="number" step="0.01" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setShowEditItem({...showEditItem, supplierPrice: parseFloat(e.target.value) || 0})} value={showEditItem.supplierPrice} />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">{tr3(lang, "Satış Fiyatı", "سعر البيع", "Retail Price")} ({t.currency})</label>
                            <input type="number" step="0.01" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setShowEditItem({...showEditItem, retailPrice: parseFloat(e.target.value) || 0})} value={showEditItem.retailPrice} />
                          </div>
                        </div>
                        <button type="submit" className="w-full bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm py-2 rounded text-xs uppercase tracking-widest font-bold hover:bg-clinicGold hover:text-neutral-950 transition-all mt-2">
                          {tr3(lang, "Güncelle", "تحديث", "Update")}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}

          </main>

        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-[#E5DCD0] bg-white py-4 text-center text-xs text-[#8C6D53] z-10">
        <p>© {new Date().getFullYear()} Mena Clinic. {tr3(lang, "Personel Yönetim Portalı", "بوابة إدارة العمليات الطبية", "Staff Operations Portal")}</p>
      </footer>

    </div>
  );
}
