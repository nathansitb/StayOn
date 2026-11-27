import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0B0B0B",
        panel: "#141311",
        panel2: "#1B1917",
        cream: "#F3EDE1",
        creamDim: "#C9C2B4",
        muted: "#8B857A",
        gold: "#C6A76A",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderColor: {
        line: "rgba(243,237,225,.10)",
        lineStrong: "rgba(243,237,225,.18)",
      },
      boxShadow: {
        phone: "0 30px 80px rgba(0,0,0,.55)",
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "2px",
        md: "3px",
        lg: "4px",
        xl: "4px",
        "2xl": "5px",
        "3xl": "6px",
      },
    },
  },
  plugins: [],
};

export default config;
