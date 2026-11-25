import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, UserCheck, X, ChevronDown } from "lucide-react";
import { tr3 } from "../i18n";

export interface SelectablePatient {
  id: string;
  fullName?: string;
  identityNo?: string;
  phone?: string;
  bloodType?: string;
  user?: {
    fullName?: string;
    identityNo?: string;
    phone?: string;
  };
}

interface PatientSearchSelectProps {
  patients: SelectablePatient[];
  value: string;
  onChange: (patientId: string) => void;
  placeholder?: string;
  required?: boolean;
  lang?: string;
}

function normalizeStr(str: string): string {
  return (str || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/i̇/g, "i");
}

export const PatientSearchSelect: React.FC<PatientSearchSelectProps> = ({
  patients,
  value,
  onChange,
  placeholder,
  required = false,
  lang = "tr",
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedPatients = useMemo(() => {
    return patients.map((p) => {
      const fullName = (p.fullName || p.user?.fullName || "").trim();
      const identityNo = (p.identityNo || p.user?.identityNo || "").trim();
      const phone = (p.phone || p.user?.phone || "").trim();
      const bloodType = p.bloodType || "";
      const normFull = normalizeStr(fullName);
      const normWords = normFull.split(/\s+/).filter(Boolean);
      return {
        id: p.id,
        fullName,
        identityNo,
        phone,
        bloodType,
        normFull,
        normWords,
      };
    });
  }, [patients]);

  const selectedPatient = useMemo(
    () => normalizedPatients.find((p) => p.id === value) || null,
    [normalizedPatients, value]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredList = useMemo(() => {
    const q = normalizeStr(query);
    if (!q) {
      return normalizedPatients.slice(0, 25);
    }

    const digitsQ = q.replace(/\D/g, "");
    const scored: { item: (typeof normalizedPatients)[0]; rank: number }[] = [];
    for (const p of normalizedPatients) {
      if (p.normFull.startsWith(q)) {
        scored.push({ item: p, rank: 1 });
        continue;
      }
      if (p.normWords.some((w) => w.startsWith(q))) {
        scored.push({ item: p, rank: 2 });
        continue;
      }
      if (
        digitsQ.length > 0 &&
        (p.identityNo.includes(digitsQ) || p.phone.replace(/\D/g, "").includes(digitsQ))
      ) {
        scored.push({ item: p, rank: 3 });
        continue;
      }
    }

    scored.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.item.fullName.localeCompare(b.item.fullName, "tr");
    });

    return scored.map((s) => s.item);
  }, [normalizedPatients, query]);

  const defaultPlaceholder =
    placeholder ||
    tr3(
      lang,
      "Hasta adını harf harf yazın (Örn: Y, Yu, Yusuf)...",
      "اكتب اسم المريض حرفاً بحرف للتصفية (مثال: يوسف)...",
      "Type patient name letter by letter (e.g. Y, Yu, Yusuf)..."
    );

  return (
    <div ref={containerRef} className="relative w-full text-xs">
      {required && (
        <input
          type="text"
          tabIndex={-1}
          required
          value={value}
          onChange={() => {}}
          className="sr-only"
          aria-hidden="true"
        />
      )}

      {selectedPatient && !isOpen ? (
        <div className="w-full p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <UserCheck size={15} className="text-emerald-700 shrink-0" />
            <div className="truncate">
              <strong className="text-[#2C1810] font-bold">{selectedPatient.fullName}</strong>
              <span className="text-[11px] text-[#6E492D] font-mono mx-1.5">
                ({selectedPatient.identityNo || tr3(lang, "Kimlik Yok", "بدون هوية", "No ID")}
                {selectedPatient.phone ? ` • ${selectedPatient.phone}` : ""})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange("");
              setQuery("");
              setIsOpen(true);
            }}
            className="px-2 py-1 rounded-lg bg-white hover:bg-red-50 text-[#6E492D] hover:text-red-700 border border-[#E5DCD0] text-[10px] font-bold shrink-0 flex items-center gap-1"
          >
            <X size={11} />
            <span>{tr3(lang, "Değiştir", "تغيير", "Change")}</span>
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-[#8C6D53] pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              if (value) onChange("");
              setIsOpen(true);
            }}
            placeholder={defaultPlaceholder}
            className="w-full pl-9 pr-8 rtl:pl-8 rtl:pr-9 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD2C1] focus:bg-white focus:border-[#4A2E1B] focus:outline-none text-xs text-[#2C1810]"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onChange("");
                setIsOpen(true);
              }}
              className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-[#8C6D53] hover:text-[#2C1810]"
            >
              <X size={13} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-[#8C6D53] hover:text-[#2C1810]"
            >
              <ChevronDown size={14} />
            </button>
          )}
        </div>
      )}

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#D5C7B5] rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-[#F3EDE2]">
          <div className="px-3 py-1.5 bg-[#FAF7F2] text-[10px] font-semibold text-[#7D6E63] flex items-center justify-between sticky top-0 border-b border-[#E5DCD0]">
            <span>
              {query.trim()
                ? tr3(
                    lang,
                    `"${query}" ile eşleşen hastalar (${filteredList.length})`,
                    `المرضى المطابقون لـ "${query}" (${filteredList.length})`,
                    `Patients matching "${query}" (${filteredList.length})`
                  )
                : tr3(
                    lang,
                    `Harf girerek filtreleyin (Toplam ${normalizedPatients.length} kayıtlı hasta)`,
                    `اكتب للتصفية (إجمالي ${normalizedPatients.length} مريض مسجل)`,
                    `Type to filter (${normalizedPatients.length} registered patients)`
                  )}
            </span>
          </div>

          {filteredList.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#7D6E63] italic">
              {tr3(
                lang,
                `"${query}" harfleriyle eşleşen hasta bulunamadı.`,
                `لا يوجد مريض يطابق "${query}".`,
                `No patient found matching "${query}".`
              )}
            </div>
          ) : (
            filteredList.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onChange(p.id);
                  setQuery(p.fullName);
                  setIsOpen(false);
                }}
                className={`w-full text-left rtl:text-right px-3.5 py-2.5 hover:bg-[#FAF7F2] transition-colors flex items-center justify-between gap-2 ${
                  value === p.id ? "bg-emerald-50/60" : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="font-bold text-[#2C1810] text-xs truncate">{p.fullName}</div>
                  <div className="text-[10px] text-[#7D6E63] font-mono flex flex-wrap items-center gap-2 mt-0.5">
                    <span>
                      {tr3(lang, "Kimlik:", "الهوية:", "ID:")} {p.identityNo || "-"}
                    </span>
                    {p.phone && (
                      <span>
                        • {tr3(lang, "Tel:", "الهاتف:", "Tel:")} {p.phone}
                      </span>
                    )}
                  </div>
                </div>
                {p.bloodType && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px] shrink-0">
                    {p.bloodType}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
