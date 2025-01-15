/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        portLligat: ['"Port Lligat Slab"', 'serif'], 
        manrope:['"Manrope"','serif'],
        poppins:['"poppins"']
      }
    },
  },
  plugins: [],
}

