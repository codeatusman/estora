/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F5A623",
          100: "#FDECC9",
          200: "#F5C96C",
          300: "#B97A14",
        },
        accent: {
          DEFAULT: "#1C1C2E",
          100: "#F8F4EF",
          200: "#F0EBE3",
          300: "#9CA3AF",
        },
      },
    },
  },
  plugins: [],
};
