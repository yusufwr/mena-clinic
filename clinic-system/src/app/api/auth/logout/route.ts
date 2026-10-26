import { jsonResponse } from "@/lib/clinicDb";

export async function POST() {
  const response = jsonResponse({ success: true });
  response.headers.set("Set-Cookie", "clinic_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");
  return response;
}
