/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E50914', // Netflix Red
          hover: '#F40612',
        },
        dark: {
          DEFAULT: '#141414',
          light: '#2F2F2F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-to-b-black': 'linear-gradient(to bottom, transparent 0%, rgba(20,20,20,1) 100%)',
        'gradient-to-r-black': 'linear-gradient(to right, rgba(20,20,20,1) 0%, transparent 100%)',
      }
    },
  },
  plugins: [],
}
