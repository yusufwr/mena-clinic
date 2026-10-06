import { Router } from "express";
import { prisma } from "../../shared/prisma";
import { logAudit } from "../../shared/audit";
import { authenticateJWT, requireRoles, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// GET /api/appointments
router.get("/", authenticateJWT, requireRoles(["RECEPTIONIST", "DOCTOR", "FINANCE", "ADMIN"]), async (req: AuthenticatedRequest, res) => {
  const dateStr = req.query.date as string;
  const doctorIdQuery = req.query.doctorId as string;
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10) || 1);
  const pageSize = Math.min(200, Math.max(1, Number.parseInt(String(req.query.pageSize || "50"), 10) || 50));

  try {
    let whereClause: any = {};

    // If user is DOCTOR and specifies nothing or wants their own, or query filters by doctor
    if (req.user?.role === "DOCTOR") {
      whereClause.doctorId = doctorIdQuery || req.user.id;
    } else if (doctorIdQuery) {
      whereClause.doctorId = doctorIdQuery;
    }

    if (dateStr) {
      const date = new Date(dateStr);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.slotTime = { gte: startOfDay, lte: endOfDay };
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          include: {
            user: { select: { fullName: true, phone: true, email: true, identityNo: true } }
          }
        },
        doctor: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { slotTime: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    res.json({ data: appointments, page, pageSize, hasMore: appointments.length === pageSize });
  } catch (error) {
    res.status(500).json({ message: "Randevular yüklenemedi." });
  }
});

// GET /api/appointments/patient
router.get("/patient", authenticateJWT, requireRoles(["PATIENT"]), async (req: AuthenticatedRequest, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(String(req.query.pageSize || "25"), 10) || 25));
  try {
    const appointments = await prisma.appointment.findMany({
      where: { patientId: req.user!.patientId },
      include: {
        doctor: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { slotTime: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    res.json({ data: appointments, page, pageSize, hasMore: appointments.length === pageSize });
  } catch (error) {
    res.status(500).json({ message: "Randevularınız yüklenemedi." });
  }
});

// POST /api/appointments
router.post("/", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { patientId, doctorId, slotTime } = req.body;
  if (!doctorId || !slotTime) {
    return res.status(400).json({ message: "Doktor ve Randevu Saati gereklidir." });
  }

  let finalPatientId = patientId;
  if (req.user!.role === "PATIENT") {
    finalPatientId = req.user!.patientId;
  }

  if (!finalPatientId) {
    return res.status(400).json({ message: "Geçerli bir hasta bulunamadı." });
  }

  try {
    const slotDateTime = new Date(slotTime);

    // Prevent double booking
    if (Number.isNaN(slotDateTime.getTime())) {
      return res.status(400).json({ message: "Geçerli bir randevu tarihi girilmelidir." });
    }

    // Generate Queue Number for the doctor on that day
    const startOfDay = new Date(slotDateTime);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(slotDateTime);
    endOfDay.setHours(23, 59, 59, 999);

    const appointment = await prisma.$transaction(async (tx) => {
      const patientSlot = await tx.appointment.findFirst({
        where: { patientId: finalPatientId, slotTime: slotDateTime },
        select: { id: true },
      });
      if (patientSlot) {
        throw new Error("PATIENT_SLOT_TAKEN");
      }
      const existing = await tx.appointment.findFirst({
        where: { doctorId, slotTime: slotDateTime, status: { not: "CANCELLED" } },
        select: { id: true },
      });
      if (existing) {
        throw new Error("SLOT_TAKEN");
      }

      const count = await tx.appointment.count({
        where: { doctorId, slotTime: { gte: startOfDay, lte: endOfDay } },
      });

      return tx.appointment.create({
        data: {
          patientId: finalPatientId,
          doctorId,
          slotTime: slotDateTime,
          status: "CONFIRMED",
          queueNumber: count + 1,
          createdBy: req.user!.id,
        },
        include: { doctor: { select: { fullName: true } } },
      });
    }, { isolationLevel: "Serializable" });

    await logAudit(req.user!.id, "CREATE_APPOINTMENT", "Appointment", appointment.id, { doctorId, slotTime, queueNumber: appointment.queueNumber });
    res.status(201).json(appointment);
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_TAKEN") {
      return res.status(409).json({ message: "Bu randevu saati başka bir hasta tarafından alınmıştır. Lütfen başka bir saat seçin." });
    }
    if (error instanceof Error && error.message === "PATIENT_SLOT_TAKEN") {
      return res.status(409).json({ message: "Bu hastanın bu saat için mevcut bir randevusu bulunmaktadır." });
    }
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return res.status(409).json({ message: "Bu randevu saati başka bir hasta tarafından alınmıştır. Lütfen başka bir saat seçin." });
    }
    console.error(error);
    res.status(500).json({ message: "Randevu oluşturulurken hata oluştu." });
  }
});

// PUT /api/appointments/:id/status
router.put("/:id/status", authenticateJWT, requireRoles(["RECEPTIONIST", "DOCTOR", "ADMIN"]), async (req: AuthenticatedRequest, res) => {
  const { status } = req.body;
  try {
    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        doctor: { select: { fullName: true } },
        patient: { include: { user: { select: { fullName: true } } } }
      }
    });
    await logAudit(req.user!.id, "UPDATE_APPOINTMENT_STATUS", "Appointment", updated.id, { status });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Randevu durumu güncellenemedi." });
  }
});

export default router;
