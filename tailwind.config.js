/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#F9F6F0',
          200: '#F2EBDC',
          300: '#E6D9C0',
          400: '#D5BF97',
        },
        botanical: {
          50: '#F4F7F4',
          100: '#E3EBE4',
          200: '#C5D6C7',
          600: '#3D614A',
          800: '#233F2E',
          900: '#172E20',
          950: '#0E1D13',
        },
        gold: {
          300: '#F3E5AB',
          400: '#E6C875',
          500: '#D4AF37',
          600: '#B89228',
          700: '#91711C',
        },
        warmgray: {
          100: '#F5F5F3',
          200: '#E6E6E2',
          600: '#6E6E69',
          900: '#2A2A28',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
