/**
 * Mena Clinic Aleppo - Universal WhatsApp API & Notification Engine
 * Provides instant 1-click messaging without recurring costs,
 * with support for Arabic, Turkish, and English localization.
 */

export interface WhatsAppAppointmentData {
  patientName: string;
  patientPhone: string;
  doctorName: string;
  specialty?: string;
  room?: string;
  dateStr: string;
  timeStr: string;
  queueNumber: number;
  fee?: string | number;
  clinicAddress?: string;
}

export interface WhatsAppPrescriptionData {
  patientName: string;
  patientPhone: string;
  doctorName: string;
  diagnosis?: string;
  prescriptions: { itemName: string; dosage: string; quantity: number }[];
  dateStr: string;
}

/** Sanitize phone number for international WhatsApp url format */
export function sanitizePhoneForWhatsApp(phone: string): string {
  let cleaned = (phone || "").replace(/\D/g, "");
  // If local Syrian number (e.g. 0991..., 991...) prepend 963
  if (cleaned.startsWith("09")) {
    cleaned = "963" + cleaned.slice(1);
  } else if (cleaned.startsWith("9") && cleaned.length === 9) {
    cleaned = "963" + cleaned;
  }
  return cleaned;
}

/** Generate 1-click WhatsApp Appointment Confirmation URL */
export function buildWhatsAppAppointmentUrl(
  data: WhatsAppAppointmentData,
  lang: "ar" | "tr" | "en" = "ar"
): string {
  const phone = sanitizePhoneForWhatsApp(data.patientPhone);
  const feeText = typeof data.fee === "number"
    ? (data.fee === 2000 ? "2.000 ل.س جديدة" : "1.000 ل.س جديدة")
    : (data.fee || "1.000 ل.س جديدة");

  let msg = "";

  if (lang === "ar") {
    msg =
`🏥 *مجمع مينا الطبي - حلب | Mena Clinic*
أهلاً بك عزيزي المريض: *${data.patientName}* 🌸

تم تأكيد موعدك بنجاح بالبيانات التالية:
👨‍⚕️ *الطبيب:* ${data.doctorName}
🏢 *العيادة:* ${data.room || "عيادات مينا التخصصية"}
📅 *التاريخ:* ${data.dateStr}
⏰ *الوقت:* ${data.timeStr}
🔢 *رقم الدور:* #${data.queueNumber}
💰 *أجرة المعاينة:* ${feeText}

📍 *العنوان:* حلب - مجمع مينا الطبي التخصصي
📞 *للاستفسار والطوارئ:* 0989111242 - 0989111245
نتمنى لكم دوام الصحة والعافية! ✨`;
  } else if (lang === "en") {
    msg =
`🏥 *Mena Clinic Aleppo - Appointment Confirmed*
Dear *${data.patientName}*,

Your appointment has been successfully scheduled:
👨‍⚕️ *Doctor:* ${data.doctorName}
🏢 *Room:* ${data.room || "Specialist Polyclinic"}
📅 *Date:* ${data.dateStr}
⏰ *Time:* ${data.timeStr}
🔢 *Queue No:* #${data.queueNumber}
💰 *Consultation Fee:* ${feeText}

📍 *Address:* Mena Medical Complex, Aleppo
📞 *Emergency & Inquiries:* 0989111242 - 0989111245
Wishing you quick recovery & good health! ✨`;
  } else {
    msg =
`🏥 *Mena Clinic Halep - Randevu Onay Bildirimi*
Sayın *${data.patientName}*,

Randevunuz başarıyla oluşturulmuştur:
👨‍⚕️ *Hekim:* ${data.doctorName}
🏢 *Poliklinik:* ${data.room || "Uzman Poliklinik"}
📅 *Tarih:* ${data.dateStr}
⏰ *Saat:* ${data.timeStr}
🔢 *Sıra No:* #${data.queueNumber}
💰 *Muayene Ücreti:* ${feeText}

📍 *Adres:* Mena Tıp Merkezi, Halep
📞 *İletişim & Acil:* 0989111242 - 0989111245
Geçmiş olsun dileklerimizle! ✨`;
  }

  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
}

/** Generate 1-click WhatsApp Prescription & Rx Share URL */
export function buildWhatsAppPrescriptionUrl(
  data: WhatsAppPrescriptionData,
  lang: "ar" | "tr" | "en" = "ar"
): string {
  const phone = sanitizePhoneForWhatsApp(data.patientPhone);
  const itemsText = data.prescriptions
    .map((item, idx) => `  ${idx + 1}. *${item.itemName}* (${item.dosage}) - ${item.quantity} عبوة`)
    .join("\n");

  let msg = "";

  if (lang === "ar") {
    msg =
`🏥 *مجمع مينا الطبي - وصفة طبية إلكترونية*
المريض: *${data.patientName}*
الطبيب المعالج: *${data.doctorName}*
التاريخ: *${data.dateStr}*
${data.diagnosis ? `📋 *التشخيص:* ${data.diagnosis}\n` : ""}
💊 *قائمة الأدوية الموصوفة:*
${itemsText}

⚠️ يرجى الالتزام بالجرعات المحددة واستشارة الصيدلي.
لأي استفسار: 0989111242 - 0989111245`;
  } else {
    msg =
`🏥 *Mena Clinic - Dijital Reçete Bildirimi*
Hasta: *${data.patientName}*
Hekim: *${data.doctorName}*
Tarih: *${data.dateStr}*
${data.diagnosis ? `Tanı: ${data.diagnosis}\n` : ""}
💊 *Reçete İlaçları:*
${itemsText}

İlaçlarınızı belirtilen dozda kullanınız. İletişim: 0989111242 - 0989111245`;
  }

  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
}

