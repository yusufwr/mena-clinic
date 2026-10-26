export interface MockStaffUser {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "RECEPTIONIST" | "DOCTOR" | "PHARMACIST" | "LAB_TECH" | "FINANCE" | "ACCOUNTANT";
  phone: string;
  identityNo: string;
  status: string;
}

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

/** Requests always use shared server storage; failures remain visible to callers. */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem("staff_token");
  if (token && !headers.has("Authorization")) headers.set("Authorization", "Bearer " + token);
  try { return await fetch(url, { ...options, headers }); }
  catch { return new Response(JSON.stringify({ message: "Sunucuya ulaşılamadı. İşlem kaydedilmedi; tekrar deneyin." }), { status: 503, headers: { "Content-Type": "application/json" } }); }
}
