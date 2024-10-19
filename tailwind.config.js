/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9',
        secondary: '#0369a1',
        background: '#0f172a',
        surface: '#1e293b',
      },
    },
  },
  plugins: [],
}
