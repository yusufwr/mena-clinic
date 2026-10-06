"use client";

import React, { useState } from "react";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { loginUser } from "../auth.service";
import { AuthUser } from "../auth.types";

interface LoginFormProps {
  onSuccess: (user: AuthUser, token: string) => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const tAuth = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("mena_auth_token", data.token);
      onSuccess(data.user, data.token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : tAuth("errorTitle");
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-[#4E3D30] mb-1.5">{tAuth("email")}</label>
        <div className="relative">
          <Mail className="absolute top-3 left-3 rtl:left-auto rtl:right-3 w-4 h-4 text-[#8A5F35]" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={tAuth("emailPlaceholder")}
            className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl py-2.5 pl-10 pr-3 rtl:pr-10 rtl:pl-3 text-sm text-[#2C1810] placeholder-[#9E8E81] focus:bg-white focus:outline-none focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#4E3D30] mb-1.5">{tAuth("password")}</label>
        <div className="relative">
          <Lock className="absolute top-3 left-3 rtl:left-auto rtl:right-3 w-4 h-4 text-[#8A5F35]" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={tAuth("passwordPlaceholder")}
            className="w-full bg-[#FAF7F2] border border-[#DDD2C1] rounded-xl py-2.5 pl-10 pr-3 rtl:pr-10 rtl:pl-3 text-sm text-[#2C1810] placeholder-[#9E8E81] focus:bg-white focus:outline-none focus:border-[#4A2E1B] focus:ring-1 focus:ring-[#4A2E1B]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#4A2E1B] hover:bg-[#382112] text-white font-bold text-sm rounded-xl shadow-md shadow-[#4A2E1B]/20 transition-all flex items-center justify-center gap-2"
      >
        <span>{loading ? tAuth("loading") : tAuth("loginButton")}</span>
        <ArrowRight className="w-4 h-4 rtl:rotate-180 text-amber-200" />
      </button>

      {onSwitchToRegister && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-xs text-[#4A2E1B] hover:text-[#6E492D] font-semibold hover:underline"
          >
            {tAuth("dontHaveAccount")} <span className="font-bold">{tAuth("goToRegister")}</span>
          </button>
        </div>
      )}
    </form>
  );
};
