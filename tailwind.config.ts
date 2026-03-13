import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Lora", "Georgia", "serif"],
        sans: ["Instrument Sans", "system-ui", "sans-serif"],
      },
      colors: {
        cream: {
          50: "#fdfbf7",
          100: "#faf6ee",
          200: "#f4ead8",
          300: "#ebdabe",
        },
        navy: {
          900: "#0f1b2d",
          800: "#1a2d45",
          700: "#243d5e",
          600: "#2e4d77",
        },
        amber: {
          400: "#f59e0b",
          500: "#d97706",
          600: "#b45309",
        },
        sage: {
          400: "#84a98c",
          500: "#6b8f72",
        },
        rose: {
          400: "#e07070",
          500: "#c95858",
        }
      },
      animation: {
        "fade-up": "fadeUp 0.4s cubic-bezier(0.4,0,0.2,1) forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
