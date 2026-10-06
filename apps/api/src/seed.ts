import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data (in reverse dependency order)
  await prisma.auditLog.deleteMany({});
  await prisma.doctorSchedule.deleteMany({});
  await prisma.pharmacySale.deleteMany({});
  await prisma.prescriptionItem.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.labOrder.deleteMany({});
  await prisma.medicalRecordAmendment.deleteMany({});
  await prisma.medicalRecord.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.user.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash("Password123", salt);

  // 1. Create Users for all roles
  const admin = await prisma.user.create({
    data: {
      email: "admin@menaclinic.com",
      passwordHash: commonPasswordHash,
      fullName: "Yönetici Ahmet",
      phone: "+905551112233",
      identityNo: "99999999990",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const receptionist = await prisma.user.create({
    data: {
      email: "receptionist@menaclinic.com",
      passwordHash: commonPasswordHash,
      fullName: "Danışma Merve",
      phone: "+905551112234",
      identityNo: "99999999991",
      role: "RECEPTIONIST",
      status: "ACTIVE",
    },
  });

  const docCardio = await prisma.user.create({
    data: {
      email: "cardio@menaclinic.com",
      passwordHash: commonPasswordHash,
      fullName: "Dr. Selim Yılmaz (Cardiology)",
      phone: "+905551112235",
      identityNo: "99999999992",
      role: "DOCTOR",
      status: "ACTIVE",
    },
  });

  const docDerma = await prisma.user.create({
    data: {
      email: "derma@menaclinic.com",
      passwordHash: commonPasswordHash,
      fullName: "Dr. Leyla Demir (Dermatology)",
      phone: "+905551112236",
      identityNo: "99999999993",
      role: "DOCTOR",
      status: "ACTIVE",
    },
  });

  const pharmacist = await prisma.user.create({
    data: {
      email: "pharmacist@menaclinic.com",
      passwordHash: commonPasswordHash,
      fullName: "Eczacı Mustafa",
      phone: "+905551112237",
      identityNo: "99999999994",
      role: "PHARMACIST",
      status: "ACTIVE",
    },
  });

  const labTech = await prisma.user.create({
    data: {
      email: "labtech@menaclinic.com",
      passwordHash: commonPasswordHash,
      fullName: "Teknisyen Ali",
      phone: "+905551112238",
      identityNo: "99999999995",
      role: "LAB_TECH",
      status: "ACTIVE",
    },
  });

  const patient1User = await prisma.user.create({
    data: {
      email: "patient1@menaclinic.com",
      passwordHash: commonPasswordHash,
      fullName: "Zeynep Kaya",
      phone: "+905551112239",
      identityNo: "99999999996",
      role: "PATIENT",
      status: "ACTIVE",
    },
  });

  const patient2User = await prisma.user.create({
    data: {
      email: "patient2@menaclinic.com",
      passwordHash: commonPasswordHash,
      fullName: "Ömer Çelik",
      phone: "+905551112240",
      identityNo: "99999999997",
      role: "PATIENT",
      status: "ACTIVE",
    },
  });

  // 2. Create Patient Profiles
  const patient1 = await prisma.patient.create({
    data: {
      userId: patient1User.id,
      bloodType: "A+",
      emergencyContact: "Eşi Hakan Kaya (+905552223344)",
      insuranceInfo: "SGK - Emekli",
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      userId: patient2User.id,
      bloodType: "0-",
      emergencyContact: "Babası Ali Çelik (+905552223345)",
      insuranceInfo: "Özel Allianz Sigorta",
    },
  });

  // 3. Create Doctor Schedules (Mon-Fri, 9:00-17:00, lunch break 12:00-13:00)
  const doctors = [docCardio, docDerma];
  for (const doc of doctors) {
    for (let day = 1; day <= 5; day++) {
      await prisma.doctorSchedule.create({
        data: {
          doctorId: doc.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          breakStart: "12:00",
          breakEnd: "13:00",
        },
      });
    }
  }

  // 4. Create Inventory Items
  const inv1 = await prisma.inventory.create({
    data: {
      itemName: "Amoxicillin 500mg (Antibiyotik)",
      SKU: "AMX500",
      stockQuantity: 150,
      supplierPrice: 45.0,
      retailPrice: 90.0,
      expiryDate: new Date("2028-12-31"),
    },
  });

  const inv2 = await prisma.inventory.create({
    data: {
      itemName: "Paracetamol 500mg (Parol)",
      SKU: "PAR500",
      stockQuantity: 500,
      supplierPrice: 10.0,
      retailPrice: 25.0,
      expiryDate: new Date("2029-06-30"),
    },
  });

  const inv3 = await prisma.inventory.create({
    data: {
      itemName: "Lipitor 10mg (Kolesterol)",
      SKU: "LIP10",
      stockQuantity: 80,
      supplierPrice: 120.0,
      retailPrice: 210.0,
      expiryDate: new Date("2027-10-15"),
    },
  });

  const inv4 = await prisma.inventory.create({
    data: {
      itemName: "Ibuprofen 400mg (Arveles)",
      SKU: "IBU400",
      stockQuantity: 200,
      supplierPrice: 15.0,
      retailPrice: 35.0,
      expiryDate: new Date("2028-05-20"),
    },
  });

  // 5. Create Appointments for Today
  const today = new Date();
  today.setHours(10, 0, 0, 0); // 10:00 AM

  const app1 = await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      doctorId: docCardio.id,
      slotTime: new Date(today),
      status: "CONFIRMED",
      queueNumber: 1,
      createdBy: receptionist.id,
    },
  });

  today.setHours(11, 0, 0, 0); // 11:00 AM
  const app2 = await prisma.appointment.create({
    data: {
      patientId: patient2.id,
      doctorId: docDerma.id,
      slotTime: new Date(today),
      status: "PENDING",
      queueNumber: 2,
      createdBy: receptionist.id,
    },
  });

  // 6. Create a past Medical Record & Lab Order & Prescription for Patient 1
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 10); // 10 days ago

  const record1 = await prisma.medicalRecord.create({
    data: {
      patientId: patient1.id,
      doctorId: docCardio.id,
      diagnosis: "I10 - Essential (primary) hypertension (Primer Hipertansiyon)",
      clinicalNotes: "SOAP NOTE:\nS: Hasta baş ağrısı ve hafif baş dönmesi şikayeti ile başvurdu.\nO: Tansiyon 145/95 mmHg ölçüldü. Nabız 78/dk.\nA: Evre 1 Hipertansiyon.\nP: Düşük sodyumlu diyet, günlük tansiyon takibi. Kolesterol ve EKG tetkikleri istendi.",
      isFinalized: true,
      createdAt: pastDate,
    },
  });

  // Lab Order
  const labOrder = await prisma.labOrder.create({
    data: {
      recordId: record1.id,
      testName: "Lipid Paneli & Kolesterol",
      status: "COMPLETED",
      resultData: "Total Kolesterol: 240 mg/dL (Yüksek), LDL: 160 mg/dL (Yüksek), HDL: 45 mg/dL, Trigliserid: 175 mg/dL",
      fileUrl: "/uploads/kolesterol_raporu_zeynep.pdf",
      labTechId: labTech.id,
      createdAt: pastDate,
    },
  });

  // Prescription
  const prescription = await prisma.prescription.create({
    data: {
      recordId: record1.id,
      patientId: patient1.id,
      status: "DISPENSED",
      createdAt: pastDate,
    },
  });

  await prisma.prescriptionItem.create({
    data: {
      prescriptionId: prescription.id,
      itemName: "Paracetamol 500mg (Parol)",
      dosage: "Günde 2 kez 1 tablet (Tok karna)",
      quantity: 1,
    },
  });

  // Sale
  await prisma.pharmacySale.create({
    data: {
      prescriptionId: prescription.id,
      patientId: patient1.id,
      totalAmount: 22.5, // 25.0 retail - 10% discount (2.5) = 22.5
      discountApplied: 2.5,
      cashierId: pharmacist.id,
      createdAt: pastDate,
    },
  });

  // Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SEED",
      resource: "SYSTEM",
      targetId: "SYSTEM",
      payload: "Initial database seed completed.",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
