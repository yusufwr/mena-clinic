import { useState } from "react";
import { tr3 } from "../i18n";

/** Preserve earlier browser-only entries without mixing unverified clinical data. */
export function LegacyDataBackup({ lang = "tr" }: { lang?: string }) {
  const [keys] = useState(() => Object.keys(localStorage).filter(key => key.startsWith("mena_admin_") || ["mena_custom_patients", "mena_booked_appointments"].includes(key)));
  if (!keys.length) return null;
  const download = () => {
    const data = Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]));
    const url = URL.createObjectURL(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "mena-legacy-browser-backup.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <aside className="m-4 p-4 border border-amber-300 bg-amber-50 rounded-xl text-sm" role="status">
    <p>
      {tr3(
        lang,
        "Bu tarayıcıda önceki sürüme ait yerel kayıtlar var. Bu kayıtlar korunuyor; henüz ortak sunucu verilerine aktarılmadı.",
        "توجد سجلات محلية سابقة في هذا المتصفح وهي محفوظة بأمان.",
        "Local browser records from an earlier version were detected and are safely preserved."
      )}
    </p>
    <button type="button" onClick={download} className="mt-2 underline font-semibold">
      {tr3(lang, "Eski yerel kayıtların yedeğini indir", "تحميل نسخة السجلات المحلية السابقة", "Download backup of legacy local records")}
    </button>
  </aside>;
}
