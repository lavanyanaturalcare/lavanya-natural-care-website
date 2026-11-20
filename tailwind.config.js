/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ONZNATURAL Brand Colors (With full numeric scales for complete contrast)
        primary: {
          DEFAULT: '#173F35', // Deep botanical green
          light: '#235A4D',
          dark: '#0E2822',
          50: '#F2F6F4',
          100: '#DEECE5',
          200: '#BDD7CB',
          300: '#95BEAC',
          400: '#71836D',
          500: '#466C5E',
          600: '#34574B',
          700: '#264E43',
          800: '#1F473C',
          900: '#173F35', // Deep botanical green
          950: '#0C241E', // Darkest forest black-green
        },
        secondary: {
          DEFAULT: '#71836D', // Muted sage
          light: '#8E9E8B',
          dark: '#556552',
          50: '#F5F7F4',
          100: '#E8ECE6',
          200: '#D2DACF',
          300: '#B5C2B1',
          400: '#8E9E8B',
          500: '#71836D',
          600: '#5A6B56',
          700: '#445241',
          800: '#323D30',
          900: '#212920',
          950: '#131912',
        },
        sand: {
          DEFAULT: '#F0EAE1', // Soft warm sand
          50: '#FDFBF7',
          100: '#F8F5EE',
          200: '#F0EAE1',
          300: '#E5DCCD',
          400: '#D2C4B0',
          500: '#BAA68E',
          600: '#9C856C',
          700: '#7B6651',
          800: '#5A4A3B',
          900: '#3E3228',
          950: '#251E18',
        },
        accent: {
          DEFAULT: '#B99B62', // Subtle antique gold
          light: '#CCB681',
          dark: '#9D8049',
          50: '#FBF9F4',
          100: '#F5F0E4',
          200: '#EBDFCA',
          300: '#DFD0A8',
          400: '#CCB681',
          500: '#B99B62', // Subtle antique gold
          600: '#9D8049',
          700: '#7E6534',
          800: '#5F4B23',
          900: '#403215',
          950: '#241B0A',
        },
        cream: {
          50: '#F7F4ED', // Warm ivory background
          100: '#EFEBE0',
          200: '#E7DCCB', // Soft sand surface
          300: '#D5C4AC',
          400: '#C0AC90',
          500: '#A99374',
          600: '#8B7658',
          700: '#6D5B41',
          800: '#4F412E',
          900: '#33291C',
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
