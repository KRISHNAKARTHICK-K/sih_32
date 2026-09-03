import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';

export const QueueSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Stats row skeleton */}
      <View style={styles.statsRow}>
        <View style={styles.statBox} />
        <View style={styles.statBox} />
        <View style={styles.statBox} />
      </View>

      {/* Main token card skeleton */}
      <AppCard style={styles.passSkeleton}>
        <View style={styles.headerLine} />
        <View style={styles.tokenBoxSkeleton} />
        <View style={styles.lineSkeleton} />
        <View style={styles.lineSkeleton} />
        <View style={styles.lineSkeleton} />
      </AppCard>

      {/* Timeline skeleton */}
      <AppCard style={styles.timelineSkeleton}>
        <View style={styles.headerLine} />
        <View style={styles.timelineBlock} />
      </AppCard>

      <View style={styles.loaderRow}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <AppText variant="caption" color={theme.colors.textMuted}>
          Connecting to centre live queue dispatcher...
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statBox: {
    flex: 1,
    height: 85,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  passSkeleton: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  headerLine: {
    width: '40%',
    height: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
  },
  tokenBoxSkeleton: {
    height: 100,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  lineSkeleton: {
    width: '100%',
    height: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
  },
  timelineSkeleton: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  timelineBlock: {
    height: 120,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
});

export default QueueSkeleton;
