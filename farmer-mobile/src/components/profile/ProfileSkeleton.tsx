import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';

export const ProfileSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <AppCard style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.avatarSkeleton} />
          <View style={styles.identitySkeleton}>
            <View style={styles.nameSkeleton} />
            <View style={styles.badgeSkeleton} />
          </View>
        </View>
      </AppCard>

      {/* Info Card Skeleton */}
      <AppCard style={styles.card}>
        <View style={styles.titleSkeleton} />
        <View style={styles.lineSkeleton} />
        <View style={styles.lineSkeleton} />
        <View style={styles.lineSkeleton} />
        <View style={styles.lineSkeleton} />
      </AppCard>

      <View style={styles.loaderRow}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <AppText variant="caption" color={theme.colors.textMuted}>
          Loading verified farmer profile...
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
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarSkeleton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
  },
  identitySkeleton: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  nameSkeleton: {
    width: '70%',
    height: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
  },
  badgeSkeleton: {
    width: 110,
    height: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
  },
  titleSkeleton: {
    width: '40%',
    height: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
  },
  lineSkeleton: {
    width: '100%',
    height: 28,
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

export default ProfileSkeleton;
