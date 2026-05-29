import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        neuros: {
          bg: "#0a0a0f",
          surface: "#0f0f18",
          "surface-2": "#141420",
          border: "rgba(255,255,255,0.06)",
          accent: "#7c3aed",
          cyan: "#06b6d4",
        },
      },
      animation: {
        "fade-in": "neuros-fade-in 0.25s ease-out forwards",
        "slide-in": "neuros-slide-in 0.2s ease-out forwards",
        ping: "ping 1.2s cubic-bezier(0,0,0.2,1) infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "neuros-grid":
          "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "24px 24px",
      },
    },
  },
  plugins: [],
};

export default config;
