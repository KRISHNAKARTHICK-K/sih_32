import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { BookingStatusBadge } from './BookingStatusBadge';
import { theme } from '../../theme';
import { Booking } from '../../types';

export interface BookingInfoCardProps {
  booking: Booking;
}

export const BookingInfoCard: React.FC<BookingInfoCardProps> = ({ booking }) => {
  const formatDate = (isoString?: string): string => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return isoString;
    }
  };

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.govtBadge}>
          <AppText variant="caption" color={theme.colors.primaryDark} weight="bold">
            CONFIRMED SLOT BOOKING
          </AppText>
        </View>

        <BookingStatusBadge status={booking.status} />
      </View>

      <View style={styles.cropBlock}>
        <AppText variant="caption" color={theme.colors.textMuted}>
          Produce Crop
        </AppText>
        <AppText variant="h2" weight="bold" color={theme.colors.primary}>
          {booking.cropName}
        </AppText>
      </View>

      {/* Primary Highlights Box */}
      <View style={styles.highlightBox}>
        <View style={styles.highlightRow}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Declared Quantity:
          </AppText>
          <AppText variant="body" weight="bold" color={theme.colors.textPrimary}>
            {booking.declaredQuantity} Quintals
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.highlightRow}>
          <AppText variant="body" color={theme.colors.textSecondary}>
            Allocated Centre:
          </AppText>
          <AppText variant="body" weight="semibold" color={theme.colors.textPrimary} style={styles.centreValue}>
            {booking.centreName}
          </AppText>
        </View>
      </View>

      {/* Breakdown Details */}
      <View style={styles.detailsList}>
        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Booking Reference
          </AppText>
          <AppText variant="body" weight="bold" color={theme.colors.textPrimary}>
            {booking.bookingCode}
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Farmer Name
          </AppText>
          <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
            {booking.farmerName} ({booking.farmerCode})
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Booked On
          </AppText>
          <AppText variant="caption" weight="medium" color={theme.colors.textSecondary}>
            {formatDate(booking.createdAt)}
          </AppText>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  govtBadge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  cropBlock: {
    gap: 2,
  },
  highlightBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centreValue: {
    flex: 1,
    textAlign: 'right',
    marginLeft: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  detailsList: {
    gap: theme.spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
});

export default BookingInfoCard;
