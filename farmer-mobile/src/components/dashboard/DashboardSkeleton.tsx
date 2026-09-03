import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';

export const DashboardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header Placeholder */}
      <View style={styles.headerBox}>
        <View style={styles.greetingPlaceholder} />
        <View style={styles.titlePlaceholder} />
        <View style={styles.badgePlaceholder} />
      </View>

      {/* Metrics Row Placeholder */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox} />
        <View style={styles.metricBox} />
        <View style={styles.metricBox} />
        <View style={styles.metricBox} />
      </View>

      {/* Card Placeholders */}
      <View style={styles.cardPlaceholder}>
        <View style={styles.cardHeaderPlaceholder} />
        <View style={styles.cardContentPlaceholder} />
      </View>

      <View style={styles.cardPlaceholder}>
        <View style={styles.cardHeaderPlaceholder} />
        <View style={styles.cardContentPlaceholder} />
      </View>

      <View style={styles.loadingIndicatorBox}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <AppText variant="caption" color={theme.colors.textMuted} style={styles.loadingText}>
          Synchronizing procurement & queue status...
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  headerBox: {
    gap: theme.spacing.xs,
  },
  greetingPlaceholder: {
    width: 100,
    height: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xs,
  },
  titlePlaceholder: {
    width: 220,
    height: 28,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
  },
  badgePlaceholder: {
    width: 140,
    height: 18,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  metricBox: {
    flex: 1,
    minWidth: '47%',
    height: 100,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardPlaceholder: {
    height: 160,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  cardHeaderPlaceholder: {
    width: '50%',
    height: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xs,
  },
  cardContentPlaceholder: {
    width: '100%',
    height: 70,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
  },
  loadingIndicatorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  loadingText: {
    marginTop: 2,
  },
});

export default DashboardSkeleton;
