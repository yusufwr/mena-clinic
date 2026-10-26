import { clinicDate } from "@/lib/clinicDate";
import { guarded } from "@/lib/apiGuard";
import { getDb, withDb, jsonResponse, corsHeaders, handleError, HttpError } from "@/lib/clinicDb";

export const dynamic = "force-dynamic";

const ALL_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30",
];

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function handleGET(req: Request, { params }: { params: { id: string } }) {
  const date = new URL(req.url).searchParams.get("date") || clinicDate();
  const db = getDb();
  const doctor = db.doctors.find((d) => d.id === params.id);
  if (!doctor) return jsonResponse({ error: "Doctor not found", message: "Doctor not found" }, 404);

  // Only appointments on the requested date block a slot
  const bookedSlots = db.appointments
    .filter((a) => a.doctorId === doctor.id && a.status !== "CANCELLED" && a.dateStr === date)
    .map((a) => a.timeStr);
  const unavailableSlots = doctor.unavailableSlots || [];
  const allBlockedSlots = Array.from(new Set([...unavailableSlots, ...bookedSlots]));

  return jsonResponse({
    date,
    doctor: { id: doctor.id, fullName: doctor.fullName, hours: doctor.hours, specialty: doctor.specialty },
    // Admin panel compatibility (expects weekly schedules)
    schedules: [1, 2, 3, 4, 5].map((d) => ({ dayOfWeek: d, startTime: "09:00", endTime: "17:00" })),
    unavailableSlots,
    bookedSlots,
    allBlockedSlots,
    availableSlots: ALL_SLOTS.filter((s) => !allBlockedSlots.includes(s)),
    allStandardSlots: ALL_SLOTS,
  });
}

async function handlePUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const doctor = await withDb((db) => {
      const d = db.doctors.find((x) => x.id === params.id);
      if (!d) throw new HttpError(404, "Doctor not found");
      if (Array.isArray(body.unavailableSlots)) d.unavailableSlots = body.unavailableSlots;
      if (body.hours) d.hours = body.hours;
      return d;
    });
    return jsonResponse({ success: true, doctor });
  } catch (err) {
    return handleError(err);
  }
}

export const GET = guarded(handleGET);
export const PUT = guarded(handlePUT);
