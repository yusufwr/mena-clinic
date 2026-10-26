import { getDb, withDb, HttpError, newId, jsonResponse, parseToken, ClinicDb, InventoryRecord } from "@/lib/clinicDb";

export function logOperation(db: ClinicDb, request: Request, action: string, details: string) {
  const session = parseToken(request);
  const staff = db.staff.find(s => s.id === session?.id);
  (db.auditLogs ||= []).push({ id: newId("audit"), action, details, createdAt: new Date().toISOString(), user: { fullName: staff?.fullName || "Sistem" } });
}

export async function inventoryOperation(request: Request, id?: string) {
  if (request.method === "GET") return jsonResponse(getDb().inventory || []);
  const body = await request.json();
  return jsonResponse(await withDb(db => {
    const inventory = db.inventory ||= [];
    const existing = id ? inventory.find(i => i.id === id) : undefined;
    if (id && !existing) throw new HttpError(404, "Stok kaydı bulunamadı");
    const record: InventoryRecord = {
      id: existing?.id || newId("inv"), itemName: String(body.itemName ?? existing?.itemName ?? "").trim(),
      SKU: String(body.SKU ?? existing?.SKU ?? "").trim(),
      stockQuantity: Number(body.stockQuantity ?? existing?.stockQuantity),
      supplierPrice: Number(body.supplierPrice ?? existing?.supplierPrice),
      retailPrice: Number(body.retailPrice ?? existing?.retailPrice),
      expiryDate: String(body.expiryDate ?? existing?.expiryDate ?? ""),
    };
    if (!record.itemName || !record.SKU || !Number.isInteger(record.stockQuantity) || record.stockQuantity < 0 || !Number.isFinite(record.supplierPrice) || record.supplierPrice < 0 || !Number.isFinite(record.retailPrice) || record.retailPrice < 0 || !Number.isFinite(Date.parse(record.expiryDate))) throw new HttpError(400, "Geçersiz stok bilgileri");
    if (inventory.some(i => i.id !== record.id && i.SKU === record.SKU)) throw new HttpError(409, "Stok kodu zaten kullanılıyor");
    if (existing) Object.assign(existing, record); else inventory.push(record);
    logOperation(db, request, existing ? "INVENTORY_UPDATED" : "INVENTORY_CREATED", record.id);
    return record;
  }), request.method === "POST" ? 201 : 200);
}

export async function dispense(request: Request, id: string) {
  return jsonResponse(await withDb(db => {
    const prescription = db.prescriptions?.find(p => p.id === id);
    if (!prescription) throw new HttpError(404, "Reçete bulunamadı");
    if (prescription.status === "DISPENSED") throw new HttpError(409, "Reçete zaten teslim edildi");
    const required = new Map<string, number>();
    for (const item of prescription.items) {
      const stock = db.inventory?.find(i => item.inventoryItemId ? i.id === item.inventoryItemId : i.itemName === item.itemName);
      if (!stock || !Number.isInteger(item.quantity) || item.quantity <= 0) throw new HttpError(409, "Reçete için stok eşleşmesi gerekli");
      required.set(stock.id, (required.get(stock.id) || 0) + item.quantity);
    }
    for (const [stockId, quantity] of Array.from(required)) {
      const stock = db.inventory!.find(i => i.id === stockId)!;
      if (stock.stockQuantity < quantity || new Date(stock.expiryDate).getTime() < Date.now()) throw new HttpError(409, "Stok yetersiz veya son kullanma tarihi geçmiş");
    }
    prescription.salesTotal = 0;
    prescription.costTotal = 0;
    for (const [stockId, quantity] of Array.from(required)) {
      const stock = db.inventory!.find(i => i.id === stockId)!;
      stock.stockQuantity -= quantity;
      prescription.salesTotal += stock.retailPrice * quantity;
      prescription.costTotal += stock.supplierPrice * quantity;
    }
    prescription.dispensedAt = new Date().toISOString();
    prescription.status = "DISPENSED";
    logOperation(db, request, "PRESCRIPTION_DISPENSED", id);
    return { success: true, prescription };
  }));
}
