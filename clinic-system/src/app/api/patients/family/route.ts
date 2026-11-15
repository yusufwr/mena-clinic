import { guarded } from "@/lib/apiGuard";
import { getDb, withDb, jsonResponse, corsHeaders, handleError, HttpError, parseToken, PatientRecord, newId, stripSecret } from "@/lib/clinicDb";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

/** GET /api/patients/family: Returns the patient and all associated family members */
async function handleGET(req: Request) {
  try {
    const session = parseToken(req);
    if (!session) throw new HttpError(401, "Oturum gerekli");

    const db = getDb();
    const primary = db.patients.find(p => p.id === session.id);
    if (!primary) throw new HttpError(404, "Hasta bulunamadı");

    // Head ID is either this patient's own ID (if they are head) or their parent's ID
    const headId = primary.familyHeadId || primary.id;

    // All members in this family
    const familyMembers = db.patients
      .filter(p => p.id === headId || p.familyHeadId === headId || (primary.id === headId && p.familyHeadId === primary.id))
      .map(p => ({
        ...stripSecret(p),
        isPrimary: p.id === session.id,
        isHead: p.id === headId,
        relationship: p.familyRelationship || (p.id === headId ? "HEAD" : "CHILD")
      }));

    return jsonResponse({
      headId,
      familyMembers,
    });
  } catch (err) {
    return handleError(err);
  }
}

/** POST /api/patients/family: Adds a family dependent (e.g. child, spouse, elder) */
async function handlePOST(req: Request) {
  try {
    const session = parseToken(req);
    if (!session) throw new HttpError(401, "Oturum gerekli");

    const body = await req.json();
    const fullName = String(body.fullName || "").trim();
    if (!fullName) throw new HttpError(400, "İsim soyisim zorunludur");

    const relationship = body.relationship || "CHILD"; // CHILD, SPOUSE, PARENT, OTHER
    const bloodType = body.bloodType || "O+";
    const emergencyContact = body.emergencyContact || "";
    const familyNote = body.familyNote || "";

    const newDependent = await withDb(async (db) => {
      const primary = db.patients.find(p => p.id === session.id);
      if (!primary) throw new HttpError(404, "Ana hasta hesabı bulunamadı");

      const headId = primary.familyHeadId || primary.id;

      // Generate a linked dependent ID and unique identity number if not provided
      const depIdentityNo = body.identityNo ? String(body.identityNo).trim() : `FAM-${Date.now().toString().slice(-8)}`;
      
      const rec: PatientRecord = {
        id: newId("pat-fam"),
        fullName,
        identityNo: depIdentityNo,
        phone: primary.phone,
        email: `${depIdentityNo.toLowerCase()}@family.menaclinic.com`,
        bloodType,
        emergencyContact: emergencyContact || `${primary.fullName} (${primary.phone})`,
        familyHeadId: headId,
        familyRelationship: relationship,
        familyNote,
        createdAt: new Date().toISOString(),
      };

      db.patients.push(rec);
      return rec;
    });

    return jsonResponse({
      success: true,
      message: "Aile ferdi başarıyla eklendi",
      member: stripSecret(newDependent),
    }, 201);
  } catch (err) {
    return handleError(err);
  }
}

export const GET = guarded(handleGET);
export const POST = guarded(handlePOST);

