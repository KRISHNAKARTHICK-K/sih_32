import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <AppText variant="h2" color={theme.colors.textMuted}>
          ∅
        </AppText>
      </View>
      <AppText variant="h3" style={styles.title}>
        {title}
      </AppText>
      {description && (
        <AppText variant="body" color={theme.colors.textSecondary} style={styles.description}>
          {description}
        </AppText>
      )}
      {actionText && onAction && (
        <AppButton
          title={actionText}
          onPress={onAction}
          variant="outline"
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
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  description: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    maxWidth: 280,
  },
  button: {
    minWidth: 140,
  },
});
