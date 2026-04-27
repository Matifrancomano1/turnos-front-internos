/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Outfit"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
        display: ['"Cabinet Grotesk"', '"Outfit"', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#1E2D5E',
          dark:    '#141f42',
          light:   '#2a3d7a',
        },
      },
      keyframes: {
        'fade-up':   { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'none' } },
        'fade-in':   { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in':  { from: { opacity: '0', transform: 'translateX(-8px)' }, to: { opacity: '1', transform: 'none' } },
        'scale-in':  { from: { opacity: '0', transform: 'scale(0.97)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'step-done': { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.2)' }, '100%': { transform: 'scale(1)' } },
      },
      animation: {
        'fade-up':   'fade-up 0.35s ease-out both',
        'fade-in':   'fade-in 0.25s ease-out both',
        'slide-in':  'slide-in 0.2s ease-out both',
        'scale-in':  'scale-in 0.3s ease-out both',
        'step-done': 'step-done 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
