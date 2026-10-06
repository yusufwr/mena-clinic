import React from "react";
import { FileText, Stethoscope, Pill, FlaskConical, Clock, ChevronDown, AlertCircle } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";

interface MedicalRecordItem {
  id: string;
  diagnosis: string;
  clinicalNotes: string;
  createdAt: string;
  doctor?: { fullName: string };
  amendments?: { id: string; notes: string; createdAt: string; doctor?: { fullName: string } }[];
  labOrders?: { id: string; testName: string; status: string; resultData?: string }[];
  prescriptions?: { id: string; status: string; items: { itemName: string; dosage: string; quantity: number }[] }[];
}

interface ConsultationHistoryDetailsProps {
  records: MedicalRecordItem[];
}

export const ConsultationHistoryDetails: React.FC<ConsultationHistoryDetailsProps> = ({ records }) => {
  const { t, language } = useTranslation();

  return (
    <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div>
        <h3 className="text-xl font-bold text-[#2C1810] font-serif">{t.consultationHistory}</h3>
        <p className="text-xs text-[#4E3D30] mt-1">
          {t.consultationSubtitle}
        </p>
      </div>

      {records.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-3">
          <FileText className="w-12 h-12 text-[#8A5F35] mx-auto" />
          <p className="text-[#4E3D30] text-sm">{t.noConsultationsYet}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {records.map((rec) => {
            const dateLocale = language === "ar" ? "ar-SY" : language === "en" ? "en-US" : "tr-TR";
            const dateStr = new Date(rec.createdAt).toLocaleDateString(dateLocale, {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={rec.id}
                className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-5 shadow-sm"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5DCD0]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E5DCD0] text-[#4A2E1B] flex items-center justify-center font-bold shadow-sm">
                      <Stethoscope className="w-5 h-5 text-[#B8860B]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#2C1810]">
                        {rec.doctor?.fullName || "Klinik Hekimi"}
                      </h4>
                      <span className="text-xs text-[#6E492D] flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#B8860B]" />
                        <span>{dateStr}</span>
                      </span>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-white border border-[#E5DCD0] text-[#4A2E1B] font-mono font-semibold self-start sm:self-auto shadow-sm">
                    Kayıt ID: #{rec.id.slice(0, 8)}
                  </span>
                </div>

                {/* Diagnosis Box */}
                <div className="p-4 rounded-xl bg-white border border-[#E5DCD0] space-y-1 shadow-sm">
                  <span className="text-[11px] font-bold text-[#B8860B] uppercase tracking-wider block">
                    {t.diagnosis}
                  </span>
                  <p className="text-sm font-bold text-[#2C1810]">
                    {rec.diagnosis}
                  </p>
                </div>

                {/* Clinical SOAP Notes */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#6E492D] uppercase tracking-wider block">
                    {t.clinicalNotes}
                  </span>
                  <div className="p-4 rounded-xl bg-white border border-[#E5DCD0] text-xs text-[#2C1810] leading-relaxed font-sans whitespace-pre-wrap shadow-sm">
                    {rec.clinicalNotes}
                  </div>
                </div>

                {/* Prescriptions Attached */}
                {rec.prescriptions && rec.prescriptions.length > 0 && (
                  <div className="p-4 rounded-xl bg-white border border-[#E5DCD0] space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#4A2E1B]">
                      <Pill className="w-4 h-4 text-[#B8860B]" />
                      <span>{t.prescribedDrugs} ({rec.prescriptions[0].items.length} Kalem İlaç)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rec.prescriptions[0].items.map((item, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E5DCD0] text-xs">
                          <strong className="text-[#2C1810] block">{item.itemName}</strong>
                          <span className="text-[#6E492D] text-[11px]">{item.dosage} • {item.quantity} Kutu</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lab Orders Attached */}
                {rec.labOrders && rec.labOrders.length > 0 && (
                  <div className="p-4 rounded-xl bg-white border border-[#E5DCD0] space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#2E7D32]">
                      <FlaskConical className="w-4 h-4 text-[#2E7D32]" />
                      <span>{t.orderedLabs}</span>
                    </div>
                    <div className="space-y-2">
                      {rec.labOrders.map((lab) => (
                        <div key={lab.id} className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E5DCD0] text-xs flex items-center justify-between">
                          <div>
                            <span className="text-[#2C1810] font-semibold block">{lab.testName}</span>
                            {lab.resultData && (
                              <span className="text-[#2E7D32] text-[11px] font-semibold font-mono">Sonuç: {lab.resultData}</span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            lab.status === "COMPLETED" ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#EFE8DC] text-[#4A2E1B]"
                          }`}>
                            {lab.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amendments / Additions if any */}
                {rec.amendments && rec.amendments.length > 0 && (
                  <div className="pt-3 border-t border-[#E5DCD0] space-y-2">
                    <span className="text-[11px] font-bold text-[#B8860B] uppercase tracking-wider block">
                      Zeyilname / Düzeltme Notları
                    </span>
                    {rec.amendments.map((am) => (
                      <div key={am.id} className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-[#4A2E1B]">
                        <div className="text-[10px] text-[#8A5F35] font-semibold mb-1">
                          {am.doctor?.fullName} • {new Date(am.createdAt).toLocaleString("tr-TR")}
                        </div>
                        {am.notes}
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
