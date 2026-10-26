import { Appointment, CreateAppointmentDTO } from "./appointments.types";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("mena_auth_token") : null;
  const response = await fetch(API_BASE + path, { ...options, cache: "no-store", headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}), ...options.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "İşlem kaydedilmedi");
  return data;
}
export const fetchAppointments = (doctorId?: string): Promise<Appointment[]> => request("/appointments" + (doctorId ? "?doctorId=" + encodeURIComponent(doctorId) : ""));
export const fetchPatientAppointments = (): Promise<Appointment[]> => request("/appointments");
export const createAppointment = (dto: CreateAppointmentDTO): Promise<Appointment> => request("/appointments", { method: "POST", body: JSON.stringify(dto) });
export async function updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
  const data = await request<{ appointment: Appointment }>("/appointments/" + encodeURIComponent(id) + "/status", { method: "PUT", body: JSON.stringify({ status }) });
  return data.appointment;
}
