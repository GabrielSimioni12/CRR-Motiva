import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: {
          950: "#15171A",
          900: "#1C1F22",
          800: "#25282C",
          700: "#32363B",
          600: "#43484E",
        },
        chalk: "#EDEDE4",
        chalkdim: "#A7ACA6",
        caution: "#F2B705",
        route: {
          ok: "#3F8F5F",
          media: "#D98A1F",
          alta: "#C4432C",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "dash-line":
          "repeating-linear-gradient(90deg, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
