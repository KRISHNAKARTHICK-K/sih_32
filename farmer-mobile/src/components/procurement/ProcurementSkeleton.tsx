import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';

export const ProcurementSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map((item) => (
        <AppCard key={item} style={styles.skeletonCard}>
          <View style={styles.topRow}>
            <View style={styles.codeSkeleton} />
            <View style={styles.pillSkeleton} />
          </View>
          <View style={styles.cropSkeleton} />
          <View style={styles.statsRow}>
            <View style={styles.statBoxSkeleton} />
            <View style={styles.statBoxSkeleton} />
          </View>
        </AppCard>
      ))}

      <View style={styles.loaderRow}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <AppText variant="caption" color={theme.colors.textMuted}>
          Fetching procurement & weighment records...
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  skeletonCard: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeSkeleton: {
    width: 120,
    height: 18,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
  },
  pillSkeleton: {
    width: 80,
    height: 18,
    backgroundColor: theme.colors.surface,
    borderRadius: 9,
  },
  cropSkeleton: {
    width: '60%',
    height: 22,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statBoxSkeleton: {
    flex: 1,
    height: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
});

export default ProcurementSkeleton;
