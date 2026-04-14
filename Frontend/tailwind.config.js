
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#0F172A',
          purple: '#7C3AED',
          blue: '#2563EB',
          bg: '#F8FAFC',
          dark: '#0B1120',
          surface: '#1E293B',
          'surface-hover': '#334155',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(124, 58, 237, 0.5)',
      }
    },
  },
  plugins: [],
}
