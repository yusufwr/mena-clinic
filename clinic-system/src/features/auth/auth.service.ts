import { AuthUser, LoginDTO, RegisterDTO } from "./auth.types";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
async function authenticate(path: string, dto: LoginDTO | RegisterDTO): Promise<{ token: string; user: AuthUser }> {
  const response = await fetch(API_BASE + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dto) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "İşlem tamamlanamadı");
  return data;
}
export const loginUser = (dto: LoginDTO) => authenticate("/auth/login", dto);
export const registerPatient = (dto: RegisterDTO) => authenticate("/auth/register", dto);
