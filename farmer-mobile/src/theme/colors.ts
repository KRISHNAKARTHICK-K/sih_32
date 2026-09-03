export const colors = {
  // Brand & Primary
  primary: '#15803D', // Emerald / Agricultural Green
  primaryDark: '#166534',
  primaryLight: '#22C55E',
  primaryMuted: '#DCFCE7',

  // Secondary & Accents
  secondary: '#0F766E', // Teal
  accent: '#EAB308', // Gold / Amber

  // Neutrals / Surfaces
  background: '#F8FAFC',
  card: '#FFFFFF',
  surface: '#F1F5F9',
  surfaceSubtle: '#F8FAFC',

  // Text
  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8', // Slate 400
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#E2E8F0', // Slate 200
  borderDark: '#CBD5E1', // Slate 300

  // Status / Feedback
  success: '#16A34A',
  successBackground: '#DCFCE7',
  warning: '#D97706',
  warningBackground: '#FEF3C7',
  error: '#DC2626',
  errorBackground: '#FEE2E2',
  info: '#0284C7',
  infoBackground: '#E0F2FE',

  // Interactive
  disabled: '#CBD5E1',
  disabledText: '#94A3B8',
  overlay: 'rgba(15, 23, 42, 0.5)',
} as const;

export type Colors = typeof colors;
