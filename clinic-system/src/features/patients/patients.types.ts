export interface Patient {
  id: string;
  userId: string;
  bloodType?: string;
  emergencyContact?: string;
  insuranceInfo?: string;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
    phone: string;
    identityNo: string;
  };
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  clinicalNotes: string;
  createdAt: string;
  doctor?: { fullName: string };
  amendments?: { id: string; notes: string; createdAt: string; doctor?: { fullName: string } }[];
  prescriptions?: { id: string; status: string; items: { itemName: string; dosage: string; quantity: number }[] }[];
  labOrders?: { id: string; testName: string; status: string; resultData?: string }[];
}
