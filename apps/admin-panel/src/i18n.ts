export type AdminLang = "tr" | "ar" | "en";

export interface AdminTranslations {
  clinicTitle: string;
  panelSubtitle: string;
  logout: string;
  currentSession: string;
  secureConnection: string;
  roleSpecialScreens: string;
  
  // Roles
  roleAdmin: string;
  roleReceptionist: string;
  roleDoctor: string;
  rolePharmacist: string;
  roleLabTech: string;
  roleAccountant: string;

  // Menus
  menuAdminOverview: string;
  menuDoctorsHub: string;
  menuPatients: string;
  menuAppointments: string;
  menuPharmacy: string;
  menuLaboratory: string;
  menuFinance: string;
  menuStaff: string;
  menuDoctorReports: string;
  menuPharmacyReports: string;

  // Doctors 360
  doctorsTitle: string;
  doctorsSubtitle: string;
  searchDoctorPlaceholder: string;
  allDepartments: string;
  consultationFee: string;
  scheduleHours: string;
  inspectDoctor: string;
  doctorDetailsTitle: string;
  doctorPatientsList: string;
  doctorWeeklySchedule: string;
  doctorQueueToday: string;
  feePerVisit: string;
  close: string;
  noPatientsForDoctor: string;

  // Patients
  patientsTitle: string;
  newPatientBtn: string;
  searchPatientPlaceholder: string;
  allBloodTypes: string;
  patientName: string;
  phone: string;
  identityNo: string;
  bloodType: string;
  actions: string;
  viewHistory: string;

  // Accountant Reports
  accountantTitle: string;
  accountantSubtitle: string;
  doctorFinancialReports: string;
  pharmacyFinancialReport: string;
  selectDoctor: string;
  allDoctors: string;
  patientCount: string;
  grossRevenue: string;
  doctorShare: string;
  clinicShare: string;
  netPayable: string;
  pharmacyRevenue: string;
  pharmacyCost: string;
  pharmacyProfit: string;
  patientDiscountsTotal: string;
  inventoryValuation: string;
  printReport: string;
  downloadPdf: string;

  // Common
  todayRevenue: string;
  totalAppointments: string;
  activePatients: string;
  stockAlerts: string;
  currency: string;

  // Doctor Workspace Features
  dailySchedule: string;
  weeklySchedule: string;
  patientQueue: string;
  patientArchive: string;
  startConsultation: string;
  consultationInProgress: string;
  endConsultation: string;
  chiefComplaint: string;
  complaintPlaceholder: string;
  patientDetails: string;
  patientArrived: string;
  patientNoShow: string;
  cancelAppointment: string;
  referToDoctor: string;
  selectReferralDoctor: string;
  referralReason: string;
  referralPriority: string;
  routine: string;
  urgent: string;
  confirmReferral: string;
  pastConsultationsHistory: string;
  noPastRecords: string;
  prescriptions: string;
  labOrders: string;
  exportArchivePdf: string;
  activeConsultationTimer: string;
}

export const adminTranslations: Record<AdminLang, AdminTranslations> = {
  tr: {
    clinicTitle: "Mena Clinic",
    panelSubtitle: "Klinik Yönetim & Operasyon Paneli",
    logout: "Çıkış Yap",
    currentSession: "Mevcut Oturum:",
    secureConnection: "Yetkili Oturum",
    roleSpecialScreens: "Menü & Modüller",

    roleAdmin: "Yönetici (Admin 360°)",
    roleReceptionist: "Danışma Görevlisi",
    roleDoctor: "Uzman Hekim",
    rolePharmacist: "Eczacı",
    roleLabTech: "Laboratuvar Teknisyeni",
    roleAccountant: "Muhasebeci (Mali Müşavir)",

    menuAdminOverview: "360° Genel Bakış",
    menuDoctorsHub: "Doktorlar & Poliklinikler",
    menuPatients: "Hasta Yönetimi",
    menuAppointments: "Klinik Randevuları & Danışma",
    menuPharmacy: "Eczane & İlaç Deposu",
    menuLaboratory: "Laboratuvar & Tahliller",
    menuFinance: "Mali Tablolar & Kasa",
    menuStaff: "Personel & Yetkiler",
    menuDoctorReports: "Doktor Bazlı Mali Raporlar",
    menuPharmacyReports: "Eczane Mali Raporu",

    doctorsTitle: "Hekim Kadrosu & Poliklinik Yönetimi",
    doctorsSubtitle: "Tüm doktorların hastalarını, muayene ücretlerini, çalışma takvimini ve randevu akışını denetleyin.",
    searchDoctorPlaceholder: "Doktor adı veya e-posta ile ara...",
    allDepartments: "Tüm Branşlar",
    consultationFee: "Muayene Ücreti",
    scheduleHours: "Çalışma Saatleri",
    inspectDoctor: "Ayrı Ayrı İncele & Detay",
    doctorDetailsTitle: "Doktor Dosyası & Muayene Denetimi",
    doctorPatientsList: "Bu Doktorun Hastaları & Muayene Geçmişi",
    doctorWeeklySchedule: "Haftalık Çalışma & Randevu Takvimi",
    doctorQueueToday: "Bugünkü Randevu Kuyruğu",
    feePerVisit: "Muayene Başına Ücret:",
    close: "Kapat",
    noPatientsForDoctor: "Bu doktora kayıtlı aktif randevu bulunmamaktadır.",

    patientsTitle: "Kayıtlı Hasta Veritabanı",
    newPatientBtn: "Yeni Hasta Kaydet",
    searchPatientPlaceholder: "Hasta adı, telefon veya kimlik no ile ara...",
    allBloodTypes: "Tüm Kan Grupları",
    patientName: "Hasta Adı",
    phone: "Telefon",
    identityNo: "Kimlik / Pasaport No",
    bloodType: "Kan Grubu",
    actions: "İşlemler",
    viewHistory: "Geçmiş",

    accountantTitle: "Mali Raporlama & Muhasebe Paneli",
    accountantSubtitle: "Her bir doktor için hakediş raporları, muayene hasılatı ve eczane kar/maliyet analizleri.",
    doctorFinancialReports: "Doktor Bazlı Gelir & Hakediş Raporu",
    pharmacyFinancialReport: "Eczane & Depo Gelir / Kar Raporu",
    selectDoctor: "Doktor Filtrele:",
    allDoctors: "Tüm Hekimler (Genel İcmal)",
    patientCount: "Hasta Adedi",
    grossRevenue: "Brüt Muayene Geliri",
    doctorShare: "Doktor Hakedişi (%65)",
    clinicShare: "Klinik Payı (%35)",
    netPayable: "Net Ödenecek Tutar",
    pharmacyRevenue: "İlaç Satış Cirosu",
    pharmacyCost: "İlaç Maliyeti (COGS)",
    pharmacyProfit: "Brüt Eczane Karı",
    patientDiscountsTotal: "Uygulanan Hasta İndirimleri (%10)",
    inventoryValuation: "Mevcut Depo Stok Değeri",
    printReport: "Raporu Yazdır",
    downloadPdf: "PDF İndir",

    todayRevenue: "Bugünkü Toplam Ciro",
    totalAppointments: "Toplam Randevu",
    activePatients: "Kayıtlı Hasta",
    stockAlerts: "Kritik Stok Uyarısı",
    currency: "TL",

    dailySchedule: "Günlük Çalışma Programı",
    weeklySchedule: "Haftalık Randevu Takvimi",
    patientQueue: "Hasta Muayene Kuyruğu & Seans",
    patientArchive: "Hasta Arşivi & Raporlar",
    startConsultation: "Oturumu Başlat",
    consultationInProgress: "Muayene Oturumu Devam Ediyor",
    endConsultation: "Muayeneyi Tamamla & Kaydet",
    chiefComplaint: "Geliş Şikayeti & Başvuru Nedeni",
    complaintPlaceholder: "Hastanın geliş şikayetini ve semptomlarını girin...",
    patientDetails: "Hasta Detay Bilgileri",
    patientArrived: "Geldi (Kabul Et)",
    patientNoShow: "Gelmedi (No-Show)",
    cancelAppointment: "Randevuyu İptal Et",
    referToDoctor: "Başka Doktora Sevk / Yönlendirme",
    selectReferralDoctor: "Sevk Edilecek Hekim:",
    referralReason: "Sevk Nedeni & Konsültasyon Notu",
    referralPriority: "Öncelik Derecesi",
    routine: "Rutin",
    urgent: "Acil",
    confirmReferral: "Sevki Tamamla & Yönlendir",
    pastConsultationsHistory: "Geçmiş Muayene & Reçete Arşivi",
    noPastRecords: "Bu hastaya ait geçmiş klinik muayene kaydı bulunamadı.",
    prescriptions: "Elektronik Reçete",
    labOrders: "Laboratuvar Tetkik İstemi",
    exportArchivePdf: "Tüm Arşivi PDF Olarak İndir",
    activeConsultationTimer: "Muayene Süresi",
  },

  ar: {
    clinicTitle: "مجمع مينا الطبي",
    panelSubtitle: "لوحة الإدارة والعمليات السريرية",
    logout: "تسجيل الخروج",
    currentSession: "الجلسة الحالية:",
    secureConnection: "جلسة مصرح بها",
    roleSpecialScreens: "القوائم والوحدات",

    roleAdmin: "المدير العام (إشراف شامل 360°)",
    roleReceptionist: "موظف الاستقبال",
    roleDoctor: "الطبيب الاستشاري",
    rolePharmacist: "الصيدلي المسؤول",
    roleLabTech: "فني المختبر",
    roleAccountant: "المحاسب المالي",

    menuAdminOverview: "نظرة عامة شاملة 360°",
    menuDoctorsHub: "الأطباء والعيادات التخصصية",
    menuPatients: "إدارة وسجلات المرضى",
    menuAppointments: "المواعيد والاستقبال",
    menuPharmacy: "الصيدلية ومستودع الأدوية",
    menuLaboratory: "المختبر والتحاليل الطبية",
    menuFinance: "التقارير المالية والخزينة",
    menuStaff: "الكادر الطبي والصلاحيات",
    menuDoctorReports: "التقارير المالية لكل طبيب",
    menuPharmacyReports: "التقرير المالي للصيدلية",

    doctorsTitle: "إدارة الكادر الطبي والعيادات التخصصية",
    doctorsSubtitle: "مراقبة مرضى كل طبيب، أجور المعاينة، جدول المواعيد وسير الفحوصات الطبية بشكل مفصل.",
    searchDoctorPlaceholder: "البحث باسم الطبيب أو البريد الإلكتروني...",
    allDepartments: "جميع الأقسام الطبية",
    consultationFee: "أجرة المعاينة",
    scheduleHours: "ساعات الدوام",
    inspectDoctor: "معاينة ملف الطبيب المنفرد",
    doctorDetailsTitle: "الملف التفصيلي وإدارة عيادة الطبيب",
    doctorPatientsList: "مرضى هذا الطبيب وسجل المعاينات",
    doctorWeeklySchedule: "جدول المواعيد والدوام الأسبوعي",
    doctorQueueToday: "قائمة انتظار اليوم",
    feePerVisit: "أجرة المعاينة الواحدة:",
    close: "إغلاق",
    noPatientsForDoctor: "لا توجد مواعيد مسجلة لهذا الطبيب حالياً.",

    patientsTitle: "قاعدة بيانات المرضى المسجلين",
    newPatientBtn: "تسجيل مريض جديد",
    searchPatientPlaceholder: "البحث بالاسم، الهاتف أو الرقم الوطني...",
    allBloodTypes: "جميع فصائل الدم",
    patientName: "اسم المريض",
    phone: "الهاتف",
    identityNo: "الرقم الوطني / جواز السفر",
    bloodType: "فصيلة الدم",
    actions: "الإجراءات",
    viewHistory: "السجل الطبي",

    accountantTitle: "لوحة المحاسبة والتقارير المالية الدقيقة",
    accountantSubtitle: "تقارير مالية مخصصة لكل طبيب على حدة، إيرادات المعاينات، وتقارير أرباح وتكاليف الصيدلية.",
    doctorFinancialReports: "تقرير مستحقات وإيرادات الأطباء",
    pharmacyFinancialReport: "التقرير المالي للصيدلية والمستودع",
    selectDoctor: "تصفية حسب الطبيب:",
    allDoctors: "جميع الأطباء (تقرير شامل)",
    patientCount: "عدد المرضى",
    grossRevenue: "إجمالي إيراد المعاينات",
    doctorShare: "حصة الطبيب المستحقة (65%)",
    clinicShare: "حصة المركز الطبي (35%)",
    netPayable: "صافي المبلغ المستحق",
    pharmacyRevenue: "إيرادات مبيعات الأدوية",
    pharmacyCost: "تكلفة شراء الأدوية (COGS)",
    pharmacyProfit: "إجمالي أرباح الصيدلية",
    patientDiscountsTotal: "خصومات المرضى المعتمدة (10%)",
    inventoryValuation: "القيمة الإجمالية للمخزون الدوائي",
    printReport: "طباعة التقرير",
    downloadPdf: "تحميل كـ PDF",

    todayRevenue: "إجمالي إيراد اليوم",
    totalAppointments: "إجمالي المواعيد",
    activePatients: "المرضى المسجلون",
    stockAlerts: "تنبيهات نقص الأدوية",
    currency: "ل.س / TL",

    dailySchedule: "جدول العمل اليومي",
    weeklySchedule: "جدول المواعيد الأسبوعي",
    patientQueue: "طابور معاينة المرضى والجلسة",
    patientArchive: "أرشيف المرضى والتقارير",
    startConsultation: "بدء الجلسة الطبية",
    consultationInProgress: "جلسة المعاينة جارية الآن",
    endConsultation: "إنهاء المعاينة وتثبيت السجل",
    chiefComplaint: "الشكوى الرئيسية وسبب المراجعة",
    complaintPlaceholder: "أدخل شكوى المريض وأعراضه الرئيسية...",
    patientDetails: "بيانات المريض التفصيلية",
    patientArrived: "حضر المريض",
    patientNoShow: "لم يحضر (غياب)",
    cancelAppointment: "إلغاء الموعد",
    referToDoctor: "إحالة إلى طبيب استشاري آخر",
    selectReferralDoctor: "اختر الطبيب المحال إليه:",
    referralReason: "سبب الإحالة والملاحظات السريرية",
    referralPriority: "درجة الأولوية",
    routine: "عادي",
    urgent: "عاجل / طارئ",
    confirmReferral: "تأكيد الإحالة وتوجيه المريض",
    pastConsultationsHistory: "سجل المعاينات والوصفات السابقة",
    noPastRecords: "لا توجد سجلات طبية سابقة مسجلة لهذا المريض.",
    prescriptions: "الوصفة الطبية الإلكترونية",
    labOrders: "طلب التحاليل المخبرية",
    exportArchivePdf: "تحميل كامل الأرشيف كـ PDF",
    activeConsultationTimer: "مدة الجلسة",
  },

  en: {
    clinicTitle: "Mena Clinic",
    panelSubtitle: "Clinic Management & Operations Panel",
    logout: "Sign Out",
    currentSession: "Current Session:",
    secureConnection: "Authenticated session",
    roleSpecialScreens: "Navigation & Modules",

    roleAdmin: "Administrator (360° Full Access)",
    roleReceptionist: "Receptionist",
    roleDoctor: "Consultant Physician",
    rolePharmacist: "Pharmacist",
    roleLabTech: "Laboratory Technician",
    roleAccountant: "Accountant & Financial Officer",

    menuAdminOverview: "360° General Overview",
    menuDoctorsHub: "Doctors & Outpatient Clinics",
    menuPatients: "Patient Management",
    menuAppointments: "Appointments & Reception",
    menuPharmacy: "Pharmacy & Medical Stock",
    menuLaboratory: "Laboratory & Diagnostic Tests",
    menuFinance: "Financial Statements & Ledger",
    menuStaff: "Staff & User Roles",
    menuDoctorReports: "Doctor-by-Doctor Financial Reports",
    menuPharmacyReports: "Pharmacy Financial Report",

    doctorsTitle: "Medical Staff & Clinic Management",
    doctorsSubtitle: "Inspect individual doctor caseloads, consultation fees, weekly schedules, and appointment queues.",
    searchDoctorPlaceholder: "Search by physician name or email...",
    allDepartments: "All Medical Departments",
    consultationFee: "Consultation Fee",
    scheduleHours: "Working Hours",
    inspectDoctor: "Inspect Doctor Drill-Down",
    doctorDetailsTitle: "Doctor File & Clinical Audit",
    doctorPatientsList: "Patients of this Physician & History",
    doctorWeeklySchedule: "Weekly Schedule & Slot Calendar",
    doctorQueueToday: "Today's Appointment Queue",
    feePerVisit: "Fee Per Consultation:",
    close: "Close",
    noPatientsForDoctor: "No active appointments currently registered for this physician.",

    patientsTitle: "Registered Patient Directory",
    newPatientBtn: "Register New Patient",
    searchPatientPlaceholder: "Search by name, phone or ID...",
    allBloodTypes: "All Blood Types",
    patientName: "Patient Name",
    phone: "Phone",
    identityNo: "National ID / Passport",
    bloodType: "Blood Group",
    actions: "Actions",
    viewHistory: "History",

    accountantTitle: "Financial Accounting & Reporting Hub",
    accountantSubtitle: "Doctor-by-doctor settlement reports, consultation revenue, and pharmacy profit/cost metrics.",
    doctorFinancialReports: "Doctor-by-Doctor Revenue & Settlement",
    pharmacyFinancialReport: "Pharmacy & Inventory Financial Report",
    selectDoctor: "Filter by Doctor:",
    allDoctors: "All Physicians (Consolidated)",
    patientCount: "Patient Count",
    grossRevenue: "Gross Consultation Revenue",
    doctorShare: "Doctor Share (65%)",
    clinicShare: "Clinic Facility Fee (35%)",
    netPayable: "Net Payable Amount",
    pharmacyRevenue: "Prescription Sales Revenue",
    pharmacyCost: "Cost of Goods Sold (COGS)",
    pharmacyProfit: "Gross Pharmacy Profit",
    patientDiscountsTotal: "Patient Discounts Applied (10%)",
    inventoryValuation: "Total Inventory Valuation",
    printReport: "Print Report",
    downloadPdf: "Download PDF",

    todayRevenue: "Today's Gross Revenue",
    totalAppointments: "Total Appointments",
    activePatients: "Registered Patients",
    stockAlerts: "Low Stock Alerts",
    currency: "TL",

    dailySchedule: "Daily Work Schedule",
    weeklySchedule: "Weekly Appointment Calendar",
    patientQueue: "Patient Queue & Consultation",
    patientArchive: "Patient Archive & Records",
    startConsultation: "Start Consultation",
    consultationInProgress: "Consultation Session In Progress",
    endConsultation: "Complete & Finalize Consultation",
    chiefComplaint: "Chief Complaint & Reason for Visit",
    complaintPlaceholder: "Enter patient complaint and symptoms...",
    patientDetails: "Patient Details",
    patientArrived: "Arrived (Check-in)",
    patientNoShow: "No-Show (Absent)",
    cancelAppointment: "Cancel Appointment",
    referToDoctor: "Refer to Another Specialist Doctor",
    selectReferralDoctor: "Select Specialist to Refer:",
    referralReason: "Referral Reason & Clinical Note",
    referralPriority: "Priority Level",
    routine: "Routine",
    urgent: "Urgent",
    confirmReferral: "Confirm & Send Referral",
    pastConsultationsHistory: "Past Medical & Prescription History",
    noPastRecords: "No past medical records found for this patient.",
    prescriptions: "E-Prescriptions",
    labOrders: "Laboratory Orders",
    exportArchivePdf: "Export All Archive as PDF",
    activeConsultationTimer: "Session Time",
  },
};
