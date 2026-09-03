import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { AppButton } from '../common/AppButton';
import { theme } from '../../theme';
import { Booking } from '../../types';

export interface UpcomingBookingCardProps {
  booking: Booking | null;
  onBookPress?: () => void;
  onViewDetailsPress?: (booking: Booking) => void;
}

export const UpcomingBookingCard: React.FC<UpcomingBookingCardProps> = ({
  booking,
  onBookPress,
  onViewDetailsPress,
}) => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleGroup}>
          <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
            PROCUREMENT SCHEDULE
          </AppText>
          <AppText variant="h3" style={styles.sectionTitle}>
            Upcoming Slot
          </AppText>
        </View>

        {booking && (
          <View
            style={[
              styles.statusPill,
              booking.status === 'CONFIRMED'
                ? styles.pillConfirmed
                : booking.status === 'COMPLETED'
                ? styles.pillCompleted
                : styles.pillPending,
            ]}
          >
            <AppText
              variant="caption"
              weight="bold"
              color={
                booking.status === 'CONFIRMED'
                  ? theme.colors.primaryDark
                  : booking.status === 'COMPLETED'
                  ? theme.colors.textSecondary
                  : theme.colors.warning
              }
            >
              {booking.status}
            </AppText>
          </View>
        )}
      </View>

      {booking ? (
        <View style={styles.contentBody}>
          {/* Crop & Quantity */}
          <View style={styles.highlightRow}>
            <View>
              <AppText variant="label" color={theme.colors.textMuted}>
                Crop Produce
              </AppText>
              <AppText variant="body" weight="bold" color={theme.colors.textPrimary}>
                {booking.cropName}
              </AppText>
            </View>
            <View style={styles.quantityBox}>
              <AppText variant="caption" color={theme.colors.primaryDark} weight="bold">
                {booking.declaredQuantity} Quintals
              </AppText>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Centre Location */}
          <View style={styles.infoRow}>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Centre
            </AppText>
            <AppText variant="caption" weight="semibold" color={theme.colors.textPrimary}>
              {booking.centreName}
            </AppText>
          </View>

          {/* Date & Time */}
          <View style={styles.infoRow}>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Slot Timing
            </AppText>
            <AppText variant="caption" weight="semibold" color={theme.colors.textPrimary}>
              {booking.slotDate} ({booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)})
            </AppText>
          </View>

          {/* Reference Code */}
          <View style={styles.infoRow}>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Booking Ref
            </AppText>
            <AppText variant="caption" weight="medium" color={theme.colors.textMuted}>
              {booking.bookingCode}
            </AppText>
          </View>

          {onViewDetailsPress && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onViewDetailsPress(booking)}
              style={styles.detailsAction}
            >
              <AppText variant="caption" color={theme.colors.primary} weight="bold">
                View Booking Slip →
              </AppText>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <AppText variant="h2">🗓️</AppText>
          </View>
          <AppText variant="body" weight="semibold" style={styles.emptyTitle}>
            No Upcoming Booking
          </AppText>
          <AppText variant="caption" color={theme.colors.textSecondary} style={styles.emptyDescription}>
            Schedule your crop delivery at your local procurement centre to secure an intake slot and queue token.
          </AppText>
          {onBookPress && (
            <AppButton
              title="Book Procurement Slot"
              onPress={onBookPress}
              size="sm"
              style={styles.bookButton}
            />
          )}
        </View>
      )}
    </AppCard>
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
  pillConfirmed: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: '#BBF7D0',
  },
  pillPending: {
    backgroundColor: theme.colors.warningBackground,
    borderColor: '#FDE68A',
  },
  pillCompleted: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  contentBody: {
    gap: theme.spacing.xs,
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  quantityBox: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  detailsAction: {
    alignItems: 'flex-end',
    marginTop: theme.spacing.sm,
    paddingVertical: 4,
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
    marginBottom: theme.spacing.md,
  },
  bookButton: {
    minWidth: 180,
  },
});

export default UpcomingBookingCard;
