import React, { useState } from "react";
import { Printer, X, Send, CheckCircle2, FileDown } from "lucide-react";
import { DoctorModel, apiFetch, API_URL } from "../apiClient";
import { EvaluatedLabResult } from "../labCatalog";
import { tr3 } from "../i18n";

export interface LabReportOrder {
  id: string;
  patientId: string;
  doctorId: string;
  sharedDoctorIds?: string[];
  sharedDoctorNames?: string[];
  specimenCategory?: "BLOOD" | "URINE" | "MICROBIOLOGY";
  panelIds?: string[];
  testName: string;
  status: string;
  resultData?: string;
  structuredResults?: EvaluatedLabResult[];
  performedBy?: string;
  performedByRole?: string;
  completedAt?: string;
  roomNumber?: string;
  notes?: string;
  createdAt: string;
  patient?: {
    fullName?: string;
    identityNo?: string;
    phone?: string;
    bloodType?: string;
    user?: { fullName?: string; identityNo?: string; phone?: string };
  };
  doctor?: {
    fullName?: string;
    specialty?: string;
    room?: string;
  };
  record?: {
    patient?: { user?: { fullName?: string } };
    doctor?: { fullName?: string };
  };
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function groupResultsBySection(results: EvaluatedLabResult[]): { section: string; items: EvaluatedLabResult[] }[] {
  const map = new Map<string, EvaluatedLabResult[]>();
  for (const r of results) {
    const sec = r.sectionTitle || "LABORATORY ANALYSIS";
    if (!map.has(sec)) map.set(sec, []);
    map.get(sec)!.push(r);
  }
  return Array.from(map.entries()).map(([section, items]) => ({ section, items }));
}

/**
 * Opens a dedicated A4 hospital laboratory report window matching the clinical PDF layout
 * and triggers native Print / Save as PDF.
 * Strict color rule:
 * - Out-of-range (HIGH, LOW, ABNORMAL) -> RED (#DC2626, bold)
 * - Normal -> NO color (#111111 plain text, white background)
 */
export function openLabReportPrintWindow(order: LabReportOrder, lang: string = "tr") {
  const win = window.open("", "_blank", "width=920,height=1100");
  if (!win) {
    window.print();
    return;
  }

  const patientName =
    order.patient?.fullName ||
    order.patient?.user?.fullName ||
    order.record?.patient?.user?.fullName ||
    tr3(lang, "Kayıtlı Hasta", "مريض مسجل", "Registered Patient");
  const patientIdNo = order.patient?.identityNo || order.patient?.user?.identityNo || "-";
  const patientPhone = order.patient?.phone || order.patient?.user?.phone || "-";
  const bloodType = order.patient?.bloodType || "-";
  const doctorName =
    (order.sharedDoctorNames && order.sharedDoctorNames.length > 0
      ? order.sharedDoctorNames.join(" • ")
      : order.doctor?.fullName || order.record?.doctor?.fullName) ||
    tr3(lang, "Klinik Hekimi", "طبيب المركز", "Clinic Physician");
  const roomNo = order.roomNumber || order.doctor?.room || "-";
  const labTechName = order.performedBy || tr3(lang, "Laboratuvar Uzmanı", "أخصائي المختبر", "Laboratory Specialist");

  const dt = new Date(order.completedAt || order.createdAt || Date.now());
  const locCode = lang === "ar" ? "ar-SY" : lang === "en" ? "en-US" : "tr-TR";
  const dateStr = dt.toLocaleDateString(locCode, { year: "numeric", month: "2-digit", day: "2-digit" });
  const timeStr = dt.toLocaleTimeString(locCode, { hour: "2-digit", minute: "2-digit" });
  const originUrl = window.location.origin;

  const structured = Array.isArray(order.structuredResults) ? order.structuredResults : [];
  const sections = groupResultsBySection(structured);

  const thTests = tr3(lang, "Tetkik (Tests)", "التحليل (Tests)", "Tests");
  const thResults = tr3(lang, "Sonuç (Results)", "النتيجة (Results)", "Results");
  const thRef = tr3(lang, "Normal Değer (Reference Range)", "القيم الطبيعية (Reference Range)", "Reference Range");
  const thUnits = tr3(lang, "Birim (Units)", "الوحدة (Units)", "Units");

  const sectionsHtml =
    sections.length > 0
      ? sections
          .map(
            (sec) => `
        <div class="section-block">
          <div class="section-banner-wrap">
            <div class="section-banner">${escapeHtml(sec.section)}</div>
          </div>
          <table class="lab-table" dir="ltr">
            <thead>
              <tr>
                <th style="width: 36%;">${escapeHtml(thTests)}</th>
                <th style="width: 20%; text-align: center;">${escapeHtml(thResults)}</th>
                <th style="width: 28%; text-align: center;">${escapeHtml(thRef)}</th>
                <th style="width: 16%;">${escapeHtml(thUnits)}</th>
              </tr>
            </thead>
            <tbody>
              ${sec.items
                .map((item) => {
                  const isOut = item.flag === "HIGH" || item.flag === "LOW" || item.flag === "ABNORMAL";
                  const arrow = item.flag === "HIGH" ? " ↑" : item.flag === "LOW" ? " ↓" : "";
                  return `
                  <tr>
                    <td class="test-name">${escapeHtml(item.name)}</td>
                    <td class="result-cell">
                      <div class="result-box ${isOut ? "out-of-range" : "normal-val"}">
                        ${escapeHtml(item.value)}${arrow}
                      </div>
                    </td>
                    <td class="ref-cell">${escapeHtml(item.referenceText)}</td>
                    <td class="unit-cell">${escapeHtml(item.unit)}</td>
                  </tr>`;
                })
                .join("")}
            </tbody>
          </table>
        </div>`
          )
          .join("")
      : `<div class="section-block">
          <div class="section-banner-wrap"><div class="section-banner">${escapeHtml(order.testName)}</div></div>
          <pre style="font-family: monospace; font-size: 12px; white-space: pre-wrap; padding: 12px; border: 1px solid #ccc;">${escapeHtml(
            order.resultData || ""
          )}</pre>
        </div>`;

  const notesHtml = order.notes
    ? `<div class="notes-box"><strong>${escapeHtml(tr3(lang, "Laboratuvar Notu:", "ملاحظات المختبر:", "Laboratory Note:"))}</strong> ${escapeHtml(order.notes)}</div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(tr3(lang, "Laboratuvar Raporu", "تقرير التحاليل المخبرية", "Laboratory Report"))} - ${escapeHtml(patientName)}</title>
  <style>
    @page { size: A4; margin: 12mm 14mm; }
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #111111;
      background: #ffffff;
      margin: 0;
      padding: 16px;
      font-size: 12px;
    }
    .toolbar {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px dashed #ccc;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid #4A2E1B;
      background: #4A2E1B;
      color: #fff;
      font-weight: bold;
      cursor: pointer;
      font-size: 12px;
    }
    .btn-sec {
      background: #fff;
      color: #4A2E1B;
    }
    @media print {
      .toolbar { display: none !important; }
      body { padding: 0; }
    }
    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #222;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .logo-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-box img {
      width: 62px;
      height: 62px;
      object-fit: contain;
    }
    .clinic-center {
      text-align: center;
      flex: 1;
    }
    .clinic-center h1 {
      margin: 0;
      font-size: 20px;
      color: #1e293b;
      letter-spacing: 0.5px;
    }
    .clinic-center h2 {
      margin: 3px 0;
      font-size: 16px;
      color: #b91c1c;
      font-weight: 800;
    }
    .clinic-center p {
      margin: 2px 0 0;
      font-size: 11px;
      color: #333;
      font-family: monospace;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 20px;
      padding: 8px 10px;
      border: 1px solid #888;
      margin-bottom: 14px;
      font-size: 11.5px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dotted #ddd;
      padding: 2px 0;
    }
    .meta-label {
      font-weight: bold;
      color: #333;
    }
    .section-block {
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .section-banner-wrap {
      display: flex;
      justify-content: center;
      margin: 8px 0 10px;
    }
    .section-banner {
      min-width: 62%;
      text-align: center;
      padding: 4px 18px;
      border: 1.5px solid #111;
      box-shadow: 3px 3px 0 #111;
      font-weight: 800;
      font-style: italic;
      font-size: 13.5px;
      color: #cc0000;
      letter-spacing: 0.6px;
      background: #fff;
    }
    .lab-table {
      width: 100%;
      border-collapse: collapse;
    }
    .lab-table thead th {
      color: #1d4ed8;
      font-size: 11.5px;
      font-weight: 700;
      padding: 5px 6px;
      border-bottom: 1.5px solid #555;
      text-align: left;
    }
    .lab-table tbody tr {
      border-bottom: 1px dotted #777;
    }
    .lab-table td {
      padding: 5px 6px;
      vertical-align: middle;
      font-size: 11.5px;
    }
    .test-name {
      font-weight: 700;
      color: #111111;
    }
    .result-cell {
      text-align: center;
    }
    .result-box {
      display: inline-block;
      min-width: 92px;
      padding: 2px 8px;
      border-right: 2px solid #666;
      border-bottom: 2px solid #666;
      border-top: 1px solid #bbb;
      border-left: 1px solid #bbb;
      text-align: center;
      font-family: Arial, sans-serif;
      font-size: 12px;
    }
    /* STRICT RULE: Out of range = RED, Normal = NO COLOR AT ALL */
    .out-of-range {
      color: #dc2626 !important;
      font-weight: 800 !important;
      border-color: #dc2626 !important;
    }
    .normal-val {
      color: #111111 !important;
      font-weight: 500;
      background: transparent !important;
    }
    .ref-cell {
      text-align: center;
      color: #111111;
      font-size: 11px;
    }
    .unit-cell {
      color: #111111;
      font-size: 11px;
    }
    .notes-box {
      margin-top: 10px;
      padding: 8px 10px;
      border: 1px solid #aaa;
      font-size: 11px;
    }
    .footer-sign {
      margin-top: 22px;
      padding-top: 10px;
      border-top: 1.5px solid #333;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="btn" onclick="window.print()">🖨️ ${escapeHtml(tr3(lang, "PDF Olarak Kaydet / Yazdır", "حفظ كـ PDF / طباعة", "Save as PDF / Print"))}</button>
    <button class="btn btn-sec" onclick="window.close()">${escapeHtml(tr3(lang, "Kapat", "إغلاق", "Close"))}</button>
  </div>

  <div class="header-top">
    <div class="logo-box">
      <img src="${originUrl}/logo.png" alt="Mena Clinic" onerror="this.style.display='none'" />
      <div>
        <div style="font-weight:800;font-size:14px;">MENA CLINIC</div>
        <div style="font-size:10px;color:#444;">LABORATORY REPORT</div>
      </div>
    </div>
    <div class="clinic-center">
      <h1>${escapeHtml(tr3(lang, "MENA CLINIC • HALEP", "مجمع مينا الطبي • حلب", "MENA CLINIC • ALEPPO"))}</h1>
      <h2>${escapeHtml(tr3(lang, "LABORATUVAR BÖLÜMÜ", "قسم المخبر والتحاليل الطبية", "LABORATORY DEPARTMENT"))}</h2>
      <p>${escapeHtml(tr3(lang, "Tel & Acil:", "الهاتف والطوارئ:", "Phone & Emergency:"))} 0989111242 – 0989111245</p>
    </div>
    <div style="text-align:right;font-size:11px;font-family:monospace;">
      <div><strong>${escapeHtml(tr3(lang, "Rapor No:", "رقم التقرير:", "Report ID:"))}</strong> ${escapeHtml(order.id)}</div>
      <div><strong>${escapeHtml(tr3(lang, "Tarih:", "التاريخ:", "Date:"))}</strong> ${escapeHtml(dateStr)}</div>
      <div><strong>${escapeHtml(tr3(lang, "Saat:", "الوقت:", "Time:"))}</strong> ${escapeHtml(timeStr)}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-row">
      <span class="meta-label">${escapeHtml(tr3(lang, "Hasta Adı:", "اسم المريض:", "Patient Name:"))}</span>
      <span><strong>${escapeHtml(patientName)}</strong></span>
    </div>
    <div class="meta-row">
      <span class="meta-label">${escapeHtml(tr3(lang, "Tarih & Saat:", "التاريخ والوقت:", "Date & Time:"))}</span>
      <span>${escapeHtml(dateStr)} — ${escapeHtml(timeStr)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">${escapeHtml(tr3(lang, "Kimlik No / Telefon:", "الرقم الوطني / الهاتف:", "ID No / Phone:"))}</span>
      <span>${escapeHtml(patientIdNo)} • ${escapeHtml(patientPhone)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">${escapeHtml(tr3(lang, "Kan Grubu / Oda No:", "فصيلة الدم / رقم الغرفة:", "Blood Type / Room:"))}</span>
      <span>${escapeHtml(bloodType)} / ${escapeHtml(roomNo)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">${escapeHtml(tr3(lang, "İlgili Doktor(lar):", "الطبيب المعالج:", "Referring Doctor(s):"))}</span>
      <span>${escapeHtml(doctorName)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">${escapeHtml(tr3(lang, "Tahlili Yapan Laboratuvarcı:", "فني المختبر المسؤول:", "Performed By Lab Tech:"))}</span>
      <span><strong>${escapeHtml(labTechName)}</strong></span>
    </div>
  </div>

  ${sectionsHtml}
  ${notesHtml}

  <div class="footer-sign">
    <div>${escapeHtml(tr3(lang, "Acil Şifalar Dileriz", "مع أطيب التمنيات بدوام الصحة والعافية", "Wishing You a Speedy Recovery"))}</div>
    <div style="text-align:center;">
      <div><strong>${escapeHtml(tr3(lang, "Laboratuvar Uzmanı Onayı", "اعتماد أخصائي المختبر", "Laboratory Specialist Signature"))}</strong></div>
      <div style="margin-top:4px;">${escapeHtml(labTechName)}</div>
    </div>
  </div>

  <script>
    window.addEventListener("load", function() {
      setTimeout(function() { window.print(); }, 250);
    });
  </script>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}

interface LabReportModalProps {
  order: LabReportOrder | null;
  onClose: () => void;
  allDoctors?: DoctorModel[];
  canSendToDoctors?: boolean;
  onUpdated?: () => void;
  lang?: string;
}

export const LabReportModal: React.FC<LabReportModalProps> = ({
  order,
  onClose,
  allDoctors = [],
  canSendToDoctors = false,
  onUpdated,
  lang = "tr",
}) => {
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(
    order?.sharedDoctorIds || (order?.doctorId ? [order.doctorId] : [])
  );
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");

  if (!order) return null;

  const patientName =
    order.patient?.fullName ||
    order.patient?.user?.fullName ||
    order.record?.patient?.user?.fullName ||
    tr3(lang, "Kayıtlı Hasta", "مريض مسجل", "Registered Patient");
  const dt = new Date(order.completedAt || order.createdAt || Date.now());
  const dateTimeStr = dt.toLocaleString(lang === "ar" ? "ar-SY" : lang === "en" ? "en-US" : "tr-TR", { dateStyle: "short", timeStyle: "short" });
  const structured = Array.isArray(order.structuredResults) ? order.structuredResults : [];
  const sections = groupResultsBySection(structured);

  const toggleDoc = (id: string) => {
    setSelectedDocIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleForwardToDoctors = async () => {
    if (selectedDocIds.length === 0) return;
    setSending(true);
    setSentMsg("");
    try {
      const res = await apiFetch(`${API_URL}/lab-orders/${encodeURIComponent(order.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sharedDoctorIds: selectedDocIds }),
      });
      if (res.ok) {
        setSentMsg(tr3(lang, "Tahlil raporu seçilen doktorların ekranına başarıyla iletildi!", "تم إرسال تقرير التحليل إلى شاشات الأطباء المحددين بنجاح!", "Lab report forwarded to the selected doctors' workspaces!"));
        onUpdated?.();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-[#D5C7B5] rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Action Bar */}
        <div className="px-5 py-3.5 bg-[#FAF7F2] border-b border-[#E5DCD0] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A5F35] block">
              {tr3(lang, "Resmi Laboratuvar Sonuç Şablonu", "نموذج نتائج التحاليل المخبرية الرسمي", "Official Laboratory Result Template")}
            </span>
            <h3 className="text-base font-serif font-bold text-[#2C1810]">
              {patientName} — {order.testName}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openLabReportPrintWindow(order, lang)}
              className="px-4 py-2 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <FileDown size={14} className="text-[#D4AF37]" />
              <span>{tr3(lang, "PDF Olarak Çıkart / Yazdır", "تصدير كـ PDF / طباعة", "Export as PDF / Print")}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-[#E5DCD0] text-[#6E492D] hover:bg-[#EFE8DC]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Report Sheet Preview */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 bg-white text-[#111111]">
          {/* Hospital Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-neutral-800 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Mena Clinic" className="w-14 h-14 object-contain" />
              <div>
                <div className="text-lg font-extrabold tracking-tight text-neutral-900">
                  {tr3(lang, "MENA CLINIC • HALEP", "مجمع مينا الطبي • حلب", "MENA CLINIC • ALEPPO")}
                </div>
                <div className="text-sm font-extrabold text-red-700">
                  {tr3(lang, "LABORATUVAR BÖLÜMÜ", "قسم المخبر والتحاليل الطبية", "LABORATORY DEPARTMENT")}
                </div>
                <div className="text-[11px] font-mono text-neutral-700">
                  {tr3(lang, "Tel & Acil:", "الهاتف والطوارئ:", "Phone & Emergency:")} 0989111242 – 0989111245
                </div>
              </div>
            </div>

            <div className="text-xs font-mono space-y-0.5 sm:text-right rtl:sm:text-left bg-neutral-50 p-3 rounded-xl border border-neutral-300">
              <div>
                <strong>{tr3(lang, "Rapor No:", "رقم التقرير:", "Report ID:")}</strong> {order.id}
              </div>
              <div>
                <strong>{tr3(lang, "Tarih & Saat:", "التاريخ والوقت:", "Date & Time:")}</strong> {dateTimeStr}
              </div>
              <div>
                <strong>{tr3(lang, "Yapan Laboratuvarcı:", "فني المختبر المسؤول:", "Performed By Lab Tech:")}</strong> {order.performedBy || tr3(lang, "Laboratuvar Uzmanı", "أخصائي المختبر", "Lab Specialist")}
              </div>
            </div>
          </div>

          {/* Patient & Doctor Metadata Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3.5 border border-neutral-400 rounded-xl text-xs">
            <div className="flex justify-between border-b border-dotted border-neutral-300 py-1">
              <span className="font-bold text-neutral-700">{tr3(lang, "Hasta Adı:", "اسم المريض:", "Patient Name:")}</span>
              <strong className="text-neutral-950">{patientName}</strong>
            </div>
            <div className="flex justify-between border-b border-dotted border-neutral-300 py-1">
              <span className="font-bold text-neutral-700">{tr3(lang, "Kimlik / Telefon:", "الرقم الوطني / الهاتف:", "ID No / Phone:")}</span>
              <span className="font-mono">
                {order.patient?.identityNo || "-"} • {order.patient?.phone || "-"}
              </span>
            </div>
            <div className="flex justify-between border-b border-dotted border-neutral-300 py-1">
              <span className="font-bold text-neutral-700">{tr3(lang, "Kan Grubu / Oda No:", "فصيلة الدم / رقم الغرفة:", "Blood Type / Room:")}</span>
              <span>
                {order.patient?.bloodType || "-"} / {order.roomNumber || order.doctor?.room || "-"}
              </span>
            </div>
            <div className="flex justify-between border-b border-dotted border-neutral-300 py-1">
              <span className="font-bold text-neutral-700">{tr3(lang, "İlgili Doktor(lar):", "الطبيب المعالج:", "Referring Doctor(s):")}</span>
              <span>
                {order.sharedDoctorNames && order.sharedDoctorNames.length > 0
                  ? order.sharedDoctorNames.join(", ")
                  : order.doctor?.fullName || "-"}
              </span>
            </div>
          </div>

          {/* Sections & Results (Strict Rule: Out-of-range = RED, Normal = Plain Black/No Color) */}
          {sections.length > 0 ? (
            sections.map((sec) => (
              <div key={sec.section} className="space-y-3">
                <div className="flex justify-center">
                  <div className="px-8 py-1.5 border-2 border-neutral-900 shadow-[3px_3px_0_#111] font-extrabold italic text-sm text-red-700 tracking-wide bg-white">
                    {sec.section}
                  </div>
                </div>

                <div className="overflow-x-auto" dir="ltr">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-neutral-600 text-blue-800 font-bold">
                        <th className="py-2 px-3 text-left">{tr3(lang, "Tetkik (Tests)", "التحليل (Tests)", "Tests")}</th>
                        <th className="py-2 px-3 text-center">{tr3(lang, "Sonuç (Results)", "النتيجة (Results)", "Results")}</th>
                        <th className="py-2 px-3 text-center">{tr3(lang, "Normal Değer (Reference Range)", "القيم الطبيعية (Reference Range)", "Reference Range")}</th>
                        <th className="py-2 px-3 text-left">{tr3(lang, "Birim (Units)", "الوحدة (Units)", "Units")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sec.items.map((item) => {
                        const isOut =
                          item.flag === "HIGH" || item.flag === "LOW" || item.flag === "ABNORMAL";
                        const arrow = item.flag === "HIGH" ? " ↑" : item.flag === "LOW" ? " ↓" : "";
                        return (
                          <tr key={`${sec.section}-${item.code}`} className="border-b border-dotted border-neutral-400">
                            <td className="py-2 px-3 font-bold text-neutral-900">{item.name}</td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`inline-block min-w-[96px] px-3 py-1 border border-neutral-400 border-r-2 border-b-2 font-mono text-xs ${
                                  isOut
                                    ? "text-red-600 font-extrabold border-red-600"
                                    : "text-neutral-900 font-medium bg-transparent"
                                }`}
                              >
                                {item.value}
                                {arrow}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center text-neutral-900 font-mono">
                              {item.referenceText}
                            </td>
                            <td className="py-2 px-3 text-neutral-900 font-mono">{item.unit}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <pre className="p-4 rounded-xl border border-neutral-300 font-mono text-xs whitespace-pre-wrap text-neutral-900">
              {order.resultData || tr3(lang, "Sonuç verisi bulunamadı.", "لا توجد بيانات نتائج.", "No result data found.")}
            </pre>
          )}

          {order.notes && (
            <div className="p-3 border border-neutral-300 rounded-xl text-xs text-neutral-900">
              <strong>{tr3(lang, "Laboratuvar Açıklaması:", "ملاحظات المختبر:", "Laboratory Note:")}</strong> {order.notes}
            </div>
          )}

          {/* Optional: Send / Share Report to Other Doctors */}
          {canSendToDoctors && allDoctors.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-3 print:hidden">
              <div className="text-xs font-bold text-[#4A2E1B] flex items-center gap-1.5">
                <Send size={13} className="text-[#B8860B]" />
                <span>{tr3(lang, "Bu Tahlil Sonucunu Diğer Doktorlara Gönder / Paylaş:", "إرسال / مشاركة نتيجة التحليل مع الأطباء الآخرين:", "Forward / Share This Lab Report with Other Doctors:")}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allDoctors.map((doc) => {
                  const checked = selectedDocIds.includes(doc.id);
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => toggleDoc(doc.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                        checked
                          ? "bg-[#4A2E1B] text-white border-[#4A2E1B]"
                          : "bg-white text-[#4A2E1B] border-[#DDD2C1] hover:bg-[#EFE8DC]"
                      }`}
                    >
                      {checked ? "✓ " : "+ "}
                      {doc.fullName}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-2">
                {sentMsg ? (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} /> {sentMsg}
                  </span>
                ) : (
                  <span className="text-[11px] text-[#7D6E63]">
                    {tr3(lang, "Seçilen doktorlar kendi ekranlarından bu tahlili görüp PDF çıkartabilir.", "يمكن للأطباء المحددين عرض هذا التقرير وطباعته كـ PDF من شاشاتهم.", "Selected doctors can view and export this report as PDF from their workspace.")}
                  </span>
                )}
                <button
                  type="button"
                  disabled={sending || selectedDocIds.length === 0}
                  onClick={handleForwardToDoctors}
                  className="px-4 py-2 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Send size={12} />
                  <span>{sending ? tr3(lang, "Gönderiliyor...", "جاري الإرسال...", "Sending...") : tr3(lang, "Seçili Doktorlara Gönder", "إرسال للأطباء المحددين", "Send to Selected Doctors")}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Print Button */}
        <div className="px-5 py-3 bg-[#FAF7F2] border-t border-[#E5DCD0] flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => openLabReportPrintWindow(order, lang)}
            className="px-4 py-2 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Printer size={14} className="text-[#D4AF37]" />
            <span>{tr3(lang, "PDF Çıkart / Yazdır", "تصدير كـ PDF / طباعة", "Export PDF / Print")}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-[#E5DCD0] text-xs font-bold text-[#4A2E1B]"
          >
            {tr3(lang, "Kapat", "إغلاق", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
};
