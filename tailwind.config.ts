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
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#059669',
          600: '#047857',
          700: '#065F46',
          800: '#064E3B',
          900: '#053F32',
        },
        navy: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#059669',
          600: '#047857',
          700: '#065F46',
          800: '#064E3B',
          900: '#053F32',
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
        cream: '#FFFFFF',
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
