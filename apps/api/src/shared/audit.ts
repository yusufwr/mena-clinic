import { prisma } from "./prisma";

export async function logAudit(
  userId: string | null,
  action: string,
  resource: string,
  targetId: string | null,
  payload: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        targetId,
        payload: payload ? JSON.stringify(payload) : null,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}
