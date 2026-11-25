import { guarded } from "@/lib/apiGuard";
import { getDb, withDb, jsonResponse, corsHeaders, handleError, HttpError, newId, parseToken, MedicalRecordEntry } from "@/lib/clinicDb";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function handleGET(req: Request) {
  const url = new URL(req.url);
  const patientId = url.searchParams.get("patientId");
  const doctorId = url.searchParams.get("doctorId");
  const db = getDb();
  let list = db.medicalRecords || [];
  if (patientId) list = list.filter((r) => r.patientId === patientId);
  if (doctorId) list = list.filter((r) => r.doctorId === doctorId);
  return jsonResponse(list);
}

async function handlePOST(req: Request) {
  try {
    const body = await req.json();
    if (!body.patientId) throw new HttpError(400, "patientId zorunludur");
    if (!body.diagnosis && !body.clinicalNotes) throw new HttpError(400, "Tanı veya klinik notlar girilmelidir");
    if (body.prescriptionItems !== undefined && (!Array.isArray(body.prescriptionItems) || body.prescriptionItems.some((item: { itemName?: string; dosage?: string; quantity?: number }) => !item?.itemName?.trim() || !item.dosage?.trim() || !Number.isInteger(item.quantity) || Number(item.quantity) <= 0))) throw new HttpError(400, "Geçersiz reçete kalemi");
    if (body.labTests !== undefined && (!Array.isArray(body.labTests) || body.labTests.some((test: { testName?: string }) => !test?.testName?.trim()))) throw new HttpError(400, "Geçersiz tetkik adı");

    const created = await withDb((db) => {
      const patient = db.patients.find((p) => p.id === body.patientId);
      const doctor = db.doctors.find((d) => d.id === body.doctorId);
      if (!patient || !doctor) throw new HttpError(404, "Hasta veya hekim bulunamadı");
      if (body.appointmentId && db.medicalRecords.some(r => r.appointmentId === body.appointmentId)) throw new HttpError(409, "Bu muayene zaten kaydedildi; ek not kullanın");
      if (body.appointmentId && !db.appointments.some(a => a.id === body.appointmentId && a.patientId === patient.id && a.doctorId === doctor.id)) throw new HttpError(409, "Randevu hasta ve hekimle eşleşmiyor");

      const rawCharges = Array.isArray(body.additionalCharges) ? body.additionalCharges : [];
      const validCharges = rawCharges
        .map((c: { title?: string; amount?: number; category?: string; notes?: string }) => ({
          id: newId("mchg"),
          title: String(c?.title || "").trim(),
          amount: Number(c?.amount),
          category: (["CONSULTATION", "PROCEDURE", "SURGERY", "OTHER"].includes(String(c?.category)) ? c.category : "PROCEDURE") as "CONSULTATION" | "PROCEDURE" | "SURGERY" | "OTHER",
          notes: c?.notes ? String(c.notes).trim() : "",
        }))
        .filter((c: { title: string; amount: number }) => c.title.length > 0 && Number.isFinite(c.amount) && c.amount > 0);

      const nowIso = new Date().toISOString();
      const session = parseToken(req);
      const actorName = db.staff.find((s) => s.id === session?.id)?.fullName || doctor?.fullName || "Klinik Hekimi";

      const record: MedicalRecordEntry = {
        id: newId("rec"),
        patientId: body.patientId,
        doctorId: doctor?.id || "doc-cardio",
        appointmentId: body.appointmentId,
        diagnosis: body.diagnosis || "R00.0 - Rutin Klinik Muayene",
        clinicalNotes: body.clinicalNotes || "Hasta stabil, vital bulgular normal.",
        prescriptionItems: Array.isArray(body.prescriptionItems) ? body.prescriptionItems : [],
        labTests: Array.isArray(body.labTests) ? body.labTests : [],
        additionalCharges: validCharges,
        amendments: [],
        createdAt: nowIso,
        doctor: {
          fullName: doctor?.fullName || "Klinik Hekimi",
          specialty: doctor?.specialty || "Uzman Tabip",
        },
      };

      if (!db.medicalRecords) db.medicalRecords = [];
      db.medicalRecords.unshift(record);

      // Push any doctor-added extra procedure / surgery charges directly to Kasa (billingCharges)
      if (validCharges.length > 0) {
        db.billingCharges ||= [];
        for (const chg of validCharges) {
          db.billingCharges.unshift({
            id: newId("chg"),
            patientId: patient.id,
            patientName: patient.fullName,
            patientPhone: patient.phone,
            patientIdentityNo: patient.identityNo,
            doctorId: doctor.id,
            doctorName: doctor.fullName,
            appointmentId: body.appointmentId || undefined,
            medicalRecordId: record.id,
            title: chg.title,
            category: chg.category,
            totalAmount: chg.amount,
            paidAmount: 0,
            remainingAmount: chg.amount,
            status: "UNPAID",
            notes: chg.notes,
            createdBy: actorName,
            createdAt: nowIso,
            updatedAt: nowIso,
            payments: [],
          });
        }
      }
      if (record.prescriptionItems.length) (db.prescriptions ||= []).push({
        id: newId("pr"), patientId: patient.id, doctorId: doctor.id,
        status: "PENDING", createdAt: record.createdAt, items: record.prescriptionItems,
        patient: { fullName: patient.fullName }, doctor: { fullName: doctor.fullName },
      });
      for (const [testIndex, test] of Array.from(record.labTests.entries())) (db.labOrders ||= []).push({
        id: newId("lab"), medicalRecordId: record.id, testIndex, patientId: patient.id, doctorId: doctor.id,
        testName: test.testName, status: "PENDING", createdAt: record.createdAt,
        patient: { fullName: patient.fullName }, doctor: { fullName: doctor.fullName },
      });

      // If an appointment ID was passed or patient has waiting/confirmed appointment with this doctor, mark COMPLETED
      if (body.appointmentId) {
        const app = db.appointments.find((a) => a.id === body.appointmentId);
        if (app) app.status = "COMPLETED";
      } else {
        const activeApp = db.appointments.find(
          (a) => a.patientId === body.patientId && a.doctorId === doctor.id && a.status !== "CANCELLED" && a.status !== "COMPLETED"
        );
        if (activeApp) activeApp.status = "COMPLETED";
      }

      return record;
    });

    return jsonResponse(created, 201);
  } catch (err) {
    return handleError(err);
  }
}

export const GET = guarded(handleGET);
export const POST = guarded(handlePOST);
