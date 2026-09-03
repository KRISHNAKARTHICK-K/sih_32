import { TextStyle } from 'react-native';

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
} as const;

export const fontWeights: Record<string, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
};

export const lineHeights = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
} as const;
