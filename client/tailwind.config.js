/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        abyss: {
          bg: '#0B0F19',
          card: '#151B2D',
          primary: '#7C3AED',
          gold: '#D4AF37',
          danger: '#EF4444',
          success: '#22C55E',
          muted: '#8A99AD',
          border: '#2C354D',
          hover: '#1F2943'
        }
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(124, 58, 237, 0.4)',
        'glow-gold': '0 0 15px rgba(212, 175, 55, 0.4)',
        'glow-success': '0 0 15px rgba(34, 197, 94, 0.4)',
        'glow-danger': '0 0 15px rgba(239, 68, 68, 0.4)',
      },
      fontFamily: {
        fantasy: ['Cinzel', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
