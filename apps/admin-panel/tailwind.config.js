/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF7',
          100: '#FAF4EB',
          200: '#F0E3CD',
          300: '#E1CBA7',
          400: '#CCA97C',
          500: '#B88B57',
          600: '#A47643',
          700: '#8A5F35',
          800: '#6E4828',
          900: '#54341B',
          950: '#2A170A',
        },
        clinicBg: '#FAF7F2',
        clinicSurface: '#F3EDE2',
        clinicCard: '#FFFFFF',
        clinicGold: '#B8860B',
        clinicGoldHover: '#8A5F35',
        clinicBorder: '#E5DCD0',
        clinicBrown: '#4A2E1B',
        clinicBrownLight: '#6E492D',
        clinicBeige: '#EFE8DC',
        clinicText: '#2C1810',
      },
    },
  },
  plugins: [],
}
