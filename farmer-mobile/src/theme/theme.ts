import { colors } from './colors';
import { fontSizes, fontWeights, lineHeights } from './typography';
import { spacing, borderRadius } from './spacing';

export const theme = {
  colors,
  fontSizes,
  fontWeights,
  lineHeights,
  spacing,
  borderRadius,
  layout: {
    screenPadding: spacing.lg,
    cardPadding: spacing.lg,
    inputHeight: 48,
    buttonHeight: 48,
    iconSizeSm: 16,
    iconSizeMd: 24,
    iconSizeLg: 32,
  },
} as const;

export type Theme = typeof theme;
