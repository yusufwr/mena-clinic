export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  slotTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  queueNumber: number;
  doctor?: { id: string; fullName: string; email?: string };
  patient?: { user?: { fullName: string; phone?: string; identityNo?: string } };
}

export interface CreateAppointmentDTO {
  doctorId: string;
  slotTime: string;
  patientId?: string;
}
