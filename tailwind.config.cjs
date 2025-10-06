// Tailwind config (CJS). Using .cjs to avoid ESM loader issues under "type": "module".
const { colors: tokenColors } = require('./src/config/tokens.cjs');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: tokenColors.brand,
        gray: tokenColors.gray
      }
    }
  },
  plugins: []
};