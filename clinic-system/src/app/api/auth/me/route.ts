import { guarded } from "@/lib/apiGuard";
import { getDb, jsonResponse, corsHeaders, errorResponse, parseToken, stripSecret } from "@/lib/clinicDb";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function handleGET(req: Request) {
  const tok = parseToken(req);
  if (!tok) return errorResponse("Oturum yok", 401);
  const db = getDb();
  if (tok.kind === "staff") {
    const s = db.staff.find((x) => x.id === tok.id);
    return s ? jsonResponse({ user: stripSecret(s) }) : errorResponse("Oturum geçersiz", 401);
  }
  const p = db.patients.find((x) => x.id === tok.id);
  return p ? jsonResponse({ user: { ...stripSecret(p), role: "PATIENT" } }) : errorResponse("Oturum geçersiz", 401);
}

export const GET = guarded(handleGET);
