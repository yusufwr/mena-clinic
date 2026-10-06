import { Router } from "express";
import { prisma } from "../../shared/prisma";
import { logAudit } from "../../shared/audit";
import { authenticateJWT, requireRoles, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// GET /api/inventory
router.get("/", authenticateJWT, requireRoles(["PHARMACIST", "FINANCE", "ADMIN"]), async (req: AuthenticatedRequest, res) => {
  try {
    const items = await prisma.inventory.findMany({
      orderBy: { itemName: "asc" },
    });

    const sanitizedItems = items.map((item) => {
      const { supplierPrice, ...publicData } = item;
      if (req.user!.role === "PHARMACIST") {
        return publicData;
      }
      return item;
    });

    res.json(sanitizedItems);
  } catch (error) {
    res.status(500).json({ message: "Stok listesi alınamadı." });
  }
});

// POST /api/inventory
router.post("/", authenticateJWT, requireRoles(["ADMIN", "FINANCE", "PHARMACIST"]), async (req: AuthenticatedRequest, res) => {
  const { itemName, SKU, stockQuantity, supplierPrice, retailPrice, expiryDate } = req.body;
  if (!itemName || !SKU || stockQuantity === undefined || !retailPrice) {
    return res.status(400).json({ message: "Eksik bilgi girdiniz." });
  }

  if (req.user!.role === "PHARMACIST" && supplierPrice !== undefined) {
    return res.status(403).json({ message: "Eczacı rolü tedarikçi alış fiyatını belirleyemez." });
  }

  try {
    const newItem = await prisma.inventory.create({
      data: {
        itemName,
        SKU,
        stockQuantity: parseInt(stockQuantity),
        supplierPrice: supplierPrice ? parseFloat(supplierPrice) : 0,
        retailPrice: parseFloat(retailPrice),
        expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    await logAudit(req.user!.id, "CREATE_INVENTORY", "Inventory", newItem.id, { itemName, stockQuantity });
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Stok kartı oluşturulamadı. SKU benzersiz olmalıdır." });
  }
});

// PUT /api/inventory/:id
router.put("/:id", authenticateJWT, requireRoles(["ADMIN", "FINANCE", "PHARMACIST"]), async (req: AuthenticatedRequest, res) => {
  const { itemName, SKU, stockQuantity, supplierPrice, retailPrice, expiryDate } = req.body;

  if (req.user!.role === "PHARMACIST" && (supplierPrice !== undefined || retailPrice !== undefined)) {
    const existing = await prisma.inventory.findUnique({ where: { id: req.params.id } });
    if (existing && (existing.retailPrice !== retailPrice || supplierPrice !== undefined)) {
      return res.status(403).json({ message: "Satış ve Tedarik fiyatlarını değiştirme yetkiniz yok. Yönetici onayı gereklidir." });
    }
  }

  try {
    const updated = await prisma.inventory.update({
      where: { id: req.params.id },
      data: {
        itemName,
        SKU,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : undefined,
        supplierPrice: supplierPrice !== undefined ? parseFloat(supplierPrice) : undefined,
        retailPrice: retailPrice !== undefined ? parseFloat(retailPrice) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      },
    });

    await logAudit(req.user!.id, "UPDATE_INVENTORY", "Inventory", updated.id, { stockQuantity });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Stok güncellenemedi." });
  }
});

// POST /api/sales/direct
router.post("/direct-sale", authenticateJWT, requireRoles(["PHARMACIST", "ADMIN"]), async (req: AuthenticatedRequest, res) => {
  const { items } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Satış yapılacak ilaç eklenmelidir." });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      for (const item of items) {
        const inv = await tx.inventory.findUnique({ where: { id: item.itemId } });
        if (!inv || inv.stockQuantity < item.quantity) {
          throw new Error(`Yetersiz stok veya ilaç bulunamadı: ${inv?.itemName || item.itemId}`);
        }

        totalAmount += inv.retailPrice * item.quantity;

        await tx.inventory.update({
          where: { id: item.itemId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      const sale = await tx.pharmacySale.create({
        data: {
          totalAmount,
          cashierId: req.user!.id,
        },
      });

      return sale;
    });

    await logAudit(req.user!.id, "DIRECT_PHARMACY_SALE", "PharmacySale", result.id, { totalAmount: result.totalAmount });
    res.json({ message: "Doğrudan ilaç satışı tamamlandı.", sale: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Satış kaydedilemedi." });
  }
});

export default router;
