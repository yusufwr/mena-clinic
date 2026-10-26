export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  fullNameAr?: string;
  fullNameEn?: string;
  email: string;
  phone: string;
  unavailableSlots?: string[];
  schedules?: DoctorSchedule[];
  specialty?: string;
  specialtyAr?: string;
  specialtyEn?: string;
  departmentName?: string;
  room?: string;
  rating?: number;
  fee?: string;
  consultationFee?: number;
}
