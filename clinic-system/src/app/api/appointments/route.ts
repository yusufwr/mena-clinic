import { guarded } from "@/lib/apiGuard";
import { getDb, withDb, jsonResponse, corsHeaders, handleError, HttpError, AppointmentRecord, newId, appointmentForAdmin } from "@/lib/clinicDb";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function handleGET(req: Request) {
  const url = new URL(req.url);
  const doctorId = url.searchParams.get("doctorId");
  const patientId = url.searchParams.get("patientId");
  const date = url.searchParams.get("date");
  let list = getDb().appointments;
  if (doctorId) list = list.filter((a) => a.doctorId === doctorId);
  if (patientId) list = list.filter((a) => a.patientId === patientId);
  if (date) list = list.filter((a) => a.dateStr === date);
  list = [...list].sort((a, b) => (a.dateStr + a.timeStr).localeCompare(b.dateStr + b.timeStr));
  return jsonResponse(list.map(appointmentForAdmin));
}

const TIME_RE = /^\d{2}:\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function handlePOST(req: Request) {
  try {
    const body = await req.json();
    let dateStr: string = body.dateStr;
    let timeStr: string = body.timeStr;
    // Admin panel sends only slotTime (ISO). Derive date/time from it if needed.
    if ((!dateStr || !timeStr) && body.slotTime) {
      const s = String(body.slotTime);
      dateStr = dateStr || s.slice(0, 10);
      timeStr = timeStr || (s.match(/T(\d{2}:\d{2})/)?.[1] ?? s.match(/\d{2}:\d{2}/)?.[0] ?? "");
    }
    if (!DATE_RE.test(dateStr || "") || !TIME_RE.test(timeStr || "")) throw new HttpError(400, "Geçersiz tarih/saat");
    const calendarDate = new Date(`${dateStr}T00:00:00Z`);
    if (!Number.isFinite(calendarDate.getTime())) throw new HttpError(400, "Geçersiz tarih/saat");
    if (calendarDate.toISOString().slice(0, 10) !== dateStr || Number(timeStr.slice(0, 2)) > 23 || Number(timeStr.slice(3)) > 59) throw new HttpError(400, "Geçersiz tarih/saat");
    if (!body.doctorId) throw new HttpError(400, "doctorId zorunludur");

    const created = await withDb((db) => {
      const patient = db.patients.find((p) => p.id === body.patientId || (body.patientIdentityNo && p.identityNo === body.patientIdentityNo));
      if (!patient) throw new HttpError(404, "Hasta bulunamadı");
      const doctor = db.doctors.find((d) => d.id === body.doctorId);
      if (!doctor) throw new HttpError(404, "Doktor bulunamadı");

      if (doctor.unavailableSlots?.includes(timeStr)) {
        throw new HttpError(409, `SLOT_UNAVAILABLE: ${doctor.fullName} ${timeStr} saatinde müsait değil`);
      }
      const active = (a: AppointmentRecord) => a.status !== "CANCELLED";
      if (db.appointments.some((a) => active(a) && a.doctorId === doctor.id && a.dateStr === dateStr && a.timeStr === timeStr)) {
        throw new HttpError(409, `SLOT_TAKEN: ${dateStr} ${timeStr} dolu`);
      }
      if (db.appointments.some((a) => active(a) && a.patientId === patient.id && a.dateStr === dateStr && a.timeStr === timeStr)) {
        throw new HttpError(409, `PATIENT_BUSY: hastanın bu saatte başka randevusu var`);
      }

      const queueNumber = Math.max(0, ...db.appointments.filter((a) => a.doctorId === doctor.id && a.dateStr === dateStr).map(a => a.queueNumber)) + 1;
      const rec: AppointmentRecord = {
        id: newId("app"),
        patientId: patient.id,
        doctorId: doctor.id,
        slotTime: `${dateStr}T${timeStr}:00`,
        timeStr,
        dateStr,
        queueNumber,
        status: "CONFIRMED",
        notes: body.notes || "",
        patient: { fullName: patient.fullName, phone: patient.phone, identityNo: patient.identityNo, bloodType: patient.bloodType },
        doctor: { fullName: doctor.fullName, email: doctor.email, specialty: doctor.specialty },
        departmentName: doctor.department?.name || doctor.specialty,
        createdAt: new Date().toISOString(),
      };
      db.appointments.push(rec);
      return rec;
    });

    return jsonResponse(appointmentForAdmin(created), 201);
  } catch (err) {
    return handleError(err);
  }
}

export const GET = guarded(handleGET);
export const POST = guarded(handlePOST);
