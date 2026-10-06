import React from "react";
import { Laptop, FlaskConical, Pill, Globe, CheckCircle } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";

export const ClinicFeatures: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Laptop,
      title: t.feat1Title,
      desc: t.feat1Desc,
      tag: "E-Health",
      color: "from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-800/30",
    },
    {
      icon: FlaskConical,
      title: t.feat2Title,
      desc: t.feat2Desc,
      tag: "Laboratory",
      color: "from-teal-500/20 to-teal-600/5 text-teal-400 border-teal-800/30",
    },
    {
      icon: Pill,
      title: t.feat3Title,
      desc: t.feat3Desc,
      tag: "Pharmacy 10% OFF",
      color: "from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-800/30",
    },
    {
      icon: Globe,
      title: t.feat4Title,
      desc: t.feat4Desc,
      tag: "Multilingual Care",
      color: "from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-800/30",
    },
  ];

  return (
    <section className="py-20 bg-[#F3EDE2] border-b border-[#E5DCD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2C1810] font-serif tracking-tight mb-4">
            {t.featuresTitle}
          </h2>
          <p className="text-[#4E3D30] text-sm sm:text-base leading-relaxed">
            {t.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E5DCD0] rounded-2xl p-6 relative overflow-hidden group hover:border-[#B8860B]/60 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#B8860B] font-bold">
                  {feat.tag}
                </span>
                <h3 className="text-base font-bold text-[#2C1810] mt-1 mb-2 font-serif">
                  {feat.title}
                </h3>
                <p className="text-[#4E3D30] text-xs leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
