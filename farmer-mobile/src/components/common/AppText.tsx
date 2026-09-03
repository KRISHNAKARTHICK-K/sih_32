import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { theme } from '../../theme';

export interface AppTextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color,
  weight,
  align,
  style,
  children,
  ...props
}) => {
  const variantStyles = styles[variant] || styles.body;
  const customStyle: TextStyle = {
    ...(color ? { color } : {}),
    ...(weight ? { fontWeight: theme.fontWeights[weight] } : {}),
    ...(align ? { textAlign: align } : {}),
  };

  return (
    <RNText style={[styles.base, variantStyles, customStyle, style]} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    color: theme.colors.textPrimary,
  },
  h1: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: theme.fontWeights.bold,
    lineHeight: theme.fontSizes.xxl * theme.lineHeights.tight,
  },
  h2: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    lineHeight: theme.fontSizes.xl * theme.lineHeights.tight,
  },
  h3: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    lineHeight: theme.fontSizes.lg * theme.lineHeights.tight,
  },
  body: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.regular,
    lineHeight: theme.fontSizes.md * theme.lineHeights.normal,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.textSecondary,
  },
  caption: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.regular,
    color: theme.colors.textMuted,
  },
});

export default AppText;
