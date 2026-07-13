/**
 * Centralized Design System for The Abyss Protocol
 */
export const theme = {
  colors: {
    bg: '#0B0F19',
    card: '#151B2D',
    primary: '#7C3AED',
    gold: '#D4AF37',
    danger: '#EF4444',
    success: '#22C55E',
    muted: '#8A99AD',
    border: '#2C354D',
    hover: '#1F2943'
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem',     // 48px
    layout: '1.5rem' // Standard outer container padding
  },
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    full: '9999px'
  },
  shadows: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
    glowPrimary: '0 0 15px rgba(124, 58, 237, 0.4)',
    glowGold: '0 0 15px rgba(212, 175, 55, 0.4)',
    glowSuccess: '0 0 15px rgba(34, 197, 94, 0.4)',
    glowDanger: '0 0 15px rgba(239, 68, 68, 0.4)'
  },
  animations: {
    timing: {
      fast: 0.15,
      normal: 0.3,
      slow: 0.5
    },
    hoverLift: {
      y: -4,
      transition: { duration: 0.2, ease: 'easeOut' }
    }
  },
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    toast: 100
  }
};
