import { Patient, MedicalRecord } from "./patients.types";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
async function read<T>(path: string): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("mena_auth_token") : null;
  const response = await fetch(API_BASE + path, { cache: "no-store", headers: token ? { Authorization: "Bearer " + token } : {} });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Kayıtlar okunamadı");
  return data;
}
export const fetchPatients = (): Promise<Patient[]> => read("/patients");
export const fetchPatientMedicalRecords = (patientId: string): Promise<MedicalRecord[]> => read("/medical-records/patient/" + encodeURIComponent(patientId));
