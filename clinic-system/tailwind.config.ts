import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: '420px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
      tv: '2560px',
      '4k': '3840px',
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        clinicBg: "#FAF7F2",
        clinicSurface: "#F3EDE2",
        clinicCard: "#FFFFFF",
        clinicBorder: "#E5DCD0",
        clinicBrown: "#4A2E1B",
        clinicBrownLight: "#6E492D",
        clinicBeige: "#EFE8DC",
        clinicText: "#2C1810",
        clinicMuted: "#7D6E63",
        clinicGold: "#B8860B",
        clinicGoldHover: "#966F33",
      },
    },
  },
  plugins: [],
};
export default config;
