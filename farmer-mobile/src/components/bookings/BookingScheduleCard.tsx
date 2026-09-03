import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';

export interface BookingScheduleCardProps {
  slotDate: string;
  startTime: string;
  endTime: string;
  centreName: string;
}

export const BookingScheduleCard: React.FC<BookingScheduleCardProps> = ({
  slotDate,
  startTime,
  endTime,
  centreName,
}) => {
  const formatFullDate = (dateStr?: string): string => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTimeRange = (start?: string, end?: string): string => {
    if (!start || !end) return '';
    return `${start.substring(0, 5)} - ${end.substring(0, 5)}`;
  };

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
          TIME & LOCATION SCHEDULE
        </AppText>
        <AppText variant="h3" style={styles.title}>
          📅 Delivery Window
        </AppText>
      </View>

      <View style={styles.dateDisplay}>
        <AppText variant="h3" weight="bold" color={theme.colors.textPrimary}>
          {formatFullDate(slotDate)}
        </AppText>
        <View style={styles.timePill}>
          <AppText variant="body" weight="bold" color={theme.colors.primaryDark}>
            ⏰ {formatTimeRange(startTime, endTime)}
          </AppText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.locationRow}>
        <AppText variant="label" color={theme.colors.textMuted}>
          Arrival Centre
        </AppText>
        <AppText variant="body" weight="semibold" color={theme.colors.textPrimary} style={styles.centreText}>
          {centreName}
        </AppText>
      </View>

      <View style={styles.guidanceBox}>
        <AppText variant="caption" weight="bold" color={theme.colors.textPrimary}>
          ℹ️ Arrival Instructions:
        </AppText>
        <AppText variant="caption" color={theme.colors.textSecondary} style={styles.guidanceText}>
          Please arrive 10-15 minutes prior to your allocated slot window. Present your Digital Token Pass at the weighbridge entry barrier.
        </AppText>
      </View>
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
  dateDisplay: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
    alignItems: 'flex-start',
  },
  timePill: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 2,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centreText: {
    flex: 1,
    textAlign: 'right',
    marginLeft: theme.spacing.md,
  },
  guidanceBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 2,
    marginTop: 2,
  },
  guidanceText: {
    lineHeight: 18,
  },
});

export default BookingScheduleCard;
