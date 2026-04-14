import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#FAF8F5',
          secondary: '#F2EDE8',
          dark: '#1C1815',
        },
        accent: {
          DEFAULT: '#C9A882',
          light: '#E8D5BE',
          dark: '#8B6E4E',
        },
        text: {
          primary: '#1C1815',
          secondary: '#6B5D52',
          muted: '#A89385',
          inverse: '#FAF8F5',
        },
        border: {
          DEFAULT: 'rgba(140,110,90,0.15)',
          strong: 'rgba(140,110,90,0.30)',
        },
        success: {
          DEFAULT: '#4A7C59',
          bg: '#EAF2ED',
        },
        warning: {
          DEFAULT: '#9B7B2E',
          bg: '#FDF4DC',
        },
        danger: {
          DEFAULT: '#8B3A3A',
          bg: '#FAEAEA',
        },
        info: {
          DEFAULT: '#2B5F8E',
          bg: '#EAF2FB',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Gowun Batang', 'Georgia', ...fontFamily.serif],
        body: ['var(--font-body)', 'Noto Sans', 'system-ui', ...fontFamily.sans],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
