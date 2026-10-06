import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
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
