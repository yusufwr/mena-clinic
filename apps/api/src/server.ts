import express from "express";
import cors from "cors";
import authRouter from "./features/auth/auth.router";
import doctorsRouter from "./features/doctors/doctors.router";
import appointmentsRouter from "./features/appointments/appointments.router";
import patientsRouter from "./features/patients/patients.router";
import medicalRecordsRouter from "./features/medical-records/medical-records.router";
import prescriptionsRouter from "./features/prescriptions/prescriptions.router";
import labOrdersRouter from "./features/lab-orders/lab-orders.router";
import inventoryRouter from "./features/inventory/inventory.router";
import financeRouter from "./features/finance/finance.router";
import usersRouter from "./features/users/users.router";
import auditRouter from "./features/audit/audit.router";
import { authenticateJWT, AuthenticatedRequest } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 3001;
const BODY_LIMIT = process.env.REQUEST_BODY_LIMIT || "1mb";

app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);

// Global Middlewares
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174")
  .split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: false, limit: BODY_LIMIT }));

// Strict Vertical Slices Mount
app.use("/api/auth", authRouter);
app.use("/api/doctors", doctorsRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/medical-records", medicalRecordsRouter);
app.use("/api/prescriptions", prescriptionsRouter);
app.use("/api/lab-orders", labOrdersRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/finance", financeRouter);
app.use("/api/users", usersRouter);
app.use("/api/audit-logs", auditRouter);

// Secure File Download Endpoint
app.get("/api/files/download", authenticateJWT, (req: AuthenticatedRequest, res) => {
  if (req.query.path) return res.status(400).json({ message: "Dosya yolu kabul edilmiyor." });
  if (req.user!.role === "PATIENT" && req.user!.email !== "patient1@menaclinic.com") {
    return res.status(403).json({ message: "Bu rapora erişim yetkiniz bulunmamaktadır." });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=lab_results_mena.pdf");
  res.send(Buffer.from("%PDF-1.4 ... Simulated HIPAA Compliant Signed URL Lab Report Content for Mena Clinic Aleppo ..."));
});

// Diagnostics & Health Endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    architecture: "Strict Vertical Slice Architecture",
    service: "Mena Clinic Aleppo HIS API",
    timestamp: new Date()
  });
});

const server = app.listen(PORT, () => {
  console.log(`[Vertical Slice API] Server running on port ${PORT}`);
});

server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

const shutdown = (signal: string) => {
  console.log(`${signal} received; closing HTTP server`);
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;
