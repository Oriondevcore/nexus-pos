/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core palette
        obsidian:  { DEFAULT: '#080808', 900: '#080808', 800: '#0d0d0d', 700: '#141414', 600: '#1a1a1a', 500: '#242424' },
        gold:      { DEFAULT: '#c9a84c', bright: '#f0c040', dim: '#7a6020', glow: 'rgba(201,168,76,0.15)', subtle: 'rgba(201,168,76,0.06)' },
        // Status
        success:   '#2ecc71',
        warning:   '#f39c12',
        danger:    '#e74c3c',
        info:      '#3a7bd5',
      },
      fontFamily: {
        display:  ['Cormorant Garamond', 'Georgia', 'serif'],
        mono:     ['DM Mono', 'Courier New', 'monospace'],
        sans:     ['Syne', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up':      'fadeUp 0.5s ease forwards',
        'fade-in':      'fadeIn 0.4s ease forwards',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'shimmer':      'shimmer 2s ease-in-out infinite',
        'spin-slow':    'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp:    { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        glowPulse: { '0%,100%': { boxShadow: '0 0 10px rgba(201,168,76,0.15)' }, '50%': { boxShadow: '0 0 30px rgba(201,168,76,0.35)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
      },
      boxShadow: {
        'gold-sm':  '0 2px 12px rgba(201,168,76,0.2)',
        'gold-md':  '0 4px 24px rgba(201,168,76,0.25)',
        'gold-lg':  '0 8px 40px rgba(201,168,76,0.3)',
        'inner-gold': 'inset 0 1px 0 rgba(201,168,76,0.2)',
      },
      backgroundImage: {
        'gold-gradient':  'linear-gradient(135deg, #7a6020 0%, #c9a84c 50%, #f0c040 75%, #c9a84c 100%)',
        'dark-gradient':  'linear-gradient(180deg, #0d0d0d 0%, #080808 100%)',
        'card-gradient':  'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
}
