import { guarded } from "@/lib/apiGuard";
import {
  getDb,
  withDb,
  jsonResponse,
  parseToken,
  corsHeaders,
  handleError,
  HttpError,
  newId,
  LabOrderRecord,
  LabParameterResult,
} from "@/lib/clinicDb";
import { logOperation } from "@/features/inventory/inventory.server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export const GET = guarded(async (request) => {
  const db = getDb();
  const url = new URL(request.url);
  const filterPatientId = url.searchParams.get("patientId");
  const session = parseToken(request);
  const staff = session?.kind === "staff" ? db.staff.find((u) => u.id === session.id) : null;

  const rawOrders = db.labOrders || [];
  const filtered = rawOrders.filter((order) => {
    if (filterPatientId && order.patientId !== filterPatientId) return false;
    if (staff?.role === "DOCTOR") {
      // Doctor sees orders they requested, orders shared/sent to them by Lab Tech, or orders for their patients
      const isDirect = order.doctorId === staff.id;
      const isShared = Array.isArray(order.sharedDoctorIds) && order.sharedDoctorIds.includes(staff.id);
      const isOwnPatient = db.appointments.some(
        (a) => a.doctorId === staff.id && a.patientId === order.patientId
      );
      return isDirect || isShared || isOwnPatient;
    }
    return true;
  });

  // Enrich patient & doctor details live from db so PDF template always has full patient metadata
  const enriched = filtered.map((order) => {
    const p = db.patients.find((pat) => pat.id === order.patientId);
    const d = db.doctors.find((doc) => doc.id === order.doctorId);
    return {
      ...order,
      roomNumber: order.roomNumber || d?.room || "Poliklinik",
      patient: {
        fullName: p?.fullName || order.patient?.fullName || "Kayıtlı Hasta",
        identityNo: p?.identityNo || order.patient?.identityNo || "-",
        phone: p?.phone || order.patient?.phone || "-",
        bloodType: p?.bloodType || order.patient?.bloodType || "-",
      },
      doctor: {
        fullName: d?.fullName || order.doctor?.fullName || "Klinik Hekimi",
        specialty: d?.specialty || order.doctor?.specialty || "",
        room: d?.room || order.doctor?.room || "",
      },
    };
  });

  // Newest first
  enriched.sort((a, b) => (b.completedAt || b.createdAt).localeCompare(a.completedAt || a.createdAt));
  return jsonResponse(enriched);
});

export const POST = guarded(async (request) => {
  try {
    const body = await request.json();
    if (!body.patientId) throw new HttpError(400, "Hasta seçimi zorunludur");
    if (!String(body.testName || "").trim()) throw new HttpError(400, "Tahlil adı zorunludur");

    const session = parseToken(request);

    const created = await withDb((db) => {
      const patient = db.patients.find((p) => p.id === body.patientId);
      if (!patient) throw new HttpError(404, "Hasta bulunamadı");

      const actorStaff = db.staff.find((s) => s.id === session?.id);
      const primaryDocId = body.doctorId || (Array.isArray(body.sharedDoctorIds) ? body.sharedDoctorIds[0] : "") || db.doctors[0]?.id || "";
      const primaryDoc = db.doctors.find((d) => d.id === primaryDocId);

      const sharedIds: string[] = Array.isArray(body.sharedDoctorIds)
        ? Array.from(new Set(body.sharedDoctorIds.map(String).filter(Boolean)))
        : primaryDocId
        ? [primaryDocId]
        : [];

      const sharedNames = sharedIds
        .map((id) => db.doctors.find((d) => d.id === id)?.fullName)
        .filter((n): n is string => Boolean(n));

      const structuredResults: LabParameterResult[] = Array.isArray(body.structuredResults)
        ? body.structuredResults
        : [];

      const hasResults = structuredResults.length > 0 || Boolean(String(body.resultData || "").trim());
      const nowIso = new Date().toISOString();

      const newOrder: LabOrderRecord = {
        id: newId("lab"),
        patientId: patient.id,
        doctorId: primaryDoc?.id || primaryDocId,
        sharedDoctorIds: sharedIds,
        sharedDoctorNames: sharedNames,
        specimenCategory: body.specimenCategory || "BLOOD",
        panelIds: Array.isArray(body.panelIds) ? body.panelIds : [],
        testName: String(body.testName).trim(),
        status: hasResults ? "COMPLETED" : "PENDING",
        resultData: String(body.resultData || ""),
        structuredResults,
        performedBy: hasResults ? (body.performedBy || actorStaff?.fullName || "Laboratuvar Uzmanı") : undefined,
        performedByRole: hasResults ? (actorStaff?.role || "LAB_TECH") : undefined,
        completedAt: hasResults ? nowIso : undefined,
        roomNumber: body.roomNumber || primaryDoc?.room || "Laboratuvar",
        notes: body.notes ? String(body.notes).trim() : undefined,
        createdAt: nowIso,
        patient: {
          fullName: patient.fullName,
          identityNo: patient.identityNo,
          phone: patient.phone,
          bloodType: patient.bloodType,
        },
        doctor: {
          fullName: primaryDoc?.fullName || "Klinik Hekimi",
          specialty: primaryDoc?.specialty,
          room: primaryDoc?.room,
        },
      };

      db.labOrders ||= [];
      db.labOrders.unshift(newOrder);
      logOperation(
        db,
        request,
        hasResults ? "LAB_REPORT_CREATED_AND_SENT" : "LAB_ORDER_CREATED",
        `${patient.fullName} - ${newOrder.testName}`
      );
      return newOrder;
    });

    return jsonResponse(created, 201);
  } catch (err) {
    return handleError(err);
  }
});
