import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { QueueToken, Booking } from '../../types';

export interface DigitalTokenPassCardProps {
  token: QueueToken;
  booking?: Booking | null;
}

export const DigitalTokenPassCard: React.FC<DigitalTokenPassCardProps> = ({
  token,
  booking,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PROCESSING':
      case 'WEIGHING':
      case 'QUALITY_CHECK':
        return { bg: theme.colors.infoBackground, border: '#BAE6FD', text: theme.colors.info, label: '● ' + status };
      case 'WAITING':
        return { bg: theme.colors.warningBackground, border: '#FDE68A', text: theme.colors.warning, label: '● WAITING IN LINE' };
      case 'ARRIVED':
      case 'VERIFIED':
        return { bg: theme.colors.primaryMuted, border: '#BBF7D0', text: theme.colors.primaryDark, label: '● AT CENTRE' };
      case 'APPROVED':
      case 'COMPLETED':
        return { bg: theme.colors.successBackground, border: '#BBF7D0', text: theme.colors.success, label: '✓ ' + status };
      default:
        return { bg: theme.colors.surface, border: theme.colors.border, text: theme.colors.textSecondary, label: '● ' + status };
    }
  };

  const badge = getStatusBadge(token.status);

  return (
    <AppCard style={styles.passCard}>
      {/* Header Banner */}
      <View style={styles.passHeader}>
        <View style={styles.govtBadge}>
          <AppText variant="caption" color={theme.colors.primaryDark} weight="bold">
            DIGITAL INTAKE PASS
          </AppText>
        </View>

        <View style={[styles.statusPill, { backgroundColor: badge.bg, borderColor: badge.border }]}>
          <AppText variant="caption" weight="bold" color={badge.text}>
            {badge.label}
          </AppText>
        </View>
      </View>

      {/* Main Token Display Box */}
      <View style={styles.tokenDisplayArea}>
        <View style={styles.tokenBadge}>
          <AppText variant="caption" color={theme.colors.textInverse} weight="semibold">
            YOUR DIGITAL TOKEN
          </AppText>
          <AppText variant="h1" color={theme.colors.textInverse} style={styles.tokenNumber}>
            {token.displayToken}
          </AppText>
          <AppText variant="caption" color="rgba(255, 255, 255, 0.85)" style={styles.tokenSub}>
            Show to gate weighbridge operator
          </AppText>
        </View>
      </View>

      {/* Pass Details Table */}
      <View style={styles.detailsTable}>
        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Farmer Name
          </AppText>
          <AppText variant="body" weight="bold" color={theme.colors.textPrimary}>
            {token.farmerName} ({token.farmerCode})
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Procurement Centre
          </AppText>
          <AppText variant="body" weight="semibold" color={theme.colors.textPrimary} numberOfLines={1}>
            {token.centreName} ({token.centreCode})
          </AppText>
        </View>

        <View style={styles.divider} />

        {booking && (
          <>
            <View style={styles.tableRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Crop Produce
              </AppText>
              <AppText variant="body" weight="bold" color={theme.colors.primary}>
                {booking.cropName}
              </AppText>
            </View>

            <View style={styles.divider} />

            <View style={styles.tableRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Declared Quantity
              </AppText>
              <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
                {booking.declaredQuantity} Quintals
              </AppText>
            </View>

            <View style={styles.divider} />

            <View style={styles.tableRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Scheduled Window
              </AppText>
              <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
                {booking.slotDate} ({booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)})
              </AppText>
            </View>

            <View style={styles.divider} />
          </>
        )}

        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Booking Ref
          </AppText>
          <AppText variant="body" weight="medium" color={theme.colors.textMuted}>
            {token.bookingCode}
          </AppText>
        </View>
      </View>

      {/* Security Watermark Footer */}
      <View style={styles.passFooter}>
        <AppText variant="caption" color={theme.colors.textMuted} align="center">
          🔒 Official AgriProcure Digital Token • Token #{token.tokenNumber}
        </AppText>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  passCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  govtBadge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  statusPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  tokenDisplayArea: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  tokenBadge: {
    backgroundColor: theme.colors.primary,
    width: '100%',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  tokenNumber: {
    fontSize: 38,
    letterSpacing: 2,
    marginVertical: 4,
  },
  tokenSub: {
    fontSize: 11,
  },
  detailsTable: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 2,
  },
  passFooter: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.xs,
  },
});

export default DigitalTokenPassCard;
