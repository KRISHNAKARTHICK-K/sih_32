import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { QueueToken } from '../../types';

export interface LiveQueueCardProps {
  queueToken: QueueToken | null;
  onTrackQueuePress?: (token?: QueueToken) => void;
}

export const LiveQueueCard: React.FC<LiveQueueCardProps> = ({
  queueToken,
  onTrackQueuePress,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING':
        return { bg: theme.colors.warningBackground, border: '#FDE68A', text: theme.colors.warning };
      case 'PROCESSING':
      case 'WEIGHING':
      case 'QUALITY_CHECK':
        return { bg: theme.colors.infoBackground, border: '#BAE6FD', text: theme.colors.info };
      case 'APPROVED':
      case 'COMPLETED':
        return { bg: theme.colors.successBackground, border: '#BBF7D0', text: theme.colors.success };
      default:
        return { bg: theme.colors.surface, border: theme.colors.border, text: theme.colors.textSecondary };
    }
  };

  const CardWrapper = onTrackQueuePress ? TouchableOpacity : View;

  return (
    <CardWrapper
      activeOpacity={0.8}
      onPress={() => onTrackQueuePress && onTrackQueuePress(queueToken || undefined)}
    >
      <AppCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleGroup}>
            <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
              INTAKE LINE
            </AppText>
            <AppText variant="h3" style={styles.sectionTitle}>
              Live Queue Token
            </AppText>
          </View>

          {queueToken && (
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: getStatusColor(queueToken.status).bg,
                  borderColor: getStatusColor(queueToken.status).border,
                },
              ]}
            >
              <AppText
                variant="caption"
                weight="bold"
                color={getStatusColor(queueToken.status).text}
              >
                {queueToken.status}
              </AppText>
            </View>
          )}
        </View>

        {queueToken ? (
          <View style={styles.tokenContainer}>
            <View style={styles.tokenMain}>
              <View style={styles.tokenDisplayBox}>
                <AppText variant="caption" color={theme.colors.textInverse} weight="semibold">
                  TOKEN NUMBER
                </AppText>
                <AppText variant="h1" color={theme.colors.textInverse} style={styles.tokenNumber}>
                  {queueToken.displayToken}
                </AppText>
              </View>

              <View style={styles.queueStats}>
                <View style={styles.statItem}>
                  <AppText variant="caption" color={theme.colors.textMuted}>
                    People Ahead
                  </AppText>
                  <AppText variant="h2" color={theme.colors.textPrimary} weight="bold">
                    {queueToken.peopleAhead}
                  </AppText>
                </View>

                <View style={styles.statItem}>
                  <AppText variant="caption" color={theme.colors.textMuted}>
                    Centre
                  </AppText>
                  <AppText variant="caption" weight="semibold" color={theme.colors.textPrimary} numberOfLines={1}>
                    {queueToken.centreName}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.queueFooter}>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                📅 Queue Date: {queueToken.queueDate}
              </AppText>
              <AppText variant="caption" color={theme.colors.primary} weight="bold">
                View Digital Pass →
              </AppText>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <AppText variant="h2">🎫</AppText>
            </View>
            <AppText variant="body" weight="semibold" style={styles.emptyTitle}>
              No Active Queue
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary} style={styles.emptyDescription}>
              Your digital intake token and live position will appear here when your delivery slot starts.
            </AppText>
          </View>
        )}
      </AppCard>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  titleGroup: {
    flex: 1,
  },
  sectionTitle: {
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  tokenContainer: {
    gap: theme.spacing.md,
  },
  tokenMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  tokenDisplayBox: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 130,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  tokenNumber: {
    fontSize: 26,
    letterSpacing: 1,
    marginTop: 2,
  },
  queueStats: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  statItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  queueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyTitle: {
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    maxWidth: 280,
  },
});

export default LiveQueueCard;
