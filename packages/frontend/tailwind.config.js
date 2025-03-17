/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#3B82F6", // Bright blue
          "primary-content": "#FFFFFF",
          secondary: "#10B981", // Emerald green
          "secondary-content": "#FFFFFF",
          accent: "#F59E0B", // Amber
          "accent-content": "#FFFFFF",
          neutral: "#1E293B", // Slate 800
          "neutral-content": "#FFFFFF",
          "base-100": "#F8FAFC", // Slate 50
          "base-200": "#E2E8F0", // Slate 200
          "base-300": "#CBD5E1", // Slate 300
          "base-content": "#1E293B", // Slate 800
          info: "#3B82F6", // Blue 500
          success: "#10B981", // Emerald 500
          warning: "#F59E0B", // Amber 500
          error: "#EF4444", // Red 500
          "--rounded-btn": "0.5rem",
          ".tooltip": { "--tooltip-tail": "6px" },
          ".link": { textUnderlineOffset: "2px" },
          ".link:hover": { opacity: "80%" },
        },
      },
      {
        dark: {
          primary: "#3B82F6", // Bright blue
          "primary-content": "#FFFFFF",
          secondary: "#10B981", // Emerald green
          "secondary-content": "#FFFFFF",
          accent: "#F59E0B", // Amber
          "accent-content": "#FFFFFF",
          neutral: "#F8FAFC", // Slate 50
          "neutral-content": "#1E293B", // Slate 800
          "base-100": "#0F172A", // Slate 900
          "base-200": "#1E293B", // Slate 800
          "base-300": "#334155", // Slate 700
          "base-content": "#F8FAFC", // Slate 50
          info: "#3B82F6", // Blue 500
          success: "#10B981", // Emerald 500
          warning: "#F59E0B", // Amber 500
          error: "#EF4444", // Red 500
          "--rounded-btn": "0.5rem",
          ".tooltip": { "--tooltip-tail": "6px", "--tooltip-color": "oklch(var(--p))" },
          ".link": { textUnderlineOffset: "2px" },
          ".link:hover": { opacity: "80%" },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: { center: "0 0 12px -2px rgb(0 0 0 / 0.05)" },
      animation: { "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite" },
      backgroundImage: {
        "crypto-pattern": "url('/crypto-pattern.png')",
      },
    },
  },
};
