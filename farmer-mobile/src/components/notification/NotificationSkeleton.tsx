import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';

export const NotificationSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Skeleton cards */}
      {[1, 2, 3, 4].map((item) => (
        <AppCard key={item} style={styles.skeletonCard}>
          <View style={styles.topRow}>
            <View style={styles.badgeSkeleton} />
            <View style={styles.dateSkeleton} />
          </View>
          <View style={styles.titleSkeleton} />
          <View style={styles.messageSkeleton} />
        </AppCard>
      ))}

      <View style={styles.loaderRow}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <AppText variant="caption" color={theme.colors.textMuted}>
          Fetching alerts from notification service...
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  skeletonCard: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  badgeSkeleton: {
    width: 90,
    height: 18,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
  },
  dateSkeleton: {
    width: 80,
    height: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
  },
  titleSkeleton: {
    width: '70%',
    height: 18,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
    marginTop: 2,
  },
  messageSkeleton: {
    width: '95%',
    height: 32,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
});

export default NotificationSkeleton;
