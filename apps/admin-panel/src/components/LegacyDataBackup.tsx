import { useState } from "react";

/** Preserve earlier browser-only entries without mixing unverified clinical data. */
export function LegacyDataBackup() {
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
    <p>Bu tarayıcıda önceki sürüme ait yerel kayıtlar var. Bu kayıtlar korunuyor; henüz ortak sunucu verilerine aktarılmadı.</p>
    <button type="button" onClick={download} className="mt-2 underline font-semibold">Eski yerel kayıtların yedeğini indir</button>
  </aside>;
}
