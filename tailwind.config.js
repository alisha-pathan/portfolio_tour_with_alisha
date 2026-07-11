/** 
 * @file tailwind.config.js
 * @description Tailwind CSS v3.4.1 configuration for the desert mountain portfolio theme.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },

      colors: {
        portfolio: {
          bg: '#1a0802',
          panel: '#3a1206',
          accent: '#ffd27a',
          orange: '#ff8a2a',
          sand: '#f6a23a',
          cream: '#fff3dd',
          muted: '#f7c98b',
        },
      },

      boxShadow: {
        eagle:
          '0 12px 22px rgba(50, 10, 2, 0.35), 0 0 16px rgba(255, 196, 95, 0.28)',
        glow: '0 0 40px rgba(255, 153, 51, 0.2)',
      },

      keyframes: {
        eagleFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-9px)' },
        },

        awakenPulse: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(0.88)' },
          '50%': { opacity: '0.8', transform: 'scale(1.08)' },
        },

        scrollBounce: {
          '0%, 100%': {
            transform: 'rotate(45deg) translateY(0)',
            opacity: '0.45',
          },
          '50%': {
            transform: 'rotate(45deg) translateY(7px)',
            opacity: '1',
          },
        },

        peakPulse: {
          '0%, 100%': {
            transform: 'scale(0.85)',
            opacity: '0.45',
          },
          '50%': {
            transform: 'scale(1.28)',
            opacity: '1',
          },
        },

        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },

      animation: {
        eagleFloat: 'eagleFloat 3.2s ease-in-out infinite',
        awakenPulse: 'awakenPulse 2.4s ease-in-out infinite',
        scrollBounce: 'scrollBounce 1.5s ease infinite',
        peakPulse: 'peakPulse 2.8s ease-in-out infinite',
        shimmer: 'shimmer 4s linear infinite',
      },
    },
  },

  plugins: [],
};