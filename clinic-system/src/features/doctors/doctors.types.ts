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
  email: string;
  phone: string;
  schedules?: DoctorSchedule[];
  specialty?: string;
  rating?: number;
}
