"use client";

import React from "react";
import { Stethoscope, User } from "lucide-react";
import { loginUser } from "../auth.service";
import { AuthUser } from "../auth.types";

interface DemoAccountSwitcherProps {
  onSuccess: (user: AuthUser, token: string) => void;
}

export const DemoAccountSwitcher: React.FC<DemoAccountSwitcherProps> = ({ onSuccess }) => {
  const handleQuickLogin = async (email: string) => {
    try {
      const data = await loginUser({ email, password: "Password123" });
      localStorage.setItem("mena_auth_token", data.token);
      onSuccess(data.user, data.token);
    } catch {
      alert("Hızlı giriş başarısız oldu.");
    }
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/5 text-left rtl:text-right">
      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
        ⚡ Hızlı Demo Hesap Seçici
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => handleQuickLogin("cardio@menaclinic.com")}
          className="w-full p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 hover:border-emerald-500 flex items-center justify-between text-xs group transition-all"
        >
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-emerald-200">Dr. Selim Yılmaz (Kardiyoloji)</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
            Doktor →
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickLogin("derma@menaclinic.com")}
          className="w-full p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 hover:border-emerald-500 flex items-center justify-between text-xs group transition-all"
        >
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-emerald-200">Dr. Leyla Demir (Dermatoloji)</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
            Doktor →
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickLogin("patient1@menaclinic.com")}
          className="w-full p-2.5 rounded-xl bg-amber-950/20 border border-amber-800/40 hover:border-amber-500 flex items-center justify-between text-xs group transition-all"
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-amber-200">Zeynep Kaya (Kayıtlı Hasta)</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
            Hasta →
          </span>
        </button>
      </div>
    </div>
  );
};
