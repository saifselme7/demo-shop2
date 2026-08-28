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
        offwhite: "var(--offwhite)",
        muted: "var(--muted)",
        line: "var(--line)",
        brand: {
          50: "#faf8f5",
          100: "#f2ede6",
          200: "#e5dccb",
          300: "#d4c2a6",
          400: "#bfa17a",
          500: "#a9845c",
          600: "#8f6a46",
          700: "#735338",
          800: "#5d4430",
          900: "#4c3828",
          950: "#2a1f16",
        },
      },
      fontFamily: {
        sans: ["Cairo", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,10,10,0.04), 0 8px 24px rgba(10,10,10,0.06)",
        lift: "0 12px 40px rgba(10,10,10,0.14)",
      },
    },
  },
  plugins: [],
};
export default config;
