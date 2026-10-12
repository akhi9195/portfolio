/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: { 950: '#0b1020', 900: '#111831', 800: '#1a2342', 700: '#26315a' },
        mint: { 400: '#5eead4', 500: '#2dd4bf' },
        glow: '#fbbf24',
      },
    },
  },
  plugins: [],
};
