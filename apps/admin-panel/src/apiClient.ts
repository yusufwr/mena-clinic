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
  unavailableSlots?: string[];
  availabilityStatus?: "AVAILABLE" | "EVENING_SHIFT" | "ON_LEAVE" | "EMERGENCY_ONLY";
  availabilityNote?: string;
  monthlyPatients: number;
  commissionRate: number;
  department: { name: string };
}

export const API_URL: string =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_API_URL || "/api";

function fallbackDirectApiUrl(url: string): string | null {
  if (typeof window === "undefined" || !url.startsWith("/api")) return null;
  return `${window.location.protocol}//${window.location.hostname}:3000${url}`;
}

/** Requests always use shared server storage; failures remain visible to callers. */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem("staff_token");
  if (token && !headers.has("Authorization")) headers.set("Authorization", "Bearer " + token);
  try {
    const res = await fetch(url, { ...options, headers });
    // If hosted statically without an /api reverse proxy, Nginx/SPA fallback may return HTML or 404/405
    const contentType = res.headers.get("content-type") || "";
    const directUrl = fallbackDirectApiUrl(url);
    if (directUrl && (contentType.includes("text/html") || res.status === 405)) {
      return await fetch(directUrl, { ...options, headers });
    }
    return res;
  } catch {
    const directUrl = fallbackDirectApiUrl(url);
    if (directUrl) {
      try {
        return await fetch(directUrl, { ...options, headers });
      } catch {
        // fall through to standard error response
      }
    }
    const curLang = typeof window !== "undefined" ? localStorage.getItem("admin_lang") || "tr" : "tr";
    const offlineMsg =
      curLang === "ar"
        ? "تعذر الاتصال بالخادم. لم يتم حفظ العملية؛ يرجى المحاولة مرة أخرى."
        : curLang === "en"
        ? "Could not reach the server. Changes were not saved; please try again."
        : "Sunucuya ulaşılamadı. İşlem kaydedilmedi; tekrar deneyin.";
    return new Response(
      JSON.stringify({ message: offlineMsg }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}
