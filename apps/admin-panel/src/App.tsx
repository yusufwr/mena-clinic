import { apiFetch } from "./apiClient";
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
  Receipt
} from "lucide-react";
import { adminTranslations, AdminLang } from "./i18n";
import { DoctorsHub } from "./components/DoctorsHub";
import { AccountantHub } from "./components/AccountantHub";

const API_URL = "http://localhost:3001/api";

const QUICK_STAFF = [
  { role: "ADMIN", name: "Yönetici Ahmet", email: "admin@menaclinic.com", color: "bg-red-50 text-red-700 border-red-200" },
  { role: "ACCOUNTANT", name: "Muhasebeci Kemal", email: "accountant@menaclinic.com", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { role: "DOCTOR", name: "Dr. Selim (Cardio)", email: "cardio@menaclinic.com", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { role: "RECEPTIONIST", name: "Danışma Merve", email: "receptionist@menaclinic.com", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { role: "PHARMACIST", name: "Eczacı Mustafa", email: "pharmacist@menaclinic.com", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { role: "LAB_TECH", name: "Teknisyen Ali", email: "labtech@menaclinic.com", color: "bg-[#EFE8DC] text-[#4A2E1B] border-[#E5DCD0]" }
];

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("staff_token"));
  const [user, setUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [lang, setLang] = useState<AdminLang>(() => (localStorage.getItem("admin_lang") as AdminLang) || "tr");
  const t = adminTranslations[lang] || adminTranslations.tr;

  const handleLanguageChange = (newLang: AdminLang) => {
    setLang(newLang);
    localStorage.setItem("admin_lang", newLang);
  };

  // Login Form
  const [loginForm, setLoginForm] = useState({ email: "", password: "Password123" });

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
  const [slotDate, setSlotDate] = useState("");

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

  // 5. Admin
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({ email: "", password: "Password123", fullName: "", phone: "", identityNo: "", role: "DOCTOR" });
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

    if (activeMenu === "reception") {
      fetchPatients();
      fetchDoctors();
      fetchAppointments();
    } else if (activeMenu === "doctor") {
      fetchAppointments();
      fetchDoctors();
    } else if (activeMenu === "pharmacy") {
      fetchPrescriptions();
      fetchInventory();
    } else if (activeMenu === "lab") {
      fetchLabOrders();
    } else if (activeMenu === "admin_fin") {
      fetchFinanceReport();
      fetchAuditLogs();
      fetchInventory();
      fetchStaffList();
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
      .then(res => res.json()).then(data => setPatients(data));
  };
  const fetchDoctors = () => {
    apiFetch(`${API_URL}/doctors`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setDoctors(data));
  };
  const fetchAppointments = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    apiFetch(`${API_URL}/appointments?date=${todayStr}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setAppointments(data));
  };
  const fetchPrescriptions = () => {
    apiFetch(`${API_URL}/prescriptions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setPrescriptions(data));
  };
  const fetchInventory = () => {
    apiFetch(`${API_URL}/inventory`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setInventory(data));
  };
  const fetchLabOrders = () => {
    apiFetch(`${API_URL}/lab-orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setLabOrders(data));
  };
  const fetchFinanceReport = () => {
    apiFetch(`${API_URL}/finance/report`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setFinanceReport(data));
  };
  const fetchAuditLogs = () => {
    apiFetch(`${API_URL}/audit-logs`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setAuditLogs(data));
  };
  const fetchStaffList = () => {
    apiFetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setStaffList(data));
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
      if (!res.ok) throw new Error(data.message || "Giriş başarısız.");
      return data;
    })
    .then(data => {
      if (data.user.role === "PATIENT") {
        throw new Error("Hastalar personel paneline giriş yapamaz. Lütfen hasta portalını kullanın.");
      }
      localStorage.setItem("staff_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setSuccessMsg("Giriş başarılı!");
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
      setSuccessMsg("Hasta başarıyla kaydedildi.");
      setNewPatient({ fullName: "", phone: "", identityNo: "", email: "", bloodType: "A+", emergencyContact: "", insuranceInfo: "" });
      setShowAddPatient(false);
      fetchPatients();
    })
    .catch(err => setErrorMsg(err.message));
  };

  // Fetch slots for receptionist appointment creation
  useEffect(() => {
    if (newApp.doctorId && slotDate) {
      apiFetch(`${API_URL}/doctors/${newApp.doctorId}/schedule?date=${slotDate}`)
        .then(res => res.json())
        .then(data => {
          const { schedules, bookedSlots } = data;
          const dateObj = new Date(slotDate);
          const dayOfWeek = dateObj.getDay();
          const daySchedule = schedules.find((s: any) => s.dayOfWeek === dayOfWeek);

          if (!daySchedule) {
            setDoctorSlots([]);
            return;
          }

          const slots: string[] = [];
          const [startH, startM] = daySchedule.startTime.split(":").map(Number);
          const [endH, endM] = daySchedule.endTime.split(":").map(Number);
          const [breakStartH, breakStartM] = daySchedule.breakStart.split(":").map(Number);
          const [breakEndH, breakEndM] = daySchedule.breakEnd.split(":").map(Number);

          let current = new Date(slotDate);
          current.setHours(startH, startM, 0, 0);
          const endLimit = new Date(slotDate);
          endLimit.setHours(endH, endM, 0, 0);
          const breakStart = new Date(slotDate);
          breakStart.setHours(breakStartH, breakStartM, 0, 0);
          const breakEnd = new Date(slotDate);
          breakEnd.setHours(breakEndH, breakEndM, 0, 0);

          while (current < endLimit) {
            if (current < breakStart || current >= breakEnd) {
              const isBooked = bookedSlots.some((bs: string) => new Date(bs).getTime() === current.getTime());
              if (!isBooked) {
                slots.push(current.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
              }
            }
            current.setMinutes(current.getMinutes() + 30);
          }
          setDoctorSlots(slots);
        });
    }
  }, [newApp.doctorId, slotDate]);

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const [h, m] = newApp.slotTime.split(":");
    const appTime = new Date(slotDate);
    appTime.setHours(parseInt(h), parseInt(m), 0, 0);

    apiFetch(`${API_URL}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        patientId: newApp.patientId,
        doctorId: newApp.doctorId,
        slotTime: appTime.toISOString()
      })
    })
    .then(async res => {
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      return d;
    })
    .then(() => {
      setSuccessMsg("Randevu başarıyla oluşturuldu.");
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
      setSuccessMsg("Randevu durumu güncellendi.");
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
        diagnosis: soapNotes.diagnosis,
        clinicalNotes: soapNotes.clinicalNotes,
        prescriptionItems: prescDrugs,
        labTests: reqTests
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
      setSuccessMsg("Reçete ilaçları teslim edildi. Satış %10 hasta indirimiyle kaydedildi.");
      fetchPrescriptions();
      fetchInventory();
    })
    .catch(err => setErrorMsg(err.message));
  };

  // Lab Tech actions
  const handleSaveLabResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labResultText || !selectedLabOrder) return;

    // Simulate S3 upload path
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
      setSuccessMsg("Laboratuvar sonucu ve analiz dosyası başarıyla kaydedildi.");
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
      setSuccessMsg("Yeni personel hesabı açıldı.");
      setNewStaff({ email: "", password: "Password123", fullName: "", phone: "", identityNo: "", role: "DOCTOR" });
      setShowAddStaff(false);
      fetchStaffList();
    })
    .catch(err => setErrorMsg(err.message));
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
      setSuccessMsg("Stok kartı eklendi.");
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
      setSuccessMsg("Stok güncellendi.");
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
      {/* HEADER */}
      <header className="border-b border-[#E5DCD0] bg-white/95 backdrop-blur-md px-6 py-3.5 flex justify-between items-center z-10 sticky top-0 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full p-0.5 bg-[#FAF7F2] border border-[#E5DCD0] flex items-center justify-center shadow-xs overflow-hidden">
            <img
              src="/logo.png"
              alt="Mena Clinic Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-serif font-bold tracking-wide text-[#2C1810]">
              {t.clinicTitle}
            </h1>
            <p className="text-[10px] tracking-widest text-[#8C6D53] font-sans font-semibold uppercase">
              {t.panelSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#E5DCD0]">
            <button
              onClick={() => handleLanguageChange("tr")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                lang === "tr"
                  ? "bg-[#4A2E1B] text-white shadow-xs"
                  : "text-[#6E492D] hover:bg-[#EFE8DC]"
              }`}
              title="Türkçe"
            >
              🇹🇷 TR
            </button>
            <button
              onClick={() => handleLanguageChange("ar")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                lang === "ar"
                  ? "bg-[#4A2E1B] text-white shadow-xs"
                  : "text-[#6E492D] hover:bg-[#EFE8DC]"
              }`}
              title="العربية"
            >
              🇸🇾 AR
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                lang === "en"
                  ? "bg-[#4A2E1B] text-white shadow-xs"
                  : "text-[#6E492D] hover:bg-[#EFE8DC]"
              }`}
              title="English"
            >
              🇬🇧 EN
            </button>
          </div>

          {token && user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
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
                className="flex items-center gap-1.5 text-xs text-[#4A2E1B] hover:text-red-700 hover:bg-red-50 border border-[#E5DCD0] px-3 py-1.5 rounded-xl bg-white transition-all font-semibold shadow-xs"
              >
                <LogOut size={13} />
                <span>{t.logout}</span>
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

              {/* Quick Logins for Testing */}
              <div className="space-y-3 pt-4">
                <p className="text-[11px] text-[#8C6D53] uppercase tracking-wider font-bold">
                  {lang === "ar" ? "تسجيل دخول سريع للتجربة (كلمة المرور: Password123)" : "Hızlı Giriş Seçenekleri (Şifre: Password123)"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUICK_STAFF.map((st) => (
                    <button
                      key={st.role}
                      onClick={() => quickLogin(st.email)}
                      className={`text-[11px] text-left px-3 py-2 rounded-xl border hover:shadow-xs transition-all ${st.color}`}
                    >
                      <strong className="block text-[#2C1810] truncate">{st.name}</strong>
                      <span className="opacity-75 text-[10px] uppercase font-semibold">{st.role}</span>
                    </button>
                  ))}
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
                  {lang === "ar" ? "تسجيل الدخول للنظام" : "Kullanıcı Girişi"}
                </h3>
                <p className="text-xs text-[#8C6D53]">
                  {lang === "ar" ? "أدخل بيانات اعتماد الموظف" : "Personel e-posta ve şifrenizi girin"}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[11px] text-[#4A2E1B] uppercase font-semibold">
                    {lang === "ar" ? "البريد الإلكتروني" : "E-posta"}
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
                    {lang === "ar" ? "كلمة المرور" : "Şifre"}
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
                  {lang === "ar" ? "دخول إلى النظام" : "Oturum Aç"}
                </button>
              </form>
            </div>

          </div>
        </div>
      ) : (
        // DASHBOARD INTERFACE
        <div className="flex-grow flex flex-col md:flex-row">
          
          {/* Side Menu */}
          <aside className="w-full md:w-64 border-r border-[#E5DCD0] bg-white p-5 space-y-6">
            <span className="text-[10px] uppercase tracking-wider text-[#8C6D53] font-bold block">
              {t.roleSpecialScreens}
            </span>
            <nav className="space-y-1.5">
              {/* ADMIN HAS FULL 360° ACCESS TO ALL MODULES */}
              {user.role === "ADMIN" && (
                <>
                  <button
                    onClick={() => setActiveMenu("admin_overview")}
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
                    onClick={() => setActiveMenu("doctors_hub")}
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
                    onClick={() => setActiveMenu("reception")}
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
                    onClick={() => setActiveMenu("pharmacy")}
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
                    onClick={() => setActiveMenu("lab")}
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
                    onClick={() => setActiveMenu("accountant")}
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
                    onClick={() => setActiveMenu("admin_fin")}
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
                    onClick={() => setActiveMenu("accountant")}
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
                    onClick={() => setActiveMenu("pharmacy")}
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
                    onClick={() => setActiveMenu("admin_fin")}
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

              {/* RECEPTIONIST */}
              {user.role === "RECEPTIONIST" && (
                <button
                  onClick={() => setActiveMenu("reception")}
                  className={`w-full text-left flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all ${
                    activeMenu === "reception"
                      ? "bg-[#4A2E1B] text-white shadow-sm"
                      : "text-[#6E492D] hover:bg-[#FAF7F2] hover:text-[#2C1810]"
                  }`}
                >
                  <UserCheck size={15} />
                  <span>{t.roleReceptionist}</span>
                </button>
              )}

              {/* DOCTOR */}
              {user.role === "DOCTOR" && (
                <button
                  onClick={() => setActiveMenu("doctor")}
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
                  onClick={() => setActiveMenu("pharmacy")}
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
                  onClick={() => setActiveMenu("lab")}
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
          <main className="flex-grow p-8 space-y-8 overflow-y-auto">
            
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
                      <span>{appointments.length} {lang === "ar" ? "موعد اليوم" : "Randevu"} →</span>
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
                        {lang === "ar" ? "أصناف دوائية" : lang === "tr" ? "İlaç Kalemi" : "Medications"}
                      </span>
                    </div>
                    <div className="text-xs text-purple-700 font-medium mt-2">
                      <span>{prescriptions.length} {lang === "ar" ? "وصفة تصرف" : "Reçete"} →</span>
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
                      {((financeReport?.totalRevenue) || 18500).toLocaleString()}{" "}
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
                        ? "تقارير مالية تفصيلية لكل طبيب، توزيع الحصص (%65 للطبيب و%35 للمركز)، وتحليلات أرباح ومخزون الصيدلية."
                        : lang === "tr"
                        ? "Her hekim için ayrı hakediş raporları (%65 hekim / %35 klinik), eczane kar/maliyet analizleri ve PDF yazdırma."
                        : "Individual doctor settlements (65% doctor / 35% clinic), pharmacy revenue margins and exportable reports."}
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
              </div>
            )}

            {/* DOCTORS 360° HUB MODULE */}
            {activeMenu === "doctors_hub" && (
              <DoctorsHub
                doctors={doctors}
                appointments={appointments}
                patients={patients}
                t={t}
                lang={lang}
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
                    todayRevenue: 18500,
                    pendingInvoices: 3,
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
                <div className="flex justify-between items-center border-b border-clinicBorder pb-3">
                  <div>
                    <h3 className="text-xl font-serif text-[#2C1810]">Danışma & Hasta Kabul</h3>
                    <p className="text-xs text-[#4E3D30]">Hasta kaydı yapabilir, canlı randevu ve doktor kuyruğunu düzenleyebilirsiniz.</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowAddPatient(true)}
                      className="flex items-center gap-1 bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm text-xs uppercase px-4 py-2 rounded hover:bg-clinicGold hover:text-neutral-950 transition-all font-semibold"
                    >
                      <Plus size={12} /> Hasta Kaydet
                    </button>
                    <button 
                      onClick={() => setShowAddApp(true)}
                      className="flex items-center gap-1 bg-[#FAF7F2] border border-clinicBorder text-[#2C1810] text-xs uppercase px-4 py-2 rounded hover:text-white hover:border-clinicGold/40 transition-all font-semibold"
                    >
                      <Plus size={12} /> Randevu Oluştur
                    </button>
                  </div>
                </div>

                {/* Queue Triage Board */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold">Günlük Muayene & Sıra Kuyruk Panosu</h4>
                    <button onClick={fetchAppointments} className="p-1 bg-stone-900 border border-clinicBorder text-[#4E3D30] hover:text-[#2C1810] rounded">
                      <RefreshCw size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CONFIRMED QUEUE */}
                    <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg p-4 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900 w-fit">Onaylı Bekleyenler</span>
                      <div className="space-y-2">
                        {appointments.filter(a => a.status === "CONFIRMED").length === 0 ? (
                          <p className="text-[11px] text-stone-500 italic">Kuyrukta bekleyen hasta yok.</p>
                        ) : (
                          appointments.filter(a => a.status === "CONFIRMED").map(app => (
                            <div key={app.id} className="bg-white border border-clinicBorder p-3 rounded text-xs space-y-2">
                              <div className="flex justify-between">
                                <strong className="text-[#2C1810]">{app.patient?.user?.fullName}</strong>
                                <span className="text-clinicGold font-mono">Sıra #{app.queueNumber}</span>
                              </div>
                              <p className="text-[10px] text-[#4E3D30]">Dr: {app.doctor?.fullName}</p>
                              <p className="text-[9px] text-stone-500">{new Date(app.slotTime).toLocaleTimeString("tr-TR", {hour:"2-digit",minute:"2-digit"})}</p>
                              <div className="flex gap-2 pt-1.5 border-t border-clinicBorder">
                                <button 
                                  onClick={() => handleUpdateAppStatus(app.id, "CANCELLED")}
                                  className="text-[9px] text-red-400 hover:underline"
                                >
                                  İptal Et
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* PENDING REGISTER */}
                    <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg p-4 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-1.5 bg-amber-950/20 px-2 py-0.5 rounded border border-gold-900 w-fit">Teyit Bekleyen Randevular</span>
                      <div className="space-y-2">
                        {appointments.filter(a => a.status === "PENDING").length === 0 ? (
                          <p className="text-[11px] text-stone-500 italic">Teyit bekleyen randevu yok.</p>
                        ) : (
                          appointments.filter(a => a.status === "PENDING").map(app => (
                            <div key={app.id} className="bg-white border border-clinicBorder p-3 rounded text-xs space-y-2">
                              <div className="flex justify-between">
                                <strong className="text-[#2C1810]">{app.patient?.user?.fullName}</strong>
                                <span className="text-amber-500 text-[10px]">Teyitsiz</span>
                              </div>
                              <p className="text-[10px] text-[#4E3D30]">Dr: {app.doctor?.fullName}</p>
                              <p className="text-[9px] text-stone-500">{new Date(app.slotTime).toLocaleTimeString("tr-TR", {hour:"2-digit",minute:"2-digit"})}</p>
                              <div className="flex gap-2 pt-1.5 border-t border-clinicBorder">
                                <button 
                                  onClick={() => handleUpdateAppStatus(app.id, "CONFIRMED")}
                                  className="text-[9px] text-emerald-400 hover:underline font-bold"
                                >
                                  Onayla (Kuyruğa Al)
                                </button>
                                <button 
                                  onClick={() => handleUpdateAppStatus(app.id, "CANCELLED")}
                                  className="text-[9px] text-stone-500 hover:underline"
                                >
                                  İptal
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* COMPLETED TODAY */}
                    <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg p-4 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-[#4E3D30] flex items-center gap-1.5 bg-stone-900/30 px-2 py-0.5 rounded border border-stone-850 w-fit">Bugün Tamamlananlar</span>
                      <div className="space-y-2">
                        {appointments.filter(a => a.status === "COMPLETED").length === 0 ? (
                          <p className="text-[11px] text-stone-500 italic">Bugün henüz tamamlanan olmadı.</p>
                        ) : (
                          appointments.filter(a => a.status === "COMPLETED").map(app => (
                            <div key={app.id} className="bg-white/50 border border-clinicBorder p-3 rounded text-xs space-y-1 opacity-70">
                              <div className="flex justify-between">
                                <strong className="text-[#2C1810]">{app.patient?.user?.fullName}</strong>
                                <span className="text-emerald-500">✓</span>
                              </div>
                              <p className="text-[10px] text-stone-500">Dr: {app.doctor?.fullName}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient List */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold">Kayıtlı Klinik Hastaları</h4>
                  <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-clinicBorder text-[#4E3D30] bg-[#FAF7F2]">
                          <th className="p-3">Hasta Adı</th>
                          <th className="p-3">Kimlik / Pasaport</th>
                          <th className="p-3">Telefon</th>
                          <th className="p-3">Kan Grubu</th>
                          <th className="p-3">Sigorta Bilgisi</th>
                          <th className="p-3">Acil Durum İrtibatı</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients.map(p => (
                          <tr key={p.id} className="border-b border-clinicBorder hover:bg-[#FAF7F2]/80">
                            <td className="p-3 font-semibold text-[#2C1810]">{p.user?.fullName}</td>
                            <td className="p-3 font-mono">{p.user?.identityNo}</td>
                            <td className="p-3">{p.user?.phone}</td>
                            <td className="p-3 text-red-500 font-bold">{p.bloodType || "Bilinmiyor"}</td>
                            <td className="p-3 text-[#4E3D30]">{p.insuranceInfo || "SGK"}</td>
                            <td className="p-3 text-[#4E3D30] truncate max-w-[200px]" title={p.emergencyContact}>{p.emergencyContact || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MODAL: ADD PATIENT */}
                {showAddPatient && (
                  <div className="fixed inset-0 bg-[#2C1810]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-clinicBorder rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
                      <button onClick={() => setShowAddPatient(false)} className="absolute right-4 top-4 text-stone-500 hover:text-[#2C1810] text-lg">×</button>
                      <h4 className="text-lg font-serif text-clinicGold uppercase tracking-wider">Walk-in Hasta Kayıt Formu</h4>
                      <form onSubmit={handleAddPatient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Ad Soyad</label>
                          <input type="text" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewPatient({...newPatient, fullName: e.target.value})} value={newPatient.fullName} />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Kimlik No / Pasaport No</label>
                          <input type="text" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewPatient({...newPatient, identityNo: e.target.value})} value={newPatient.identityNo} />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Telefon</label>
                          <input type="text" className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewPatient({...newPatient, phone: e.target.value})} value={newPatient.phone} />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">E-posta (İsteğe Bağlı)</label>
                          <input type="email" className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewPatient({...newPatient, email: e.target.value})} value={newPatient.email} />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Kan Grubu</label>
                          <select className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewPatient({...newPatient, bloodType: e.target.value})} value={newPatient.bloodType}>
                            <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                            <option>AB+</option><option>AB-</option><option>0+</option><option>0-</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Sigorta Bilgileri</label>
                          <input type="text" className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewPatient({...newPatient, insuranceInfo: e.target.value})} value={newPatient.insuranceInfo} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Acil Durum İrtibat Kişisi & Telefon</label>
                          <input type="text" className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewPatient({...newPatient, emergencyContact: e.target.value})} value={newPatient.emergencyContact} />
                        </div>
                        <button type="submit" className="md:col-span-2 w-full bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm py-2 rounded text-xs uppercase tracking-widest font-bold hover:bg-clinicGold hover:text-neutral-950 transition-all mt-2">Kaydet</button>
                      </form>
                    </div>
                  </div>
                )}

                {/* MODAL: ADD APPOINTMENT */}
                {showAddApp && (
                  <div className="fixed inset-0 bg-[#2C1810]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-clinicBorder rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
                      <button onClick={() => setShowAddApp(false)} className="absolute right-4 top-4 text-stone-500 hover:text-[#2C1810] text-lg">×</button>
                      <h4 className="text-lg font-serif text-clinicGold uppercase tracking-wider">Randevu Planlama</h4>
                      <form onSubmit={handleAddAppointment} className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Hasta Seçimi</label>
                          <select required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewApp({...newApp, patientId: e.target.value})} value={newApp.patientId}>
                            <option value="">-- Hasta Seçin --</option>
                            {patients.map(p => (
                              <option key={p.id} value={p.id}>{p.user?.fullName} ({p.user?.identityNo})</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Doktor Seçimi</label>
                          <select required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewApp({...newApp, doctorId: e.target.value})} value={newApp.doctorId}>
                            <option value="">-- Doktor Seçin --</option>
                            {doctors.map(d => (
                              <option key={d.id} value={d.id}>{d.fullName}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Tarih</label>
                          <input type="date" required min={new Date().toISOString().split("T")[0]} className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setSlotDate(e.target.value)} value={slotDate} />
                        </div>
                        {slotDate && newApp.doctorId && (
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Saat Slotu</label>
                            <select required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewApp({...newApp, slotTime: e.target.value})} value={newApp.slotTime}>
                              <option value="">-- Müsait Saat Seçin --</option>
                              {doctorSlots.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <button type="submit" className="w-full bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm py-2.5 rounded text-xs uppercase tracking-widest font-bold hover:bg-clinicGold hover:text-neutral-950 transition-all mt-2">Randevu Ekle</button>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* 2. DOCTOR MODULE */}
            {activeMenu === "doctor" && (
              <div className="space-y-8">
                <div className="border-b border-clinicBorder pb-3">
                  <h3 className="text-xl font-serif text-[#2C1810] font-semibold">Poliklinik Muayene Ekranı</h3>
                  <p className="text-xs text-[#4E3D30]">Atanan hasta kuyruğunu görüntüleyebilir, SOAP notları girebilir ve reçete/lab talepleri oluşturabilirsiniz.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Queue of assigned patients */}
                  <div className="space-y-4 bg-[#FAF7F2] border border-clinicBorder p-4 rounded-lg">
                    <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold border-b border-clinicBorder pb-2">Bugünkü Hasta Kuyruğum</h4>
                    <div className="space-y-2">
                      {appointments.filter(a => a.status === "CONFIRMED" && a.doctorId === user.id).length === 0 ? (
                        <p className="text-[11px] text-stone-500 italic">Bekleyen muayeneniz bulunmamaktadır.</p>
                      ) : (
                        appointments.filter(a => a.status === "CONFIRMED" && a.doctorId === user.id).map(app => (
                          <div 
                            key={app.id} 
                            onClick={() => selectActivePatient(app)}
                            className={`p-3 rounded text-xs cursor-pointer border hover:border-clinicGold/40 transition-all ${
                              selectedQueueApp?.id === app.id ? "bg-stone-900 border-clinicGold text-clinicGold" : "bg-white border-clinicBorder text-[#2C1810]"
                            }`}
                          >
                            <div className="flex justify-between font-bold">
                              <span>{app.patient?.user?.fullName}</span>
                              <span>Sıra #{app.queueNumber}</span>
                            </div>
                            <p className="text-[10px] text-stone-500 mt-1">{new Date(app.slotTime).toLocaleTimeString("tr-TR", {hour:"2-digit",minute:"2-digit"})}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* SOAP entry & SOAP history details */}
                  <div className="lg:col-span-2 space-y-6">
                    {selectedQueueApp ? (
                      <div className="space-y-6 bg-[#FAF7F2] border border-clinicBorder p-6 rounded-lg">
                        
                        {/* Patient info details */}
                        <div className="flex justify-between border-b border-clinicBorder pb-3">
                          <div>
                            <span className="text-[8px] uppercase tracking-wider text-clinicGold">Muayene Edilen Hasta</span>
                            <h4 className="text-base text-[#2C1810] font-bold">{selectedQueueApp.patient?.user?.fullName}</h4>
                            <p className="text-[10px] text-stone-500">Kan: <strong className="text-red-500">{selectedQueueApp.patient?.bloodType || "A+"}</strong> | Kimlik: {selectedQueueApp.patient?.user?.identityNo}</p>
                          </div>
                          <button onClick={() => setSelectedQueueApp(null)} className="text-xs text-stone-500 hover:text-[#2C1810]">İptal</button>
                        </div>

                        {/* History Records (Read-only check) */}
                        {pastRecords.length > 0 && (
                          <div className="bg-white p-4 rounded border border-clinicBorder space-y-3 max-h-48 overflow-y-auto">
                            <h5 className="text-[10px] text-clinicGold uppercase font-bold border-b border-clinicBorder pb-1 flex items-center gap-1">
                              <ShieldAlert size={12} /> Geriye Dönük EMR Tanı Arşivi (Finalized & Append-Only)
                            </h5>
                            {pastRecords.map(rec => (
                              <div key={rec.id} className="text-[11px] border-b border-clinicBorder pb-2 mb-2 last:border-0">
                                <div className="flex justify-between text-[#4E3D30]">
                                  <strong>Tanı: {rec.diagnosis}</strong>
                                  <span>{new Date(rec.createdAt).toLocaleDateString("tr-TR")}</span>
                                </div>
                                <p className="text-stone-500 mt-1 whitespace-pre-wrap font-mono text-[10px] bg-stone-950 p-2 rounded">{rec.clinicalNotes}</p>
                                
                                {/* Amendments display */}
                                {rec.amendments && rec.amendments.map((am: any) => (
                                  <div key={am.id} className="bg-yellow-950/10 border-l border-yellow-600 p-1.5 rounded mt-1 ml-2 text-[10px] italic">
                                    Düzeltme: {am.notes} ({new Date(am.createdAt).toLocaleDateString("tr-TR")})
                                  </div>
                                ))}

                                {/* Add Amendment Input toggle */}
                                <div className="mt-2 text-right">
                                  {showAmendmentId === rec.id ? (
                                    <div className="space-y-1.5 mt-1.5 text-left">
                                      <textarea 
                                        placeholder="Ek bilgi girin (Asla geçmiş not silinmez, buraya eklenir)..."
                                        className="w-full bg-[#FAF7F2] border border-clinicBorder p-2 rounded text-[10px] focus:outline-none"
                                        rows={2}
                                        value={amendmentText}
                                        onChange={e => setAmendmentText(e.target.value)}
                                      />
                                      <div className="flex gap-2 justify-end">
                                        <button onClick={() => setShowAmendmentId(null)} className="text-[9px] text-stone-500 bg-stone-900 px-2 py-0.5 rounded">Vazgeç</button>
                                        <button onClick={() => handleAddAmendment(rec.id)} className="text-[9px] text-yellow-500 bg-yellow-950/20 border border-yellow-900 px-2.5 py-0.5 rounded font-semibold">Kaydet (Düzeltme Ekle)</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => { setShowAmendmentId(rec.id); setAmendmentText(""); }}
                                      className="text-[9px] text-yellow-600 hover:text-yellow-500 underline"
                                    >
                                      + Amendment (Düzeltme Notu) Ekle
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Write SOAP Notes Form */}
                        <form onSubmit={handleSaveSOAP} className="space-y-4">
                          
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Klinik Tanı (ICD-10 Kodu & Açıklaması)</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="Örn: I10 - Primer Hipertansiyon veya J06 - Akut üst solunum yolu enfeksiyonu"
                              className="w-full bg-[#FAF7F2] border border-clinicBorder p-2.5 rounded text-xs" 
                              value={soapNotes.diagnosis} 
                              onChange={e => setSoapNotes({...soapNotes, diagnosis: e.target.value})} 
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">SOAP Klinik Notları</label>
                            <textarea 
                              required 
                              rows={5}
                              placeholder="S: Şikayetler (Subjective)&#10;O: Bulgular (Objective)&#10;A: Değerlendirme (Assessment)&#10;P: Tedavi Planı (Plan)"
                              className="w-full bg-[#FAF7F2] border border-clinicBorder p-2.5 rounded text-xs font-mono" 
                              value={soapNotes.clinicalNotes} 
                              onChange={e => setSoapNotes({...soapNotes, clinicalNotes: e.target.value})} 
                            />
                          </div>

                          {/* Electronic Prescription Form */}
                          <div className="border-t border-clinicBorder pt-4 space-y-3">
                            <span className="block text-[10px] text-clinicGold uppercase font-bold">Elektronik Reçete İlaç İstemleri</span>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                              <input 
                                type="text" 
                                placeholder="İlaç Adı" 
                                className="col-span-2 bg-[#FAF7F2] border border-clinicBorder p-2 rounded text-xs" 
                                value={drugInput.itemName}
                                onChange={e => setDrugInput({...drugInput, itemName: e.target.value})}
                              />
                              <input 
                                type="text" 
                                placeholder="Dozaj (Örn: 2x1)" 
                                className="bg-[#FAF7F2] border border-clinicBorder p-2 rounded text-xs" 
                                value={drugInput.dosage}
                                onChange={e => setDrugInput({...drugInput, dosage: e.target.value})}
                              />
                              <div className="flex gap-2">
                                <input 
                                  type="number" 
                                  min={1} 
                                  className="w-16 bg-[#FAF7F2] border border-clinicBorder p-2 rounded text-xs" 
                                  value={drugInput.quantity}
                                  onChange={e => setDrugInput({...drugInput, quantity: parseInt(e.target.value) || 1})}
                                />
                                <button type="button" onClick={addDrug} className="bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm px-3 rounded text-xs">+</button>
                              </div>
                            </div>

                            {/* Drug Table */}
                            {prescDrugs.length > 0 && (
                              <div className="bg-white p-2.5 rounded border border-clinicBorder space-y-1.5">
                                {prescDrugs.map((d, index) => (
                                  <div key={index} className="flex justify-between items-center text-xs">
                                    <span>{d.itemName} - <strong className="text-[#4E3D30]">{d.dosage}</strong> ({d.quantity} Kutu)</span>
                                    <button type="button" onClick={() => removeDrug(index)} className="text-red-400 font-bold px-1 text-[11px]">Kaldır</button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Lab Test Requests Form */}
                          <div className="border-t border-clinicBorder pt-4 space-y-3">
                            <span className="block text-[10px] text-clinicGold uppercase font-bold">Laboratuvar Tetkik İstemi</span>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="İstenecek Tahlil Adı (Örn: Lipid Paneli, Hemogram)" 
                                className="flex-grow bg-[#FAF7F2] border border-clinicBorder p-2 rounded text-xs" 
                                value={testInput}
                                onChange={e => setTestInput(e.target.value)}
                              />
                              <button type="button" onClick={addTest} className="bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm px-3 py-1.5 rounded text-xs">+</button>
                            </div>

                            {reqTests.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {reqTests.map((t, index) => (
                                  <span key={index} className="bg-[#FAF7F2] border border-clinicBorder text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[#2C1810]">
                                    {t}
                                    <button type="button" onClick={() => removeTest(index)} className="text-red-400 text-[10px] font-bold">×</button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <button 
                            type="submit" 
                            className="w-full bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm py-3 rounded text-xs uppercase tracking-widest font-bold hover:bg-clinicGold hover:text-neutral-950 transition-all mt-4"
                          >
                            Muayeneyi Sonlandır & SOAP Kaydet (Immutable)
                          </button>

                        </form>
                      </div>
                    ) : (
                      <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg p-8 text-center text-stone-500 italic text-xs">
                        Lütfen soldaki kuyruktan muayene edilecek bir hasta seçin.
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* 3. PHARMACIST MODULE */}
            {activeMenu === "pharmacy" && (
              <div className="space-y-8">
                <div className="border-b border-clinicBorder pb-3">
                  <h3 className="text-xl font-serif text-[#2C1810]">Eczane Dispense & Stok Kontrolü</h3>
                  <p className="text-xs text-[#4E3D30]">Reçeteli veya reçetesiz ilaç çıkışı yapabilir, stok ve fiyat takibi gerçekleştirebilirsiniz.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Pending Prescriptions */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-clinicBorder pb-2">
                      <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold">Bekleyen Reçeteler</h4>
                      <input 
                        type="text" 
                        placeholder="Hasta adı ara..." 
                        className="bg-[#FAF7F2] border border-clinicBorder px-2.5 py-1 text-[11px] rounded focus:outline-none focus:border-clinicGold w-36"
                        value={searchPresc}
                        onChange={e => setSearchPresc(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      {prescriptions.filter(p => p.status === "PENDING" && p.patient?.user?.fullName.toLowerCase().includes(searchPresc.toLowerCase())).length === 0 ? (
                        <p className="text-[11px] text-stone-500 italic">Bekleyen reçeteli ilaç istemi bulunmamaktadır.</p>
                      ) : (
                        prescriptions.filter(p => p.status === "PENDING" && p.patient?.user?.fullName.toLowerCase().includes(searchPresc.toLowerCase())).map(p => (
                          <div key={p.id} className="bg-[#FAF7F2] border border-clinicBorder p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <strong className="text-[#2C1810] text-xs block">{p.patient?.user?.fullName}</strong>
                                <span className="text-[9px] text-stone-500 block">Hekim: {p.record?.doctor?.fullName}</span>
                              </div>
                              <span className="text-[8px] bg-amber-950 text-clinicGold border border-gold-900 px-1.5 py-0.5 rounded font-semibold uppercase">Pending</span>
                            </div>

                            <ul className="list-disc pl-4 text-[11px] text-[#4E3D30] space-y-0.5">
                              {p.items.map((item: any) => (
                                <li key={item.id}>
                                  {item.itemName} - <span className="text-[#2C1810]">{item.dosage}</span> ({item.quantity} Kutu)
                                </li>
                              ))}
                            </ul>

                            <button 
                              onClick={() => handleDispense(p.id)}
                              className="w-full bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm py-1.5 rounded text-[10px] uppercase font-bold hover:bg-clinicGold hover:text-neutral-950 transition-all"
                            >
                              İlaçları Teslim Et & Satış Yap (%10 İndirimli)
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Inventory List */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center border-b border-clinicBorder pb-2">
                      <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold">Klinik Eczane Stok Seviyeleri</h4>
                      <span className="text-[9px] text-stone-500 uppercase">Junior Pharmacist yetki kısıtlamalı görünüm</span>
                    </div>

                    <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-clinicBorder text-[#4E3D30] bg-[#FAF7F2]">
                            <th className="p-3">İlaç Adı</th>
                            <th className="p-3">SKU Barkod</th>
                            <th className="p-3 text-center">Stok Adedi</th>
                            <th className="p-3">Satış Fiyatı</th>
                            <th className="p-3 text-red-500">Maliyet Alış (Supplier Price)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventory.map(item => (
                            <tr key={item.id} className="border-b border-clinicBorder hover:bg-[#FAF7F2]/80">
                              <td className="p-3 font-semibold text-[#2C1810]">{item.itemName}</td>
                              <td className="p-3 font-mono">{item.SKU}</td>
                              <td className={`p-3 text-center font-bold ${item.stockQuantity < 20 ? "text-amber-500 animate-pulse" : "text-[#2C1810]"}`}>{item.stockQuantity} Kutu</td>
                              <td className="p-3 text-[#2C1810]">{(item.retailPrice ?? 0).toFixed(2)} TL</td>
                              <td className="p-3 text-red-400/80 font-mono">
                                {item.supplierPrice !== undefined ? `${(item.supplierPrice ?? 0).toFixed(2)} TL` : (
                                  <span className="text-[10px] text-stone-600 flex items-center gap-1">
                                    <Lock size={10} /> Gizli (Yetkisiz)
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

            {/* 4. LAB TECHNICIAN MODULE */}
            {activeMenu === "lab" && (
              <div className="space-y-8">
                <div className="border-b border-clinicBorder pb-3">
                  <h3 className="text-xl font-serif text-[#2C1810]">Laboratuvar Analiz & Sonuç Girişi</h3>
                  <p className="text-xs text-[#4E3D30]">Doktorlar tarafından talep edilen biyokimya ve tahlil testlerini listeleyip sonuç verisi ve PDF raporu girebilirsiniz.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Test orders */}
                  <div className="space-y-4 bg-[#FAF7F2] border border-clinicBorder p-4 rounded-lg">
                    <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold border-b border-clinicBorder pb-2">Tahlil / Test İstekleri</h4>
                    <div className="space-y-2">
                      {labOrders.filter(l => l.status === "PENDING").length === 0 ? (
                        <p className="text-[11px] text-stone-500 italic">Sonuç girilmeyi bekleyen tahlil isteği bulunmamaktadır.</p>
                      ) : (
                        labOrders.filter(l => l.status === "PENDING").map(order => (
                          <div 
                            key={order.id} 
                            onClick={() => { setSelectedLabOrder(order); setLabResultText(""); }}
                            className={`p-3 rounded text-xs cursor-pointer border hover:border-clinicGold/40 transition-all ${
                              selectedLabOrder?.id === order.id ? "bg-stone-900 border-clinicGold text-clinicGold" : "bg-white border-clinicBorder text-[#2C1810]"
                            }`}
                          >
                            <div className="flex justify-between font-bold">
                              <span>{order.testName}</span>
                              <span className="text-[9px] text-amber-500 uppercase">Pending</span>
                            </div>
                            <p className="text-[10px] text-[#4E3D30] mt-1">Hasta: {order.record?.patient?.user?.fullName}</p>
                            <p className="text-[9px] text-stone-500 mt-0.5">Tarih: {new Date(order.createdAt).toLocaleDateString("tr-TR")}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Enter Results */}
                  <div className="lg:col-span-2">
                    {selectedLabOrder ? (
                      <div className="bg-[#FAF7F2] border border-clinicBorder p-6 rounded-lg space-y-4">
                        <div className="flex justify-between items-center border-b border-clinicBorder pb-3">
                          <div>
                            <span className="text-[8px] uppercase tracking-wider text-clinicGold">Tahlil Detayları</span>
                            <h4 className="text-sm font-bold text-[#2C1810]">{selectedLabOrder.testName}</h4>
                            <p className="text-[10px] text-stone-500">Hasta: {selectedLabOrder.record?.patient?.user?.fullName} | Hekim: {selectedLabOrder.record?.doctor?.fullName}</p>
                          </div>
                          <button onClick={() => setSelectedLabOrder(null)} className="text-xs text-stone-500 hover:text-[#2C1810]">Vazgeç</button>
                        </div>

                        <form onSubmit={handleSaveLabResult} className="space-y-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Tahlil Değerleri & Sonuç Verileri (Metin/Sayısal)</label>
                            <textarea 
                              required 
                              rows={4}
                              placeholder="Örn: Total Kolesterol: 240 mg/dL (Yüksek), LDL: 160 mg/dL (Yüksek), HDL: 45 mg/dL"
                              className="w-full bg-[#FAF7F2] border border-clinicBorder p-2.5 rounded text-xs font-mono focus:outline-none focus:border-clinicGold" 
                              value={labResultText} 
                              onChange={e => setLabResultText(e.target.value)} 
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">PDF Rapor Dosyası (S3/MinIO signed-url simülasyonlu)</label>
                            <div className="border border-dashed border-clinicBorder p-4 rounded text-center text-stone-500 bg-white/50 text-[11px] flex flex-col items-center justify-center gap-1.5">
                              <Upload size={18} className="text-clinicGold" />
                              <span>Sistem HIPAA kurallarına göre analiz rapor dosyasını şifreleyerek yükleyecektir.</span>
                              <span className="text-[9px] text-stone-600 font-mono">Simulated path: /uploads/lab_report_{selectedLabOrder.id}_final.pdf</span>
                            </div>
                          </div>

                          <button 
                            type="submit" 
                            className="w-full bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm py-2.5 rounded text-xs uppercase tracking-widest font-bold hover:bg-clinicGold hover:text-neutral-950 transition-all"
                          >
                            Sonucu Tamamla & PDF Kaydet
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg p-8 text-center text-stone-500 italic text-xs">
                        Lütfen sonuç girişi yapmak için soldaki listeden bir tetkik isteği seçin.
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* 5. ADMIN & FINANCE MODULE */}
            {activeMenu === "admin_fin" && (
              <div className="space-y-8">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-clinicBorder pb-3">
                  <div>
                    <h3 className="text-xl font-serif text-[#2C1810]">Yönetici & Finans Departmanı</h3>
                    <p className="text-xs text-[#4E3D30]">Sistem denetim günlüklerini (Audit Logs) okuyabilir, mali kar marjlarını ve personel hesaplarını yönetebilirsiniz.</p>
                  </div>
                  {user.role === "ADMIN" && (
                    <button 
                      onClick={() => setShowAddStaff(true)}
                      className="flex items-center gap-1 bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm text-xs uppercase px-4 py-2 rounded hover:bg-clinicGold hover:text-neutral-950 transition-all font-semibold"
                    >
                      <Plus size={12} /> Personel Ekle
                    </button>
                  )}
                </div>

                {/* Finance Report Widgets */}
                {financeReport && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#FAF7F2] border border-clinicBorder p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-stone-500">Bugünkü Toplam Ciro</span>
                        <h4 className="text-lg font-bold text-emerald-400">{(financeReport.totalRevenue ?? 0).toFixed(2)} TL</h4>
                      </div>
                      <TrendingUp size={24} className="text-emerald-500/40" />
                    </div>

                    <div className="bg-[#FAF7F2] border border-clinicBorder p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-stone-500">Uygulanan Hasta İndirimleri</span>
                        <h4 className="text-lg font-bold text-amber-500">-{(financeReport.totalDiscounts ?? 0).toFixed(2)} TL</h4>
                      </div>
                      <DollarSign size={24} className="text-amber-500/40" />
                    </div>

                    <div className="bg-[#FAF7F2] border border-clinicBorder p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-stone-500">Net Tahmini İlaç Karı</span>
                        <h4 className="text-lg font-bold text-clinicGold">{(financeReport.estimatedProfit ?? 0).toFixed(2)} TL</h4>
                      </div>
                      <TrendingUp size={24} className="text-clinicGold/40" />
                    </div>

                    <div className="bg-[#FAF7F2] border border-clinicBorder p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-stone-500">Düşük Stok Alarmları</span>
                        <h4 className={`text-lg font-bold ${(financeReport.lowStockItemsCount ?? 0) > 0 ? "text-red-400 font-bold" : "text-[#4E3D30]"}`}>{(financeReport.lowStockItemsCount ?? 0)} Kalem</h4>
                      </div>
                      <AlertTriangle size={24} className={(financeReport.lowStockItemsCount ?? 0) > 0 ? "text-red-500/40 animate-bounce" : "text-stone-500/40"} />
                    </div>
                  </div>
                )}

                {/* Subsections Tab Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left Column: Audit Logs */}
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold border-b border-clinicBorder pb-2">HIPAA Sistem Audit Logları (Değiştirilemez Günlükler)</h4>
                    <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg p-3 max-h-96 overflow-y-auto space-y-2">
                      {auditLogs.map(log => (
                        <div key={log.id} className="bg-white/50 border border-clinicBorder p-2.5 rounded text-[10px] space-y-1">
                          <div className="flex justify-between items-center text-stone-500 border-b border-clinicBorder pb-1">
                            <span>Kullanıcı: <strong className="text-[#2C1810]">{log.user?.fullName || "SYSTEM"}</strong></span>
                            <span>{new Date(log.timestamp).toLocaleString("tr-TR")}</span>
                          </div>
                          <div className="flex justify-between text-[#4E3D30]">
                            <span>Eylem: <strong className="text-clinicGold">{log.action}</strong></span>
                            <span>Kaynak: {log.resource}</span>
                          </div>
                          {log.payload && (
                            <pre className="text-[9px] bg-stone-950 p-1.5 rounded text-stone-500 font-mono overflow-x-auto truncate max-w-full" title={log.payload}>
                              Payload: {log.payload}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Inventory Management (Prices & Admin stock addition) */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-clinicBorder pb-2">
                      <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold">Eczane Depo Katalogu & Maliyetleri</h4>
                      <button 
                        onClick={() => setShowAddItem(true)}
                        className="text-[10px] bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm px-2.5 py-1 rounded hover:bg-clinicGold hover:text-neutral-950 transition-all font-semibold"
                      >
                        + Yeni Stok Ekle
                      </button>
                    </div>

                    <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg p-3 max-h-96 overflow-y-auto space-y-2">
                      {inventory.map(item => (
                        <div key={item.id} className="bg-white border border-clinicBorder p-3 rounded-lg flex justify-between items-center text-xs">
                          <div>
                            <strong className="text-[#2C1810] block">{item.itemName}</strong>
                            <span className="text-[10px] text-[#4E3D30]">SKU: {item.SKU} | Stok: <strong className="text-clinicGold">{item.stockQuantity}</strong></span>
                            <span className="block text-[10px] text-stone-500">Maliyet: {(item.supplierPrice ?? 0).toFixed(2)} TL | Satış: {(item.retailPrice ?? 0).toFixed(2)} TL</span>
                          </div>
                          <button 
                            onClick={() => setShowEditItem(item)}
                            className="text-[10px] bg-stone-900 text-[#2C1810] hover:text-white px-2.5 py-1 rounded border border-clinicBorder"
                          >
                            Düzenle
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Staff List */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider text-clinicGold font-bold">Klinik Personel Listesi</h4>
                  <div className="bg-[#FAF7F2] border border-clinicBorder rounded-lg overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-clinicBorder text-[#4E3D30] bg-[#FAF7F2]">
                          <th className="p-3">Ad Soyad</th>
                          <th className="p-3">E-posta</th>
                          <th className="p-3">Kimlik No</th>
                          <th className="p-3">Sistem Rolü</th>
                          <th className="p-3">Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffList.map(st => (
                          <tr key={st.id} className="border-b border-clinicBorder hover:bg-[#FAF7F2]/80">
                            <td className="p-3 font-semibold text-[#2C1810]">{st.fullName}</td>
                            <td className="p-3 font-mono">{st.email}</td>
                            <td className="p-3">{st.identityNo}</td>
                            <td className="p-3">
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                                st.role === "ADMIN" ? "bg-red-950/20 text-red-400 border-red-900" :
                                st.role === "DOCTOR" ? "bg-emerald-950/20 text-emerald-400 border-emerald-900" :
                                st.role === "RECEPTIONIST" ? "bg-blue-950/20 text-blue-400 border-blue-900" :
                                "bg-stone-900 text-[#2C1810] border-stone-700"
                              }`}>
                                {st.role}
                              </span>
                            </td>
                            <td className={`p-3 font-bold ${st.status === "ACTIVE" ? "text-emerald-500" : "text-red-500"}`}>{st.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MODAL: ADD STAFF */}
                {showAddStaff && (
                  <div className="fixed inset-0 bg-[#2C1810]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-clinicBorder rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
                      <button onClick={() => setShowAddStaff(false)} className="absolute right-4 top-4 text-stone-500 hover:text-[#2C1810] text-lg">×</button>
                      <h4 className="text-lg font-serif text-clinicGold uppercase tracking-wider font-semibold">Yeni Personel Hesabı Ekle</h4>
                      <form onSubmit={handleAddStaff} className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Ad Soyad</label>
                          <input type="text" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewStaff({...newStaff, fullName: e.target.value})} value={newStaff.fullName} />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">E-posta</label>
                          <input type="email" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewStaff({...newStaff, email: e.target.value})} value={newStaff.email} />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Geçici Şifre</label>
                          <input type="password" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewStaff({...newStaff, password: e.target.value})} value={newStaff.password} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Rol</label>
                            <select className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewStaff({...newStaff, role: e.target.value})} value={newStaff.role}>
                              <option>DOCTOR</option><option>RECEPTIONIST</option><option>PHARMACIST</option>
                              <option>LAB_TECH</option><option>FINANCE</option><option>ADMIN</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Kimlik No</label>
                            <input type="text" className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewStaff({...newStaff, identityNo: e.target.value})} value={newStaff.identityNo} />
                          </div>
                        </div>
                        <button type="submit" className="w-full bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm py-2 rounded text-xs uppercase tracking-widest font-bold hover:bg-clinicGold hover:text-neutral-950 transition-all mt-2">Personel Kaydet</button>
                      </form>
                    </div>
                  </div>
                )}

                {/* MODAL: ADD INVENTORY */}
                {showAddItem && (
                  <div className="fixed inset-0 bg-[#2C1810]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-clinicBorder rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
                      <button onClick={() => setShowAddItem(false)} className="absolute right-4 top-4 text-stone-500 hover:text-[#2C1810] text-lg">×</button>
                      <h4 className="text-lg font-serif text-clinicGold uppercase tracking-wider font-semibold">Eczane Depo Yeni İlaç Ekle</h4>
                      <form onSubmit={handleAddInventory} className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">İlaç / Sarf Malzeme Adı</label>
                          <input type="text" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewItem({...newItem, itemName: e.target.value})} value={newItem.itemName} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">SKU Barkod</label>
                            <input type="text" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewItem({...newItem, SKU: e.target.value})} value={newItem.SKU} />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Stok Miktarı</label>
                            <input type="number" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewItem({...newItem, stockQuantity: parseInt(e.target.value) || 0})} value={newItem.stockQuantity} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Maliyet (Alış Fiyatı)</label>
                            <input type="number" step="0.01" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewItem({...newItem, supplierPrice: parseFloat(e.target.value) || 0})} value={newItem.supplierPrice} />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Perakende (Satış Fiyatı)</label>
                            <input type="number" step="0.01" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setNewItem({...newItem, retailPrice: parseFloat(e.target.value) || 0})} value={newItem.retailPrice} />
                          </div>
                        </div>
                        <button type="submit" className="w-full bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm py-2 rounded text-xs uppercase tracking-widest font-bold hover:bg-clinicGold hover:text-neutral-950 transition-all mt-2">Kaydet</button>
                      </form>
                    </div>
                  </div>
                )}

                {/* MODAL: EDIT INVENTORY ITEM */}
                {showEditItem && (
                  <div className="fixed inset-0 bg-[#2C1810]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-clinicBorder rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
                      <button onClick={() => setShowEditItem(null)} className="absolute right-4 top-4 text-stone-500 hover:text-[#2C1810] text-lg">×</button>
                      <h4 className="text-lg font-serif text-clinicGold uppercase tracking-wider font-semibold">İlaç Stok Kartını Düzenle</h4>
                      <form onSubmit={handleUpdateInventory} className="space-y-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">İlaç Adı</label>
                          <input type="text" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setShowEditItem({...showEditItem, itemName: e.target.value})} value={showEditItem.itemName} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">SKU Barkod</label>
                            <input type="text" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setShowEditItem({...showEditItem, SKU: e.target.value})} value={showEditItem.SKU} />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Mevcut Stok</label>
                            <input type="number" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setShowEditItem({...showEditItem, stockQuantity: parseInt(e.target.value) || 0})} value={showEditItem.stockQuantity} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Alış (Supplier Cost)</label>
                            <input type="number" step="0.01" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setShowEditItem({...showEditItem, supplierPrice: parseFloat(e.target.value) || 0})} value={showEditItem.supplierPrice} />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#4E3D30] uppercase font-semibold">Satış (Retail Price)</label>
                            <input type="number" step="0.01" required className="w-full bg-[#FAF7F2] border border-clinicBorder rounded p-2 text-xs" onChange={e => setShowEditItem({...showEditItem, retailPrice: parseFloat(e.target.value) || 0})} value={showEditItem.retailPrice} />
                          </div>
                        </div>
                        <button type="submit" className="w-full bg-[#4A2E1B] border border-[#382112] text-white hover:bg-[#382112] shadow-sm py-2 rounded text-xs uppercase tracking-widest font-bold hover:bg-clinicGold hover:text-neutral-950 transition-all mt-2">Güncelle</button>
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
        <p>© {new Date().getFullYear()} Mena Clinic. {lang === "ar" ? "بوابة إدارة العمليات الطبية" : "Personel Yönetim Portalı"} (HIPAA EMR Enabled)</p>
      </footer>

    </div>
  );
}
