import { guarded } from "@/lib/apiGuard";
import { getDb, jsonResponse, corsHeaders, errorResponse, digits, stripSecret, parseToken } from "@/lib/clinicDb";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

/** Full patient profile for the QR portal: identity, appointments and finalised medical records. */
async function handleGET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  if (!q) return errorResponse("q gerekli", 400);
  const db = getDb();
  const p =
    db.patients.find((x) => x.identityNo === q) ||
    (digits(q).length >= 7 ? db.patients.find((x) => digits(x.phone) === digits(q) || digits(x.phone).endsWith(digits(q))) : undefined);
  if (!p) return errorResponse("Hasta bulunamadı", 404);
  const session = parseToken(req);
  if (session?.kind === "patient" && session.id !== p.id) return errorResponse("Erişim yetkiniz yok", 403);

  const appointments = db.appointments
    .filter((a) => a.patientId === p.id)
    .sort((a, b) => (b.dateStr + b.timeStr).localeCompare(a.dateStr + a.timeStr))
    .map((a) => ({
      id: a.id,
      doctorId: a.doctorId,
      doctorName: a.doctor.fullName,
      slotTime: `${a.dateStr} ${a.timeStr}`,
      queueNumber: a.queueNumber,
      status: a.status,
    }));

  const consultations = db.medicalRecords
    .filter((r) => r.patientId === p.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => ({
      id: r.id,
      doctorName: r.doctor.fullName,
      specialty: r.doctor.specialty || "",
      date: r.createdAt.slice(0, 10),
      diagnosis: r.diagnosis,
      clinicalNotes: r.clinicalNotes + (r.amendments.length ? "\n\n" + r.amendments.map((m) => `+ ${m.createdAt.slice(0, 10)}: ${m.notes}`).join("\n") : ""),
      prescriptions: r.prescriptionItems,
      labTests: r.labTests,
    }));

  return jsonResponse({ ...stripSecret(p), appointments, consultations });
}

export const GET = guarded(handleGET);
