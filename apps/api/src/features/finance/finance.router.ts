import { Router } from "express";
import { prisma } from "../../shared/prisma";
import { authenticateJWT, requireRoles } from "../../middleware/auth";

const router = Router();

// GET /api/finance/report
router.get("/report", authenticateJWT, requireRoles(["ADMIN", "FINANCE"]), async (req, res) => {
  try {
    const sales = await prisma.pharmacySale.findMany({
      include: {
        patient: { include: { user: { select: { fullName: true } } } },
        cashier: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalDiscounts = sales.reduce((sum, s) => sum + s.discountApplied, 0);

    const inventory = await prisma.inventory.findMany();
    const lowStockItems = inventory.filter((item) => item.stockQuantity < 20);

    let estimatedCost = 0;
    for (const sale of sales) {
      if (sale.prescriptionId) {
        const presc = await prisma.prescription.findUnique({
          where: { id: sale.prescriptionId },
          include: { items: true },
        });
        if (presc) {
          for (const item of presc.items) {
            const inv = inventory.find((i) => i.itemName.includes(item.itemName));
            if (inv) {
              estimatedCost += inv.supplierPrice * item.quantity;
            }
          }
        }
      } else {
        estimatedCost += sale.totalAmount * 0.5;
      }
    }

    const estimatedProfit = totalRevenue - estimatedCost;

    res.json({
      totalRevenue,
      totalDiscounts,
      estimatedProfit,
      salesCount: sales.length,
      salesDetails: sales,
      lowStockItemsCount: lowStockItems.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Finansal rapor üretilemedi." });
  }
});

export default router;
