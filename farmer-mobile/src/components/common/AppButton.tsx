import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../theme';
import { AppText } from './AppText';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isInteractive = !disabled && !loading;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? theme.colors.primary : theme.colors.textInverse}
        />
      ) : (
        <AppText
          style={[
            styles.baseText,
            styles[`${variant}Text`],
            styles[`sizeText_${size}`],
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  danger: {
    backgroundColor: theme.colors.error,
  },
  disabledButton: {
    backgroundColor: theme.colors.disabled,
    borderColor: theme.colors.disabled,
  },
  size_sm: {
    height: 36,
    paddingHorizontal: theme.spacing.md,
  },
  size_md: {
    height: theme.layout.buttonHeight,
    paddingHorizontal: theme.spacing.lg,
  },
  size_lg: {
    height: 54,
    paddingHorizontal: theme.spacing.xl,
  },
  baseText: {
    fontWeight: theme.fontWeights.semibold,
  },
  primaryText: {
    color: theme.colors.textInverse,
  },
  secondaryText: {
    color: theme.colors.textInverse,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  dangerText: {
    color: theme.colors.textInverse,
  },
  disabledText: {
    color: theme.colors.disabledText,
  },
  sizeText_sm: {
    fontSize: theme.fontSizes.sm,
  },
  sizeText_md: {
    fontSize: theme.fontSizes.md,
  },
  sizeText_lg: {
    fontSize: theme.fontSizes.lg,
  },
});

export default AppButton;
