import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';

export interface NotificationEmptyStateProps {
  filterActive?: boolean;
}

export const NotificationEmptyState: React.FC<NotificationEmptyStateProps> = ({
  filterActive = false,
}) => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.iconCircle}>
        <AppText variant="h1">🔔</AppText>
      </View>

      <AppText variant="h2" weight="bold" style={styles.title}>
        {filterActive ? 'No Matching Notifications' : 'No Notifications Yet'}
      </AppText>

      <AppText variant="body" color={theme.colors.textSecondary} align="center" style={styles.description}>
        {filterActive
          ? 'There are no notifications matching the selected filter category.'
          : 'You will receive real-time alerts regarding your slot bookings, queue tokens, and DBT disbursements here.'}
      </AppText>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
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
  },
});

export default NotificationEmptyState;
