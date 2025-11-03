export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'field-dark': '#1a1625',
        'field-green': '#2d5016',
        'field-accent': '#7c3aed',
      },
      animation: {
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce 1s infinite',
      }
    },
  },
  plugins: [],
}
