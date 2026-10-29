import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        recruiter: "#1e293b",
        candidate: "#0D9488",
        assessment: {
          bg: "#0F172A",
        }
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
