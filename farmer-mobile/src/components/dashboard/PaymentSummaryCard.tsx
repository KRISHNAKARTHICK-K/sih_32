import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { Payment } from '../../types';

export interface PaymentSummaryCardProps {
  payment: Payment | null;
}

export const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({
  payment,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AppCard style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleGroup}>
          <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
            DBT DISBURSEMENT
          </AppText>
          <AppText variant="h3" style={styles.sectionTitle}>
            Latest Payment
          </AppText>
        </View>

        {payment && (
          <View
            style={[
              styles.statusPill,
              payment.status === 'PAID'
                ? styles.pillPaid
                : styles.pillPending,
            ]}
          >
            <AppText
              variant="caption"
              weight="bold"
              color={
                payment.status === 'PAID'
                  ? theme.colors.success
                  : theme.colors.warning
              }
            >
              {payment.status}
            </AppText>
          </View>
        )}
      </View>

      {payment ? (
        <View style={styles.contentBody}>
          <View style={styles.amountBox}>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Disbursed Amount
            </AppText>
            <AppText variant="h1" color={theme.colors.success} weight="bold" style={styles.amountText}>
              {formatCurrency(payment.amount)}
            </AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Payment Mode
            </AppText>
            <AppText variant="caption" weight="medium" color={theme.colors.textPrimary}>
              {payment.paymentMethod || 'Direct Bank Transfer (DBT)'}
            </AppText>
          </View>

          {payment.transactionReference && (
            <View style={styles.infoRow}>
              <AppText variant="caption" color={theme.colors.textMuted}>
                Transaction Ref
              </AppText>
              <AppText variant="caption" weight="medium" color={theme.colors.textPrimary}>
                {payment.transactionReference}
              </AppText>
            </View>
          )}

          <View style={styles.infoRow}>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Voucher Code
            </AppText>
            <AppText variant="caption" color={theme.colors.textMuted}>
              {payment.paymentCode}
            </AppText>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <AppText variant="h2">💳</AppText>
          </View>
          <AppText variant="body" weight="semibold" style={styles.emptyTitle}>
            No Payment Vouchers Yet
          </AppText>
          <AppText variant="caption" color={theme.colors.textSecondary} style={styles.emptyDescription}>
            Direct Bank Transfer (DBT) credit vouchers will appear here once procurement invoices are approved.
          </AppText>
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
  pillPaid: {
    backgroundColor: theme.colors.successBackground,
    borderColor: '#BBF7D0',
  },
  pillPending: {
    backgroundColor: theme.colors.warningBackground,
    borderColor: '#FDE68A',
  },
  contentBody: {
    gap: theme.spacing.xs,
  },
  amountBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  amountText: {
    marginTop: 2,
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

export default PaymentSummaryCard;
