/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wei: '#3B82F6',
        shu: '#EF4444',
        wu: '#10B981',
        neutral: '#F59E0B',
        gold: '#FBBF24',
      },
      fontFamily: {
        chinese: ['Ma Shan Zheng', 'cursive'],
      },
      animation: {
        'dice-roll': 'diceRoll 0.5s ease-in-out',
        'player-move': 'playerMove 0.3s ease-out',
        'card-flip': 'cardFlip 0.6s ease-in-out',
      },
      keyframes: {
        diceRoll: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(180deg)' },
        },
        playerMove: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
      },
    },
  },
  plugins: [],
}
