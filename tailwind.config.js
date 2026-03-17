/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F9FAFB", // Light gray background
        panel: "#FFFFFF",      // White panel
        surface: "#F3F4F6",    // Slightly darker surface
        primary: "#3B82F6",
        accent: "#F59E0B"
      },
    },
  },
  plugins: [],
}
