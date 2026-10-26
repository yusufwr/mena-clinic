import React from "react";

// 1. Yeni Suriye İstiklal / Devrim Bayrağı (Yeşil, Beyaz - 3 Kırmızı Yıldız, Siyah)
export const SyrianFlag: React.FC<{ className?: string }> = ({ className = "w-4 h-2.5" }) => (
  <svg
    viewBox="0 0 30 20"
    className={`inline-block rounded-[2px] shadow-sm border border-black/10 shrink-0 align-middle ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>العلم السوري الجديد (علم الثورة والاستقلال)</title>
    <rect width="30" height="6.67" fill="#007A3D" />
    <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
    <rect y="13.34" width="30" height="6.67" fill="#000000" />
    <g fill="#CE1126">
      <polygon points="8.5,8.2 8.95,9.5 10.3,9.5 9.2,10.3 9.6,11.6 8.5,10.8 7.4,11.6 7.8,10.3 6.7,9.5 8.05,9.5" />
      <polygon points="15,8.2 15.45,9.5 16.8,9.5 15.7,10.3 16.1,11.6 15,10.8 13.9,11.6 14.3,10.3 13.2,9.5 14.55,9.5" />
      <polygon points="21.5,8.2 21.95,9.5 23.3,9.5 22.2,10.3 22.6,11.6 21.5,10.8 20.4,11.6 20.8,10.3 19.7,9.5 21.05,9.5" />
    </g>
  </svg>
);

// 2. Türkiye Bayrağı (Kırmızı Zemin, Beyaz Hilal ve Yıldız)
export const TurkishFlag: React.FC<{ className?: string }> = ({ className = "w-4 h-2.5" }) => (
  <svg
    viewBox="0 0 30 20"
    className={`inline-block rounded-[2px] shadow-sm border border-black/10 shrink-0 align-middle ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Türkiye Bayrağı</title>
    <rect width="30" height="20" fill="#E30A17" />
    <circle cx="10.5" cy="10" r="5.8" fill="#FFFFFF" />
    <circle cx="11.9" cy="10" r="4.65" fill="#E30A17" />
    <polygon
      points="17.2,7.7 17.95,9.25 19.65,9.25 18.28,10.25 18.8,11.8 17.2,10.82 15.6,11.8 16.12,10.25 14.75,9.25 16.45,9.25"
      fill="#FFFFFF"
    />
  </svg>
);

// 3. Birleşik Krallık / İngiltere Bayrağı (Union Jack)
export const UkFlag: React.FC<{ className?: string }> = ({ className = "w-4 h-2.5" }) => (
  <svg
    viewBox="0 0 30 20"
    className={`inline-block rounded-[2px] shadow-sm border border-black/10 shrink-0 align-middle ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>English (UK Flag)</title>
    <g>
      <rect width="30" height="20" fill="#012169" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#FFFFFF" strokeWidth="4.2" />
      <path d="M0,0 L15,10 M30,20 L15,10 M30,0 L15,10 M0,20 L15,10" stroke="#C8102E" strokeWidth="2.1" />
      <path d="M15,0 V20 M0,10 H30" stroke="#FFFFFF" strokeWidth="6.4" />
      <path d="M15,0 V20 M0,10 H30" stroke="#C8102E" strokeWidth="3.8" />
    </g>
  </svg>
);
