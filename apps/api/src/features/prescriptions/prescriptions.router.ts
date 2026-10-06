import { Router } from "express";
import { prisma } from "../../shared/prisma";
import { logAudit } from "../../shared/audit";
import { authenticateJWT, requireRoles, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// GET /api/prescriptions
router.get("/", authenticateJWT, requireRoles(["PHARMACIST", "DOCTOR", "ADMIN"]), async (req, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(String(req.query.pageSize || "25"), 10) || 25));
  try {
    const prescriptions = await prisma.prescription.findMany({
      include: {
        patient: { include: { user: { select: { fullName: true, phone: true } } } },
        record: { include: { doctor: { select: { fullName: true } } } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    res.json({ data: prescriptions, page, pageSize, hasMore: prescriptions.length === pageSize });
  } catch (error) {
    res.status(500).json({ message: "Reçeteler yüklenemedi." });
  }
});

// GET /api/prescriptions/patient
router.get("/patient", authenticateJWT, requireRoles(["PATIENT"]), async (req: AuthenticatedRequest, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(String(req.query.pageSize || "25"), 10) || 25));
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: req.user!.patientId },
      include: {
        record: { include: { doctor: { select: { fullName: true } } } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    res.json({ data: prescriptions, page, pageSize, hasMore: prescriptions.length === pageSize });
  } catch (error) {
    res.status(500).json({ message: "Reçeteleriniz yüklenemedi." });
  }
});

// PUT /api/prescriptions/:id/dispense
router.put("/:id/dispense", authenticateJWT, requireRoles(["PHARMACIST", "ADMIN"]), async (req: AuthenticatedRequest, res) => {
  const prescriptionId = req.params.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const presc = await tx.prescription.findUnique({
        where: { id: prescriptionId },
        include: { items: true, patient: true },
      });

      if (!presc) {
        throw new Error("Reçete bulunamadı.");
      }
      if (presc.status === "DISPENSED") {
        throw new Error("Bu reçete zaten teslim edilmiş.");
      }

      let totalRetail = 0;
      let itemsToUpdate: { inventoryId: string; quantity: number }[] = [];

      for (const item of presc.items) {
        const invItem = await tx.inventory.findFirst({
          where: { itemName: { contains: item.itemName } },
        });

        if (!invItem) {
          throw new Error(`Stokta '${item.itemName}' ilacı bulunamadı.`);
        }
        if (invItem.stockQuantity < item.quantity) {
          throw new Error(`Yetersiz stok! '${item.itemName}' için kalan stok: ${invItem.stockQuantity}, istenen: ${item.quantity}`);
        }

        totalRetail += invItem.retailPrice * item.quantity;
        itemsToUpdate.push({ inventoryId: invItem.id, quantity: item.quantity });
      }

      const discountApplied = totalRetail * 0.1;
      const totalAmount = totalRetail - discountApplied;

      for (const update of itemsToUpdate) {
        await tx.inventory.update({
          where: { id: update.inventoryId },
          data: { stockQuantity: { decrement: update.quantity } },
        });
      }

      await tx.prescription.update({
        where: { id: prescriptionId },
        data: { status: "DISPENSED" },
      });

      const sale = await tx.pharmacySale.create({
        data: {
          prescriptionId: presc.id,
          patientId: presc.patientId,
          totalAmount,
          discountApplied,
          cashierId: req.user!.id,
        },
      });

      return sale;
    });

    await logAudit(req.user!.id, "DISPENSE_PRESCRIPTION", "Prescription", prescriptionId, { totalAmount: result.totalAmount });
    res.json({ message: "İlaçlar başarıyla teslim edildi ve satış kaydedildi.", sale: result });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message || "İlaç teslim işleminde hata oluştu." });
  }
});

export default router;
