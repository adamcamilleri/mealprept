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
          50: '#fef6f2',
          100: '#fde8df',
          200: '#fcc9b5',
          300: '#f5a07e',
          400: '#ee7d50',
          500: '#E86C3A',
          600: '#d05a2a',
          700: '#ad4720',
          800: '#8c3a1c',
          900: '#733219',
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
        cream: '#FEFCF9',
        ink: '#32302F',
        warmgray: {
          50: '#faf9f7',
          100: '#f0eeeb',
          200: '#e0dcd6',
          300: '#c9c3ba',
          400: '#a8a196',
          500: '#908879',
          600: '#7a7264',
          700: '#625b51',
          800: '#32302F',
          900: '#282625',
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
