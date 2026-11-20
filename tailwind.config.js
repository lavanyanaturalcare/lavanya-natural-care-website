/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ONZNATURAL Brand Colors
        primary: {
          DEFAULT: '#173F35', // Deep botanical green
          light: '#235A4D',
          dark: '#0E2822',
        },
        secondary: {
          DEFAULT: '#71836D', // Muted sage
          light: '#8E9E8B',
          dark: '#556552',
        },
        cream: {
          50: '#F7F4ED', // Warm ivory background
          100: '#EFEBE0',
          200: '#E7DCCB', // Soft sand surface
          300: '#D5C4AC',
          400: '#C0AC90',
        },
        surface: {
          DEFAULT: '#E7DCCB', // Soft sand
          light: '#F0E7D9',
          dark: '#D8C7B0',
        },
        botanical: {
          50: '#F2F6F4',
          100: '#DEECE5',
          200: '#BDD7CB',
          300: '#95BEAC',
          400: '#71836D', // Muted sage
          500: '#466C5E',
          600: '#34574B',
          700: '#264E43',
          800: '#1F473C',
          900: '#173F35', // Deep botanical green
          950: '#0C241E',
        },
        gold: {
          300: '#DFD0A8',
          400: '#CCB681',
          500: '#B99B62', // Subtle antique gold
          600: '#9D8049',
          700: '#7E6534',
        },
        warmgray: {
          50: '#FAF9F6',
          100: '#F3F1EC',
          200: '#E6E3DB',
          300: '#D0CBC1',
          400: '#A39D91',
          500: '#7A7468',
          600: '#5C564B',
          700: '#413D34',
          800: '#2A2721',
          900: '#171612',
          950: '#0D0C0A',
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
