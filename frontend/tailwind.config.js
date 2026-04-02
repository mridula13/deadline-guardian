/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Warm pastel palette
        blush:   { 50:'#fff0f3', 100:'#ffe0e8', 200:'#ffc2d1', 300:'#ff94ab', 400:'#ff5c80', DEFAULT:'#ff5c80' },
        peach:   { 50:'#fff7ed', 100:'#ffedd5', 200:'#fed7aa', 300:'#fdba74', 400:'#fb923c', DEFAULT:'#fdba74' },
        lavender:{ 50:'#f5f3ff', 100:'#ede9fe', 200:'#ddd6fe', 300:'#c4b5fd', 400:'#a78bfa', DEFAULT:'#c4b5fd' },
        mint:    { 50:'#f0fdf4', 100:'#dcfce7', 200:'#bbf7d0', 300:'#86efac', 400:'#4ade80', DEFAULT:'#86efac' },
        sand:    { 50:'#fefce8', 100:'#fef9c3', 200:'#fef08a', 300:'#fde047', DEFAULT:'#fef08a' },
        rose:    { 50:'#fff1f2', 100:'#ffe4e6', 200:'#fecdd3', DEFAULT:'#fecdd3' },
        cream:   { DEFAULT:'#fdf6f0', dark:'#f7ece1' },
        // Urgency
        urgent:  { DEFAULT:'#ff4757', light:'#fff0f1', border:'#ffa0a8' },
        warning: { DEFAULT:'#ff7f50', light:'#fff4ef', border:'#ffb899' },
        safe:    { DEFAULT:'#2ed573', light:'#f0fdf4', border:'#86efac' },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft':   '0 2px 20px rgba(0,0,0,0.06)',
        'warm':   '0 4px 24px rgba(255,140,100,0.12)',
        'glow-r': '0 0 20px rgba(255,71,87,0.2)',
        'glow-o': '0 0 20px rgba(255,127,80,0.2)',
        'glow-g': '0 0 20px rgba(46,213,115,0.15)',
      },
      animation: {
        'fade-in':  'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from:{ opacity:0 }, to:{ opacity:1 } },
        slideUp:   { from:{ opacity:0, transform:'translateY(24px)' }, to:{ opacity:1, transform:'translateY(0)' } },
        pulseSoft: { '0%,100%':{ opacity:1 }, '50%':{ opacity:0.6 } },
      },
    },
  },
  plugins: [],
}
