export interface AuthUser {
  id: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN" | "RECEPTIONIST" | "PHARMACIST" | "LAB_TECH" | "FINANCE";
  fullName: string;
  patientId?: string;
  phone?: string;
  identityNo?: string;
  status?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}
