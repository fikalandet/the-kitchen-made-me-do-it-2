/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#a1c798',
        section: '#f6f2e0',
        button: '#56c5c5',
      },
      fontFamily: {
        lobster: ['Lobster', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
