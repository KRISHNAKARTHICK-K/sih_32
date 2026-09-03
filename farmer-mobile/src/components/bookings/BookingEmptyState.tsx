import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { AppButton } from '../common/AppButton';
import { theme } from '../../theme';

export interface BookingEmptyStateProps {
  onBookPress: () => void;
}

export const BookingEmptyState: React.FC<BookingEmptyStateProps> = ({ onBookPress }) => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.iconCircle}>
        <AppText variant="h1">📅</AppText>
      </View>

      <AppText variant="h3" weight="bold" style={styles.title}>
        No Scheduled Slots
      </AppText>

      <AppText variant="body" color={theme.colors.textSecondary} style={styles.description}>
        You have not booked any agricultural procurement slots. Select your nearby centre and crop to reserve an intake time window.
      </AppText>

      <AppButton
        title="+ Schedule Delivery Slot"
        variant="primary"
        onPress={onBookPress}
        style={styles.actionButton}
      />
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.md,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  actionButton: {
    width: '100%',
    marginTop: theme.spacing.xs,
  },
});

export default BookingEmptyState;
