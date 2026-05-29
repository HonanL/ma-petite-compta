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
        ink: "#13201b",
        moss: "#425c4c",
        mint: "#dff4e8",
        clay: "#b75e36",
        paper: "#fbfbf7"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(19, 32, 27, 0.09)"
      }
    }
  },
  plugins: []
};

export default config;
