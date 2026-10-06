/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matheat: {
          navy: '#0b192c',
          dark: '#070f1e',
          surface: '#112240',
          card: '#1e293b',
          border: '#334155',
          flame: '#ff5500',
          orange: '#ea580c',
          amber: '#f59e0b',
          blue: '#1e40af',
          steel: '#64748b',
          pass: '#10b981',
          fail: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
