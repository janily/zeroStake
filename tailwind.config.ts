import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: "#151719",
        paper: "#f7f8f5",
        moss: "#4f6f52",
      },
      boxShadow: {
        diffusion: "0 20px 48px -24px rgba(21, 23, 25, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
