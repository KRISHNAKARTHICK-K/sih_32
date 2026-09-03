import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { AppButton } from '../common/AppButton';
import { theme } from '../../theme';

export interface BookingQueueCardProps {
  queueToken?: string;
  onTrackQueue?: () => void;
}

export const BookingQueueCard: React.FC<BookingQueueCardProps> = ({
  queueToken,
  onTrackQueue,
}) => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
          LIVE QUEUE INTEGRATION
        </AppText>
        <AppText variant="h3" style={styles.title}>
          🎫 Digital Queue Token
        </AppText>
      </View>

      {queueToken ? (
        <View style={styles.tokenContainer}>
          <View style={styles.tokenDisplay}>
            <AppText variant="caption" color={theme.colors.primaryDark} weight="bold">
              OFFICIAL INTAKE PASS
            </AppText>
            <AppText variant="h1" weight="bold" color={theme.colors.primary} style={styles.tokenCode}>
              {queueToken}
            </AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Present this code at centre gate
            </AppText>
          </View>

          {onTrackQueue && (
            <AppButton
              title="Track Live Queue Position →"
              variant="primary"
              onPress={onTrackQueue}
              style={styles.trackButton}
            />
          )}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Queue token will appear here once entry is verified at the centre.
          </AppText>
        </View>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  header: {
    gap: 2,
  },
  title: {
    marginTop: 2,
  },
  tokenContainer: {
    gap: theme.spacing.md,
  },
  tokenDisplay: {
    backgroundColor: '#F0FDF4',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    gap: 2,
  },
  tokenCode: {
    fontSize: 32,
    letterSpacing: 2,
    marginVertical: 2,
  },
  trackButton: {
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: theme.spacing.xs,
  },
});

export default BookingQueueCard;
