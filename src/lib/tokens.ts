// StayRight Design Tokens
// Source of truth: /docs/DESIGN.md shared rules

export const colors = {
  primary: '#006948',
  primaryGradientStart: '#006948',
  primaryGradientEnd: '#00855D',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceContainerLow: '#F3F4F5',
  textPrimary: '#191C1D',
  textSecondary: '#3D4A42',
  statusAmber: '#D97706',
  statusRed: '#BA1A1A',
} as const;

export const radius = {
  md: '0.75rem',
  lg: '1rem',
  full: '9999px',
} as const;

export const gradients = {
  primary: 'linear-gradient(135deg, #006948, #00855D)',
} as const;
