import React, { useState } from "react";
import { X, Stethoscope, Pill, FlaskConical, Plus, Trash2, CheckCircle, AlertCircle, Save } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";
import { apiRequest } from "../../../shared/api";

interface MedicalRecordEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  appointmentId?: string | null;
  onSuccess: () => void;
}

export const MedicalRecordEntryModal: React.FC<MedicalRecordEntryModalProps> = ({
  isOpen,
  onClose,
  patient,
  appointmentId,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");

  // Prescriptions list
  const [prescriptionItems, setPrescriptionItems] = useState<
    { itemName: string; dosage: string; quantity: number }[]
  >([]);
  const [drugInput, setDrugInput] = useState({ itemName: "", dosage: "Günde 2 kez tok", quantity: 1 });

  // Lab tests list
  const [labTests, setLabTests] = useState<string[]>([]);
  const [testInput, setTestInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen || !patient) return null;

  const patientName = patient.user?.fullName || patient.fullName || patient.patient?.fullName || "Hasta";
  const patientId = patient.patientId || patient.id;

  const handleAddDrug = () => {
    if (!drugInput.itemName.trim()) return;
    setPrescriptionItems([...prescriptionItems, { ...drugInput }]);
    setDrugInput({ itemName: "", dosage: "Günde 2 kez tok", quantity: 1 });
  };

  const handleRemoveDrug = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleAddLab = () => {
    if (!testInput.trim()) return;
    setLabTests([...labTests, testInput.trim()]);
    setTestInput("");
  };

  const handleRemoveLab = (index: number) => {
    setLabTests(labTests.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim() || !clinicalNotes.trim()) {
      setErrorMsg("Tanı (ICD) ve Klinik Notlar zorunludur.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await apiRequest("/medical-records", {
        method: "POST",
        body: JSON.stringify({
          patientId,
          diagnosis,
          clinicalNotes,
          prescriptionItems: prescriptionItems.length > 0 ? prescriptionItems : undefined,
          labTests: labTests.length > 0 ? labTests : undefined,
        }),
      });

      // If associated with today's appointment queue, complete it
      if (appointmentId) {
        await apiRequest(`/appointments/${appointmentId}/status`, {
          method: "PUT",
          body: JSON.stringify({ status: "COMPLETED" }),
        }).catch(() => {});
      }

      setSuccessMsg(t.recordSavedSuccess);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Tıbbi kayıt kaydedilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#141412] border border-clinicBorder rounded-3xl shadow-2xl overflow-hidden text-stone-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-emerald-500/15 via-transparent to-amber-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-serif">{t.newMedicalRecord}</h3>
              <p className="text-xs text-emerald-400 font-mono">Hasta: {patientName} • ID: {patientId.slice(0, 8)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Diagnosis (ICD-10) */}
          <div>
            <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              {t.diagnosisICD} *
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Örn: I20.9 - Anjina Pektoris / L20.9 - Atopik Dermatit"
              className="w-full bg-black/60 border border-stone-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Clinical SOAP Notes */}
          <div>
            <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
              {t.clinicalFindings} *
            </label>
            <textarea
              required
              rows={4}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="S: Hasta göğüs sıkışması ve nefes darlığı şikayeti ile başvurdu.&#10;O: TA: 135/85 mmHg, Nabız: 78 bpm, EKG ritmik.&#10;A: Stabil angina pektoris şüphesi.&#10;P: İlaç tedavisi başlandı, lipid ve EKO istemi yapıldı."
              className="w-full bg-black/60 border border-stone-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono leading-relaxed transition-colors"
            />
          </div>

          {/* E-Prescription Creator */}
          <div className="p-4 rounded-2xl bg-black/40 border border-purple-900/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
              <Pill className="w-4 h-4 text-purple-400" />
              <span>E-Reçete Yaz (İlaç Ekle)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="İlaç Adı (Örn: Lipitor 10mg / Amoxicillin)"
                value={drugInput.itemName}
                onChange={(e) => setDrugInput({ ...drugInput, itemName: e.target.value })}
                className="sm:col-span-6 bg-black/60 border border-stone-800 rounded-xl py-2 px-3 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Doz (Günde 1 kez)"
                value={drugInput.dosage}
                onChange={(e) => setDrugInput({ ...drugInput, dosage: e.target.value })}
                className="sm:col-span-3 bg-black/60 border border-stone-800 rounded-xl py-2 px-3 text-xs text-white"
              />
              <input
                type="number"
                min={1}
                value={drugInput.quantity}
                onChange={(e) => setDrugInput({ ...drugInput, quantity: parseInt(e.target.value) || 1 })}
                className="sm:col-span-1 bg-black/60 border border-stone-800 rounded-xl py-2 px-2 text-xs text-white text-center"
              />
              <button
                type="button"
                onClick={handleAddDrug}
                className="sm:col-span-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ekle</span>
              </button>
            </div>

            {/* Added drugs list */}
            {prescriptionItems.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {prescriptionItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs flex items-center justify-between">
                    <div>
                      <strong className="text-white">{item.itemName}</strong>
                      <span className="text-purple-300 ml-2">({item.dosage} • {item.quantity} Kutu)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDrug(idx)}
                      className="text-stone-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lab Test Order */}
          <div className="p-4 rounded-2xl bg-black/40 border border-teal-900/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
              <FlaskConical className="w-4 h-4 text-teal-400" />
              <span>Laboratuvar Tahlili İste</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Örn: Lipid Paneli, Hemogram, Troponin I, Karaciğer Enzimleri"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="flex-1 bg-black/60 border border-stone-800 rounded-xl py-2 px-3 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddLab}
                className="py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>İste</span>
              </button>
            </div>

            {/* Added tests list */}
            {labTests.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {labTests.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/50 border border-teal-800/50 text-teal-300 text-xs"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLab(idx)}
                      className="hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-semibold"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Kaydediliyor..." : t.saveMedicalRecord}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
