import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';

export const EmergencyAssistanceCard: React.FC = () => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <AppText variant="h2">🚨</AppText>
        </View>

        <View style={styles.textBlock}>
          <AppText variant="h3" color={theme.colors.error} weight="bold">
            Emergency & Safety Notice
          </AppText>
          <AppText variant="caption" color={theme.colors.textMuted}>
            Safety at Procurement Yards & Weighbridges
          </AppText>
        </View>
      </View>

      <AppText variant="body" color={theme.colors.textPrimary} style={styles.noticeText}>
        AgriProcure is a digital agricultural procurement and slot management platform.
      </AppText>

      <View style={styles.warningBox}>
        <AppText variant="body" weight="semibold" color={theme.colors.error}>
          ⚠️ In case of accidents, fire, medical emergencies, or immediate physical danger at the centre or on the road:
        </AppText>
        <AppText variant="caption" color={theme.colors.textSecondary} style={styles.subGuidance}>
          Please alert the nearest centre security personnel and contact your local emergency emergency response services immediately.
        </AppText>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.errorBackground,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    gap: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  noticeText: {
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  subGuidance: {
    lineHeight: 18,
  },
});

export default EmergencyAssistanceCard;
