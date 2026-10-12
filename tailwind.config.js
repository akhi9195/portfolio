/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        term: 'var(--term)',
        dim: 'var(--dim)',
        accent: 'var(--accent)',
        line: 'var(--line)',
      },
    },
  },
  plugins: [],
};
