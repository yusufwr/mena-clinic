import { getDb, parseToken, errorResponse, handleError } from "./clinicDb";

type Handler = (request: Request, context: { params: { id: string } }) => Promise<Response>;

function attachOriginCors(request: Request, response: Response): Response {
  const origin = request.headers.get("origin");
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin || "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  headers.set("Access-Control-Allow-Credentials", "true");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** Shared policy; business rules stay in their existing feature routes. */
export function guarded(handler: Handler): Handler {
  return async (request, context) => {
    const respond = (res: Response) => attachOriginCors(request, res);
    try {
      const url = new URL(request.url);
      const route = url.pathname.replace(/^\/api\//, "");
      const read = request.method === "GET";
      const publicRead = read && (route === "doctors" || /^doctors\/[^/]+\/schedule$/.test(route) || route === "health");
      if (publicRead || ["auth/login", "auth/register"].includes(route)) return respond(await handler(request, context));
      const session = parseToken(request);
      if (!session) return respond(errorResponse("Oturum gerekli", 401));
      const db = getDb();
      const user = session.kind === "staff" ? db.staff.find(s => s.id === session.id && s.status === "ACTIVE") : db.patients.find(p => p.id === session.id);
      if (!user) return respond(errorResponse("Oturum geçersiz", 401));
      const role = "role" in user ? user.role : "PATIENT";
      if (route === "auth/me") return respond(await handler(request, context));
      const feature = route.split("/")[0];
      const isDoctorCreate = feature === "doctors" && request.method === "POST" && route === "doctors";
      const access: Record<string, string[]> = {
        patients: (read && route === "patients/lookup") || route.startsWith("patients/family")
          ? ["ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"]
          : read
          ? ["ADMIN", "RECEPTIONIST", "DOCTOR", "LAB_TECH"]
          : ["ADMIN", "RECEPTIONIST", "DOCTOR"],
        appointments: read
          ? ["ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT", "ACCOUNTANT", "FINANCE"]
          : ["ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"],
        doctors: isDoctorCreate ? ["ADMIN"] : ["ADMIN", "RECEPTIONIST"],
        users: ["ADMIN"],
        "medical-records": ["ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"],
        inventory: read
          ? ["ADMIN", "RECEPTIONIST", "PHARMACIST", "ACCOUNTANT", "FINANCE"]
          : ["ADMIN", "RECEPTIONIST", "PHARMACIST"],
        prescriptions: read
          ? ["ADMIN", "RECEPTIONIST", "PHARMACIST", "DOCTOR", "ACCOUNTANT", "FINANCE"]
          : ["ADMIN", "RECEPTIONIST", "PHARMACIST"],
        "lab-orders": read
          ? ["ADMIN", "RECEPTIONIST", "LAB_TECH", "DOCTOR", "PATIENT"]
          : ["ADMIN", "RECEPTIONIST", "LAB_TECH", "DOCTOR"],
        billing: read
          ? ["ADMIN", "RECEPTIONIST", "DOCTOR", "ACCOUNTANT", "FINANCE"]
          : ["ADMIN", "RECEPTIONIST", "DOCTOR"],
        expenses: ["ADMIN", "FINANCE", "ACCOUNTANT"],
        finance: ["ADMIN", "FINANCE", "ACCOUNTANT"],
        "audit-logs": ["ADMIN"],
        backup: ["ADMIN"],
      };
      if (!access[feature]?.includes(role)) return respond(errorResponse("Bu işlem için yetkiniz yok", 403));
      if (role === "PATIENT") {
        if (feature === "medical-records") {
          if (!read) return respond(errorResponse("Bu işlem için yetkiniz yok", 403));
          const segments = route.split("/");
          if (segments[1] === "patient") {
            const targetPatientId = segments[2];
            const isFamilyMember = db.patients.some(p => p.id === targetPatientId && (p.id === session.id || p.familyHeadId === session.id));
            if (!isFamilyMember) return respond(errorResponse("Erişim yetkiniz yok", 403));
          }
          if (segments[2] === "pdf" && !db.medicalRecords.some(r => r.id === segments[1] && (r.patientId === session.id || db.patients.some(p => p.id === r.patientId && p.familyHeadId === session.id)))) return respond(errorResponse("Kayıt bulunamadı", 404));
          if (segments[1] === "export-pdf") return respond(errorResponse("Erişim yetkiniz yok", 403));
        }
        if (read) {
          if (!route.startsWith("patients/family")) {
            url.searchParams.set("patientId", session.id);
            request = new Request(url, request);
          }
        } else {
          const body = await request.clone().json().catch(() => ({}));
          if (feature === "appointments" && request.method === "POST" && route === "appointments") {
            const targetId = body.patientId || (body.patientIdentityNo ? db.patients.find(p => p.identityNo === body.patientIdentityNo)?.id : undefined) || session.id;
            const isFamilyBooking = db.patients.some(p => p.id === targetId && (p.id === session.id || p.familyHeadId === session.id || (p.familyHeadId && p.familyHeadId === db.patients.find(curr => curr.id === session.id)?.familyHeadId)));
            if (!isFamilyBooking) return respond(errorResponse("Kendi adınıza veya aile bireyiniz adına randevu alabilirsiniz", 403));
          } else if (route.startsWith("patients/family")) {
            // allow family member creation
          } else return respond(errorResponse("Bu işlem için yetkiniz yok", 403));
        }
      }
      if (role === "DOCTOR") {
        if (["users", "inventory", "finance"].includes(feature) || (feature === "patients" && !read)) return respond(errorResponse("Erişim yetkiniz yok", 403));
        if (feature === "billing" && request.method === "PUT") return respond(errorResponse("Kasa tahsilat onayı danışma veya yönetici yetkisindedir", 403));
        // Doctors have full cross-disciplinary view of patient records (Dentistry, Cardiology, Ortho, etc.)
        if (read && feature === "appointments") {
          url.searchParams.set("doctorId", session.id);
          request = new Request(url, request);
        }
        if (!read && ["appointments", "medical-records"].includes(feature)) {
          const body = await request.clone().json().catch(() => ({}));
          const appointmentId = feature === "appointments" ? route.split("/")[1] : body.appointmentId;
          const ownPatientReferral = route === "appointments" && request.method === "POST" && db.appointments.some(a => a.doctorId === session.id && a.patientId === body.patientId);
          if ((body.doctorId && body.doctorId !== session.id && !ownPatientReferral) || (appointmentId && !db.appointments.some(a => a.id === appointmentId && a.doctorId === session.id))) return respond(errorResponse("Erişim yetkiniz yok", 403));
          if (route === "medical-records" && request.method === "POST" && body.doctorId !== session.id) return respond(errorResponse("Hekim kimliği gerekli", 403));
        }
      }
      return respond(await handler(request, context));
    } catch (error) { return respond(handleError(error)); }
  };
}
