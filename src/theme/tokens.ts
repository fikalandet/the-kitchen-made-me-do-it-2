export const colors = {
  primary: {
    green: '#a1c798',
    cyan: '#56c5c5',
    black: '#000000',
    white: '#FFFFFF',
  },
  status: {
    open: '#a1c798',
    soon: '#F6C445',
    closed: '#D9D9D9',
  },
  text: {
    primary: '#000000',
    secondary: '#666666',
    onDark: '#FFFFFF',
    onGreen: '#0B2B13',
  },
  background: {
    card: '#FFFFFF',
    lightGreen: '#cfe5d2',
    lightGray: '#D9D9D9',
  },
  discount: '#56c5c5',
  originalPrice: '#999999',
} as const;

export const typography = {
  fonts: {
    display: "'Lobster', cursive",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  },
  sizes: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
} as const;

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  full: '9999px',
} as const;

export const shadows = {
  card: '0 3px 10px rgba(0, 0, 0, 0.10)',
  cardHover: '0 6px 16px rgba(0, 0, 0, 0.12)',
} as const;

export const transitions = {
  fast: '160ms ease-out',
} as const;
