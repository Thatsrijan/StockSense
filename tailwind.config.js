/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        odoo: {
          50: '#f9f6f8',
          100: '#f2ecf0',
          200: '#e5d9e1',
          300: '#d0bcc9',
          400: '#b395a9',
          500: '#94708a',
          600: '#7c5972',
          700: '#714B67', // Odoo purple primary
          800: '#5a3b52',
          900: '#4c3345',
          950: '#2d1a28',
        },
        tealbrand: {
          50: '#f0fdf9',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#008784', // Odoo teal secondary
          800: '#115e59',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
