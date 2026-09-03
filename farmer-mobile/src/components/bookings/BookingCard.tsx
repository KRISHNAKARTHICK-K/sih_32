import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { BookingStatusBadge } from './BookingStatusBadge';
import { theme } from '../../theme';
import { Booking } from '../../types';

export interface BookingCardProps {
  booking: Booking;
  onPress: (booking: Booking) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const formatTime = (timeStr?: string): string => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(booking)}
      style={styles.wrapper}
    >
      <AppCard style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.codeGroup}>
            <AppText variant="body" weight="bold" color={theme.colors.textPrimary}>
              {booking.bookingCode}
            </AppText>
            {booking.queueToken && (
              <View style={styles.tokenPill}>
                <AppText variant="caption" color={theme.colors.primaryDark} weight="bold">
                  Token: {booking.queueToken}
                </AppText>
              </View>
            )}
          </View>

          <BookingStatusBadge status={booking.status} />
        </View>

        <View style={styles.cropRow}>
          <View>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Scheduled Produce
            </AppText>
            <AppText variant="h3" weight="bold" color={theme.colors.primary}>
              {booking.cropName}
            </AppText>
          </View>

          <View style={styles.quantityBox}>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Declared
            </AppText>
            <AppText variant="body" weight="bold" color={theme.colors.textPrimary}>
              {booking.declaredQuantity} Quintals
            </AppText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            Centre:
          </AppText>
          <AppText variant="caption" weight="semibold" color={theme.colors.textPrimary} numberOfLines={1} style={styles.centreText}>
            {booking.centreName}
          </AppText>
        </View>

        <View style={styles.metaRow}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            Time Window:
          </AppText>
          <AppText variant="caption" weight="bold" color={theme.colors.primaryDark}>
            📅 {booking.slotDate} • {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
          </AppText>
        </View>

        <View style={styles.footerRow}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            Ref #{booking.id.substring(0, 8)}
          </AppText>
          <AppText variant="caption" color={theme.colors.primary} weight="bold">
            View Details →
          </AppText>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.sm,
  },
  card: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  codeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  tokenPill: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  cropRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  quantityBox: {
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1,
  },
  centreText: {
    flex: 1,
    textAlign: 'right',
    marginLeft: theme.spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 2,
  },
});

export default BookingCard;
