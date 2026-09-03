import React from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme';
import { AppText } from './AppText';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      )}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          error ? styles.inputError : null,
          style,
        ]}
        {...props}
      />
      {error ? (
        <AppText variant="caption" style={styles.errorText}>
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" style={styles.helperText}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
  },
  input: {
    height: theme.layout.inputHeight,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  helperText: {
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});
