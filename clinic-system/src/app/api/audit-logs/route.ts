import { guarded } from "@/lib/apiGuard";
import { corsHeaders } from "@/lib/clinicDb";
export const dynamic = "force-dynamic";
export async function OPTIONS() { return new Response(null, { status: 204, headers: corsHeaders() }); }
import { getDb, jsonResponse } from "@/lib/clinicDb";
export const GET = guarded(async () => jsonResponse(getDb().auditLogs || []));