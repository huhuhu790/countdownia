/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 5s linear infinite",
      }
    }
  },
  plugins: [],
}