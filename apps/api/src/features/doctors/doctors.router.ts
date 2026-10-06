import { Router } from "express";
import { prisma } from "../../shared/prisma";
import { logAudit } from "../../shared/audit";
import { authenticateJWT, requireRoles, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// GET /api/doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: "DOCTOR", status: "ACTIVE" },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        schedules: true,
      },
    });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Doktor listesi alınamadı." });
  }
});

// GET /api/doctors/:id/schedule
router.get("/:id/schedule", async (req, res) => {
  const doctorId = req.params.id;
  const dateStr = req.query.date as string; // e.g. "2026-08-27"

  try {
    const schedules = await prisma.doctorSchedule.findMany({
      where: { doctorId },
    });

    if (!dateStr) {
      return res.json({ schedules, bookedSlots: [] });
    }

    const date = new Date(dateStr);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        slotTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { notIn: ["CANCELLED"] },
      },
      select: { slotTime: true },
    });

    const bookedSlots = appointments.map((app) => app.slotTime.toISOString());
    res.json({ schedules, bookedSlots });
  } catch (error) {
    res.status(500).json({ message: "Doktor takvimi yüklenemedi." });
  }
});

// PUT /api/doctors/:id/schedule
router.put(
  "/:id/schedule",
  authenticateJWT,
  requireRoles(["DOCTOR", "ADMIN"]),
  async (req: AuthenticatedRequest, res) => {
    const doctorId = req.params.id;
    const { schedules } = req.body;

    if (req.user!.role === "DOCTOR" && req.user!.id !== doctorId) {
      return res.status(403).json({ message: "Başka bir doktorun çalışma saatlerini güncelleyemezsiniz." });
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.doctorSchedule.deleteMany({ where: { doctorId } });
        if (schedules && schedules.length > 0) {
          await tx.doctorSchedule.createMany({
            data: schedules.map((s: any) => ({
              doctorId,
              dayOfWeek: parseInt(s.dayOfWeek),
              startTime: s.startTime,
              endTime: s.endTime,
              breakStart: s.breakStart,
              breakEnd: s.breakEnd,
            })),
          });
        }
      });

      await logAudit(req.user!.id, "UPDATE_SCHEDULE", "DoctorSchedule", doctorId, schedules);
      res.json({ message: "Çalışma saatleri başarıyla güncellendi." });
    } catch (error) {
      res.status(500).json({ message: "Takvim güncellenirken hata oluştu." });
    }
  }
);

export default router;
