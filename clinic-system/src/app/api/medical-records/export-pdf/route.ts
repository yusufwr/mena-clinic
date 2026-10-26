import { guarded } from "@/lib/apiGuard";
import { corsHeaders } from "@/lib/clinicDb";
import { generateClinicalPdfBuffer, ClinicalReportData } from "@/lib/pdfGenerator";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

async function handlePOST(req: Request) {
  try {
    const body: ClinicalReportData = await req.json();
    const pdfBuffer = generateClinicalPdfBuffer(body);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="clinical_report_${body.reportId || Date.now()}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
        ...corsHeaders(),
      },
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "PDF oluşturulamadı" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
}

export const POST = guarded(handlePOST);
