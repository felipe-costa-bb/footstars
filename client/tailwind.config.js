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
        'pitch-dark': '#0a1a2f', // Deep night blue
        'pitch-green': '#00ff41', // Electric green
        'stadium-blue': '#1e3a8a',
        'card-gold': '#ffd700',
        'card-silver': '#c0c0c0',
        'card-bronze': '#cd7f32',
      },
      fontFamily: {
        sports: ['Montserrat', 'sans-serif'],
        display: ['Oswald', 'sans-serif'],
      },
      backgroundImage: {
        'stadium': "url('/assets/stadium-bg.jpg')",
      },
      animation: {
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce 1s infinite',
      }
    },
  },
  plugins: [],
}
