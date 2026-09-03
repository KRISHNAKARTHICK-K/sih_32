import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { QueueStatus } from '../../types';

export interface QueueTimelineProps {
  status: QueueStatus;
}

interface TimelineStage {
  id: string;
  label: string;
  subtitle: string;
  backendStatuses: string;
  statuses: QueueStatus[];
}

const STAGES: TimelineStage[] = [
  {
    id: 'stage_1',
    label: '1. Slot Booked',
    subtitle: 'Delivery time slot confirmed & token assigned',
    backendStatuses: 'Status: BOOKED',
    statuses: ['BOOKED'],
  },
  {
    id: 'stage_2',
    label: '2. Gate Arrival & Verification',
    subtitle: 'Farmer identity and booking reference verified at entry',
    backendStatuses: 'Status: ARRIVED / VERIFIED',
    statuses: ['ARRIVED', 'VERIFIED'],
  },
  {
    id: 'stage_3',
    label: '3. Waiting in Intake Queue',
    subtitle: 'In line awaiting weighbridge and inspection lane',
    backendStatuses: 'Status: WAITING',
    statuses: ['WAITING'],
  },
  {
    id: 'stage_4',
    label: '4. Weighment & Quality Grading',
    subtitle: 'Gross weighment, moisture & FAQ quality inspection',
    backendStatuses: 'Status: PROCESSING / WEIGHING / QUALITY_CHECK',
    statuses: ['PROCESSING', 'WEIGHING', 'QUALITY_CHECK'],
  },
  {
    id: 'stage_5',
    label: '5. Lot Acceptance & Settlement',
    subtitle: 'Produce intake complete, weighment slip & DBT approved',
    backendStatuses: 'Status: APPROVED / COMPLETED',
    statuses: ['APPROVED', 'COMPLETED'],
  },
];

export const QueueTimeline: React.FC<QueueTimelineProps> = ({ status }) => {
  // If cancelled, render specific cancellation state
  if (status === 'CANCELLED') {
    return (
      <AppCard style={styles.cancelledCard}>
        <View style={styles.cancelledHeader}>
          <AppText variant="h2">🚫</AppText>
          <View style={styles.cancelledTitleGroup}>
            <AppText variant="h3" color={theme.colors.error} weight="bold">
              Token Cancelled
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>
              This queue token has been cancelled. Please schedule a new procurement slot if needed.
            </AppText>
          </View>
        </View>
      </AppCard>
    );
  }

  // Determine current stage index (0 to 4)
  const getStageIndex = (currStatus: QueueStatus): number => {
    for (let i = 0; i < STAGES.length; i++) {
      if (STAGES[i].statuses.includes(currStatus)) {
        return i;
      }
    }
    return 0;
  };

  const currentStageIdx = getStageIndex(status);

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
          LIVE INTAKE PROGRESS
        </AppText>
        <AppText variant="h3" style={styles.title}>
          Procurement Stages
        </AppText>
      </View>

      <View style={styles.timelineContainer}>
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIdx;
          const isActive = idx === currentStageIdx;

          return (
            <View key={stage.id} style={styles.stageItem}>
              {/* Left Indicator Column */}
              <View style={styles.indicatorColumn}>
                <View
                  style={[
                    styles.circle,
                    isDone && styles.circleDone,
                    isActive && styles.circleActive,
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    color={isDone || isActive ? theme.colors.textInverse : theme.colors.textMuted}
                    style={styles.circleText}
                  >
                    {isDone ? '✓' : idx + 1}
                  </AppText>
                </View>

                {/* Connecting Line to next stage */}
                {idx < STAGES.length - 1 && (
                  <View
                    style={[
                      styles.connectorLine,
                      isDone && styles.connectorLineDone,
                    ]}
                  />
                )}
              </View>

              {/* Right Content Column */}
              <View style={styles.contentColumn}>
                <AppText
                  variant="body"
                  weight={isActive ? 'bold' : isDone ? 'semibold' : 'regular'}
                  color={isActive ? theme.colors.primaryDark : isDone ? theme.colors.textPrimary : theme.colors.textMuted}
                >
                  {stage.label} {isActive && '● CURRENT'}
                </AppText>
                <AppText variant="caption" color={theme.colors.textMuted} style={styles.subtitle}>
                  {stage.subtitle}
                </AppText>
                <AppText variant="caption" color={isActive ? theme.colors.primary : theme.colors.textMuted} style={styles.backendTag}>
                  [{stage.backendStatuses}]
                </AppText>
              </View>
            </View>
          );
        })}
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  cancelledCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.errorBackground,
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  cancelledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  cancelledTitleGroup: {
    flex: 1,
    gap: 2,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    marginTop: 2,
  },
  timelineContainer: {
    gap: 0,
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  indicatorColumn: {
    alignItems: 'center',
    width: 24,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  circleDone: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  circleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  circleText: {
    fontSize: 10,
    lineHeight: 12,
  },
  connectorLine: {
    width: 2,
    height: 44,
    backgroundColor: theme.colors.border,
    marginVertical: 2,
  },
  connectorLineDone: {
    backgroundColor: theme.colors.success,
  },
  contentColumn: {
    flex: 1,
    paddingBottom: theme.spacing.md,
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 2,
    lineHeight: 16,
  },
  backendTag: {
    fontSize: 10,
    marginTop: 2,
  },
});

export default QueueTimeline;
