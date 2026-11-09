import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#060A17",
          900: "#0B132B",
          850: "#0F1A3A",
          800: "#14244E",
          750: "#172033",
          700: "#1E3368",
          600: "#2B478B",
        },
        aqi: {
          good: "#10B981",        // 0 - 50: Emerald
          moderate: "#F59E0B",    // 51 - 100: Amber
          sensitive: "#F97316",   // 101 - 150: Orange
          unhealthy: "#EF4444",   // 151 - 200: Red
          veryUnhealthy: "#A855F7", // 201 - 300: Purple
          hazardous: "#881337",   // 301+: Maroon
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
