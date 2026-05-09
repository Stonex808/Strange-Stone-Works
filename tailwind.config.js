import typography from '@tailwindcss/typography';
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#070604',
        panel: '#11100D',
        border: '#2A261F',
        glow: '#FF8A18',
        highlight: '#DCA24A',
        warning: '#D13A20',
        text: '#C8BCA7'
      },
      fontFamily: {
        heading: ['Georgia', 'Times New Roman', 'serif'],
        ui: ['Trebuchet MS', 'Arial', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'monospace']
      },
      boxShadow: {
        ember: '0 0 40px rgba(255,138,24,.35)'
      },
      animation: {
        pulseSlow: 'pulse 4s ease-in-out infinite'
      }
    }
  },
  plugins: [typography]
};
