import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { Booking, QueueToken } from '../../types';
import { useTranslation } from '../../i18n';

export interface MetricsGridProps {
  activeBooking: Booking | null;
  activeQueueToken: QueueToken | null;
  totalProcuredQuantity: number;
  totalDisbursedAmount: number;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  activeBooking,
  activeQueueToken,
  totalProcuredQuantity,
  totalDisbursedAmount,
}) => {
  const { t } = useTranslation();

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <View style={styles.container}>
      {/* Metric 1: Booking Status */}
      <View style={styles.metricCard}>
        <View style={styles.iconCircle}>
          <AppText variant="body">📅</AppText>
        </View>
        <AppText variant="caption" color={theme.colors.textMuted} weight="medium">
          {t('dashboard.activeBooking')}
        </AppText>
        <AppText variant="h3" weight="bold" color={activeBooking ? theme.colors.primary : theme.colors.textSecondary} numberOfLines={1}>
          {activeBooking ? activeBooking.status : t('booking.noBookingsTitle')}
        </AppText>
        <AppText variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
          {activeBooking ? activeBooking.slotDate : t('booking.bookSlotAction')}
        </AppText>
      </View>

      {/* Metric 2: Live Queue */}
      <View style={styles.metricCard}>
        <View style={[styles.iconCircle, styles.queueCircle]}>
          <AppText variant="body">🎫</AppText>
        </View>
        <AppText variant="caption" color={theme.colors.textMuted} weight="medium">
          {t('dashboard.queuePosition')}
        </AppText>
        <AppText variant="h3" weight="bold" color={activeQueueToken ? theme.colors.info : theme.colors.textSecondary} numberOfLines={1}>
          {activeQueueToken ? activeQueueToken.displayToken : t('queue.noActiveToken')}
        </AppText>
        <AppText variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
          {activeQueueToken ? `${activeQueueToken.peopleAhead} ${t('queue.peopleAhead')}` : t('dashboard.inIntakeQueue')}
        </AppText>
      </View>

      {/* Metric 3: Total Procured */}
      <View style={styles.metricCard}>
        <View style={[styles.iconCircle, styles.procurementCircle]}>
          <AppText variant="body">⚖️</AppText>
        </View>
        <AppText variant="caption" color={theme.colors.textMuted} weight="medium">
          {t('dashboard.totalProcured')}
        </AppText>
        <AppText variant="h3" weight="bold" color={theme.colors.textPrimary} numberOfLines={1}>
          {totalProcuredQuantity.toFixed(1)} Qtl
        </AppText>
        <AppText variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
          {t('dashboard.procuredProduce')}
        </AppText>
      </View>

      {/* Metric 4: Total Payments Disbursed */}
      <View style={styles.metricCard}>
        <View style={[styles.iconCircle, styles.paymentCircle]}>
          <AppText variant="body">💳</AppText>
        </View>
        <AppText variant="caption" color={theme.colors.textMuted} weight="medium">
          {t('dashboard.totalDisbursed')}
        </AppText>
        <AppText variant="h3" weight="bold" color={theme.colors.success} numberOfLines={1}>
          {formatCurrency(totalDisbursedAmount)}
        </AppText>
        <AppText variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
          {t('dashboard.settledPayments')}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    marginBottom: theme.spacing.xs,
  },
  queueCircle: {
    backgroundColor: theme.colors.infoBackground,
  },
  procurementCircle: {
    backgroundColor: theme.colors.warningBackground,
  },
  paymentCircle: {
    backgroundColor: theme.colors.successBackground,
  },
});

export default MetricsGrid;
