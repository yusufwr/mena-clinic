import { Router } from "express";
import { prisma } from "../../shared/prisma";
import { logAudit } from "../../shared/audit";
import { authenticateJWT, requireRoles, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// GET /api/medical-records/patient/:patientId
router.get("/patient/:patientId", authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const targetPatientId = req.params.patientId;
  const page = Math.max(1, Number.parseInt(String(req.query.page || "1"), 10) || 1);
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(String(req.query.pageSize || "20"), 10) || 20));

  // Patients can only fetch their own files
  if (req.user!.role === "PATIENT" && req.user!.patientId !== targetPatientId) {
    return res.status(403).json({ message: "Başka bir hastanın tıbbi kayıtlarına erişemezsiniz." });
  }

  // Receptionist/Pharmacist cannot access detailed diagnosis history/records
  if (req.user!.role === "RECEPTIONIST" || req.user!.role === "PHARMACIST") {
    return res.status(403).json({ message: "Klinik tanı ve doktor notlarına erişim yetkiniz bulunmamaktadır." });
  }

  try {
    const records = await prisma.medicalRecord.findMany({
      where: { patientId: targetPatientId },
      include: {
        doctor: { select: { fullName: true } },
        amendments: { include: { doctor: { select: { fullName: true } } } },
        labOrders: true,
        prescriptions: { include: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    res.json({ data: records, page, pageSize, hasMore: records.length === pageSize });
  } catch (error) {
    res.status(500).json({ message: "Tıbbi geçmiş yüklenemedi." });
  }
});

// POST /api/medical-records
router.post("/", authenticateJWT, requireRoles(["DOCTOR", "ADMIN"]), async (req: AuthenticatedRequest, res) => {
  const { patientId, diagnosis, clinicalNotes, prescriptionItems, labTests } = req.body;

  if (!patientId || !diagnosis || !clinicalNotes) {
    return res.status(400).json({ message: "Hasta ID, Tanı ve Klinik Notlar zorunludur." });
  }

  try {
    const record = await prisma.$transaction(async (tx) => {
      // 1. Create the Medical Record
      const medRecord = await tx.medicalRecord.create({
        data: {
          patientId,
          doctorId: req.user!.id,
          diagnosis,
          clinicalNotes,
          isFinalized: true,
        },
      });

      // 2. Create Prescription if requested
      if (prescriptionItems && prescriptionItems.length > 0) {
        const prescription = await tx.prescription.create({
          data: {
            recordId: medRecord.id,
            patientId,
            status: "PENDING",
          },
        });

        await tx.prescriptionItem.createMany({
          data: prescriptionItems.map((item: any) => ({
            prescriptionId: prescription.id,
            itemName: item.itemName,
            dosage: item.dosage,
            quantity: parseInt(item.quantity) || 1,
          })),
        });
      }

      // 3. Create Lab Orders if requested
      if (labTests && labTests.length > 0) {
        for (const testName of labTests) {
          await tx.labOrder.create({
            data: {
              recordId: medRecord.id,
              testName,
              status: "PENDING",
            },
          });
        }
      }

      return medRecord;
    });

    await logAudit(req.user!.id, "CREATE_MEDICAL_RECORD", "MedicalRecord", record.id, { patientId, diagnosis });
    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Tıbbi kayıt kaydedilemedi." });
  }
});

// POST /api/medical-records/:id/amendments
router.post("/:id/amendments", authenticateJWT, requireRoles(["DOCTOR", "ADMIN"]), async (req: AuthenticatedRequest, res) => {
  const recordId = req.params.id;
  const { notes } = req.body;

  if (!notes) {
    return res.status(400).json({ message: "Ek bilgi/düzeltme notu girilmelidir." });
  }

  try {
    const amendment = await prisma.medicalRecordAmendment.create({
      data: {
        medicalRecordId: recordId,
        doctorId: req.user!.id,
        notes,
      },
    });

    await logAudit(req.user!.id, "CREATE_AMENDMENT", "MedicalRecordAmendment", amendment.id, { recordId });
    res.status(201).json(amendment);
  } catch (error) {
    res.status(500).json({ message: "Ek kayıt eklenirken hata oluştu." });
  }
});

export default router;
