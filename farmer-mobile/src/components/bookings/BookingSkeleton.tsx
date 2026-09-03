import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';

export const BookingSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <AppCard style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.badgeSkeleton} />
          <View style={styles.statusSkeleton} />
        </View>
        <View style={styles.titleSkeleton} />
        <View style={styles.boxSkeleton} />
        <View style={styles.lineSkeleton} />
        <View style={styles.lineSkeleton} />
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.titleSkeleton} />
        <View style={styles.boxSkeleton} />
      </AppCard>

      <View style={styles.loaderRow}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <AppText variant="caption" color={theme.colors.textMuted}>
          Loading slot booking records...
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
  card: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeSkeleton: {
    width: 140,
    height: 22,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
  },
  statusSkeleton: {
    width: 90,
    height: 22,
    backgroundColor: theme.colors.surface,
    borderRadius: 11,
  },
  titleSkeleton: {
    width: '60%',
    height: 26,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
  },
  boxSkeleton: {
    width: '100%',
    height: 70,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  lineSkeleton: {
    width: '100%',
    height: 24,
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

export default BookingSkeleton;
