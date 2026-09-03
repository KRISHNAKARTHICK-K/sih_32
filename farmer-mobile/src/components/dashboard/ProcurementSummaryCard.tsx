import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { Procurement } from '../../types';

export interface ProcurementSummaryCardProps {
  procurement: Procurement | null;
  onPress?: (procurement?: Procurement) => void;
}

export const ProcurementSummaryCard: React.FC<ProcurementSummaryCardProps> = ({
  procurement,
  onPress,
}) => {
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      activeOpacity={0.8}
      onPress={() => onPress && onPress(procurement || undefined)}
    >
      <AppCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleGroup}>
            <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
              PRODUCE INTAKE
            </AppText>
            <AppText variant="h3" style={styles.sectionTitle}>
              Latest Procurement
            </AppText>
          </View>

          {procurement && (
            <View style={styles.statusPill}>
              <AppText variant="caption" weight="bold" color={theme.colors.primaryDark}>
                {procurement.status}
              </AppText>
            </View>
          )}
        </View>

        {procurement ? (
          <View style={styles.contentBody}>
            <View style={styles.highlightRow}>
              <View>
                <AppText variant="label" color={theme.colors.textMuted}>
                  Delivered Produce
                </AppText>
                <AppText variant="body" weight="bold" color={theme.colors.textPrimary}>
                  {procurement.cropName}
                </AppText>
              </View>
              <View style={styles.weightBox}>
                <AppText variant="caption" color={theme.colors.textPrimary} weight="bold">
                  {procurement.actualQuantity > 0 ? procurement.actualQuantity : procurement.declaredQuantity} {procurement.cropUnit}
                </AppText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <AppText variant="caption" color={theme.colors.textMuted}>
                Net Payable
              </AppText>
              <AppText variant="caption" weight="bold" color={theme.colors.success}>
                {formatCurrency(procurement.netAmount)}
              </AppText>
            </View>

            <View style={styles.footerRow}>
              <AppText variant="caption" color={theme.colors.textMuted}>
                Ref: {procurement.procurementCode}
              </AppText>
              <AppText variant="caption" color={theme.colors.primary} weight="bold">
                View Slip Details →
              </AppText>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <AppText variant="h2">⚖️</AppText>
            </View>
            <AppText variant="body" weight="semibold" style={styles.emptyTitle}>
              No Procurement Records
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary} style={styles.emptyDescription}>
              Weighment receipts and quality grading certificates will appear here after physical delivery.
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
    backgroundColor: theme.colors.primaryMuted,
    borderColor: '#BBF7D0',
    borderWidth: 1,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
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
  weightBox: {
    backgroundColor: theme.colors.surface,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 2,
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

export default ProcurementSummaryCard;
