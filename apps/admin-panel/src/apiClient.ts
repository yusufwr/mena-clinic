// Standalone resilient API client & in-browser Mock HIS Engine for Mena Clinic Admin Panel

export interface MockStaffUser {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "RECEPTIONIST" | "DOCTOR" | "PHARMACIST" | "LAB_TECH" | "FINANCE" | "ACCOUNTANT";
  phone: string;
  identityNo: string;
  status: string;
}

const DEFAULT_STAFF: MockStaffUser[] = [
  { id: "admin-1", email: "admin@menaclinic.com", fullName: "Yönetici Ahmet", role: "ADMIN", phone: "+963 991 112230", identityNo: "99999999990", status: "ACTIVE" },
  { id: "rec-1", email: "receptionist@menaclinic.com", fullName: "Danışma Merve", role: "RECEPTIONIST", phone: "+963 991 112231", identityNo: "99999999991", status: "ACTIVE" },
  { id: "doc-cardio", email: "cardio@menaclinic.com", fullName: "Dr. Selim Yılmaz", role: "DOCTOR", phone: "+963 991 112233", identityNo: "99999999992", status: "ACTIVE" },
  { id: "doc-derma", email: "derma@menaclinic.com", fullName: "Dr. Leyla Demir", role: "DOCTOR", phone: "+963 991 112234", identityNo: "99999999993", status: "ACTIVE" },
  { id: "pharm-1", email: "pharmacist@menaclinic.com", fullName: "Eczacı Mustafa", role: "PHARMACIST", phone: "+963 991 112238", identityNo: "99999999994", status: "ACTIVE" },
  { id: "lab-1", email: "labtech@menaclinic.com", fullName: "Teknisyen Ali", role: "LAB_TECH", phone: "+963 991 112239", identityNo: "99999999995", status: "ACTIVE" },
  { id: "acc-1", email: "accountant@menaclinic.com", fullName: "Muhasebeci Kemal", role: "ACCOUNTANT", phone: "+963 991 112240", identityNo: "99999999998", status: "ACTIVE" },
];

const DEFAULT_PATIENTS = [
  { id: "pat-1", fullName: "Zeynep Kaya (فاطمة الزهراء)", email: "patient1@menaclinic.com", phone: "+963 992 334455", identityNo: "99999999996", bloodType: "A+", emergencyContact: "Kardeşi - +963 944 112233", insuranceInfo: "Özel Sağlık Sigortası" },
  { id: "pat-2", fullName: "Ömer Çelik (عمر جليك)", email: "patient2@menaclinic.com", phone: "+963 992 556677", identityNo: "99999999997", bloodType: "0-", emergencyContact: "Eşi - +963 944 556677", insuranceInfo: "SGK / Genel Sağlık" },
  { id: "pat-3", fullName: "Fatima Al-Hassan (فاطمة الحسن)", email: "fatima@menaclinic.com", phone: "+963 993 112233", identityNo: "99999999998", bloodType: "B+", emergencyContact: "Babası - +963 944 998877", insuranceInfo: "Mena Kurumsal Anlaşma" },
  { id: "pat-4", fullName: "Mahmoud Al-Halabi (محمود الحلبي)", email: "mahmoud@menaclinic.com", phone: "+963 991 445566", identityNo: "99999999999", bloodType: "AB+", emergencyContact: "Annesi - +963 944 223344", insuranceInfo: "Bireysel" },
];

export interface DoctorModel {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  consultationFee: number;
  room: string;
  hours: string;
  monthlyPatients: number;
  commissionRate: number;
  department: { name: string };
}

const DEFAULT_DOCTORS: DoctorModel[] = [
  { id: "doc-cardio", fullName: "Dr. Selim Yılmaz", email: "cardio@menaclinic.com", phone: "+963 991 112233", consultationFee: 1200, room: "Poliklinik 101", hours: "09:00 - 17:00", monthlyPatients: 48, commissionRate: 0.65, department: { name: "Kardiyoloji Kliniği" } },
  { id: "doc-derma", fullName: "Dr. Leyla Demir", email: "derma@menaclinic.com", phone: "+963 991 112234", consultationFee: 950, room: "Poliklinik 102", hours: "09:00 - 17:00", monthlyPatients: 36, commissionRate: 0.65, department: { name: "Dermatoloji Kliniği" } },
  { id: "doc-ortho", fullName: "Dr. Fadi Al-Halabi", email: "ortho@menaclinic.com", phone: "+963 991 112235", consultationFee: 1100, room: "Poliklinik 103", hours: "09:00 - 17:00", monthlyPatients: 42, commissionRate: 0.65, department: { name: "Ortopedi ve Travmatoloji" } },
  { id: "doc-pediatrics", fullName: "Dr. Nour Al-Khatib", email: "pediatrics@menaclinic.com", phone: "+963 991 112236", consultationFee: 850, room: "Poliklinik 104", hours: "09:00 - 17:00", monthlyPatients: 30, commissionRate: 0.65, department: { name: "Çocuk Sağlığı ve Hastalıkları" } },
];

const DEFAULT_APPOINTMENTS = [
  {
    id: "app-101",
    patientId: "pat-1",
    doctorId: "doc-cardio",
    slotTime: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
    queueNumber: 1,
    status: "WAITING",
    patient: { fullName: "Zeynep Kaya", phone: "+963 992 334455", identityNo: "99999999996", bloodType: "A+" },
    doctor: { fullName: "Dr. Selim Yılmaz", email: "cardio@menaclinic.com" },
    departmentName: "Kardiyoloji Kliniği"
  },
  {
    id: "app-102",
    patientId: "pat-2",
    doctorId: "doc-cardio",
    slotTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    queueNumber: 2,
    status: "IN_CONSULTATION",
    patient: { fullName: "Ömer Çelik", phone: "+963 992 556677", identityNo: "99999999997", bloodType: "0-" },
    doctor: { fullName: "Dr. Selim Yılmaz", email: "cardio@menaclinic.com" },
    departmentName: "Kardiyoloji Kliniği"
  },
  {
    id: "app-103",
    patientId: "pat-3",
    doctorId: "doc-derma",
    slotTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    queueNumber: 3,
    status: "CONFIRMED",
    patient: { fullName: "Fatima Al-Hassan", phone: "+963 993 112233", identityNo: "99999999998", bloodType: "B+" },
    doctor: { fullName: "Dr. Leyla Demir", email: "derma@menaclinic.com" },
    departmentName: "Dermatoloji Kliniği"
  }
];

const DEFAULT_INVENTORY = [
  { id: "inv-1", itemName: "Lipitor 10mg (Atorvastatin)", SKU: "MED-LIP-10", stockQuantity: 84, supplierPrice: 9.5, retailPrice: 15.5, expiryDate: "2027-12-31" },
  { id: "inv-2", itemName: "Coraspin 100mg (Aspirin)", SKU: "MED-COR-100", stockQuantity: 120, supplierPrice: 2.2, retailPrice: 4.0, expiryDate: "2028-06-30" },
  { id: "inv-3", itemName: "Advantan %0.1 Krem 30g", SKU: "MED-ADV-01", stockQuantity: 45, supplierPrice: 7.0, retailPrice: 12.0, expiryDate: "2027-04-15" },
  { id: "inv-4", itemName: "Augmentin 1000mg BID", SKU: "MED-AUG-1000", stockQuantity: 60, supplierPrice: 6.5, retailPrice: 11.5, expiryDate: "2026-11-20" },
  { id: "inv-5", itemName: "Parol 500mg Tablet", SKU: "MED-PAR-500", stockQuantity: 210, supplierPrice: 1.0, retailPrice: 2.5, expiryDate: "2028-09-01" },
  { id: "inv-6", itemName: "Steril Gazlı Bez 10x10", SKU: "MAT-GAZ-10", stockQuantity: 500, supplierPrice: 0.3, retailPrice: 0.8, expiryDate: "2029-01-01" }
];

const DEFAULT_PRESCRIPTIONS = [
  {
    id: "pr-1",
    patientId: "pat-1",
    patient: { fullName: "Zeynep Kaya", phone: "+963 992 334455" },
    doctor: { fullName: "Dr. Selim Yılmaz" },
    status: "PENDING",
    createdAt: new Date().toISOString(),
    items: [
      { id: "pri-1", itemName: "Lipitor 10mg (Atorvastatin)", dosage: "1x1 Akşam", quantity: 1, inventoryItem: { retailPrice: 15.5, stockQuantity: 84 } },
      { id: "pri-2", itemName: "Coraspin 100mg", dosage: "1x1 Tok", quantity: 1, inventoryItem: { retailPrice: 4.0, stockQuantity: 120 } }
    ]
  },
  {
    id: "pr-2",
    patientId: "pat-3",
    patient: { fullName: "Fatima Al-Hassan", phone: "+963 993 112233" },
    doctor: { fullName: "Dr. Leyla Demir" },
    status: "DISPENSED",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    items: [
      { id: "pri-3", itemName: "Advantan %0.1 Krem", dosage: "1x1 İnce tabaka", quantity: 1, inventoryItem: { retailPrice: 12.0, stockQuantity: 45 } }
    ]
  }
];

const DEFAULT_LAB_ORDERS = [
  {
    id: "lab-101",
    patientId: "pat-1",
    patient: { fullName: "Zeynep Kaya", phone: "+963 992 334455" },
    doctor: { fullName: "Dr. Selim Yılmaz" },
    testName: "Lipid Paneli & Kardiyak Biyokimya (Total Kolesterol, HDL, LDL, Trigliserid)",
    status: "PENDING",
    resultData: null,
    fileUrl: null,
    createdAt: new Date().toISOString()
  },
  {
    id: "lab-102",
    patientId: "pat-2",
    patient: { fullName: "Ömer Çelik", phone: "+963 992 556677" },
    doctor: { fullName: "Dr. Selim Yılmaz" },
    testName: "Troponin I & CK-MB Yüksek Duyarlıklı Test",
    status: "COMPLETED",
    resultData: "Troponin I: <0.01 ng/mL (Normal/Negatif), CK-MB: 12 U/L (Referans: 0-25 U/L)",
    fileUrl: "/uploads/lab_report_lab-102_final.pdf",
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

const DEFAULT_MEDICAL_RECORDS = [
  {
    id: "rec-1",
    patientId: "pat-1",
    diagnosis: "I20.9 - Angina Pektoris (Göğüs Sıkışması ve Koroner Spazm)",
    clinicalNotes: "S: Merdiven çıkarken göğüste baskı ve nefes darlığı hissi.\nO: TA: 135/85 mmHg, Nabız: 76 bpm. EKG: İskemi bulgusu saptanmadı.\nA: Stabil koroner arter şüphesi, koruyucu tedavi başlandı.\nP: Lipitor 10mg ve kardiyak EKO takibi.",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    doctor: { fullName: "Dr. Selim Yılmaz" },
    amendments: []
  }
];

const DEFAULT_AUDIT_LOGS = [
  { id: "log-1", action: "STAFF_LOGIN", details: "Yönetici Ahmet sisteme giriş yaptı.", user: { fullName: "Yönetici Ahmet" }, createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: "log-2", action: "PRESCRIPTION_DISPENSED", details: "Reçete PR-2 onaylanıp teslim edildi.", user: { fullName: "Eczacı Mustafa" }, createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
  { id: "log-3", action: "APPOINTMENT_CREATED", details: "Zeynep Kaya için randevu oluşturuldu.", user: { fullName: "Danışma Merve" }, createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() }
];

// Helper to create a fake Response object
function createMockResponse(data: any, status = 200, statusText = "OK"): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: new Headers({ "Content-Type": "application/json" }),
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as unknown as Response;
}

// Local storage storage keys
function getStore<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStore<T>(key: string, val: T) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};

  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      return res;
    }
    // If server responded with error or non-JSON HTML, fallback to mock engine
    return handleMock(url, method, body, options);
  } catch {
    // If backend is completely offline, seamlessly handle via mock engine
    return handleMock(url, method, body, options);
  }
}

function handleMock(url: string, method: string, body: any, options: RequestInit): Response {
  const path = url.replace(/^https?:\/\/[^/]+/, "");

  // 1. Auth Login
  if (path.includes("/auth/login") && method === "POST") {
    const email = (body.email || "").toLowerCase().trim();
    const staffList = getStore("mena_admin_staff", DEFAULT_STAFF);

    let foundUser = staffList.find((s) => s.email.toLowerCase() === email);
    if (!foundUser) {
      if (email.includes("admin")) foundUser = staffList.find((s) => s.role === "ADMIN");
      else if (email.includes("reception")) foundUser = staffList.find((s) => s.role === "RECEPTIONIST");
      else if (email.includes("cardio") || email.includes("selim")) foundUser = staffList.find((s) => s.id === "doc-cardio");
      else if (email.includes("pharm")) foundUser = staffList.find((s) => s.role === "PHARMACIST");
      else if (email.includes("lab")) foundUser = staffList.find((s) => s.role === "LAB_TECH");
      else if (email.includes("acc") || email.includes("muhasebe")) foundUser = staffList.find((s) => s.role === "ACCOUNTANT");
      else foundUser = staffList[0];
    }

    const token = "mock_staff_token_" + Date.now();
    localStorage.setItem("staff_token", token);
    localStorage.setItem("staff_user", JSON.stringify(foundUser));
    return createMockResponse({ token, user: foundUser });
  }

  // 2. Auth Me
  if (path.includes("/auth/me")) {
    const user = getStore("staff_user", DEFAULT_STAFF[0]);
    return createMockResponse({ user });
  }

  // 3. Patients
  if (path.startsWith("/api/patients") || path === "/patients") {
    const patients = getStore("mena_admin_patients", DEFAULT_PATIENTS);
    if (method === "POST") {
      const newP = {
        id: "pat-" + Date.now(),
        ...body,
      };
      patients.unshift(newP);
      setStore("mena_admin_patients", patients);
      return createMockResponse(newP);
    }
    return createMockResponse(patients);
  }

  // 4. Doctors & Schedule
  if (path.includes("/schedule")) {
    return createMockResponse({
      schedules: [
        { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
        { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
        { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
        { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
        { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
        { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
        { dayOfWeek: 6, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
      ],
      bookedSlots: [],
    });
  }

  if (path.startsWith("/api/doctors") || path === "/doctors") {
    return createMockResponse(DEFAULT_DOCTORS);
  }

  // 5. Appointments
  if (path.includes("/appointments")) {
    const apps = getStore("mena_admin_apps", DEFAULT_APPOINTMENTS);

    if (method === "POST") {
      const patients = getStore("mena_admin_patients", DEFAULT_PATIENTS);
      const patient = patients.find((p) => p.id === body.patientId) || patients[0];
      const doctor = DEFAULT_DOCTORS.find((d) => d.id === body.doctorId) || DEFAULT_DOCTORS[0];

      const newApp = {
        id: "app-" + Date.now(),
        patientId: body.patientId,
        doctorId: body.doctorId,
        slotTime: body.slotTime,
        queueNumber: apps.length + 1,
        status: "WAITING",
        patient: { fullName: patient.fullName, phone: patient.phone, identityNo: patient.identityNo, bloodType: (patient as any).bloodType || "A+" },
        doctor: { fullName: doctor.fullName, email: doctor.email },
        departmentName: doctor.department.name,
      };
      apps.push(newApp);
      setStore("mena_admin_apps", apps);
      return createMockResponse(newApp);
    }

    if (method === "PUT" && path.includes("/status")) {
      const parts = path.split("/");
      const id = parts[parts.indexOf("appointments") + 1];
      const found = apps.find((a) => a.id === id);
      if (found) {
        found.status = body.status;
        setStore("mena_admin_apps", apps);
      }
      return createMockResponse({ success: true, appointment: found });
    }

    return createMockResponse(apps);
  }

  // 6. Prescriptions
  if (path.includes("/prescriptions")) {
    const presc = getStore("mena_admin_presc", DEFAULT_PRESCRIPTIONS);

    if (method === "PUT" && path.includes("/dispense")) {
      const parts = path.split("/");
      const id = parts[parts.indexOf("prescriptions") + 1];
      const found = presc.find((p) => p.id === id);
      if (found) {
        found.status = "DISPENSED";
        setStore("mena_admin_presc", presc);
      }
      return createMockResponse({ success: true, prescription: found });
    }

    return createMockResponse(presc);
  }

  // 7. Inventory
  if (path.includes("/inventory")) {
    const inv = getStore("mena_admin_inv", DEFAULT_INVENTORY);

    if (method === "POST") {
      const newItem = { id: "inv-" + Date.now(), ...body };
      inv.push(newItem);
      setStore("mena_admin_inv", inv);
      return createMockResponse(newItem);
    }

    if (method === "PUT") {
      const parts = path.split("/");
      const id = parts[parts.indexOf("inventory") + 1];
      const idx = inv.findIndex((i) => i.id === id);
      if (idx !== -1) {
        inv[idx] = { ...inv[idx], ...body };
        setStore("mena_admin_inv", inv);
      }
      return createMockResponse({ success: true });
    }

    return createMockResponse(inv);
  }

  // 8. Lab Orders
  if (path.includes("/lab-orders")) {
    const labs = getStore("mena_admin_labs", DEFAULT_LAB_ORDERS);

    if (method === "PUT") {
      const parts = path.split("/");
      const id = parts[parts.indexOf("lab-orders") + 1];
      const found = labs.find((l) => l.id === id);
      if (found) {
        found.status = "COMPLETED";
        found.resultData = body.resultData;
        found.fileUrl = body.fileUrl || `/uploads/lab_report_${id}_final.pdf`;
        setStore("mena_admin_labs", labs);
      }
      return createMockResponse({ success: true, labOrder: found });
    }

    return createMockResponse(labs);
  }

  // 9. Medical Records & SOAP
  if (path.includes("/medical-records")) {
    const recs = getStore("mena_admin_recs", DEFAULT_MEDICAL_RECORDS);

    if (path.includes("/patient/")) {
      const parts = path.split("/");
      const patientId = parts[parts.indexOf("patient") + 1];
      const filtered = recs.filter((r) => r.patientId === patientId);
      return createMockResponse(filtered.length > 0 ? filtered : recs);
    }

    if (path.includes("/amendments")) {
      const parts = path.split("/");
      const id = parts[parts.indexOf("medical-records") + 1];
      const rec = recs.find((r) => r.id === id);
      if (rec) {
        if (!(rec as any).amendments) (rec as any).amendments = [];
        (rec as any).amendments.push({ id: "am-" + Date.now(), notes: body.notes, createdAt: new Date().toISOString() });
        setStore("mena_admin_recs", recs);
      }
      return createMockResponse({ success: true });
    }

    if (method === "POST") {
      const newRec = {
        id: "rec-" + Date.now(),
        patientId: body.patientId,
        diagnosis: body.diagnosis,
        clinicalNotes: body.clinicalNotes,
        createdAt: new Date().toISOString(),
        doctor: { fullName: "Dr. Selim Yılmaz" },
        amendments: [],
      };
      recs.unshift(newRec);
      setStore("mena_admin_recs", recs);
      return createMockResponse(newRec);
    }

    return createMockResponse(recs);
  }

  // 10. Finance Report
  if (path.includes("/finance/report")) {
    return createMockResponse({
      totalRevenue: 34850.0,
      totalDiscounts: 3485.0,
      estimatedProfit: 14200.0,
      lowStockItemsCount: 2,
      todayRevenue: 2450.0,
      totalSalesCount: 142,
      pendingPayments: 1200.0,
      monthlyGrowth: "+18.4%",
      departmentBreakdown: [
        { name: "Kardiyoloji", revenue: 14200 },
        { name: "Dermatoloji & Estetik", revenue: 9800 },
        { name: "Eczane & İlaç", revenue: 6450 },
        { name: "Laboratuvar & Analiz", revenue: 4400 },
      ],
    });
  }

  // 11. Audit Logs
  if (path.includes("/audit-logs")) {
    const logs = getStore("mena_admin_audit", DEFAULT_AUDIT_LOGS);
    return createMockResponse(logs);
  }

  // 12. Staff List (Users)
  if (path.includes("/users")) {
    const staff = getStore("mena_admin_staff", DEFAULT_STAFF);

    if (method === "POST") {
      const newStaff = {
        id: "user-" + Date.now(),
        ...body,
        status: "ACTIVE",
      };
      staff.push(newStaff);
      setStore("mena_admin_staff", staff);
      return createMockResponse(newStaff);
    }

    return createMockResponse(staff);
  }

  return createMockResponse({});
}
