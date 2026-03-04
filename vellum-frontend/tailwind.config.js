/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5bafc',
          400: '#8098f9',
          500: '#6172f3',
          600: '#4e54e8',
          700: '#3f43cd',
          800: '#3538a6',
          900: '#313484',
          950: '#1e1f52',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'page': '0 4px 24px rgba(0,0,0,0.18)',
        'panel': '2px 0 8px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
