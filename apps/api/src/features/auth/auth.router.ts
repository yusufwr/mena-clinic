import { Router } from "express";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { prisma } from "../../shared/prisma";
import { logAudit } from "../../shared/audit";
import { authenticateJWT, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error("JWT_SECRET must be configured and at least 32 characters long.");
const jwtSecret = JWT_SECRET as string;

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "E-posta ve şifre zorunludur." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { patientProfile: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({ message: "Geçersiz e-posta veya pasif kullanıcı." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Şifre hatalı." });
    }

    const payload: any = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    if (user.role === "PATIENT" && user.patientProfile) {
      payload.patientId = user.patientProfile.id;
    }

    const token = jwt.sign(payload, jwtSecret, { expiresIn: "8h", algorithm: "HS256" });

    // Log the successful auth
    await logAudit(user.id, "AUTH_LOGIN", "User", user.id, { email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        patientId: user.patientProfile?.id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Giriş yapılırken sunucu hatası oluştu." });
  }
});

// POST /api/auth/register or /api/auth/register-patient
router.post(["/register", "/register-patient"], async (req, res) => {
  const {
    email,
    password,
    fullName,
    phone,
    identityNo,
    bloodType,
    emergencyContact,
    insuranceInfo,
  } = req.body;

  if (!email || !password || !fullName || !identityNo) {
    return res.status(400).json({ message: "E-posta, şifre, ad soyad ve T.C./Pasaport numarası zorunludur." });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { identityNo }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Bu e-posta veya kimlik numarası ile kayıtlı bir kullanıcı zaten mevcut." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
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

      return { user, patient };
    });

    await logAudit(result.user.id, "AUTH_REGISTER", "Patient", result.patient.id, { email });

    const token = jwt.sign(
      {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        fullName: result.user.fullName,
        patientId: result.patient.id,
      },
      jwtSecret,
      { expiresIn: "8h", algorithm: "HS256" }
    );

    res.status(201).json({
      message: "Hasta kaydı başarıyla tamamlandı.",
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        fullName: result.user.fullName,
        patientId: result.patient.id,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Kayıt işlemi sırasında bir hata oluştu." });
  }
});

// GET /api/auth/me
router.get("/me", authenticateJWT, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

export default router;
