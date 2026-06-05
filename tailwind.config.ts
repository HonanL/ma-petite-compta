import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#102A43",
        moss: "#0B4A7A",
        accent: "#2FBC45",
        mint: "#F7FAF8",
        line: "#D9E8E2",
        clay: "#B42318",
        paper: "#F7FAF8"
      },
      boxShadow: {
        soft: "0 16px 38px rgba(11, 74, 122, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
