/**
 * SILENCEHUB Design Tokens — Tailwind CSS mapping
 * Importer dans tailwind.config.js : theme.extend
 */

module.exports = {
  colors: {
    primary: {
      900: '#081F2C',
      800: '#0B3C5D',
      600: '#0FA3B1',
      400: '#22D3EE',
    },
    neutral: {
      900: '#0B0F19',
      800: '#1F2937',
      600: '#4B5563',
      400: '#9CA3AF',
      200: '#E5E7EB',
      100: '#F5F7FA',
    },
    semantic: {
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
  fontFamily: {
    sans: ['Proxima Nova', 'Inter', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    display: ['40px', { lineHeight: '48px' }],
    h1: ['32px', { lineHeight: '40px' }],
    h2: ['24px', { lineHeight: '32px' }],
    h3: ['18px', { lineHeight: '26px' }],
    body: ['16px', { lineHeight: '24px' }],
    small: ['14px', { lineHeight: '20px' }],
    caption: ['12px', { lineHeight: '16px' }],
  },
  spacing: {
    4: '4px',
    8: '8px',
    12: '12px',
    16: '16px',
    24: '24px',
    32: '32px',
    40: '40px',
    48: '48px',
    64: '64px',
    96: '96px',
  },
  borderRadius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  boxShadow: {
    'elevation-1': '0 1px 3px rgba(0,0,0,0.12)',
    'elevation-2': '0 4px 12px rgba(0,0,0,0.15)',
    'elevation-3': '0 0 40px rgba(0,0,0,0.2)',
  },
  backdropBlur: {
    glass: '12px',
  },
};
