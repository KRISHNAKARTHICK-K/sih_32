import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { QueueToken, QueueOverview } from '../../types';

export interface QueueStatsGridProps {
  token: QueueToken;
  overview?: QueueOverview | null;
}

export const QueueStatsGrid: React.FC<QueueStatsGridProps> = ({
  token,
  overview,
}) => {
  const currentServing = overview?.currentServingToken && overview.currentServingToken !== 'None'
    ? overview.currentServingToken
    : 'None';

  return (
    <View style={styles.container}>
      {/* Tile 1: Currently Serving Token */}
      <View style={styles.statTile}>
        <View style={styles.iconCircle}>
          <AppText variant="body">🎯</AppText>
        </View>
        <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
          NOW SERVING
        </AppText>
        <AppText variant="h2" color={theme.colors.primaryDark} weight="bold" numberOfLines={1}>
          {currentServing}
        </AppText>
        <AppText variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
          At intake gate
        </AppText>
      </View>

      {/* Tile 2: People Ahead */}
      <View style={styles.statTile}>
        <View style={[styles.iconCircle, styles.aheadCircle]}>
          <AppText variant="body">👥</AppText>
        </View>
        <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
          PEOPLE AHEAD
        </AppText>
        <AppText variant="h2" color={theme.colors.info} weight="bold" numberOfLines={1}>
          {token.peopleAhead}
        </AppText>
        <AppText variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
          {token.peopleAhead === 0 ? 'You are next!' : 'Waiting farmers'}
        </AppText>
      </View>

      {/* Tile 3: Queue Position */}
      <View style={styles.statTile}>
        <View style={[styles.iconCircle, styles.posCircle]}>
          <AppText variant="body">🔢</AppText>
        </View>
        <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
          YOUR POSITION
        </AppText>
        <AppText variant="h2" color={theme.colors.textPrimary} weight="bold" numberOfLines={1}>
          #{token.queuePosition || token.tokenNumber}
        </AppText>
        <AppText variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
          Today's sequence
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statTile: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    gap: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  aheadCircle: {
    backgroundColor: theme.colors.infoBackground,
  },
  posCircle: {
    backgroundColor: theme.colors.warningBackground,
  },
});

export default QueueStatsGrid;
