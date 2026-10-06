import { Router } from "express";
import { prisma } from "../../shared/prisma";
import { authenticateJWT, requireRoles } from "../../middleware/auth";

const router = Router();

// GET /api/audit-logs
router.get("/", authenticateJWT, requireRoles(["ADMIN", "FINANCE"]), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      include: { user: { select: { fullName: true, email: true, role: true } } },
      take: 200,
    });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Denetim günlükleri yüklenemedi." });
  }
});

export default router;
