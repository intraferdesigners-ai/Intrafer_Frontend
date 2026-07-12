/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#B5541E',
          dark:    '#8B3F16',
          light:   '#F5EBE5',
          bg:      '#FDF0E8',
        },
        warm: {
          50:  '#FAFAF8',
          100: '#F5F0EA',
          200: '#EDE8E0',
          300: '#E0D9CE',
          400: '#C8BFB0',
          500: '#A89E8E',
          600: '#6B6760',
          700: '#4A4844',
          800: '#2A2826',
          900: '#1A1A18',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm:    '8px',
        md:    '12px',
        lg:    '16px',
        xl:    '20px',
        '2xl': '28px',
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(26,26,24,.06)',
        'warm-md': '0 4px 12px rgba(26,26,24,.08)',
        'warm-lg': '0 12px 32px rgba(26,26,24,.1)',
      },
    },
  },
  plugins: [],
};
