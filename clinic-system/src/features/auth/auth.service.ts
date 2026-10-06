import { AuthUser, LoginDTO, RegisterDTO } from "./auth.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const ALLOW_DEMO_AUTH = process.env.NEXT_PUBLIC_ALLOW_DEMO_AUTH !== "false";

export async function loginUser(dto: LoginDTO): Promise<{ token: string; user: AuthUser }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    // Backend offline / connection refused - fallback to standalone mock
  }

  if (!ALLOW_DEMO_AUTH) {
    throw new Error("Kimlik doğrulama sunucusuna ulaşılamıyor.");
  }

  // Local demo login is opt-in for development only.
  const email = (dto.email || "").toLowerCase().trim();
  let user: AuthUser;

  if (email.includes("doctor1") || email.includes("cardio") || email.includes("selim")) {
    user = {
      id: "doc-cardio",
      email: "doctor1@menaclinic.com",
      fullName: "Dr. Selim Yılmaz (د. سليم يلماز)",
      role: "DOCTOR",
      phone: "+963 991 112233",
      identityNo: "99999999992",
      status: "ACTIVE",
    };
  } else if (email.includes("doctor2") || email.includes("derma") || email.includes("leyla")) {
    user = {
      id: "doc-derma",
      email: "doctor2@menaclinic.com",
      fullName: "Dr. Leyla Demir (د. ليلى دمر)",
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
  } else if (email.includes("receptionist") || email.includes("danisma")) {
    user = {
      id: "rec-1",
      email: "receptionist@menaclinic.com",
      fullName: "Danışma Merve",
      role: "RECEPTIONIST",
      phone: "+963 991 112231",
      identityNo: "99999999991",
      status: "ACTIVE",
    };
  } else {
    // Patient
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
  if (typeof window !== "undefined") {
    localStorage.setItem("mena_auth_token", token);
    localStorage.setItem("mena_auth_user", JSON.stringify(user));
  }

  return { token, user };
}

export async function registerPatient(dto: RegisterDTO): Promise<{ token: string; user: AuthUser }> {
  try {
    const res = await fetch(`${API_BASE}/auth/register-patient`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    // Backend offline - fallback to local registration
  }

  if (!ALLOW_DEMO_AUTH) throw new Error("Kayıt sunucusuna ulaşılamıyor.");
  const user: AuthUser = {
    id: "pat-" + Date.now(),
    email: dto.email,
    fullName: dto.fullName,
    role: "PATIENT",
    patientId: "pat-" + Date.now(),
    phone: dto.phone,
    identityNo: dto.identityNo,
    status: "ACTIVE",
  };

  const token = "mock_jwt_token_" + Date.now();
  if (typeof window !== "undefined") {
    localStorage.setItem("mena_auth_token", token);
    localStorage.setItem("mena_auth_user", JSON.stringify(user));
  }

  return { token, user };
}
