// Standalone Mock Clinical Data for Mena Clinic Aleppo
import { AuthUser } from "../features/auth/auth.types";
import { DoctorData } from "../features/landing/DoctorsShowcase";

export const MOCK_DOCTORS: DoctorData[] = [
  {
    id: "doc-cardio",
    fullName: "Dr. Selim Yılmaz",
    email: "cardio@menaclinic.com",
    phone: "+963 991 112233",
  },
  {
    id: "doc-derma",
    fullName: "Dr. Leyla Demir",
    email: "derma@menaclinic.com",
    phone: "+963 991 112234",
  },
  {
    id: "doc-ortho",
    fullName: "Dr. Fadi Al-Halabi",
    email: "ortho@menaclinic.com",
    phone: "+963 991 112235",
  },
  {
    id: "doc-pediatrics",
    fullName: "Dr. Nour Al-Khatib",
    email: "pediatrics@menaclinic.com",
    phone: "+963 991 112236",
  },
  {
    id: "doc-dental",
    fullName: "Dr. Omar Kassem",
    email: "dental@menaclinic.com",
    phone: "+963 991 112237",
  },
  {
    id: "doc-physio",
    fullName: "Dr. Reem Al-Saleh",
    email: "physio@menaclinic.com",
    phone: "+963 991 112238",
  },
];

export const DEFAULT_PATIENT_USER: AuthUser = {
  id: "pat-1",
  email: "patient1@menaclinic.com",
  fullName: "Zeynep Kaya (فاطمة الزهراء)",
  role: "PATIENT",
  patientId: "pat-1",
  phone: "+963 992 334455",
  identityNo: "99999999996",
  status: "ACTIVE",
};

export const MOCK_CONSULTATIONS = [
  {
    id: "rec-101",
    diagnosis: "I20.9 - Angina Pektoris (Göğüs Sıkışması ve Koroner Spazm)",
    clinicalNotes: "S: Merdiven çıkarken retrosternal baskı hissi.\nO: TA: 135/85 mmHg, Nabız: 74 bpm. EKG: Sinüs ritmi.\nA: Stabil kardiyak risk, lipit takibi önerildi.\nP: Lipitor 10mg ve kardiyak EKO planlandı.",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    doctor: { fullName: "Dr. Selim Yılmaz (Kardiyoloji)" },
    prescriptions: [
      {
        id: "pr-1",
        status: "DISPENSED",
        items: [
          { itemName: "Lipitor 10mg (Atorvastatin)", dosage: "Günde 1 kez akşam", quantity: 1 },
          { itemName: "Coraspin 100mg (Aspirin)", dosage: "Günde 1 kez tok", quantity: 1 },
        ],
      },
    ],
    labOrders: [
      {
        id: "lab-1",
        testName: "Lipid Paneli (Total Kolesterol, HDL, LDL)",
        status: "COMPLETED",
        resultData: "LDL: 138 mg/dL, HDL: 46 mg/dL, Total: 194 mg/dL",
      },
      {
        id: "lab-2",
        testName: "Troponin I & CK-MB Kardiyak Enzimler",
        status: "COMPLETED",
        resultData: "Troponin: <0.01 ng/mL (Negatif - Normal)",
      },
    ],
  },
  {
    id: "rec-102",
    diagnosis: "L20.9 - Atopik Egzama ve Kutanöz Lezyonlar",
    clinicalNotes: "S: Kollar ve boyunda kaşıntılı kuru lezyonlar.\nO: Eritematöz plaklar, sekonder enfeksiyon bulgusu yok.\nA: Alerjik atopik dermatit alevlenmesi.\nP: Advantan krem ve nemlendirici medikal balsam.",
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    doctor: { fullName: "Dr. Leyla Demir (Dermatoloji)" },
    prescriptions: [
      {
        id: "pr-2",
        status: "DISPENSED",
        items: [
          { itemName: "Advantan %0.1 Krem", dosage: "Günde 1 kez ince tabaka", quantity: 1 },
          { itemName: "Balsam Dermaprotect", dosage: "Günde 3 kez bol miktarda", quantity: 2 },
        ],
      },
    ],
    labOrders: [
      {
        id: "lab-3",
        testName: "Total Serum IgE Seviyesi",
        status: "COMPLETED",
        resultData: "IgE: 84 IU/mL (Hafif alerjik duyarlılık)",
      },
    ],
  },
  {
    id: "rec-103",
    diagnosis: "Z00.0 - Genel Sağlık Taraması ve Check-up",
    clinicalNotes: "Rutin periyodik sağlık muayenesi. Genel durum iyi, vitaller stabil.",
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    doctor: { fullName: "Dr. Fadi Al-Halabi (Ortopedi & Travma)" },
    prescriptions: [],
    labOrders: [
      {
        id: "lab-4",
        testName: "Tam Kan Sayımı (Hemogram 18 Parametre)",
        status: "COMPLETED",
        resultData: "WBC: 6.8, RBC: 4.9, Hb: 14.2 g/dL (Normal sınırlar)",
      },
      {
        id: "lab-5",
        testName: "Açlık Kan Şekeri & HbA1c",
        status: "COMPLETED",
        resultData: "Glukoz: 92 mg/dL, HbA1c: %5.4 (Optimal)",
      },
    ],
  },
];

export const MOCK_PRESCRIPTIONS = [
  {
    id: "pr-1",
    status: "DISPENSED",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    doctor: { fullName: "Dr. Selim Yılmaz" },
    items: [
      { itemName: "Lipitor 10mg (Atorvastatin)", dosage: "Günde 1 kez akşam", quantity: 1 },
      { itemName: "Coraspin 100mg", dosage: "Günde 1 kez tok karnına", quantity: 1 },
    ],
  },
  {
    id: "pr-2",
    status: "DISPENSED",
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    doctor: { fullName: "Dr. Leyla Demir" },
    items: [
      { itemName: "Advantan %0.1 Krem", dosage: "Günde 1 kez ince tabaka", quantity: 1 },
      { itemName: "Medikal Nemlendirici Balsam", dosage: "Günde 3 kez", quantity: 2 },
    ],
  },
];

export const MOCK_LAB_ORDERS = [
  {
    id: "lab-1",
    testName: "Lipid Paneli (Total Kolesterol, HDL, LDL, Trigliserid)",
    status: "COMPLETED",
    resultData: "LDL: 138 mg/dL, HDL: 46 mg/dL, Total: 194 mg/dL",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    doctor: { fullName: "Dr. Selim Yılmaz" },
  },
  {
    id: "lab-2",
    testName: "Troponin I & CK-MB Kardiyak Enzimler",
    status: "COMPLETED",
    resultData: "Troponin: <0.01 ng/mL (Negatif - Normal)",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    doctor: { fullName: "Dr. Selim Yılmaz" },
  },
  {
    id: "lab-4",
    testName: "Tam Kan Sayımı (Hemogram 18 Parametre)",
    status: "COMPLETED",
    resultData: "WBC: 6.8, RBC: 4.9, Hb: 14.2 g/dL, Trombosit: 250K",
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    doctor: { fullName: "Dr. Fadi Al-Halabi" },
  },
  {
    id: "lab-5",
    testName: "Açlık Kan Şekeri & HbA1c",
    status: "COMPLETED",
    resultData: "Açlık Glukozu: 92 mg/dL, HbA1c: %5.4 (Optimal)",
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    doctor: { fullName: "Dr. Fadi Al-Halabi" },
  },
];

export const MOCK_INITIAL_APPOINTMENTS = [
  {
    id: "app-prev-1",
    patientId: "pat-1",
    doctorId: "doc-cardio",
    slotTime: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0] + "T10:30:00.000Z",
    queueNumber: 3,
    status: "CONFIRMED",
    doctor: { fullName: "Dr. Selim Yılmaz", email: "cardio@menaclinic.com" },
    departmentName: "Kardiyoloji Kliniği",
  },
  {
    id: "app-prev-2",
    patientId: "pat-1",
    doctorId: "doc-derma",
    slotTime: new Date(Date.now() - 86400000 * 25).toISOString().split("T")[0] + "T11:00:00.000Z",
    queueNumber: 1,
    status: "COMPLETED",
    doctor: { fullName: "Dr. Leyla Demir", email: "derma@menaclinic.com" },
    departmentName: "Dermatoloji & Estetik",
  },
];
