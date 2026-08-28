import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        brand: {
          50: '#fbf7ee',
          100: '#f5edd7',
          200: '#edd8ad',
          300: '#e2be7a',
          400: '#d7a149',
          500: '#c5832a',
          600: '#aa6421',
          700: '#884a1e',
          800: '#6f3c1e',
          900: '#5c331c',
          950: '#341a0d',
        }
      },
    },
  },
  plugins: [],
};
export default config;
