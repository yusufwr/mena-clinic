import { guarded } from "@/lib/apiGuard";
import {
  withDb,
  jsonResponse,
  HttpError,
  corsHeaders,
  handleError,
  parseToken,
  LabParameterResult,
} from "@/lib/clinicDb";
import { logOperation } from "@/features/inventory/inventory.server";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export const PUT = guarded(async (request, { params }) => {
  try {
    const body = await request.json();
    const structuredResults: LabParameterResult[] | undefined = Array.isArray(body.structuredResults)
      ? body.structuredResults
      : undefined;

    // Allow updating just sharedDoctorIds (forwarding an existing report to additional doctors)
    const isForwardOnly =
      Boolean(body.sharedDoctorIds) &&
      structuredResults === undefined &&
      body.resultData === undefined;

    if (!isForwardOnly && !String(body.resultData || "").trim() && (!structuredResults || structuredResults.length === 0)) {
      throw new HttpError(400, "En az bir test sonucu girilmelidir");
    }

    const session = parseToken(request);

    const result = await withDb((db) => {
      const lab = db.labOrders?.find((order) => order.id === params.id);
      if (!lab) throw new HttpError(404, "Tetkik kaydı bulunamadı");

      const actorStaff = db.staff.find((s) => s.id === session?.id);
      const nowIso = new Date().toISOString();

      if (Array.isArray(body.sharedDoctorIds)) {
        const mergedIds = Array.from(
          new Set([
            ...(lab.doctorId ? [lab.doctorId] : []),
            ...body.sharedDoctorIds.map(String).filter(Boolean),
          ])
        );
        lab.sharedDoctorIds = mergedIds;
        lab.sharedDoctorNames = mergedIds
          .map((id) => db.doctors.find((d) => d.id === id)?.fullName)
          .filter((n): n is string => Boolean(n));
      }

      if (!isForwardOnly) {
        if (structuredResults) {
          lab.structuredResults = structuredResults;
        }
        if (body.specimenCategory) {
          lab.specimenCategory = body.specimenCategory;
        }
        if (Array.isArray(body.panelIds)) {
          lab.panelIds = body.panelIds;
        }
        if (body.testName && String(body.testName).trim()) {
          lab.testName = String(body.testName).trim();
        }
        if (body.roomNumber !== undefined) {
          lab.roomNumber = String(body.roomNumber).trim();
        }
        if (body.notes !== undefined) {
          lab.notes = String(body.notes).trim();
        }

        // Build readable summary text for legacy medicalRecords compatibility
        const summaryLines =
          structuredResults && structuredResults.length > 0
            ? structuredResults
                .map(
                  (r) =>
                    `${r.name}: ${r.value} ${r.unit || ""} [Ref: ${r.referenceText}]${
                      r.flag === "HIGH" ? " (YÜKSEK ↑)" : r.flag === "LOW" ? " (DÜŞÜK ↓)" : r.flag === "ABNORMAL" ? " (POZİTİF/ANORMAL)" : ""
                    }`
                )
                .join("\n")
            : String(body.resultData || "");

        lab.resultData = String(body.resultData || summaryLines);
        lab.status = "COMPLETED";
        lab.performedBy = body.performedBy || actorStaff?.fullName || lab.performedBy || "Laboratuvar Uzmanı";
        lab.performedByRole = actorStaff?.role || "LAB_TECH";
        lab.completedAt = nowIso;

        if (body.fileUrl) {
          lab.fileUrl = String(body.fileUrl);
        }

        // Sync back to linked medicalRecord if this order originated from a consultation
        if (lab.medicalRecordId) {
          const record = db.medicalRecords.find((r) => r.id === lab.medicalRecordId);
          const test = record?.labTests[lab.testIndex ?? -1];
          if (test) {
            test.status = "COMPLETED";
            test.resultData = lab.resultData;
          }
        }
      }

      // Enrich patient info on save
      const pat = db.patients.find((p) => p.id === lab.patientId);
      if (pat) {
        lab.patient = {
          fullName: pat.fullName,
          identityNo: pat.identityNo,
          phone: pat.phone,
          bloodType: pat.bloodType,
        };
      }

      logOperation(
        db,
        request,
        isForwardOnly ? "LAB_REPORT_SENT_TO_DOCTORS" : "LAB_RESULT_COMPLETED",
        `${lab.patient?.fullName || lab.id} - ${lab.testName}`
      );
      return { success: true, labOrder: lab };
    });

    return jsonResponse(result);
  } catch (err) {
    return handleError(err);
  }
});
