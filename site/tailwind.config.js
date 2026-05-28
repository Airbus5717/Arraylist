/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,md}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        paper: 'var(--color-paper)',
        ink: 'var(--color-ink)',
        accent: 'var(--color-accent)',
      },
    },
  },
  plugins: [],
}
