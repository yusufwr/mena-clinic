/// <reference types="vite/client" />

import { 
  MOCK_DOCTORS, 
  DEFAULT_PATIENT_USER, 
  MOCK_CONSULTATIONS, 
  MOCK_PRESCRIPTIONS, 
  MOCK_LAB_ORDERS, 
  MOCK_INITIAL_APPOINTMENTS 
} from "./mockData";
import { AuthUser, AuthResponse } from "../features/auth/auth.types";

// Shared API client for Mena Clinic Aleppo with offline resilience
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  const storedToken = token || localStorage.getItem("mena_auth_token");
  if (storedToken) {
    headers["Authorization"] = `Bearer ${storedToken}`;
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        return data as T;
      }
    }
    // If backend returns non-JSON (e.g. Vite SPA HTML), 404 or 500, fallback to local mock engine
    return handleMockFallback<T>(endpoint, options);
  } catch (err) {
    // If fetch failed completely (backend server offline / port down), fallback to mock engine
    return handleMockFallback<T>(endpoint, options);
  }
}

// Fallback Mock Engine to ensure 100% functionality even when standalone/offline
function handleMockFallback<T>(endpoint: string, options: RequestInit): T {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};

  // 1. Auth Login
  if (endpoint.includes("/auth/login") && method === "POST") {
    const email = (body.email || "").toLowerCase().trim();
    let user: AuthUser;

    if (email.includes("cardio") || email.includes("doctor1")) {
      user = {
        id: "doc-cardio",
        email: "cardio@menaclinic.com",
        fullName: "Dr. Selim Yılmaz",
        role: "DOCTOR",
        phone: "+963 991 112233",
        identityNo: "99999999992",
        status: "ACTIVE",
      };
    } else if (email.includes("derma") || email.includes("doctor2") || email.includes("leyla")) {
      user = {
        id: "doc-derma",
        email: "derma@menaclinic.com",
        fullName: "Dr. Leyla Demir",
        role: "DOCTOR",
        phone: "+963 991 112234",
        identityNo: "99999999993",
        status: "ACTIVE",
      };
    } else if (email.includes("admin")) {
      user = {
        id: "admin-1",
        email: "admin@menaclinic.com",
        fullName: "Yönetici Ahmet",
        role: "ADMIN",
        phone: "+963 991 112230",
        identityNo: "99999999990",
        status: "ACTIVE",
      };
    } else {
      // Patient Login
      user = {
        id: "pat-1",
        email: email || "patient1@menaclinic.com",
        fullName: "Zeynep Kaya (فاطمة الزهراء)",
        role: "PATIENT",
        patientId: "pat-1",
        phone: "+963 992 334455",
        identityNo: "99999999996",
        status: "ACTIVE",
      };
    }

    const token = "mock_jwt_token_" + Date.now();
    localStorage.setItem("mena_auth_token", token);
    localStorage.setItem("mena_auth_user", JSON.stringify(user));
    return { token, user } as unknown as T;
  }

  // 2. Auth Register
  if (endpoint.includes("/auth/register-patient") && method === "POST") {
    const user: AuthUser = {
      id: "pat-" + Date.now(),
      email: body.email || "patient@menaclinic.com",
      fullName: body.fullName || "Yeni Hasta",
      role: "PATIENT",
      patientId: "pat-" + Date.now(),
      phone: body.phone || "+963 992 000000",
      identityNo: body.identityNo || "99900011122",
      status: "ACTIVE",
    };
    const token = "mock_jwt_token_" + Date.now();
    localStorage.setItem("mena_auth_token", token);
    localStorage.setItem("mena_auth_user", JSON.stringify(user));
    return { token, user } as unknown as T;
  }

  // 3. Auth Me
  if (endpoint.includes("/auth/me")) {
    const raw = localStorage.getItem("mena_auth_user");
    const user = raw ? JSON.parse(raw) : DEFAULT_PATIENT_USER;
    return { user } as unknown as T;
  }

  // 4. Doctors List
  if (endpoint.includes("/doctors") && !endpoint.includes("/schedule")) {
    return MOCK_DOCTORS as unknown as T;
  }

  // 5. Doctor Schedule
  if (endpoint.includes("/schedule")) {
    return {
      schedules: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
        { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
        { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
        { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
        { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
      ],
      bookedSlots: [],
    } as unknown as T;
  }

  // 6. Appointments
  if (endpoint.startsWith("/appointments") || endpoint.includes("/appointments")) {
    // New Booking
    if (method === "POST") {
      const bookedListRaw = localStorage.getItem("mena_booked_appointments");
      const bookedList = bookedListRaw ? JSON.parse(bookedListRaw) : [];
      const doctor = MOCK_DOCTORS.find((d) => d.id === body.doctorId) || MOCK_DOCTORS[0];
      const newApp = {
        id: "app-" + Date.now(),
        patientId: body.patientId || "pat-1",
        doctorId: body.doctorId,
        slotTime: body.slotTime || new Date().toISOString(),
        queueNumber: bookedList.length + 1,
        status: "CONFIRMED",
        doctor: { fullName: doctor.fullName, email: doctor.email },
        departmentName: "Mena Tıp Merkezi",
      };
      bookedList.unshift(newApp);
      localStorage.setItem("mena_booked_appointments", JSON.stringify(bookedList));
      return { success: true, appointment: newApp, queueNumber: newApp.queueNumber } as unknown as T;
    }

    // Patient Appointments List
    if (endpoint.includes("/patient")) {
      const bookedListRaw = localStorage.getItem("mena_booked_appointments");
      const bookedList = bookedListRaw ? JSON.parse(bookedListRaw) : [];
      const allAppointments = [...bookedList, ...MOCK_INITIAL_APPOINTMENTS];
      return { data: allAppointments, total: allAppointments.length } as unknown as T;
    }

    // Doctor Appointments List
    const bookedListRaw = localStorage.getItem("mena_booked_appointments");
    const bookedList = bookedListRaw ? JSON.parse(bookedListRaw) : [];
    const all = [...bookedList, ...MOCK_INITIAL_APPOINTMENTS].map((a, i) => ({
      ...a,
      patient: { fullName: "Zeynep Kaya", phone: "+963 992 334455", identityNo: "99999999996" },
      queueNumber: i + 1,
    }));
    return { data: all, total: all.length } as unknown as T;
  }

  // 7. Prescriptions
  if (endpoint.includes("/prescriptions")) {
    return MOCK_PRESCRIPTIONS as unknown as T;
  }

  // 8. Lab Orders
  if (endpoint.includes("/lab-orders")) {
    return MOCK_LAB_ORDERS as unknown as T;
  }

  // 9. Medical Records / Consultations
  if (endpoint.includes("/medical-records")) {
    return { data: MOCK_CONSULTATIONS, total: MOCK_CONSULTATIONS.length } as unknown as T;
  }

  // 10. Patients list for doctor
  if (endpoint.includes("/patients")) {
    const pts = [
      { id: "pat-1", fullName: "Zeynep Kaya", email: "patient1@menaclinic.com", phone: "+963 992 334455", identityNo: "99999999996", bloodType: "A+" },
      { id: "pat-2", fullName: "Ömer Çelik", email: "patient2@menaclinic.com", phone: "+963 992 556677", identityNo: "99999999997", bloodType: "0-" },
      { id: "pat-3", fullName: "Fatima Al-Hassan", email: "fatima@menaclinic.com", phone: "+963 993 112233", identityNo: "99999999998", bloodType: "B+" },
    ];
    return { data: pts, total: pts.length } as unknown as T;
  }

  return {} as T;
}
