import React, { useState, useEffect } from "react";
import { X, FileText, Stethoscope, Clock, Pill, FlaskConical, Plus } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";
import { apiRequest } from "../../../shared/api";

interface PastRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string | null;
}

export const PastRecordsModal: React.FC<PastRecordsModalProps> = ({
  isOpen,
  onClose,
  patientId,
}) => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAmendmentNote, setNewAmendmentNote] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !patientId) return;

    setLoading(true);
    apiRequest<any>(`/medical-records/patient/${patientId}`)
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setRecords(list);
      })
      .catch((err) => console.error("Error loading patient records:", err))
      .finally(() => setLoading(false));
  }, [isOpen, patientId]);

  const handleAddAmendment = async (recordId: string) => {
    if (!newAmendmentNote.trim()) return;
    try {
      await apiRequest(`/medical-records/${recordId}/amendments`, {
        method: "POST",
        body: JSON.stringify({ notes: newAmendmentNote }),
      });
      setNewAmendmentNote("");
      setSelectedRecordId(null);
      // reload
      const updated = await apiRequest<any[]>(`/medical-records/patient/${patientId}`);
      setRecords(updated || []);
    } catch (err) {
      alert("Zeyilname eklenemedi.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#141412] border border-clinicBorder rounded-3xl shadow-2xl overflow-hidden text-stone-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/15 via-transparent to-emerald-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-black flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-serif">{t.viewHistory}</h3>
              <p className="text-xs text-blue-400 font-mono">Hasta Dosya No: #{patientId?.slice(0, 8)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {loading ? (
            <div className="py-12 text-center text-stone-500 text-xs animate-pulse">
              Tıbbi kayıtlar getiriliyor...
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center bg-black/30 rounded-2xl border border-white/5 text-stone-500 text-sm">
              Bu hastaya ait geçmiş klinik muayene kaydı bulunamadı.
            </div>
          ) : (
            records.map((rec) => (
              <div key={rec.id} className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">{rec.doctor?.fullName}</span>
                  </div>
                  <span className="text-stone-400">
                    {new Date(rec.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block">Tanı / Teşhis</span>
                  <div className="text-xs font-semibold text-white mt-0.5">{rec.diagnosis}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Klinik Notlar (SOAP)</span>
                  <div className="p-3 bg-white/5 rounded-xl text-xs text-stone-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {rec.clinicalNotes}
                  </div>
                </div>

                {/* Prescriptions */}
                {rec.prescriptions && rec.prescriptions.length > 0 && (
                  <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl space-y-2">
                    <span className="text-[10px] text-purple-400 uppercase font-bold block">Yazılan İlaçlar</span>
                    <div className="space-y-1">
                      {rec.prescriptions[0].items.map((it: any) => (
                        <div key={it.id} className="text-xs text-stone-200">
                          • {it.itemName} ({it.dosage}) - {it.quantity} Kutu
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amendments */}
                {rec.amendments && rec.amendments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] text-amber-400 uppercase font-bold block">Zeyilnameler</span>
                    {rec.amendments.map((am: any) => (
                      <div key={am.id} className="p-2.5 rounded-lg bg-amber-950/20 text-xs text-amber-200">
                        <span className="text-[10px] text-stone-400 block">{am.doctor?.fullName}</span>
                        {am.notes}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add amendment action */}
                {selectedRecordId === rec.id ? (
                  <div className="pt-2 space-y-2">
                    <textarea
                      rows={2}
                      value={newAmendmentNote}
                      onChange={(e) => setNewAmendmentNote(e.target.value)}
                      placeholder="Ek klinik not veya düzeltme zeyilnamesi..."
                      className="w-full bg-black/60 border border-stone-700 rounded-xl p-2.5 text-xs text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddAmendment(rec.id)}
                        className="px-3 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-lg"
                      >
                        Kaydet
                      </button>
                      <button
                        onClick={() => setSelectedRecordId(null)}
                        className="px-3 py-1.5 bg-stone-800 text-stone-300 text-xs rounded-lg"
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedRecordId(rec.id)}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 pt-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Zeyilname / Düzeltme Notu Ekle</span>
                  </button>
                )}

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
