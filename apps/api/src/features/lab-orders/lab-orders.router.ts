import { Router } from "express";
import { prisma } from "../../shared/prisma";
import { logAudit } from "../../shared/audit";
import { authenticateJWT, requireRoles, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// GET /api/lab-orders
router.get("/", authenticateJWT, requireRoles(["LAB_TECH", "DOCTOR", "ADMIN"]), async (req, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(String(req.query.pageSize || "25"), 10) || 25));
  try {
    const orders = await prisma.labOrder.findMany({
      include: {
        record: {
          include: {
            patient: { include: { user: { select: { fullName: true, phone: true } } } },
            doctor: { select: { fullName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    res.json({ data: orders, page, pageSize, hasMore: orders.length === pageSize });
  } catch (error) {
    res.status(500).json({ message: "Laboratuvar emirleri yüklenemedi." });
  }
});

// GET /api/lab-orders/patient
router.get("/patient", authenticateJWT, requireRoles(["PATIENT"]), async (req: AuthenticatedRequest, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(String(req.query.pageSize || "25"), 10) || 25));
  try {
    const orders = await prisma.labOrder.findMany({
      where: {
        record: {
          patientId: req.user!.patientId,
        },
      },
      include: {
        record: {
          include: { doctor: { select: { fullName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    res.json({ data: orders, page, pageSize, hasMore: orders.length === pageSize });
  } catch (error) {
    res.status(500).json({ message: "Laboratuvar sonuçlarınız yüklenemedi." });
  }
});

// PUT /api/lab-orders/:id
router.put("/:id", authenticateJWT, requireRoles(["LAB_TECH", "ADMIN"]), async (req: AuthenticatedRequest, res) => {
  const { resultData, fileUrl } = req.body;

  if (!resultData) {
    return res.status(400).json({ message: "Laboratuvar sonuç verisi gereklidir." });
  }

  try {
    const updated = await prisma.labOrder.update({
      where: { id: req.params.id },
      data: {
        resultData,
        fileUrl: fileUrl || null,
        status: "COMPLETED",
        labTechId: req.user!.id,
      },
    });

    await logAudit(req.user!.id, "COMPLETE_LAB_ORDER", "LabOrder", updated.id, { resultData });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Laboratuvar sonucu kaydedilemedi." });
  }
});

export default router;
