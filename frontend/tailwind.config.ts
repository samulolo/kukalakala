import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        muted: "#5f6b7a",
        line: "#d8dee8",
        "soft-line": "#ebf0f6",
        accent: {
          DEFAULT: "#17a34a",
          dark: "#15803d",
          soft: "#effdf4",
        },
        paper: "#f6f8fb",
      },
      boxShadow: {
        soft: "0 10px 24px rgba(21, 42, 76, 0.08)",
        search: "0 12px 28px rgba(21, 42, 76, 0.1)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
