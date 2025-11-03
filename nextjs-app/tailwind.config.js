/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Material Design 3 colors
        'm3-primary': '#6750A4',
        'm3-on-primary': '#FFFFFF',
        'm3-primary-container': '#EADDFF',
        'm3-on-primary-container': '#21005D',
        'm3-secondary': '#625B71',
        'm3-on-secondary': '#FFFFFF',
        'm3-secondary-container': '#E8DEF8',
        'm3-on-secondary-container': '#1D192B',
        'm3-tertiary': '#7D5260',
        'm3-on-tertiary': '#FFFFFF',
        'm3-tertiary-container': '#FFD8E4',
        'm3-on-tertiary-container': '#31111D',
        'm3-error': '#BA1A1A',
        'm3-on-error': '#FFFFFF',
        'm3-error-container': '#FFDAD6',
        'm3-on-error-container': '#410002',
        'm3-background': '#FFFBFE',
        'm3-on-background': '#1C1B1F',
        'm3-surface': '#FFFBFE',
        'm3-on-surface': '#1C1B1F',
        'm3-surface-variant': '#E7E0EC',
        'm3-on-surface-variant': '#49454F',
        'm3-outline': '#79747E',
        'm3-outline-variant': '#CAC4D0',
        'm3-shadow': '#000000',
        'm3-scrim': '#000000',
        'm3-inverse-surface': '#313033',
        'm3-inverse-on-surface': '#F4EFF4',
        'm3-inverse-primary': '#D0BCFF',
        'm3-surface-dim': '#DDD8DD',
        'm3-surface-bright': '#FFFBFE',
        'm3-surface-container-lowest': '#FFFFFF',
        'm3-surface-container-low': '#F7F2FA',
        'm3-surface-container': '#F3EDF7',
        'm3-surface-container-high': '#ECE6F0',
        'm3-surface-container-highest': '#E6E0E9',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}