/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: '#3525cd',
        'on-primary': '#ffffff',
        'on-surface': '#191c1e',
        'on-surface-variant': '#464555',
        'surface': '#f8f9fb',
        'surface-container': '#edeef0',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f3f4f6',
        'outline-variant': '#c7c4d8',
        'secondary-container': '#fea619',
        'on-secondary-container': '#684000',
        'primary-fixed': '#e2dfff',
        'on-primary-fixed': '#0f0069',
        'primary-container': '#4f46e5',
        'on-primary-container': '#dad7ff',
        'tertiary': '#005338',
        'on-tertiary': '#ffffff',
        'tertiary-fixed': '#6ffbbe',
        'on-tertiary-fixed': '#002113',
        'error': '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        'success': '#10b981',
        'warning': '#f59e0b',
        'info': '#4f46e5',
        'danger': '#dc2626',
      },
      fontFamily: {
        sans: ['Nunito Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        sinhala: ['Noto Sans Sinhala', 'serif'],
      },
      fontSize: {
        'display-lg': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg': ['2rem', { lineHeight: '2.5rem', fontWeight: '800' }],
        'headline-lg-mobile': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '800' }],
        'headline-md': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
        'body-lg': ['1.25rem', { lineHeight: '1.875rem', fontWeight: '500' }],
        'body-md': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        'label-lg': ['1rem', { lineHeight: '1.5rem', fontWeight: '700' }],
        'button': ['1.25rem', { lineHeight: '1.5rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }],
      },
      fontWeight: {
        'extra-bold': 800,
        'bold': 700,
        'medium': 500,
      },
      spacing: {
        'unit': '0.5rem',
        'touch-target': '3rem',
      },
      borderRadius: {
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        'full': '9999px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'sm': '0 2px 4px rgba(0, 0, 0, 0.08)',
        'md': '0 4px 8px rgba(0, 0, 0, 0.1)',
        'lg': '0 12px 24px rgba(0, 0, 0, 0.12)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.04), 0 0 1px rgba(0, 0, 0, 0.1)',
        'interactive': '0 8px 16px rgba(79, 70, 229, 0.16)',
        'lift': '0 8px 16px rgba(0, 0, 0, 0.16)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        'pop-in': 'pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { opacity: '1' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(79, 70, 229, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(79, 70, 229, 0)' },
        },
      },
      maxWidth: {
        'container': '71.25rem',
      },
      minHeight: {
        'touch': '3rem',
      },
      minWidth: {
        'touch': '3rem',
      },
    },
  },
  plugins: [
    // Custom plugin for additional utilities
    function ({ addComponents, addUtilities }) {
      addComponents({
        '.container-max': {
          maxWidth: '71.25rem',
          marginLeft: 'auto',
          marginRight: 'auto',
        },
      });
      
      // Add custom text utility classes
      addUtilities({
        '.text-display-lg': {
          fontSize: '3rem',
          fontWeight: '800',
          lineHeight: '3.5rem',
        },
        '.text-headline-lg': {
          fontSize: '2rem',
          fontWeight: '800',
          lineHeight: '2.5rem',
        },
        '.text-headline-md': {
          fontSize: '1.5rem',
          fontWeight: '700',
          lineHeight: '2rem',
        },
        '.text-body-lg': {
          fontSize: '1.25rem',
          fontWeight: '500',
          lineHeight: '1.875rem',
        },
        '.text-body-md': {
          fontSize: '1.125rem',
          fontWeight: '500',
          lineHeight: '1.75rem',
        },
        '.text-label-lg': {
          fontSize: '1rem',
          fontWeight: '700',
          lineHeight: '1.5rem',
        },
      });
    },
  ],
};
