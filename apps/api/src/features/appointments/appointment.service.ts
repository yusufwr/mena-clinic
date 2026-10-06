import { Prisma } from "@prisma/client";
import { prisma } from "../shared/prisma";

export type AuthUser = { id: string; role: string; patientId?: string };

export type BookAppointmentInput = {
  patientId: string;
  doctorId: string;
  slotTime: Date | string;
  clinicId?: string;
};

function parseSlotTime(value: Date | string): Date {
  const slot = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(slot.getTime())) throw new Error("Geçerli bir randevu zamanı girilmelidir.");
  if (slot <= new Date()) throw new Error("Randevu zamanı gelecekte olmalıdır.");
  return slot;
}

export async function bookAppointment(actor: AuthUser, input: BookAppointmentInput) {
  if (actor.role !== "PATIENT") throw new Error("Sadece hastalar randevu alabilir.");
  if (!actor.patientId || actor.patientId !== input.patientId) {
    throw new Error("Yalnızca kendi adınıza randevu oluşturabilirsiniz.");
  }
  const slotTime = parseSlotTime(input.slotTime);

  const doctor = await prisma.user.findFirst({
    where: { id: input.doctorId, role: "DOCTOR", status: "ACTIVE" },
    select: { id: true },
  });
  if (!doctor) throw new Error("Aktif doktor bulunamadı.");

  try {
    return await prisma.appointment.create({
      data: {
        patientId: input.patientId,
        doctorId: input.doctorId,
        slotTime,
        clinicId: input.clinicId,
        status: "PENDING",
        queueNumber: 0,
        createdBy: actor.id,
      },
      include: { doctor: { select: { id: true, fullName: true } } },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Bu hasta için aynı saatte zaten bir randevu mevcut.");
    }
    throw error;
  }
}
