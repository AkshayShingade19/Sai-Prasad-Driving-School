/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary - deep, rich navy for trust & authority
        navy: {
          50: '#f4f7fa',
          100: '#e6edf4',
          200: '#c7d6e4',
          300: '#9bb3cc',
          400: '#6a8cad',
          500: '#4a6e92',
          600: '#395674',
          700: '#2e455e',
          800: '#1b2d40',
          900: '#0e1f2f',
          950: '#071320',
        },
        // Primary action - refined emerald
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Secondary premium accent - warm gold
        gold: {
          50: '#fdf9ef',
          100: '#faf0d5',
          200: '#f4dfaa',
          300: '#ecc87a',
          400: '#e5b452',
          500: '#d99f36',
          600: '#c07f26',
          700: '#9c6022',
          800: '#804d24',
          900: '#6a4022',
        },
        ink: {
          DEFAULT: '#071320',
          soft: '#2e455e',
          muted: '#5b7a99',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-sm': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'display-lg': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.035em' }],
        'title-lg': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'title-md': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.015em' }],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(7 19 32 / 0.05)',
        sm: '0 1px 3px 0 rgb(7 19 32 / 0.08), 0 1px 2px -1px rgb(7 19 32 / 0.06)',
        md: '0 4px 12px -2px rgb(7 19 32 / 0.10), 0 2px 6px -2px rgb(7 19 32 / 0.06)',
        lg: '0 12px 28px -6px rgb(7 19 32 / 0.14), 0 4px 10px -4px rgb(7 19 32 / 0.08)',
        xl: '0 24px 48px -12px rgb(7 19 32 / 0.20), 0 8px 16px -8px rgb(7 19 32 / 0.10)',
        '2xl': '0 32px 64px -16px rgb(7 19 32 / 0.26), 0 12px 24px -12px rgb(7 19 32 / 0.12)',
        accent: '0 8px 24px -6px rgb(5 150 105 / 0.40)',
        'accent-lg': '0 14px 34px -8px rgb(5 150 105 / 0.48)',
        gold: '0 8px 24px -6px rgb(192 127 38 / 0.35)',
        inset: 'inset 0 1px 0 0 rgb(255 255 255 / 0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      maxWidth: {
        prose: '68ch',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      backgroundImage: {
        'premium-gradient': 'linear-gradient(135deg, #071320 0%, #1b2d40 45%, #0e1f2f 100%)',
        'accent-gradient': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gold-gradient': 'linear-gradient(135deg, #ecc87a 0%, #c07f26 100%)',
        'sheen': 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.6s ease both',
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
