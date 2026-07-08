import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17233D",
        parchment: "#FAF6EE",
        paper: "#FFFFFF",
        brass: "#A9793C",
        "brass-dark": "#8C6530",
        alert: "#A83B32",
        slate: "#5B6472",
        line: "#E2D9C6",
        ok: "#3E6B4F",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 12px 30px -14px rgba(23,35,61,0.25)",
        panel: "0 18px 40px -12px rgba(23,35,61,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
