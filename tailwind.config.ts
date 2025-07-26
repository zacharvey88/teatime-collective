import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        lobster: ['var(--font-lobster)', 'cursive'],
        'poppins': ['var(--font-poppins)', 'sans-serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        cream: '#FFFBF0',
        'light-cream': '#FFF5E0',
        orange: {
          DEFAULT: 'var(--primary-color)',
          50: 'color-mix(in srgb, var(--primary-color) 5%, white)',
          100: 'color-mix(in srgb, var(--primary-color) 10%, white)',
          200: 'color-mix(in srgb, var(--primary-color) 20%, white)',
          300: 'color-mix(in srgb, var(--primary-color) 30%, white)',
          400: 'color-mix(in srgb, var(--primary-color) 40%, white)',
          500: 'var(--primary-color)',
          600: 'color-mix(in srgb, var(--primary-color) 60%, black)',
          700: 'color-mix(in srgb, var(--primary-color) 70%, black)',
          800: 'color-mix(in srgb, var(--primary-color) 80%, black)',
          900: 'color-mix(in srgb, var(--primary-color) 90%, black)',
          950: 'color-mix(in srgb, var(--primary-color) 95%, black)',
        },
        dark: '#000000',
        gray: '#383838',
        'light-gray': '#999999',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config