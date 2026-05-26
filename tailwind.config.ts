import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        pureGray: {
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
      },
      fontSize: {
        'responsive-xs': 'clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem)',
        'responsive-sm': 'clamp(0.875rem, 0.82rem + 0.25vw, 1rem)',
        'responsive-base': 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
        'responsive-lg': 'clamp(1.125rem, 1rem + 0.6vw, 1.5rem)',
        'responsive-xl': 'clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)',
        'responsive-2xl': 'clamp(2rem, 1.5rem + 2.5vw, 3.5rem)',
      },
      spacing: {
        'responsive-xs': 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
        'responsive-sm': 'clamp(0.5rem, 0.4rem + 0.5vw, 0.875rem)',
        'responsive-md': 'clamp(1rem, 0.8rem + 1vw, 1.5rem)',
        'responsive-lg': 'clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem)',
        'responsive-xl': 'clamp(2rem, 1.5rem + 2.5vw, 4rem)',
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
