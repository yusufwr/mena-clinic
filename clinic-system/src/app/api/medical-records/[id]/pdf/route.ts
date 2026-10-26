import { guarded } from "@/lib/apiGuard";
import { getDb, corsHeaders, MedicalRecordEntry } from "@/lib/clinicDb";
import { generateClinicalPdfBuffer, ClinicalReportData } from "@/lib/pdfGenerator";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function handleGET(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const record = (db.medicalRecords || []).find((r) => r.id === params.id) as (MedicalRecordEntry & { patient?: { fullName: string; identityNo: string; phone: string; bloodType?: string }; patientName?: string; patientIdentity?: string; patientPhone?: string }) | undefined;

  if (!record) {
    return new Response(JSON.stringify({ error: "Medical record not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }

  const patient = db.patients.find((p) => p.id === record.patientId || p.identityNo === record.patientId) || record.patient;
  const doctor = db.doctors.find((d) => d.id === record.doctorId) || {
    fullName: record.doctor?.fullName || "Dr. Mena Staff",
    specialty: record.doctor?.specialty || "Klinik Hekimi",
  };

  const reportData: ClinicalReportData = {
    reportId: record.id,
    clinicName: "Mena Clinic Aleppo",
    clinicAddress: "Al-Aziziyah, Aleppo, Syria",
    doctorName: doctor.fullName,
    specialty: doctor.specialty || "Uzman Hekim",
    patientName: patient?.fullName || record.patientName || "Hasta",
    patientIdentity: patient?.identityNo || record.patientIdentity || "N/A",
    patientPhone: patient?.phone || record.patientPhone || "N/A",
    bloodType: patient?.bloodType || "Belirtilmedi",
    date: record.createdAt ? record.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    diagnosis: record.diagnosis || "Belirtilmedi",
    clinicalNotes: record.clinicalNotes || "Klinik muayene tamamlandi.",
    prescriptions: record.prescriptionItems || [],
    labTests: record.labTests || [],
  };

  const pdfBuffer = generateClinicalPdfBuffer(reportData);

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="mena_medical_report_${record.id}.pdf"`,
      "Content-Length": String(pdfBuffer.length),
      ...corsHeaders(),
    },
  });
}

async function handlePOST(req: Request) {
  try {
    const body = await req.json();
    const pdfBuffer = generateClinicalPdfBuffer(body);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="mena_medical_report_${body.reportId || Date.now()}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
        ...corsHeaders(),
      },
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "PDF oluşturulamadı" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
}

export const GET = guarded(handleGET);
export const POST = guarded(handlePOST);
