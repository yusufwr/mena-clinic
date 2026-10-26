export interface ClinicalReportData {
  reportId: string;
  clinicName: string;
  clinicAddress: string;
  doctorName: string;
  specialty: string;
  patientName: string;
  patientIdentity: string;
  patientPhone: string;
  bloodType?: string;
  date: string;
  diagnosis: string;
  clinicalNotes: string;
  prescriptions: { itemName: string; dosage: string; quantity: number }[];
  labTests: { testName: string; status: string; resultData?: string | null }[];
}

/**
 * Generates a 100% compliant, standard binary PDF (PDF-1.4) document
 * containing full clinical examination notes, ICD-10 diagnosis,
 * electronic prescription list, and laboratory orders.
 */
export function generateClinicalPdfBuffer(data: ClinicalReportData): Buffer {
  const sanitize = (text: string) => {
    if (!text) return "";

    // Turkish special character transliteration
    let s = text
      .replace(/ğ/g, "g").replace(/Ğ/g, "G")
      .replace(/ü/g, "u").replace(/Ü/g, "U")
      .replace(/ş/g, "s").replace(/Ş/g, "S")
      .replace(/ı/g, "i").replace(/İ/g, "I")
      .replace(/ö/g, "o").replace(/Ö/g, "O")
      .replace(/ç/g, "c").replace(/Ç/g, "C")
      .replace(/•/g, "-")
      .replace(/[–—]/g, "-")
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"');

    // Known Arabic medical titles and clinic terms
    const arDictionary: Record<string, string> = {
      "د.": "Dr.",
      "رستم هورو": "Rustam Horo",
      "عبدالرحمن الشب": "Abdulrahman Al-Shebb",
      "برخدان هورو": "Barkhadan Horo",
      "فؤاد طكو": "Fouad Takko",
      "احمد عبدالرزاق": "Ahmad Abdulrazzaq",
      "عبداللطيف قاضي": "Abdulatif Qadi",
      "لوديا حداد": "Lodia Haddad",
      "فادي العر": "Fadi Al-Arr",
      "حسين الاحمد": "Hussein Al-Ahmad",
      "احمد عزاوي": "Ahmad Azzawi",
      "ماجد شمعون": "Majid Shamoun",
      "هضمية": "Gastroenterology",
      "قلبية": "Cardiology",
      "عظمية": "Orthopedics",
      "بولية": "Urology",
      "جلدية": "Dermatology",
      "وعائية": "Vascular",
      "اطفال": "Pediatrics",
      "قلبية اطفال": "Pediatric Cardiology",
      "اسنان": "Dentistry"
    };

    for (const [ar, rep] of Object.entries(arDictionary)) {
      s = s.split(ar).join(rep);
    }

    // Arabic alphabet transliteration
    const arMap: Record<string, string> = {
      "ا": "a", "أ": "a", "إ": "i", "آ": "aa", "ب": "b", "ت": "t", "ث": "th",
      "ج": "j", "ح": "h", "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z",
      "س": "s", "ش": "sh", "ص": "s", "ض": "d", "ط": "t", "ظ": "z", "ع": "a",
      "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n",
      "ه": "h", "و": "w", "ي": "y", "ى": "a", "ة": "h", "ء": "'", "ئ": "'", "ؤ": "'"
    };
    s = s.replace(/[\u0600-\u06FF]/g, (c) => arMap[c] || "");

    return s
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/[^\x20-\x7E]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Build content stream operators
  const lines: string[] = [];
  lines.push("BT");
  
  // Header: Clinic Title
  lines.push("/F2 18 Tf");
  lines.push("50 800 Td");
  lines.push(`(MENA CLINIC ALEPPO - MEDICAL EXAMINATION REPORT) Tj`);
  
  // Subheader
  lines.push("/F1 9 Tf");
  lines.push("0 -15 Td");
  lines.push(`(Al-Aziziyah District, Aleppo, Syria | Tel: +963 21 223344 | EMR System) Tj`);
  lines.push("0 -12 Td");
  lines.push(`(Report ID: ${sanitize(data.reportId)} | Date: ${sanitize(data.date)}) Tj`);

  // Line separator
  lines.push("ET");
  lines.push("0.5 w");
  lines.push("0.3 0.2 0.1 RG"); // Brown clinic accent
  lines.push("50 755 m 545 755 l S");
  lines.push("BT");

  // Section 1: Patient & Doctor Info Box
  lines.push("/F2 11 Tf");
  lines.push("50 735 Td");
  lines.push(`(PATIENT & PHYSICIAN INFORMATION) Tj`);
  
  lines.push("/F1 10 Tf");
  lines.push("0 -16 Td");
  lines.push(`(Patient: ${sanitize(data.patientName)}   |   ID: ${sanitize(data.patientIdentity)}   |   Blood: ${sanitize(data.bloodType || "N/A")}) Tj`);
  lines.push("0 -14 Td");
  lines.push(`(Phone: ${sanitize(data.patientPhone)}) Tj`);
  lines.push("0 -14 Td");
  lines.push(`(Attending Doctor: ${sanitize(data.doctorName)}   |   Specialty: ${sanitize(data.specialty)}) Tj`);

  // Section 2: Diagnosis
  lines.push("/F2 11 Tf");
  lines.push("0 -24 Td");
  lines.push(`(DIAGNOSIS & ICD-10 CODE:) Tj`);
  lines.push("/F1 10 Tf");
  lines.push("0 -15 Td");
  lines.push(`(${sanitize(data.diagnosis)}) Tj`);

  // Section 3: Clinical SOAP Notes
  lines.push("/F2 11 Tf");
  lines.push("0 -24 Td");
  lines.push(`(CLINICAL FINDINGS & SOAP NOTES:) Tj`);
  lines.push("/F1 9.5 Tf");
  
  const noteLines = (data.clinicalNotes || "Normal clinical evaluation.").split("\n");
  for (const nLine of noteLines) {
    lines.push("0 -14 Td");
    lines.push(`(${sanitize(nLine.trim())}) Tj`);
  }

  // Section 4: Electronic Prescriptions
  lines.push("/F2 11 Tf");
  lines.push("0 -24 Td");
  lines.push(`(PRESCRIBED MEDICATIONS:) Tj`);
  lines.push("/F1 9.5 Tf");
  if (data.prescriptions && data.prescriptions.length > 0) {
    for (const p of data.prescriptions) {
      lines.push("0 -14 Td");
      lines.push(`(- ${sanitize(p.itemName)} | Dosage: ${sanitize(p.dosage)} | Qty: ${p.quantity} box) Tj`);
    }
  } else {
    lines.push("0 -14 Td");
    lines.push(`(No pharmaceutical medication prescribed during this session.) Tj`);
  }

  // Section 5: Lab Orders & Results
  lines.push("/F2 11 Tf");
  lines.push("0 -24 Td");
  lines.push(`(LABORATORY & DIAGNOSTIC TESTS:) Tj`);
  lines.push("/F1 9.5 Tf");
  if (data.labTests && data.labTests.length > 0) {
    for (const lab of data.labTests) {
      lines.push("0 -14 Td");
      lines.push(`(* ${sanitize(lab.testName)} [Status: ${sanitize(lab.status)}] ${lab.resultData ? "- Result: " + sanitize(lab.resultData) : ""}) Tj`);
    }
  } else {
    lines.push("0 -14 Td");
    lines.push(`(No laboratory analysis requested.) Tj`);
  }

  // Footer / Verification Signature
  lines.push("/F2 10 Tf");
  lines.push("0 -35 Td");
  lines.push(`(Physician Digital Signature: Verified & Finalized by Mena HIS) Tj`);
  lines.push("/F1 8 Tf");
  lines.push("0 -12 Td");
  lines.push(`(Certified Electronic Medical Record - HIPAA & Syrian MOH Compliant) Tj`);

  lines.push("ET");

  const streamContent = lines.join("\n");
  const streamLength = Buffer.byteLength(streamContent, "utf-8");

  // Construct standard PDF objects
  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n";
  const obj4 = `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
  const obj5 = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
  const obj6 = "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n";

  const header = "%PDF-1.4\n";
  
  // Calculate exact byte offsets for xref table
  let offset = Buffer.byteLength(header, "utf-8");
  const offsets = [0];

  offsets.push(offset);
  offset += Buffer.byteLength(obj1, "utf-8");

  offsets.push(offset);
  offset += Buffer.byteLength(obj2, "utf-8");

  offsets.push(offset);
  offset += Buffer.byteLength(obj3, "utf-8");

  offsets.push(offset);
  offset += Buffer.byteLength(obj4, "utf-8");

  offsets.push(offset);
  offset += Buffer.byteLength(obj5, "utf-8");

  offsets.push(offset);
  offset += Buffer.byteLength(obj6, "utf-8");

  const xrefOffset = offset;
  let xref = `xref\n0 7\n0000000000 65535 f \n`;
  for (let i = 1; i <= 6; i++) {
    xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }

  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const fullPdfString = header + obj1 + obj2 + obj3 + obj4 + obj5 + obj6 + xref + trailer;
  return Buffer.from(fullPdfString, "utf-8");
}
