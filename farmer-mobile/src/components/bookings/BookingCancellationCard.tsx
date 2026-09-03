import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';

export const BookingCancellationCard: React.FC = () => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
          SLOT MODIFICATION POLICY
        </AppText>
        <AppText variant="h3" style={styles.title}>
          ⚙️ Cancellation & Rescheduling
        </AppText>
      </View>

      <View style={styles.infoBox}>
        <AppText variant="body" color={theme.colors.textPrimary} style={styles.infoText}>
          Self-service slot cancellation is currently managed directly by the procurement centre administration to preserve capacity allocation.
        </AppText>
        <AppText variant="caption" color={theme.colors.textSecondary} style={styles.subText}>
          If you need to reschedule or cancel your booked slot, please contact your allocated procurement centre desk before the operating window commences.
        </AppText>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  header: {
    gap: 2,
  },
  title: {
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  infoText: {
    lineHeight: 20,
  },
  subText: {
    lineHeight: 18,
  },
});

export default BookingCancellationCard;
