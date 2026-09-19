/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xs': ['1rem', { lineHeight: '1.5rem' }],        // 12px -> 16px (+4px)
        'sm': ['1.125rem', { lineHeight: '1.75rem' }],   // 14px -> 18px (+4px)
        'base': ['1.25rem', { lineHeight: '1.875rem' }], // 16px -> 20px (+4px)
        'lg': ['1.375rem', { lineHeight: '2rem' }],      // 18px -> 22px (+4px)
        'xl': ['1.5rem', { lineHeight: '2.125rem' }],    // 20px -> 24px (+4px)
        '2xl': ['1.75rem', { lineHeight: '2.25rem' }],   // 24px -> 28px (+4px)
        '3xl': ['2.125rem', { lineHeight: '2.5rem' }],   // 30px -> 34px (+4px)
        '4xl': ['2.5rem', { lineHeight: '2.75rem' }],    // 36px -> 40px (+4px)
        '5xl': ['3.25rem', { lineHeight: '1.15' }],      // 48px -> 52px (+4px)
        '6xl': ['4rem', { lineHeight: '1.1' }],          // 60px -> 64px (+4px)
      },
      colors: {
        navy: {
          950: '#040B15',
          900: '#0A192F',
          850: '#0D203D',
          800: '#112A4F',
          700: '#1A3C6E',
          600: '#255294',
          500: '#326BB8',
          100: '#E8EEF8',
          50: '#F2F6FC'
        },
        heat: {
          orange: '#FF6B00',
          amber: '#F59E0B',
          glow: '#FFA048',
          deep: '#E04F00',
          red: '#DC2626'
        },
        steel: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A'
        }
      },
      fontFamily: {
        sans: ['"Times New Roman"', 'Times', 'serif'],
        serif: ['"Times New Roman"', 'Times', 'serif'],
        mono: ['"Times New Roman"', 'Times', 'serif']
      },
      backgroundImage: {
        'blueprint-grid': 'linear-gradient(to right, rgba(10, 25, 47, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(10, 25, 47, 0.04) 1px, transparent 1px)',
        'blueprint-grid-dark': 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        'blueprint-dots': 'radial-gradient(rgba(10, 25, 47, 0.08) 1px, transparent 0)',
        'blueprint-dots-dark': 'radial-gradient(rgba(255, 107, 0, 0.15) 1px, transparent 0)'
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 24s linear infinite',
        'heat-flow': 'heatFlow 2.5s ease-in-out infinite'
      },
      keyframes: {
        heatFlow: {
          '0%': { strokeDashoffset: '100%' },
          '100%': { strokeDashoffset: '0%' }
        }
      }
    },
  },
  plugins: [],
}
