import { Doctor } from "./doctors.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const FALLBACK_DOCTORS: Doctor[] = [
  {
    id: "doc-cardio",
    fullName: "Dr. Selim Yılmaz",
    email: "cardio@menaclinic.com",
    phone: "+963 991 112233",
    rating: 4.95,
  },
  {
    id: "doc-derma",
    fullName: "Dr. Leyla Demir",
    email: "derma@menaclinic.com",
    phone: "+963 991 112234",
    rating: 4.92,
  },
  {
    id: "doc-ortho",
    fullName: "Dr. Fadi Al-Halabi",
    email: "ortho@menaclinic.com",
    phone: "+963 991 112235",
    rating: 4.98,
  },
];

export async function fetchDoctors(): Promise<Doctor[]> {
  try {
    const res = await fetch(`${API_BASE}/doctors`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {}
  return FALLBACK_DOCTORS;
}

export async function fetchDoctorSchedule(doctorId: string, dateStr?: string) {
  try {
    const url = dateStr
      ? `${API_BASE}/doctors/${doctorId}/schedule?date=${dateStr}`
      : `${API_BASE}/doctors/${doctorId}/schedule`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {}

  return {
    schedules: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00" },
    ],
    bookedSlots: [],
  };
}
