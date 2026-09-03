import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { Weighment } from '../../types';

export interface WeighmentCardProps {
  weighment?: Weighment | null;
  cropUnit?: string;
}

export const WeighmentCard: React.FC<WeighmentCardProps> = ({
  weighment,
  cropUnit = 'Quintals',
}) => {
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
            STEP 1 • WEIGHBRIDGE
          </AppText>
          <AppText variant="h3" style={styles.title}>
            ⚖️ Weighment Slip
          </AppText>
        </View>

        <View
          style={[
            styles.statusPill,
            weighment ? styles.statusPillDone : styles.statusPillPending,
          ]}
        >
          <AppText
            variant="caption"
            weight="bold"
            color={weighment ? theme.colors.success : theme.colors.warning}
          >
            {weighment ? '✓ WEIGHED' : '● PENDING'}
          </AppText>
        </View>
      </View>

      {weighment ? (
        <View style={styles.content}>
          {/* Main Weight Metric */}
          <View style={styles.weightBox}>
            <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
              VERIFIED NET WEIGHT
            </AppText>
            <AppText variant="h1" color={theme.colors.primary} style={styles.weightNumber}>
              {weighment.actualWeight} <AppText variant="body" color={theme.colors.textSecondary}>{cropUnit}</AppText>
            </AppText>
          </View>

          {/* Table Data */}
          <View style={styles.detailsTable}>
            {weighment.declaredQuantity !== undefined && (
              <>
                <View style={styles.tableRow}>
                  <AppText variant="label" color={theme.colors.textMuted}>
                    Declared Quantity
                  </AppText>
                  <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
                    {weighment.declaredQuantity} {cropUnit}
                  </AppText>
                </View>
                <View style={styles.divider} />
              </>
            )}

            {weighment.moisturePercentage !== undefined && weighment.moisturePercentage !== null && (
              <>
                <View style={styles.tableRow}>
                  <AppText variant="label" color={theme.colors.textMuted}>
                    Weighment Moisture
                  </AppText>
                  <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
                    {weighment.moisturePercentage}%
                  </AppText>
                </View>
                <View style={styles.divider} />
              </>
            )}

            <View style={styles.tableRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Recorded By
              </AppText>
              <AppText variant="body" weight="medium" color={theme.colors.textPrimary}>
                {weighment.recordedBy || 'Weighbridge Operator'}
              </AppText>
            </View>

            <View style={styles.divider} />

            <View style={styles.tableRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Recorded At
              </AppText>
              <AppText variant="caption" weight="medium" color={theme.colors.textSecondary}>
                {formatDate(weighment.recordedAt)}
              </AppText>
            </View>

            {weighment.remarks ? (
              <>
                <View style={styles.divider} />
                <View style={styles.tableRow}>
                  <AppText variant="label" color={theme.colors.textMuted}>
                    Remarks
                  </AppText>
                  <AppText variant="caption" color={theme.colors.textPrimary}>
                    {weighment.remarks}
                  </AppText>
                </View>
              </>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <AppText variant="body" color={theme.colors.textSecondary} align="center">
            Weighment is pending. Net weight will be recorded upon entry to the centre weighbridge lane.
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
  statusPillDone: {
    backgroundColor: theme.colors.successBackground,
    borderColor: '#BBF7D0',
  },
  statusPillPending: {
    backgroundColor: theme.colors.warningBackground,
    borderColor: '#FDE68A',
  },
  content: {
    gap: theme.spacing.md,
  },
  weightBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  weightNumber: {
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

export default WeighmentCard;
