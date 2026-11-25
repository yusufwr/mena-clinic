import React, { useState, useRef } from "react";
import { ShieldCheck, Download, Upload, AlertTriangle, CheckCircle2, FileJson, Info } from "lucide-react";
import { AdminLang, tr3 } from "../i18n";
import { apiFetch } from "../apiClient";

interface SystemBackupRestoreProps {
  token: string | null;
  apiUrl: string;
  lang: AdminLang;
  onRefreshAll?: () => void;
}

export const SystemBackupRestore: React.FC<SystemBackupRestoreProps> = ({
  token,
  apiUrl,
  lang,
  onRefreshAll,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastExportTime, setLastExportTime] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const [pendingFileContent, setPendingFileContent] = useState<any | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = async () => {
    setIsExporting(true);
    setStatusMessage(null);
    try {
      const res = await apiFetch(`${apiUrl}/backup/export`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || tr3(lang, "Yedek oluşturulamadı", "تعذر إنشاء النسخة الاحتياطية", "Failed to generate backup"));
      }

      const backupData = await res.json();
      const dateStr = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const fileName = `mena-clinic-backup-${dateStr}.json`;

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const timeNow = new Date().toLocaleTimeString();
      setLastExportTime(timeNow);
      setStatusMessage({
        type: "success",
        text: tr3(
          lang,
          `Gün sonu sistem yedeği başarıyla indirildi (${backupData.stats?.patientsCount || 0} hasta, ${backupData.stats?.doctorsCount || 0} doktor).`,
          `تم تصدير وتنزيل النسخة الاحتياطية بنجاح (${backupData.stats?.patientsCount || 0} مريض، ${backupData.stats?.doctorsCount || 0} أطباء).`,
          `System backup downloaded successfully (${backupData.stats?.patientsCount || 0} patients, ${backupData.stats?.doctorsCount || 0} doctors).`
        ),
      });
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        text: error.message || tr3(lang, "Yedekleme sırasında bir hata oluştu.", "حدث خطأ أثناء النسخ الاحتياطي.", "An error occurred during backup."),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = JSON.parse(event.target?.result as string);
        const data = content.data || content;
        if (!Array.isArray(data.doctors) || !Array.isArray(data.patients)) {
          throw new Error(
            tr3(
              lang,
              "Yedek dosyası eksik veya geçersiz; doktor veya hasta tablosu bulunamadı.",
              "ملف النسخة الاحتياطية غير صالح أو ناقص.",
              "Backup file is invalid or incomplete; doctor or patient tables missing."
            )
          );
        }
        setPendingFileContent(content);
        setPendingFileName(file.name);
      } catch (err: any) {
        setStatusMessage({
          type: "error",
          text: err.message || tr3(lang, "Seçilen dosya geçerli bir JSON yedeği değil.", "الملف المحدد ليس ملف JSON صالحاً.", "Selected file is not a valid JSON backup."),
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = async () => {
    if (!pendingFileContent) return;
    setIsRestoring(true);
    setStatusMessage(null);

    try {
      const res = await apiFetch(`${apiUrl}/backup/restore`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(pendingFileContent),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || tr3(lang, "Geri yükleme başarısız oldu.", "فشلت عملية الاستعادة.", "Restore failed."));
      }

      setPendingFileContent(null);
      setPendingFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      setStatusMessage({
        type: "success",
        text: tr3(
          lang,
          `Sistem yedeği başarıyla yüklendi! (${result.restoredStats?.patientsCount} hasta, ${result.restoredStats?.doctorsCount} doktor güncellendi).`,
          `تمت استعادة النظام بنجاح! تم تثبيت ${result.restoredStats?.patientsCount} مريض و ${result.restoredStats?.doctorsCount} أطباء.`,
          `System backup restored! (${result.restoredStats?.patientsCount} patients, ${result.restoredStats?.doctorsCount} doctors updated).`
        ),
      });

      if (onRefreshAll) onRefreshAll();
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        text: error.message || tr3(lang, "Geri yükleme işlemi sırasında hata oluştu.", "حدث خطأ أثناء الاستعادة.", "Error restoring backup."),
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const incomingData = pendingFileContent?.data || pendingFileContent;

  return (
    <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DCD0]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A2E1B] to-[#2C1810] text-[#D4AF37] flex items-center justify-center shadow-md shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-serif font-bold text-[#2C1810]">
                {tr3(
                  lang,
                  "Veri Güvenliği, Gün Sonu & Sıfırlanma Önleme",
                  "أمان البيانات والنسخ الاحتياطي الشامل",
                  "Data Security, End-of-Day Backup & Disaster Recovery"
                )}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {tr3(lang, "Korumalı", "نشط ومحمي", "Protected")}
              </span>
            </div>
            <p className="text-xs text-[#8C6D53] mt-0.5">
              {tr3(
                lang,
                "Tüm hasta, doktor, muayene ücreti, randevu ve finansal kayıtları tek tıkla yedekleyin veya anında geri yükleyin.",
                "تصدير كافة بيانات المركز بنقرة واحدة (المرضى، الأطباء، الأجور، المواعيد، الإيرادات) مع إمكانية استعادتها فوراً.",
                "Export all patient, physician, fee, appointment, and financial records in one click or restore instantly."
              )}
            </p>
          </div>
        </div>

        {lastExportTime && (
          <span className="text-[11px] font-mono text-[#8C6D53] bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#E5DCD0] self-start sm:self-auto">
            {tr3(lang, "Son Yedek:", "آخر تصدير:", "Last Backup:")} {lastExportTime}
          </span>
        )}
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between animate-fadeIn ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : statusMessage.type === "error"
              ? "bg-rose-50 border border-rose-200 text-rose-900"
              : "bg-blue-50 border border-blue-200 text-blue-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-stone-400 hover:text-stone-700 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#FAF7F2] border border-[#E5DCD0] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A2E1B] flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[#B8860B]" />
                {tr3(
                  lang,
                  "1. Gün Sonu / Anlık Tam Yedeği İndir (.json)",
                  "1. تصدير وتنزيل نسخة اليوم (.json)",
                  "1. Download Full Daily Backup (.json)"
                )}
              </span>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#E5DCD0] text-[#8C6D53]">
                SHA-256
              </span>
            </div>
            <p className="text-xs text-[#6E492D] leading-relaxed">
              {tr3(
                lang,
                "Kayıtlı tüm hastaları, hekim kadrosunu, muayene ücretlerini (SYP), randevuları, tahlilleri ve reçeteleri tek bir dosyada bilgisayarınıza indirir.",
                "يقوم بتجميع كافة المرضى، أطباء العيادات، أجور المعاينات (ل.س)، المواعيد والتحاليل بملف واحد آمن.",
                "Saves all registered patients, physicians, consultation fees (SYP), appointments, lab reports, and prescriptions in a single encrypted snapshot."
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportBackup}
            disabled={isExporting}
            className="w-full py-3 px-4 rounded-xl bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-xs shadow-md shadow-[#4A2E1B]/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{tr3(lang, "Yedek Hazırlanıyor...", "جاري تجهيز النسخة...", "Preparing Backup...")}</span>
              </>
            ) : (
              <>
                <FileJson className="w-4 h-4 text-[#D4AF37]" />
                <span>{tr3(lang, "Tam Sistem Yedeğini Şimdi İndir", "تحميل نسخة النظام كاملة الآن", "Download Full System Backup Now")}</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-[#FAF7F2] border border-[#E5DCD0] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A2E1B] flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-700" />
                {tr3(lang, "2. Yedekten Sistemi Geri Yükle", "2. استعادة النظام من نسخة سابقة", "2. Restore System from Backup")}
              </span>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#E5DCD0] text-emerald-800">
                {tr3(lang, "Güvenli Yükleme", "استعادة آمنة", "Safe Restore")}
              </span>
            </div>
            <p className="text-xs text-[#6E492D] leading-relaxed">
              {tr3(
                lang,
                "Olası bir sistem sıfırlanması veya yeni bir sunucuya taşınma durumunda yedeği seçerek sistemi saniyeler içinde geri yükleyin.",
                "في حال حدث أي طارئ أو نقل إلى خادم جديد، اختر ملف النسخة الاحتياطية لاستعادة كافة السجلات فوراً.",
                "Select a backup file to restore all clinical records in seconds after any server migration or reset."
              )}
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              id="system-restore-file-input"
            />
            <label
              htmlFor="system-restore-file-input"
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#F3EDE2] text-[#4A2E1B] border border-[#D5C7B5] font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>{tr3(lang, "Yedek Dosyası Seç (.json)", "اختر ملف النسخة (.json) للاستعادة", "Select Backup File (.json)")}</span>
            </label>
          </div>
        </div>
      </div>

      {pendingFileContent && (
        <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-950">
                {tr3(lang, "Sistem Yedeğini Geri Yükleme Onayı", "تأكيد استعادة بيانات النظام", "Confirm System Backup Restore")}
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                {tr3(
                  lang,
                  `"${pendingFileName}" adlı yedek dosyası yüklenecektir:`,
                  `أنت على وشك استعادة النسخة الاحتياطية من الملف "${pendingFileName}":`,
                  `You are about to restore the backup from "${pendingFileName}":`
                )}
              </p>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                <span className="bg-white px-2.5 py-1 rounded-lg border border-amber-300 text-amber-950 font-semibold">
                  👥 {incomingData?.patients?.length || 0} {tr3(lang, "Hasta", "مريض", "Patients")}
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-amber-300 text-amber-950 font-semibold">
                  👨‍⚕️ {incomingData?.doctors?.length || 0} {tr3(lang, "Doktor", "أطباء", "Doctors")}
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-amber-300 text-amber-950 font-semibold">
                  📅 {incomingData?.appointments?.length || 0} {tr3(lang, "Randevu", "موعد", "Appointments")}
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-amber-300 text-amber-950 font-semibold">
                  📋 {incomingData?.medicalRecords?.length || 0} {tr3(lang, "Tıbbi Kayıt", "سجل طبي", "Records")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-amber-200">
            <button
              type="button"
              onClick={() => {
                setPendingFileContent(null);
                setPendingFileName("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="px-4 py-2 rounded-xl bg-white text-stone-700 hover:bg-stone-100 border border-stone-300 text-xs font-semibold"
            >
              {tr3(lang, "İptal", "إلغاء", "Cancel")}
            </button>
            <button
              type="button"
              disabled={isRestoring}
              onClick={handleConfirmRestore}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              {isRestoring ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{tr3(lang, "Yükleniyor...", "جاري الاستعادة...", "Restoring...")}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{tr3(lang, "Onayla ve Verileri Geri Yükle", "تأكيد واستعادة البيانات الآن", "Confirm & Restore Data")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] flex items-start gap-3 text-xs text-[#6A584A]">
        <Info className="w-4 h-4 text-[#8A5F35] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[#2C1810] block font-semibold">
            {tr3(
              lang,
              "Güncellemelerde Sıfırlanmayı Önleme Garantisi:",
              "ضمان عدم فقدان البيانات أثناء التحديثات:",
              "Zero Data-Loss Guarantee During Updates:"
            )}
          </strong>
          <p className="leading-relaxed">
            {tr3(
              lang,
              "Her gün sonu yukarıdaki butondan yedeği indirebilir, olası bir sunucu taşıma veya sıfırlanma durumunda bu .json dosyasını seçerek tüm kayıtları tek tıkla geri yükleyebilirsiniz.",
              "احفظ نسخة اليوم دورياً؛ وفي حال أي نقل أو إعادة ضبط يمكنك استرجاع جميع السجلات فوراً بنقرة واحدة.",
              "Download the daily snapshot periodically; if you ever migrate servers or reset, select the .json snapshot to restore all records in one click."
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
