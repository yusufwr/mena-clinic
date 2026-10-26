import { guarded } from "@/lib/apiGuard";
import { corsHeaders } from "@/lib/clinicDb";
export const dynamic = "force-dynamic";
export async function OPTIONS() { return new Response(null, { status: 204, headers: corsHeaders() }); }
import { inventoryOperation } from "@/features/inventory/inventory.server";
export const PUT = guarded((req, { params }) => inventoryOperation(req, params.id));