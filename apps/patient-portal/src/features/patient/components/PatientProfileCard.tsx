import React from "react";
import { User, Droplet, Shield, Phone, Mail, FileText, Calendar, Pill } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";
import { AuthUser } from "../../auth/auth.types";

interface PatientProfileCardProps {
  user: AuthUser;
  stats: {
    appointmentsCount: number;
    recordsCount: number;
    prescriptionsCount: number;
    labCount: number;
  };
}

export const PatientProfileCard: React.FC<PatientProfileCardProps> = ({ user, stats }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white border border-[#E5DCD0] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      
      {/* Top Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#E5DCD0]">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4A2E1B] to-[#2C1810] p-0.5 shadow-md">
            <div className="w-full h-full bg-[#FAF7F2] rounded-[14px] flex items-center justify-center text-[#4A2E1B]">
              <User className="w-10 h-10" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFE8DC] border border-[#E5DCD0] text-[#4A2E1B] text-[10px] font-mono font-bold uppercase mb-1 shadow-sm">
              <span>{t.patientFileBadge}</span>
            </div>
            <h2 className="text-2xl font-bold text-[#2C1810] font-serif">{user.fullName}</h2>
            <div className="text-xs text-[#4E3D30] mt-1 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#8A5F35]" />
                <span>{user.email}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#8A5F35]" />
                <span>{user.phone || "+963 999 000 112"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Blood Group Highlight */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#FAF0F0] border border-red-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black">
            <Droplet className="w-6 h-6 fill-red-200 text-red-600" />
          </div>
          <div>
            <span className="text-[10px] text-[#6E492D] uppercase tracking-wider block font-semibold">
              {t.bloodType}
            </span>
            <span className="text-lg font-black text-red-700 font-mono">
              A Rh (+)
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-1 shadow-sm">
          <span className="text-[11px] text-[#6E492D] uppercase tracking-wider font-semibold">
            {t.identityNo}
          </span>
          <div className="text-sm font-bold text-[#2C1810] font-mono">
            {user.identityNo || "99999999996"}
          </div>
          <span className="text-[10px] text-[#2E7D32] flex items-center gap-1 font-medium">
            <Shield className="w-3 h-3" />
            <span>Doğrulanmış Kimlik</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-1 shadow-sm">
          <span className="text-[11px] text-[#6E492D] uppercase tracking-wider font-semibold">
            {t.emergencyContact}
          </span>
          <div className="text-sm font-bold text-[#2C1810]">
            Hakan Kaya (+963 991 223 344)
          </div>
          <span className="text-[10px] text-[#6E492D]">1. Derece Yakını (Eşi)</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] space-y-1 shadow-sm">
          <span className="text-[11px] text-[#6E492D] uppercase tracking-wider font-semibold">
            {t.insuranceInfo}
          </span>
          <div className="text-sm font-bold text-[#8A5F35]">
            Özel Bupa / SGK Anlaşmalı
          </div>
          <span className="text-[10px] text-[#6E492D]">Poliçe No: #TR-SY-88219</span>
        </div>

      </div>

      {/* Health Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] text-center shadow-sm">
          <span className="text-2xl font-black text-[#4A2E1B] font-serif">{stats.appointmentsCount}</span>
          <span className="text-xs text-[#6E492D] block mt-1 font-medium">{t.myAppointments}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] text-center shadow-sm">
          <span className="text-2xl font-black text-[#1E40AF] font-serif">{stats.recordsCount}</span>
          <span className="text-xs text-[#6E492D] block mt-1 font-medium">{t.consultationHistory}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] text-center shadow-sm">
          <span className="text-2xl font-black text-[#2E7D32] font-serif">{stats.prescriptionsCount}</span>
          <span className="text-xs text-[#6E492D] block mt-1 font-medium">{t.prescriptions}</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCD0] text-center shadow-sm">
          <span className="text-2xl font-black text-[#6B21A8] font-serif">{stats.labCount}</span>
          <span className="text-xs text-[#6E492D] block mt-1 font-medium">{t.labResults}</span>
        </div>
      </div>

    </div>
  );
};
