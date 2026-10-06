"use client";

import React from "react";
import { User, Droplet } from "lucide-react";
import { Patient } from "../patients.types";

interface PatientProfileViewProps {
  patient: Patient;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({ patient }) => {
  return (
    <div className="bg-[#141412] border border-clinicBorder rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-md shrink-0">
            <div className="w-full h-full bg-[#181815] rounded-[14px] flex items-center justify-center text-amber-400">
              <User className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-serif">{patient.user.fullName}</h2>
            <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-3">
              <span>{patient.user.email}</span>
              <span>•</span>
              <span>{patient.user.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-950/30 border border-red-800/40">
          <Droplet className="w-4 h-4 text-red-400" />
          <span className="text-xs font-mono font-bold text-red-300">
            {patient.bloodType || "A+"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-stone-500 uppercase font-semibold text-[10px]">Kimlik No</span>
          <div className="text-white font-mono font-bold">{patient.user.identityNo}</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-stone-500 uppercase font-semibold text-[10px]">Acil İletişim</span>
          <div className="text-stone-200">{patient.emergencyContact || "Belirtilmedi"}</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-stone-500 uppercase font-semibold text-[10px]">Sigorta</span>
          <div className="text-amber-300 font-medium">{patient.insuranceInfo || "SGK / Standart"}</div>
        </div>
      </div>
    </div>
  );
};
