/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0B0D",
          2: "#141417",
          3: "#1D1D22",
        },
        paper: {
          DEFAULT: "#F5F3ED",
          2: "#ECE8DE",
        },
        amber: {
          DEFAULT: "#F2B744",
          2: "#D99A2B",
          3: "#8C6319",
        },
        ember: {
          DEFAULT: "#D63829",
          2: "#A82818",
        },
        sand: "#E8DFCC",
        smoke: {
          DEFAULT: "#6D6D75",
          2: "#9A9AA2",
        },
        line: {
          DEFAULT: "#D8D2C4",
          dark: "#24242A",
        },
      },
      fontFamily: {
        display: ["'Big Shoulders Display'", "sans-serif"],
        editorial: ["'Fraunces'", "'Big Shoulders Display'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
