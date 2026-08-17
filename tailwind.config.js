/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#F4F1EA",
          100: "#E7E1D4",
          400: "#8A7F6C",
          700: "#3D3428",
          900: "#1A1611",
          950: "#0F0D0A",
        },
        forest: {
          50: "#E8F3EE",
          100: "#C5E0D3",
          500: "#1F6B4A",
          700: "#0F3D2E",
          800: "#0B2E23",
          900: "#071F18",
        },
        gold: {
          200: "#E8D7A8",
          400: "#D4B56A",
          500: "#C4A35A",
          700: "#8A6B2A",
        },
        danger: {
          50: "#FEF3F2",
          600: "#B42318",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,22,17,0.06), 0 12px 32px rgba(26,22,17,0.08)",
      },
    },
  },
  plugins: [],
};
