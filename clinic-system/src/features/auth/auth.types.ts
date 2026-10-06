export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  identityNo?: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN" | "RECEPTIONIST" | "PHARMACIST" | "LAB_TECH" | "FINANCE";
  patientId?: string;
  status?: "ACTIVE" | "SUSPENDED";
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  identityNo: string;
  bloodType?: string;
  emergencyContact?: string;
  insuranceInfo?: string;
}
