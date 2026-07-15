/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#14532D',
        secondary: '#F5F1E8',
        background: '#FAF9F5',
        accent: '#DDE9E0',
        text: '#111827',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '24px',
      }
    },
  },
  plugins: [],
}
