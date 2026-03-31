/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22C55E', // Sporty Green
          hover: '#16A34A',
          glow: 'rgba(34, 197, 94, 0.4)',
        },
        surface: {
          DEFAULT: '#020617', // Deep Slate
          card: '#0F172A',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
