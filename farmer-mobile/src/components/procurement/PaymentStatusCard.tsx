import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { Payment, PaymentStatus, Procurement } from '../../types';

export interface PaymentStatusCardProps {
  payment?: Payment | null;
  procurement: Procurement;
}

export const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({
  payment,
  procurement,
}) => {
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return { bg: theme.colors.successBackground, border: '#BBF7D0', text: theme.colors.success, label: '✓ DBT DISBURSED' };
      case 'PROCESSING':
        return { bg: theme.colors.infoBackground, border: '#BAE6FD', text: theme.colors.info, label: '● PROCESSING' };
      case 'PENDING':
        return { bg: theme.colors.warningBackground, border: '#FDE68A', text: theme.colors.warning, label: '● PENDING' };
      case 'FAILED':
        return { bg: theme.colors.errorBackground, border: '#FECACA', text: theme.colors.error, label: '✕ FAILED' };
      default:
        return { bg: theme.colors.surface, border: theme.colors.border, text: theme.colors.textSecondary, label: status };
    }
  };

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
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleGroup}>
          <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
            STEP 3 • DBT SETTLEMENT
          </AppText>
          <AppText variant="h3" style={styles.title}>
            💳 Payment Status
          </AppText>
        </View>

        {payment && (
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: getStatusBadge(payment.status).bg,
                borderColor: getStatusBadge(payment.status).border,
              },
            ]}
          >
            <AppText
              variant="caption"
              weight="bold"
              color={getStatusBadge(payment.status).text}
            >
              {getStatusBadge(payment.status).label}
            </AppText>
          </View>
        )}
      </View>

      {payment ? (
        <View style={styles.content}>
          {/* Main Amount Metric */}
          <View style={styles.amountBox}>
            <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
              TOTAL DISBURSED AMOUNT
            </AppText>
            <AppText variant="h1" color={theme.colors.success} style={styles.amountNumber}>
              ₹{payment.amount.toLocaleString('en-IN')}
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              Direct Benefit Transfer to registered bank account
            </AppText>
          </View>

          {/* Table Data */}
          <View style={styles.detailsTable}>
            <View style={styles.tableRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Payment Voucher
              </AppText>
              <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
                {payment.paymentCode}
              </AppText>
            </View>

            <View style={styles.divider} />

            <View style={styles.tableRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Settlement Method
              </AppText>
              <AppText variant="body" weight="medium" color={theme.colors.textPrimary}>
                {payment.paymentMethod ? payment.paymentMethod.replace(/_/g, ' ') : 'Direct Bank Transfer (DBT)'}
              </AppText>
            </View>

            {payment.transactionReference ? (
              <>
                <View style={styles.divider} />
                <View style={styles.tableRow}>
                  <AppText variant="label" color={theme.colors.textMuted}>
                    Transaction Ref
                  </AppText>
                  <AppText variant="caption" weight="bold" color={theme.colors.primaryDark}>
                    {payment.transactionReference}
                  </AppText>
                </View>
              </>
            ) : null}

            <View style={styles.divider} />

            <View style={styles.tableRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Voucher Date
              </AppText>
              <AppText variant="caption" weight="medium" color={theme.colors.textSecondary}>
                {formatDate(payment.createdAt)}
              </AppText>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <AppText variant="body" color={theme.colors.textSecondary} align="center">
            {procurement.status === 'COMPLETED' || procurement.status === 'APPROVED'
              ? 'Payment voucher is queued for batch disbursement to your registered Aadhaar-linked bank account.'
              : 'Payment voucher will be generated automatically upon completion and acceptance of quality grading.'}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleGroup: {
    gap: 2,
  },
  title: {
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  content: {
    gap: theme.spacing.md,
  },
  amountBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  amountNumber: {
    fontSize: 32,
    marginVertical: 4,
  },
  detailsTable: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
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
  emptyBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.xs,
  },
});

export default PaymentStatusCard;
