import { Router } from "express";
import * as bcrypt from "bcryptjs";
import { prisma } from "../../shared/prisma";
import { logAudit } from "../../shared/audit";
import { authenticateJWT, requireRoles, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// GET /api/patients
router.get("/", authenticateJWT, requireRoles(["RECEPTIONIST", "DOCTOR", "FINANCE", "ADMIN"]), async (req, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(String(req.query.pageSize || "25"), 10) || 25));
  const search = String(req.query.search || "").trim();
  try {
    const patients = await prisma.patient.findMany({
      where: search ? {
        user: {
          OR: [
            { fullName: { contains: search } },
            { identityNo: { contains: search } },
            { phone: { contains: search } },
          ],
        },
      } : undefined,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            identityNo: true,
          },
        },
        appointments: {
          take: 5,
          orderBy: { slotTime: "desc" },
          include: { doctor: { select: { fullName: true } } }
        },
        medicalRecords: {
          take: 3,
          orderBy: { createdAt: "desc" },
          select: { id: true, diagnosis: true, createdAt: true }
        }
      },
      orderBy: {
        user: {
          fullName: "asc",
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    res.json({ data: patients, page, pageSize, hasMore: patients.length === pageSize });
  } catch (error) {
    res.status(500).json({ message: "Hastalar yüklenemedi." });
  }
});

// POST /api/patients
router.post("/", authenticateJWT, requireRoles(["RECEPTIONIST", "ADMIN", "DOCTOR"]), async (req: AuthenticatedRequest, res) => {
  const { fullName, phone, identityNo, email, bloodType, emergencyContact, insuranceInfo } = req.body;

  if (!fullName || !identityNo) {
    return res.status(400).json({ message: "Hasta Adı ve Kimlik Numarası zorunludur." });
  }

  try {
    const generatedEmail = email || `patient_${identityNo}@menaclinic.com`;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("Password123", salt);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: generatedEmail,
          passwordHash,
          fullName,
          phone: phone || "",
          identityNo,
          role: "PATIENT",
          status: "ACTIVE",
        },
      });

      const patient = await tx.patient.create({
        data: {
          userId: user.id,
          bloodType: bloodType || null,
          emergencyContact: emergencyContact || null,
          insuranceInfo: insuranceInfo || null,
        },
      });

      return patient;
    });

    await logAudit(req.user!.id, "CREATE_PATIENT", "Patient", result.id, { fullName });
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Hasta kaydı oluşturulurken hata oluştu." });
  }
});

export default router;
