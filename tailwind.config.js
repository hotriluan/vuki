import { colors as tokenColors } from './src/config/tokens.js';
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: tokenColors.brand.primary,
          secondary: tokenColors.brand.secondary,
          accent: tokenColors.brand.accent
        },
        gray: tokenColors.gray
      }
    }
  },
  plugins: []
};
import { colors as tokenColors } from './src/config/tokens.js';
