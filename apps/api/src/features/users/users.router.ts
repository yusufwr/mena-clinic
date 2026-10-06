import { Router } from "express";
import * as bcrypt from "bcryptjs";
import { prisma } from "../../shared/prisma";
import { logAudit } from "../../shared/audit";
import { authenticateJWT, requireRoles, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// GET /api/users
router.get("/", authenticateJWT, requireRoles(["ADMIN", "FINANCE"]), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        identityNo: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { fullName: "asc" },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Kullanıcılar yüklenemedi." });
  }
});

// POST /api/users
router.post("/", authenticateJWT, requireRoles(["ADMIN"]), async (req: AuthenticatedRequest, res) => {
  const { email, password, fullName, phone, identityNo, role } = req.body;
  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ message: "Zorunlu alanları doldurun." });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone: phone || "",
        identityNo: identityNo || Math.floor(Math.random() * 10000000000).toString(),
        role,
        status: "ACTIVE",
      },
    });

    await logAudit(req.user!.id, "CREATE_USER", "User", newUser.id, { email, role });
    res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu.", id: newUser.id });
  } catch (error) {
    res.status(500).json({ message: "Kullanıcı oluşturulurken hata oluştu." });
  }
});

// PUT /api/users/:id
router.put("/:id", authenticateJWT, requireRoles(["ADMIN"]), async (req: AuthenticatedRequest, res) => {
  const { fullName, phone, identityNo, role, status } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { fullName, phone, identityNo, role, status },
    });
    await logAudit(req.user!.id, "UPDATE_USER", "User", updated.id, { role, status });
    res.json({ message: "Kullanıcı güncellendi." });
  } catch (error) {
    res.status(500).json({ message: "Kullanıcı güncellenirken hata oluştu." });
  }
});

export default router;
