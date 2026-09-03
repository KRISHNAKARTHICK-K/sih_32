import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

export interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  style?: ViewStyle;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryText = 'Try Again',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.badge}>
        <AppText variant="h3" color={theme.colors.error}>
          !
        </AppText>
      </View>
      <AppText variant="h3" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="body" color={theme.colors.textSecondary} style={styles.message}>
        {message}
      </AppText>
      {onRetry && (
        <AppButton
          title={retryText}
          onPress={onRetry}
          variant="primary"
          size="sm"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.errorBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  message: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  button: {
    minWidth: 140,
  },
});
