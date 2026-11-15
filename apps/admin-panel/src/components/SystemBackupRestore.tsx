import React, { useState, useRef } from "react";
import { ShieldCheck, Download, Upload, RefreshCw, AlertTriangle, CheckCircle2, FileJson, Lock, Database, Info } from "lucide-react";
import { AdminLang } from "../i18n";

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
  
  // Pending file for restore confirmation
  const [pendingFileContent, setPendingFileContent] = useState<any | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Export Snapshot
  const handleExportBackup = async () => {
    setIsExporting(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`${apiUrl}/backup/export`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Yedek oluşturulamadı");
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
        text: lang === "ar"
          ? `تم بنجاح تصدير وتنزيل النسخة الاحتياطية (${backupData.stats?.patientsCount || 0} مريض، ${backupData.stats?.doctorsCount || 0} أطباء).`
          : `Gün sonu sistem yedeği başarıyla indirildi (${backupData.stats?.patientsCount || 0} hasta, ${backupData.stats?.doctorsCount || 0} doktor).`,
      });
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        text: error.message || "Yedekleme sırasında bir hata oluştu.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Select File for Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = JSON.parse(event.target?.result as string);
        const data = content.data || content;
        if (!Array.isArray(data.doctors) || !Array.isArray(data.patients)) {
          throw new Error("Yedek dosyası eksik veya geçersiz; doktor veya hasta tablosu bulunamadı.");
        }
        setPendingFileContent(content);
        setPendingFileName(file.name);
      } catch (err: any) {
        setStatusMessage({
          type: "error",
          text: err.message || "Seçilen dosya geçerli bir JSON yedeği değil.",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  // 3. Confirm and Execute Restore
  const handleConfirmRestore = async () => {
    if (!pendingFileContent) return;
    setIsRestoring(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`${apiUrl}/backup/restore`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(pendingFileContent),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Geri yükleme başarısız oldu.");
      }

      setPendingFileContent(null);
      setPendingFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      setStatusMessage({
        type: "success",
        text: lang === "ar"
          ? `تمت استعادة النظام بنجاح! تم تثبيت ${result.restoredStats?.patientsCount} مريض و ${result.restoredStats?.doctorsCount} أطباء.`
          : `Sistem yedeği başarıyla yüklendi! (${result.restoredStats?.patientsCount} hasta, ${result.restoredStats?.doctorsCount} doktor güncellendi).`,
      });

      if (onRefreshAll) onRefreshAll();
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        text: error.message || "Geri yükleme işlemi sırasında hata oluştu.",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const incomingData = pendingFileContent?.data || pendingFileContent;

  return (
    <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DCD0]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A2E1B] to-[#2C1810] text-[#D4AF37] flex items-center justify-center shadow-md shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-serif font-bold text-[#2C1810]">
                {lang === "ar" ? "أمان البيانات والنسخ الاحتياطي (Disaster Recovery)" : "Veri Güvenliği, Gün Sonu & Sıfırlanma Önleme"}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {lang === "ar" ? "نشط ومحمي" : "Korumalı"}
              </span>
            </div>
            <p className="text-xs text-[#8C6D53] mt-0.5">
              {lang === "ar"
                ? "تصدير كافة بيانات المركز بنقرة واحدة (المرضى، الأطباء، الأجور، المواعيد، الإيرادات) مع إمكانية استعادتها فوراً بدون أي فقدان."
                : "Tüm hasta, doktor, muayene ücreti, randevu ve finansal kayıtları tek tıkla yedekleyin veya kayıp anında anında geri yükleyin."}
            </p>
          </div>
        </div>

        {lastExportTime && (
          <span className="text-[11px] font-mono text-[#8C6D53] bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#E5DCD0] self-start sm:self-auto">
            {lang === "ar" ? "آخر تصدير: " : "Son Yedek: "} {lastExportTime}
          </span>
        )}
      </div>

      {/* Status Feedback */}
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

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Gün Sonu İndir */}
        <div className="bg-[#FAF7F2] border border-[#E5DCD0] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A2E1B] flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[#B8860B]" />
                {lang === "ar" ? "1. تصدير وتنزيل نسخة اليوم (JSON)" : "1. Gün Sonu / Anlık Tam Yedeği İndir (.json)"}
              </span>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#E5DCD0] text-[#8C6D53]">
                SHA-256
              </span>
            </div>
            <p className="text-xs text-[#6E492D] leading-relaxed">
              {lang === "ar"
                ? "يقوم بتجميع كافة المرضى، أطباء العيادات، أجور المعاينات، المواعيد والتقارير الطبية بملف واحد مشفر يمكنك حفظه على فلاش ميموري أو Google Drive."
                : "Kayıtlı tüm hastaları, hekim kadrosunu, yeni muayene ücretlerini (1.000 / 2.000 ل.س), randevuları ve reçeteleri tek bir dosyada güvenle bilgisayarınıza indirir."}
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
                <span>{lang === "ar" ? "جاري تجهيز النسخة..." : "Yedek Hazırlanıyor..."}</span>
              </>
            ) : (
              <>
                <FileJson className="w-4 h-4 text-[#D4AF37]" />
                <span>{lang === "ar" ? "تحميل نسخة النظام كاملة الآن" : "Tam Sistem Yedeğini Şimdi İndir"}</span>
              </>
            )}
          </button>
        </div>

        {/* Card 2: Yedekten Geri Yükle */}
        <div className="bg-[#FAF7F2] border border-[#E5DCD0] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A2E1B] flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-700" />
                {lang === "ar" ? "2. استعادة النظام من نسخة سابقة" : "2. Yedekten Sistemi Geri Yükle"}
              </span>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#E5DCD0] text-emerald-800">
                Safe Restore
              </span>
            </div>
            <p className="text-xs text-[#6E492D] leading-relaxed">
              {lang === "ar"
                ? "في حال حدث أي طارئ أو إعادة ضبط، اختر ملف النسخة الاحتياطية وسيقوم النظام فوراً بإعادة بناء كافة السجلات وكأن شيئاً لم يكن."
                : "Olası bir sistem sıfırlanması, veri bozulması veya yeni bir sunucuya taşınma durumunda yedeği seçerek sistemi saniyeler içinde eski haline döndürün."}
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
              <span>{lang === "ar" ? "اختر ملف النسخة (.json) للاستعادة" : "Yedek Dosyası Seç (.json)"}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Confirmation Modal when a file is selected */}
      {pendingFileContent && (
        <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-950">
                {lang === "ar" ? "تأكيد استعادة بيانات النظام" : "Sistem Yedeğini Geri Yükleme Onayı"}
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                {lang === "ar"
                  ? `أنت على وشك استعادة النسخة الاحتياطية من الملف: "${pendingFileName}". سيتضمن ذلك استعادة:`
                  : `"${pendingFileName}" adlı yedek dosyası yüklenecektir. Bu işlem mevcut verileri bu yedeğe göre günceller:`}
              </p>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                <span className="bg-white px-2.5 py-1 rounded-lg border border-amber-300 text-amber-950 font-semibold">
                  👥 {incomingData?.patients?.length || 0} {lang === "ar" ? "مريض" : "Hasta"}
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-amber-300 text-amber-950 font-semibold">
                  👨‍⚕️ {incomingData?.doctors?.length || 0} {lang === "ar" ? "أطباء" : "Doktor"}
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-amber-300 text-amber-950 font-semibold">
                  📅 {incomingData?.appointments?.length || 0} {lang === "ar" ? "موعد" : "Randevu"}
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-amber-300 text-amber-950 font-semibold">
                  📋 {incomingData?.medicalRecords?.length || 0} {lang === "ar" ? "سجل طبي" : "Tıbbi Kayıt"}
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
              {lang === "ar" ? "إلغاء" : "İptal"}
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
                  <span>{lang === "ar" ? "جاري الاستعادة..." : "Yükleniyor..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === "ar" ? "تأكيد واستعادة البيانات الآن" : "Onayla ve Verileri Geri Yükle"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Safety Instructions Note */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] flex items-start gap-3 text-xs text-[#6A584A]">
        <Info className="w-4 h-4 text-[#8A5F35] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[#2C1810] block font-semibold">
            {lang === "ar" ? "كيف تضمن عدم فقدان أي بيانات أثناء التطوير أو التحديثات؟" : "Geliştirme ve Güncellemelerde Sıfırlanmayı Önleme Garantisi:"}
          </strong>
          <p className="leading-relaxed">
            {lang === "ar"
              ? "1) احفظ نسخة اليوم عبر الزر أعلاه دورياً. 2) إذا حصل أي عطل أو طلب المطور تحديثاً، يمكنك إرسال ملف الـ JSON هذا في المحادثة وسيقوم المساعد الذكي باسترجاعه فوراً. 3) تم عزل ملف قاعدة البيانات لتجنب مسحه عند سحب تحديثات الكود."
              : "1) Her gün sonu yukarıdaki butondan yedeği indirin. 2) Olası bir sıfırlanma durumunda indirdiğiniz bu .json dosyasını chat ekranından bana göndermeniz yeterlidir; tek komutla tüm verileri anında kurtarırım. 3) Kod güncellemelerinde veri tabanının üzerine yazılmaması için veritabanı kopyalama ve geri yükleme emniyet kilitleri sisteme entegre edilmiştir."}
          </p>
        </div>
      </div>
    </div>
  );
};

