// Keep this file in CommonJS so Tailwind CLI and Next.js can load it without ESM interop issues.
// tokens.mjs exports `colors` – require via dynamic import fallback not needed since we stay in CJS here.
const { colors: tokenColors } = require('./src/config/tokens.js');

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
