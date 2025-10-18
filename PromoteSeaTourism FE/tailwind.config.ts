import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcd9ff",
          300: "#90c2ff",
          400: "#5aa2ff",
          500: "#2a82ff",
          600: "#1163e6",
          700: "#0b4dc0",
          800: "#0f4598",
          900: "#123d79",
          950: "#0c284e",
        },
        secondary: {
          50: "#fff5f5",
          100: "#ffe3e3",
          200: "#ffc9c9",
          300: "#ffa8a8",
          400: "#ff8787",
          500: "#ff6b6b",
          600: "#fa5252",
          700: "#e03131",
          800: "#c92a2a",
          900: "#a51111",
          950: "#6e0909",
        },
      },
      keyframes: {
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "bounce-slow": {
          "0%, 100%": {
            transform: "translateY(-10%)",
            animationTimingFunction: "cubic-bezier(0.8,0,1,1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0,0,0.2,1)",
          },
        },
      },
      animation: {
        "spin-slow": "spin-slow 3s linear infinite",
        "bounce-slow": "bounce-slow 2s infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
