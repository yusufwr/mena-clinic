import { prisma } from "../shared/prisma";
import type { AuthUser } from "../appointments/appointment.service";

function assertDoctor(actor: AuthUser) {
  if (actor.role !== "DOCTOR") throw new Error("Bu işlem yalnızca doktorlar içindir.");
}

export async function getMyPatients(actor: AuthUser) {
  assertDoctor(actor);
  const doctor = await prisma.user.findFirst({ where: { id: actor.id, role: "DOCTOR", status: "ACTIVE" }, select: { id: true } });
  if (!doctor) throw new Error("Aktif doktor hesabı bulunamadı.");

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: actor.id },
    distinct: ["patientId"],
    orderBy: { slotTime: "desc" },
    select: { patient: { include: { user: { select: { id: true, fullName: true, email: true, phone: true } } } } },
  });
  return appointments.map(({ patient }) => patient);
}

export async function getMyAppointmentHistory(actor: AuthUser) {
  assertDoctor(actor);
  return prisma.appointment.findMany({
    where: { doctorId: actor.id },
    orderBy: { slotTime: "desc" },
    include: { patient: { include: { user: { select: { id: true, fullName: true, email: true } } } } },
  });
}
