import { Patient, MedicalRecord } from "./patients.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("mena_auth_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const FALLBACK_PATIENT_RECORDS: MedicalRecord[] = [
  {
    id: "med-1",
    patientId: "pat-1",
    doctorId: "doc-cardio",
    diagnosis: "I20.9 - Angina Pektoris (Göğüs Sıkışması ve Koroner Spazm)",
    clinicalNotes: "S: Hasta son 1 aydır merdiven çıkarken retrosternal baskı hissediyor.\nO: TA: 135/85 mmHg, Nabız: 74 bpm. EKG: Sinüs ritmi, V4-V6 hafif ST depresyonu.\nA: Stabil angina pektoris şüphesi.\nP: Lipitor 10mg ve kardiyak EKO planlandı. Ağır efordan kaçınması önerildi.",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    doctor: { fullName: "Dr. Selim Yılmaz (Kardiyoloji)" },
    prescriptions: [
      {
        id: "pr-1",
        status: "DISPENSED",
        items: [
          { itemName: "Lipitor 10mg (Kolesterol)", dosage: "Günde 1 kez akşam", quantity: 1 },
          { itemName: "Aspirin 100mg (Kan Sulandırıcı)", dosage: "Günde 1 kez tok", quantity: 1 }
        ]
      }
    ],
    labOrders: [
      { id: "lab-1", testName: "Lipid Paneli (Total Kolesterol, HDL, LDL)", status: "COMPLETED", resultData: "LDL: 142 mg/dL, HDL: 44 mg/dL" },
      { id: "lab-2", testName: "Troponin I ve CK-MB", status: "COMPLETED", resultData: "Negatif (<0.01 ng/mL)" }
    ]
  },
  {
    id: "med-2",
    patientId: "pat-1",
    doctorId: "doc-derma",
    diagnosis: "L20.9 - Atopik Dermatit ve Cilt Kuruluğu",
    clinicalNotes: "S: Mevsimsel kaşıntı ve kol fleksuralarında pullanma.\nO: Eritematöz plaklar mevcut, sekonder enfeksiyon yok.\nA: Atopik egzama alevlenmesi.\nP: Nemlendirici ve topikal kortikosteroid losyon reçete edildi.",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    doctor: { fullName: "Dr. Leyla Demir (Dermatoloji)" },
    prescriptions: [
      {
        id: "pr-2",
        status: "DISPENSED",
        items: [
          { itemName: "Advantan %0.1 Krem", dosage: "Günde 1 kez ince tabaka", quantity: 1 },
          { itemName: "Nemlendirici Tıbbi Balsam", dosage: "Günde 3 kez", quantity: 2 }
        ]
      }
    ]
  }
];

export async function fetchPatients(): Promise<Patient[]> {
  try {
    const res = await fetch(`${API_BASE}/patients`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (res.ok) return await res.json();
  } catch (err) {}

  return [
    {
      id: "pat-1",
      userId: "user-1",
      bloodType: "A+",
      emergencyContact: "+963 992 334455",
      insuranceInfo: "Mena Health Care / Allianz",
      createdAt: new Date().toISOString(),
      user: {
        fullName: "Zeynep Kaya",
        email: "patient1@menaclinic.com",
        phone: "+963 992 334455",
        identityNo: "99999999996",
      }
    }
  ];
}

export async function fetchPatientMedicalRecords(patientId: string): Promise<MedicalRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/medical-records/patient/${patientId}`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (res.ok) return await res.json();
  } catch (err) {}

  return FALLBACK_PATIENT_RECORDS;
}
