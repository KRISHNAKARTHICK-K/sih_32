import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { Procurement, ProcurementStatus } from '../../types';

export interface ProcurementCardProps {
  procurement: Procurement;
  onPress: (procurement: Procurement) => void;
}

export const ProcurementCard: React.FC<ProcurementCardProps> = ({
  procurement,
  onPress,
}) => {
  const getStatusBadge = (status: ProcurementStatus) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return { bg: theme.colors.successBackground, border: '#BBF7D0', text: theme.colors.success, label: '✓ ' + status };
      case 'QUALITY_CHECKED':
      case 'WEIGHED':
        return { bg: theme.colors.infoBackground, border: '#BAE6FD', text: theme.colors.info, label: '● ' + status.replace('_', ' ') };
      case 'DRAFT':
        return { bg: theme.colors.warningBackground, border: '#FDE68A', text: theme.colors.warning, label: '● INTAKE DRAFT' };
      case 'CANCELLED':
        return { bg: theme.colors.errorBackground, border: '#FECACA', text: theme.colors.error, label: '✕ CANCELLED' };
      default:
        return { bg: theme.colors.surface, border: theme.colors.border, text: theme.colors.textSecondary, label: '● ' + status };
    }
  };

  const formatDate = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const badge = getStatusBadge(procurement.status);
  const displayQty = procurement.actualQuantity > 0 ? procurement.actualQuantity : procurement.declaredQuantity;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(procurement)}
    >
      <AppCard style={styles.card}>
        {/* Header Row */}
        <View style={styles.cardHeader}>
          <View style={styles.codeGroup}>
            <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
              INTAKE SLIP
            </AppText>
            <AppText variant="body" weight="bold" color={theme.colors.textPrimary}>
              {procurement.procurementCode}
            </AppText>
          </View>

          <View style={[styles.statusPill, { backgroundColor: badge.bg, borderColor: badge.border }]}>
            <AppText variant="caption" weight="bold" color={badge.text}>
              {badge.label}
            </AppText>
          </View>
        </View>

        {/* Crop & Quantity Section */}
        <View style={styles.mainInfo}>
          <View style={styles.cropBlock}>
            <AppText variant="caption" color={theme.colors.textMuted}>
              Crop Produce
            </AppText>
            <AppText variant="h3" color={theme.colors.primary} weight="bold">
              {procurement.cropName}
            </AppText>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <AppText variant="caption" color={theme.colors.textMuted}>
                Quantity
              </AppText>
              <AppText variant="body" weight="bold" color={theme.colors.textPrimary}>
                {displayQty} {procurement.cropUnit || 'Quintals'}
              </AppText>
            </View>

            <View style={styles.statBox}>
              <AppText variant="caption" color={theme.colors.textMuted}>
                Settlement Net
              </AppText>
              <AppText variant="body" weight="bold" color={theme.colors.success}>
                ₹{procurement.netAmount.toLocaleString('en-IN')}
              </AppText>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            📅 {formatDate(procurement.createdAt)} {procurement.displayToken ? `• Token: ${procurement.displayToken}` : ''}
          </AppText>

          <AppText variant="caption" color={theme.colors.primary} weight="bold">
            View Slip Details →
          </AppText>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  codeGroup: {
    gap: 2,
  },
  statusPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  mainInfo: {
    gap: theme.spacing.xs,
  },
  cropBlock: {
    gap: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: 4,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSubtle,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export default ProcurementCard;
