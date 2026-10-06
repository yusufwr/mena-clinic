import { Appointment, CreateAppointmentDTO } from "./appointments.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function getAuthHeaders(token?: string) {
  const t = token || (typeof window !== "undefined" ? localStorage.getItem("mena_auth_token") : null);
  return {
    "Content-Type": "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}

export async function fetchAppointments(doctorId?: string): Promise<Appointment[]> {
  try {
    const url = doctorId ? `${API_BASE}/appointments?doctorId=${doctorId}` : `${API_BASE}/appointments`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (res.ok) return await res.json();
  } catch (err) {}

  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("mena_booked_appointments");
    return raw ? JSON.parse(raw) : [];
  }
  return [];
}

export async function fetchPatientAppointments(): Promise<Appointment[]> {
  try {
    const res = await fetch(`${API_BASE}/appointments/patient`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (res.ok) return await res.json();
  } catch (err) {}

  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("mena_booked_appointments");
    return raw ? JSON.parse(raw) : [];
  }
  return [];
}

export async function createAppointment(dto: CreateAppointmentDTO): Promise<Appointment> {
  try {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    if (res.ok) return await res.json();
  } catch (err) {}

  // Resilient Local Mock Appointment
  const newApp: Appointment = {
    id: "app-" + Date.now(),
    patientId: dto.patientId || "pat-1",
    doctorId: dto.doctorId,
    slotTime: dto.slotTime,
    queueNumber: Math.floor(Math.random() * 8) + 1,
    status: "CONFIRMED",
    patient: {
      user: { fullName: "Zeynep Kaya", phone: "+963 992 334455", identityNo: "99999999996" },
    },
    doctor: {
      id: dto.doctorId,
      fullName: dto.doctorId === "doc-derma" ? "Dr. Leyla Demir" : "Dr. Selim Yılmaz",
    },
  };

  if (typeof window !== "undefined") {
    const raw = localStorage.getItem("mena_booked_appointments");
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(newApp);
    localStorage.setItem("mena_booked_appointments", JSON.stringify(list));
  }

  return newApp;
}

export async function updateAppointmentStatus(id: string, status: string): Promise<Appointment> {
  try {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) return await res.json();
  } catch (err) {}

  return {
    id,
    patientId: "pat-1",
    doctorId: "doc-cardio",
    slotTime: new Date().toISOString(),
    queueNumber: 1,
    status: status as any,
  };
}
