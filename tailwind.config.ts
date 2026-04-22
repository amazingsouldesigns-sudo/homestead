import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          cyan: '#5eead4',
          'cyan-dim': '#2dd4bf',
          violet: '#a78bfa',
          deep: '#0a0f1a',
        },
        brand: {
          50: '#f0f7f4',
          100: '#d9ede3',
          200: '#b5dbca',
          300: '#85c1a9',
          400: '#5aa386',
          500: '#3a876b',
          600: '#2b6c55',
          700: '#245745',
          800: '#1f4639',
          900: '#1b3a30',
          950: '#0d201b',
        },
        sand: {
          50: '#faf8f5',
          100: '#f3efe8',
          200: '#e6ddd0',
          300: '#d5c7b2',
          400: '#c2ab90',
          500: '#b3957a',
          600: '#a6836b',
          700: '#8b6c59',
          800: '#72594c',
          900: '#5e4a40',
          950: '#322621',
        },
        slate: {
          925: '#0d1520',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      letterSpacing: {
        futuristic: '0.22em',
        widecaps: '0.12em',
      },
      boxShadow: {
        glow: '0 0 48px -12px rgba(58, 135, 107, 0.35), 0 0 80px -24px rgba(34, 197, 94, 0.12)',
        'glow-brand': '0 0 32px -8px rgba(58, 135, 107, 0.55), 0 0 48px -12px rgba(74, 222, 128, 0.2)',
        'glow-tight': '0 0 18px -4px rgba(74, 222, 128, 0.45)',
        'glass-elevate':
          '0 8px 32px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(58, 135, 107, 0.12)',
      },
      backgroundImage: {
        'grid-fine':
          'linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
