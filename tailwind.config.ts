import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['"SF Pro"', '-apple-system', 'BlinkMacSystemFont', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Consolas', 'monospace'],
        display: ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.7', letterSpacing: '0.0125em' }],
        'lg': ['1.125rem', { lineHeight: '1.7', letterSpacing: '0.0125em' }],
        'xl': ['1.25rem', { lineHeight: '1.7', letterSpacing: '0.0125em' }],
        '2xl': ['1.5rem', { lineHeight: '1.6', letterSpacing: '0.0125em' }],
        '3xl': ['1.875rem', { lineHeight: '1.5', letterSpacing: '0.0125em' }],
        '4xl': ['2.25rem', { lineHeight: '1.4', letterSpacing: '0.0125em' }],
        '5xl': ['3rem', { lineHeight: '1.3', letterSpacing: '0.0125em' }],
        '6xl': ['3.75rem', { lineHeight: '1.2', letterSpacing: '0.0125em' }],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))'
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))'
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))'
        },
        purple: 'hsl(var(--purple))',
        teal: 'hsl(var(--teal))',
        orange: 'hsl(var(--orange))',
        aqua: 'hsl(var(--aqua))',
        mint: 'hsl(var(--mint))',
        coral: 'hsl(var(--coral))',
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '48px',
        '4xl': '64px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1.5rem',
        '2xl': '1.75rem',
        '3xl': '2rem'
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
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'glass-morph': {
          '0%': { 
            backdropFilter: 'blur(8px)',
            transform: 'scale(1)'
          },
          '50%': { 
            backdropFilter: 'blur(24px)',
            transform: 'scale(1.02)'
          },
          '100%': { 
            backdropFilter: 'blur(8px)',
            transform: 'scale(1)'
          },
        },
        'glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px hsl(var(--accent) / 0.3)'
          },
          '50%': { 
            boxShadow: '0 0 40px hsl(var(--accent) / 0.6)'
          },
        },
        'neon-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px hsl(var(--accent) / 0.4), 0 0 40px hsl(var(--accent) / 0.2)'
          },
          '50%': {
            boxShadow: '0 0 30px hsl(var(--accent) / 0.6), 0 0 60px hsl(var(--accent) / 0.4)'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'slide-down': 'slide-down 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.6s ease-out',
        'fade-in': 'fade-in 0.8s ease-out',
        'glass-morph': 'glass-morph 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
