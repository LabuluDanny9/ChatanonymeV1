/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* Charte bleu/blanc — moderne */
        'chat-bg': '#ffffff',
        'chat-surface': '#f8fafc',
        'chat-primary': '#2563eb',
        'chat-accent': '#0ea5e9',
        'chat-offwhite': '#1e293b',
        'chat-muted': '#64748b',
        'chat-danger': '#ef4444',
        'chat-success': '#22c55e',
        'chat-border': '#e2e8f0',
        /* Compatibilité */
        'corum-blue': '#2563eb',
        'corum-night': '#f1f5f9',
        'corum-turquoise': '#0ea5e9',
        'corum-offwhite': '#1e293b',
        'corum-gray': '#64748b',
        'corum-red': '#ef4444',
        'bg-main': '#ffffff',
        'bg-card': '#ffffff',
        primary: '#2563eb',
        accent: '#0ea5e9',
        danger: '#ef4444',
        success: '#22c55e',
        'text-main': '#1e293b',
        muted: '#64748b',
      },
      spacing: {
        4.5: '18px',
      },
      fontSize: {
        h1: ['32px', { lineHeight: '1.2' }],
        h2: ['24px', { lineHeight: '1.3' }],
        h3: ['18px', { lineHeight: '1.4' }],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(37, 99, 235, 0.1), 0 4px 6px -4px rgba(37, 99, 235, 0.1)',
        'primary': '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '600ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(.4,0,.2,1)',
      },
    },
  },
  plugins: [],
};
