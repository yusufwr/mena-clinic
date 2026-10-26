import { guarded } from "@/lib/apiGuard";
import { corsHeaders } from "@/lib/clinicDb";
export const dynamic = "force-dynamic";
export async function OPTIONS() { return new Response(null, { status: 204, headers: corsHeaders() }); }
import { dispense } from "@/features/inventory/inventory.server";
export const PUT = guarded((req, {params}) => dispense(req, params.id));