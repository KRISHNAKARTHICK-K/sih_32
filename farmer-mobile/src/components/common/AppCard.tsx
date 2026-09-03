import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, ViewProps } from 'react-native';
import { theme } from '../../theme';

export interface AppCardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
  style?: StyleProp<ViewStyle>;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  variant = 'elevated',
  style,
  ...props
}) => {
  return (
    <View style={[styles.card, styles[variant], style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.layout.cardPadding,
    marginVertical: theme.spacing.xs,
  },
  elevated: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  flat: {
    backgroundColor: theme.colors.surface,
  },
});

export default AppCard;
