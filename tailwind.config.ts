import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#fff5f2',
          100: '#ffe8e0',
          200: '#ffc9b8',
          300: '#ffa48a',
          400: '#ff7a57',
          500: '#ff5733',
          600: '#e83e1a',
          700: '#c12e11',
          800: '#9a2712',
          900: '#7d2314',
        },
        sage: {
          50: '#f6f7f4',
          100: '#e8eae2',
          200: '#d2d6c7',
          300: '#b3baa3',
          400: '#939d80',
          500: '#768163',
          600: '#5d674e',
          700: '#495140',
          800: '#3d4336',
          900: '#343a2f',
        },
        cream: '#faf8f5',
        warmgray: {
          50: '#faf9f7',
          100: '#f0eeeb',
          200: '#e2dfd9',
          300: '#ccc8bf',
          400: '#b3ada1',
          500: '#9c958a',
          600: '#857e73',
          700: '#6e6860',
          800: '#5c5751',
          900: '#4d4945',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
