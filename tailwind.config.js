export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pyr: {
          light: '#f87171',
          DEFAULT: '#ef4444',
          dark: '#991b1b',
        },
        aqua: {
          light: '#38bdf8',
          DEFAULT: '#06b6d4',
          dark: '#0e7490',
        },
        terra: {
          light: '#4ade80',
          DEFAULT: '#10b981',
          dark: '#065f46',
        },
        nox: {
          light: '#c084fc',
          DEFAULT: '#a855f7',
          dark: '#581c87',
        },
        dungeon: {
          900: '#0a0a0f',
          800: '#12131c',
          700: '#1b1c2b',
          600: '#26283d',
          border: '#32354f',
        }
      },
      fontFamily: {
        fantasy: ['Cinzel', 'serif', 'system-ui'],
      }
    },
  },
  plugins: [],
}
