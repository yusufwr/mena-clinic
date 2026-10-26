// Standalone Mock Clinical Data for Mena Clinic Aleppo
import { AuthUser } from "../features/auth/auth.types";
import { DoctorData } from "../features/landing/DoctorsShowcase";

export const MOCK_DOCTORS: DoctorData[] = [
  { id: "doc-gastro-horo", fullName: "Dr. Rustam Horo (د. رستم هورو)", email: "gastro.horo@menaclinic.com", phone: "+963 991 223301" },
  { id: "doc-cardio-chebb", fullName: "Dr. Abdulrahman Al-Shebb (د. عبدالرحمن الشب)", email: "cardio.shebb@menaclinic.com", phone: "+963 991 223302" },
  { id: "doc-cardio-horo", fullName: "Dr. Barkhadan Horo (د. برخدان هورو)", email: "cardio.horo@menaclinic.com", phone: "+963 991 223303" },
  { id: "doc-ortho-takko", fullName: "Dr. Fouad Takko (د. فؤاد طكو)", email: "ortho.takko@menaclinic.com", phone: "+963 991 223304" },
  { id: "doc-uro-razzaq", fullName: "Dr. Ahmad Abdulrazzaq (د. احمد عبدالرزاق)", email: "uro.razzaq@menaclinic.com", phone: "+963 991 223305" },
  { id: "doc-uro-qadi", fullName: "Dr. Abdulatif Qadi (د. عبداللطيف قاضي)", email: "uro.qadi@menaclinic.com", phone: "+963 991 223306" },
  { id: "doc-derma-haddad", fullName: "Dr. Lodia Haddad (د. لوديا حداد)", email: "derma.haddad@menaclinic.com", phone: "+963 991 223307" },
  { id: "doc-vasc-arr", fullName: "Dr. Fadi Al-Arr (د. فادي العر)", email: "vasc.arr@menaclinic.com", phone: "+963 991 223308" },
  { id: "doc-ped-ahmad", fullName: "Dr. Hussein Al-Ahmad (د. حسين الاحمد)", email: "ped.ahmad@menaclinic.com", phone: "+963 991 223309" },
  { id: "doc-pedcardio-azzawi", fullName: "Dr. Ahmad Azzawi (د. احمد عزاوي)", email: "pedcardio.azzawi@menaclinic.com", phone: "+963 991 223310" },
  { id: "doc-dental-shamoun", fullName: "Dr. Majid Shamoun (د. ماجد شمعون)", email: "dental.shamoun@menaclinic.com", phone: "+963 991 223311" },
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
