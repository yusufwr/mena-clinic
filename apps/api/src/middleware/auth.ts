import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error("JWT_SECRET must be configured and at least 32 characters long.");
const jwtSecret = JWT_SECRET as string;

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    fullName: string;
    patientId?: string; // If patient role, store patient profile ID
  };
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Oturum açılması gerekiyor. Yetki belgesi bulunamadı." });
  }

  const [scheme, token] = authHeader.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== "bearer") return res.status(401).json({ message: "Geçersiz yetkilendirme biçimi." });
  if (!token) {
    return res.status(401).json({ message: "Geçersiz yetkilendirme biçimi." });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] }) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Oturum süresi doldu veya geçersiz jeton (token)." });
  }
}

export function requireRoles(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Kimlik doğrulaması başarısız." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Bu işlem için yetkiniz bulunmamaktadır. Gerekli Rol: [${allowedRoles.join(", ")}], Mevcut Rol: [${req.user.role}]`
      });
    }

    next();
  };
}
