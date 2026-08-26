/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand — crop green (like paddy/wheat leaves)
        brand: {
          50:  '#f3ffe0',
          100: '#e3fbb8',
          200: '#c8f578',
          300: '#a6e635',
          400: '#84cc16',
          500: '#65a30d',
          600: '#4d7c0f',
          700: '#3a5c0a',
          800: '#294207',
          900: '#1a2e04',
          950: '#0e1a02',
        },
        // Earth tones — soil, bark, clay
        earth: {
          50:  '#fdf8f0',
          100: '#f9edda',
          200: '#f1d9b0',
          300: '#e3be7e',
          400: '#d49a48',
          500: '#b87828',
          600: '#8f5a1a',
          700: '#6b4112',
          800: '#4e2f0d',
          900: '#361f08',
          950: '#1e1004',
        },
        // Harvest gold — sun, wheat, ripe crops
        harvest: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Dawn sky — morning mist, irrigation water
        dawn: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Forest greens — deeper shade/tree tones
        forest: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Custom slate (dark soil, night sky)
        slate: {
          850: '#121a0f',
          900: '#0c1509',
          950: '#060e04',
        }
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Merriweather', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'crop-rows': "repeating-linear-gradient(90deg, transparent 0 44px, rgba(163,230,53,0.12) 45px 46px, transparent 47px 90px)",
        'soil-texture': "radial-gradient(ellipse at 50% 100%, rgba(78,45,12,0.35), transparent 60%)",
        'dawn-sky': "linear-gradient(180deg, rgba(253,186,116,0.20), rgba(251,191,36,0.10), transparent 40%)",
      },
      boxShadow: {
        'glass':     '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        'premium':   '0 12px 36px -6px rgba(0, 0, 0, 0.45)',
        'glow':      '0 0 28px rgba(101, 163, 28, 0.20)',
        'glow-gold': '0 0 28px rgba(245, 158, 11, 0.22)',
        'glow-earth':'0 0 24px rgba(120, 60, 10, 0.18)',
        'leaf':      '0 4px 18px rgba(34, 90, 14, 0.25)',
      },
      animation: {
        'sway':    'swayLeaf 4s ease-in-out infinite',
        'sunrise': 'sunrisePulse 3.5s ease-in-out infinite',
        'breeze':  'fieldBreeze 22s ease-in-out infinite alternate',
      },
      borderRadius: {
        'leaf': '70% 30% 60% 40% / 40% 60% 30% 70%',
      },
    },
  },
  plugins: [],
}
