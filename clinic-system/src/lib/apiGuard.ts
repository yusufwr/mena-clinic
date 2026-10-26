import { getDb, parseToken, errorResponse, handleError } from "./clinicDb";

type Handler = (request: Request, context: { params: { id: string } }) => Promise<Response>;

/** Shared policy; business rules stay in their existing feature routes. */
export function guarded(handler: Handler): Handler {
  return async (request, context) => {
    try {
      const url = new URL(request.url);
      const route = url.pathname.replace(/^\/api\//, "");
      const read = request.method === "GET";
      const publicRead = read && (route === "doctors" || /^doctors\/[^/]+\/schedule$/.test(route) || route === "health");
      if (publicRead || ["auth/login", "auth/register"].includes(route)) return await handler(request, context);
      const session = parseToken(request);
      if (!session) return errorResponse("Oturum gerekli", 401);
      const db = getDb();
      const user = session.kind === "staff" ? db.staff.find(s => s.id === session.id && s.status === "ACTIVE") : db.patients.find(p => p.id === session.id);
      if (!user) return errorResponse("Oturum geçersiz", 401);
      const role = "role" in user ? user.role : "PATIENT";
      if (route === "auth/me") return await handler(request, context);
      const feature = route.split("/")[0];
      const access: Record<string, string[]> = {
        patients: read && route === "patients/lookup" ? ["ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"] : ["ADMIN", "RECEPTIONIST", "DOCTOR"],
        appointments: read ? ["ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT", "ACCOUNTANT", "FINANCE"] : ["ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"],
        doctors: ["ADMIN"],
        users: ["ADMIN"],
        "medical-records": ["ADMIN", "DOCTOR", "PATIENT"],
        inventory: read ? ["ADMIN", "PHARMACIST", "ACCOUNTANT", "FINANCE"] : ["ADMIN", "PHARMACIST"],
        prescriptions: read ? ["ADMIN", "PHARMACIST", "DOCTOR", "ACCOUNTANT", "FINANCE"] : ["ADMIN", "PHARMACIST"],
        "lab-orders": read ? ["ADMIN", "LAB_TECH", "DOCTOR"] : ["ADMIN", "LAB_TECH"],
        finance: ["ADMIN", "FINANCE", "ACCOUNTANT"],
        "audit-logs": ["ADMIN"],
      };
      if (!access[feature]?.includes(role)) return errorResponse("Bu işlem için yetkiniz yok", 403);
      if (role === "PATIENT") {
        if (feature === "medical-records") {
          if (!read) return errorResponse("Bu işlem için yetkiniz yok", 403);
          const segments = route.split("/");
          if (segments[1] === "patient" && segments[2] !== session.id) return errorResponse("Erişim yetkiniz yok", 403);
          if (segments[2] === "pdf" && !db.medicalRecords.some(r => r.id === segments[1] && r.patientId === session.id)) return errorResponse("Kayıt bulunamadı", 404);
          if (segments[1] === "export-pdf") return errorResponse("Erişim yetkiniz yok", 403);
        }
        if (read) {
          url.searchParams.set("patientId", session.id);
          request = new Request(url, request);
        } else {
          const body = await request.clone().json();
          if (feature === "appointments" && request.method === "POST" && route === "appointments") {
            if (body.patientId !== session.id) return errorResponse("Kendi adınıza randevu alabilirsiniz", 403);
          } else return errorResponse("Bu işlem için yetkiniz yok", 403);
        }
      }
      if (role === "DOCTOR") {
        if (["users", "inventory", "finance"].includes(feature) || (feature === "patients" && !read)) return errorResponse("Erişim yetkiniz yok", 403);
        if (read && ["appointments", "medical-records"].includes(feature)) {
          url.searchParams.set("doctorId", session.id);
          request = new Request(url, request);
        }
        if (!read && ["appointments", "medical-records"].includes(feature)) {
          const body = await request.clone().json();
          const appointmentId = feature === "appointments" ? route.split("/")[1] : body.appointmentId;
          const ownPatientReferral = route === "appointments" && request.method === "POST" && db.appointments.some(a => a.doctorId === session.id && a.patientId === body.patientId);
          if ((body.doctorId && body.doctorId !== session.id && !ownPatientReferral) || (appointmentId && !db.appointments.some(a => a.id === appointmentId && a.doctorId === session.id))) return errorResponse("Erişim yetkiniz yok", 403);
          if (route === "medical-records" && request.method === "POST" && body.doctorId !== session.id) return errorResponse("Hekim kimliği gerekli", 403);
        }
      }
      return await handler(request, context);
    } catch (error) { return handleError(error); }
  };
}
