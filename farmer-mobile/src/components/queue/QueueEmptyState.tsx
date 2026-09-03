import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { AppButton } from '../common/AppButton';
import { theme } from '../../theme';

export interface QueueEmptyStateProps {
  onBookPress?: () => void;
}

export const QueueEmptyState: React.FC<QueueEmptyStateProps> = ({ onBookPress }) => {
  return (
    <AppCard style={styles.container}>
      <View style={styles.iconCircle}>
        <AppText variant="h1">🎫</AppText>
      </View>

      <AppText variant="h2" weight="bold" style={styles.title}>
        No Active Queue Token
      </AppText>

      <AppText variant="body" color={theme.colors.textSecondary} align="center" style={styles.description}>
        You currently have no scheduled procurement delivery tokens. Schedule a slot at your nearest procurement centre to receive an automatic digital queue pass.
      </AppText>

      {onBookPress && (
        <AppButton
          title="Schedule Procurement Delivery"
          onPress={onBookPress}
          style={styles.bookButton}
        />
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    maxWidth: 300,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  bookButton: {
    minWidth: 240,
  },
});

export default QueueEmptyState;
