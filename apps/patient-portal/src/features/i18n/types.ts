export type Language = "tr" | "ar" | "en";

export interface TranslationDictionary {
  // Navigation & General
  clinicName: string;
  clinicTagline: string;
  home: string;
  patientPortal: string;
  doctorPortal: string;
  bookAppointment: string;
  login: string;
  logout: string;
  register: string;
  welcome: string;
  demoStaff: string;
  switchRole: string;
  activeLanguage: string;
  emergencyHotline: string;
  aleppoSyria: string;
  allRightsReserved: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  scheduleHoursValue: string;
  
  // Landing Page
  heroBadge: string;
  heroTitle1: string;
  heroTitleAccent: string;
  heroTitle2: string;
  heroDescription: string;
  viewSpecialties: string;
  quickBooking: string;
  statsDoctors: string;
  statsDepartments: string;
  statsPatients: string;
  statsEmergency: string;
  departmentsTitle: string;
  departmentsSubtitle: string;
  ourDoctorsTitle: string;
  ourDoctorsSubtitle: string;
  bookWithDoctor: string;
  selectDeptPrompt: string;
  allSpecialties: string;
  featuresTitle: string;
  featuresSubtitle: string;
  feat1Title: string;
  feat1Desc: string;
  feat2Title: string;
  feat2Desc: string;
  feat3Title: string;
  feat3Desc: string;
  feat4Title: string;
  feat4Desc: string;

  // Patient Portal
  patientDashboardTitle: string;
  patientProfile: string;
  bloodType: string;
  identityNo: string;
  emergencyContact: string;
  insuranceInfo: string;
  newAppointmentBtn: string;
  myAppointments: string;
  appointmentHistory: string;
  consultationHistory: string;
  prescriptions: string;
  labResults: string;
  queueNumber: string;
  appointmentDate: string;
  doctor: string;
  department: string;
  status: string;
  statusPending: string;
  statusConfirmed: string;
  statusCompleted: string;
  statusCancelled: string;
  cancelAppointment: string;
  noAppointmentsYet: string;
  noPrescriptionsYet: string;
  noLabOrdersYet: string;
  noConsultationsYet: string;
  diagnosis: string;
  clinicalNotes: string;
  prescribedDrugs: string;
  orderedLabs: string;
  downloadReport: string;

  // Booking Modal
  bookingModalTitle: string;
  selectDepartment: string;
  selectDoctor: string;
  selectDate: string;
  selectTimeSlot: string;
  noSlotsAvailable: string;
  confirmBooking: string;
  bookingSuccessTitle: string;
  bookingSuccessDesc: string;
  yourQueueNumberIs: string;

  // Doctor Portal
  doctorDashboardTitle: string;
  doctorSpecialtyBadge: string;
  todayAgenda: string;
  todayQueueSubtitle: string;
  myPatients: string;
  myPatientsSubtitle: string;
  totalAppointmentsToday: string;
  pendingConsultations: string;
  completedToday: string;
  patientName: string;
  timeSlot: string;
  actions: string;
  startConsultation: string;
  viewHistory: string;
  newMedicalRecord: string;
  diagnosisICD: string;
  clinicalFindings: string;
  addPrescriptionItem: string;
  drugName: string;
  dosage: string;
  quantity: string;
  addLabTest: string;
  testName: string;
  saveMedicalRecord: string;
  recordSavedSuccess: string;
  cancel: string;
  save: string;
  searchPatient: string;
  filterByStatus: string;
  all: string;
  
  // Auth Modal
  authModalTitle: string;
  authLoginTab: string;
  authRegisterTab: string;
  authDoctorDemoTab: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  loginBtn: string;
  registerBtn: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;

  // New shared keys
  topBarTagline: string;
  quickJump: string;
  landingCorporate: string;
  specialtiesBadge: string;
  doctorConsultantsBadge: string;
  doctorBioDefault: string;
  bookingRequiresAuthNotice: string;
  loginToBookBtn: string;
  patientFileBadge: string;
  consultationSubtitle: string;
  safeCareGuarantee: string;
  patientPortalNotice: string;
}
