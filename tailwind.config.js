/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FCF9F2',
          100: '#F6F0E4',
          200: '#ECE2CE',
          300: '#DFCFB2',
          800: '#2C2621',
          900: '#1D1916',
        },
        ink: {
          DEFAULT: '#1E1B18',
          muted: '#5C5349',
          subtle: '#8A7E72',
        },
        accent: {
          amber: '#B45309',
          terracotta: '#9A3412',
          sage: '#3F6212',
        }
      },
      fontFamily: {
        serif: ['"Newsreader"', '"Noto Serif JP"', '"Noto Serif KR"', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
