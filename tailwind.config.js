/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          container: 'hsl(var(--primary-container))',
          'on-primary': 'hsl(var(--on-primary))',
          'on-primary-container': 'hsl(var(--on-primary-container))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          container: 'hsl(var(--secondary-container))',
          'on-secondary': 'hsl(var(--on-secondary))',
          'on-secondary-container': 'hsl(var(--on-secondary-container))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Material Design 3 colors
        'm3-surface': 'hsl(var(--m3-surface))',
        'm3-surface-container': 'hsl(var(--m3-surface-container))',
        'm3-surface-container-high': 'hsl(var(--m3-surface-container-high))',
        'm3-surface-container-highest': 'hsl(var(--m3-surface-container-highest))',
        'm3-on-surface': 'hsl(var(--m3-on-surface))',
        'm3-on-surface-variant': 'hsl(var(--m3-on-surface-variant))',
        'm3-outline': 'hsl(var(--m3-outline))',
        'm3-outline-variant': 'hsl(var(--m3-outline-variant))',
        'm3-primary': 'hsl(var(--m3-primary))',
        'm3-on-primary': 'hsl(var(--m3-on-primary))',
        'm3-primary-container': 'hsl(var(--m3-primary-container))',
        'm3-on-primary-container': 'hsl(var(--m3-on-primary-container))',
        'm3-secondary': 'hsl(var(--m3-secondary))',
        'm3-on-secondary': 'hsl(var(--m3-on-secondary))',
        'm3-secondary-container': 'hsl(var(--m3-secondary-container))',
        'm3-on-secondary-container': 'hsl(var(--m3-on-secondary-container))',
        'm3-tertiary': 'hsl(var(--m3-tertiary))',
        'm3-on-tertiary': 'hsl(var(--m3-on-tertiary))',
        'm3-tertiary-container': 'hsl(var(--m3-tertiary-container))',
        'm3-on-tertiary-container': 'hsl(var(--m3-on-tertiary-container))',
        'm3-error': 'hsl(var(--m3-error))',
        'm3-on-error': 'hsl(var(--m3-on-error))',
        'm3-error-container': 'hsl(var(--m3-error-container))',
        'm3-on-error-container': 'hsl(var(--m3-on-error-container))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
      },
      fontFamily: {
        'sans': ['Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('tailwindcss-animate')],
}