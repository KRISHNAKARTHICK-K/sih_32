import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { QualityInspection, QualityGrade } from '../../types';

export interface QualityInspectionCardProps {
  qualityInspection?: QualityInspection | null;
}

export const QualityInspectionCard: React.FC<QualityInspectionCardProps> = ({
  qualityInspection,
}) => {
  const getGradeBadge = (grade: QualityGrade) => {
    switch (grade) {
      case 'A':
        return { bg: theme.colors.successBackground, border: '#BBF7D0', text: theme.colors.success, label: 'GRADE A • FAQ' };
      case 'B':
        return { bg: theme.colors.infoBackground, border: '#BAE6FD', text: theme.colors.info, label: 'GRADE B • STANDARD' };
      case 'C':
        return { bg: theme.colors.warningBackground, border: '#FDE68A', text: theme.colors.warning, label: 'GRADE C • SUB-STANDARD' };
      case 'REJECTED':
        return { bg: theme.colors.errorBackground, border: '#FECACA', text: theme.colors.error, label: '✕ REJECTED' };
      default:
        return { bg: theme.colors.surface, border: theme.colors.border, text: theme.colors.textSecondary, label: grade };
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
            STEP 2 • QUALITY GRADING
          </AppText>
          <AppText variant="h3" style={styles.title}>
            🔬 Quality Inspection
          </AppText>
        </View>

        <View
          style={[
            styles.statusPill,
            qualityInspection ? styles.statusPillDone : styles.statusPillPending,
          ]}
        >
          <AppText
            variant="caption"
            weight="bold"
            color={qualityInspection ? theme.colors.success : theme.colors.warning}
          >
            {qualityInspection ? (qualityInspection.approved ? '✓ CERTIFIED' : '● GRADED') : '● PENDING'}
          </AppText>
        </View>
      </View>

      {qualityInspection ? (
        <View style={styles.content}>
          {/* Main Grade Metric */}
          <View style={styles.gradeBox}>
            <View
              style={[
                styles.gradePill,
                {
                  backgroundColor: getGradeBadge(qualityInspection.grade).bg,
                  borderColor: getGradeBadge(qualityInspection.grade).border,
                },
              ]}
            >
              <AppText
                variant="h2"
                weight="bold"
                color={getGradeBadge(qualityInspection.grade).text}
              >
                {getGradeBadge(qualityInspection.grade).label}
              </AppText>
            </View>

            <AppText variant="caption" color={theme.colors.textSecondary} style={styles.gradeSub}>
              {qualityInspection.remarks || 'Standard Fair Average Quality (FAQ) certified'}
            </AppText>
          </View>

          {/* Table Data */}
          <View style={styles.detailsTable}>
            {qualityInspection.moisturePercentage !== undefined && qualityInspection.moisturePercentage !== null && (
              <>
                <View style={styles.tableRow}>
                  <AppText variant="label" color={theme.colors.textMuted}>
                    Moisture Content
                  </AppText>
                  <AppText variant="body" weight="bold" color={theme.colors.textPrimary}>
                    {qualityInspection.moisturePercentage}%
                  </AppText>
                </View>
                <View style={styles.divider} />
              </>
            )}

            {qualityInspection.foreignMatterPercentage !== undefined && qualityInspection.foreignMatterPercentage !== null && (
              <>
                <View style={styles.tableRow}>
                  <AppText variant="label" color={theme.colors.textMuted}>
                    Foreign Matter
                  </AppText>
                  <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
                    {qualityInspection.foreignMatterPercentage}%
                  </AppText>
                </View>
                <View style={styles.divider} />
              </>
            )}

            {qualityInspection.brokenGrainPercentage !== undefined && qualityInspection.brokenGrainPercentage !== null && (
              <>
                <View style={styles.tableRow}>
                  <AppText variant="label" color={theme.colors.textMuted}>
                    Broken Grain
                  </AppText>
                  <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
                    {qualityInspection.brokenGrainPercentage}%
                  </AppText>
                </View>
                <View style={styles.divider} />
              </>
            )}

            <View style={styles.tableRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Quality Assayer
              </AppText>
              <AppText variant="body" weight="medium" color={theme.colors.textPrimary}>
                {qualityInspection.inspectedBy || 'Govt Quality Officer'}
              </AppText>
            </View>

            <View style={styles.divider} />

            <View style={styles.tableRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Inspected At
              </AppText>
              <AppText variant="caption" weight="medium" color={theme.colors.textSecondary}>
                {formatDate(qualityInspection.inspectedAt)}
              </AppText>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <AppText variant="body" color={theme.colors.textSecondary} align="center">
            Quality inspection is not available yet. Sampling and laboratory moisture testing are performed after gross weighment.
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
  gradeBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  gradePill: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
  },
  gradeSub: {
    marginTop: 2,
    textAlign: 'center',
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

export default QualityInspectionCard;
