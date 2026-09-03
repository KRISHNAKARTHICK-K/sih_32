import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';

export const ContactSupportCard: React.FC = () => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
          PHYSICAL CENTRE & DESK ASSISTANCE
        </AppText>
        <AppText variant="h3" style={styles.title}>
          🏢 Procurement Centre Support
        </AppText>
      </View>

      <AppText variant="body" color={theme.colors.textSecondary} style={styles.description}>
        For questions regarding delivery slot arrivals, queue token sequence, or physical produce unloading, please approach the on-duty Centre Manager or Weighbridge Operator at your allocated procurement centre.
      </AppText>

      <View style={styles.checklist}>
        <AppText variant="caption" weight="bold" color={theme.colors.textPrimary}>
          📋 What to bring to the centre:
        </AppText>
        <AppText variant="caption" color={theme.colors.textSecondary}>
          • Government Farmer Registration Code (e.g. FAR-000001)
        </AppText>
        <AppText variant="caption" color={theme.colors.textSecondary}>
          • Active Digital Intake Token Pass on your mobile app
        </AppText>
        <AppText variant="caption" color={theme.colors.textSecondary}>
          • Tractor / Vehicle carrying the scheduled produce batch
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
  description: {
    lineHeight: 20,
  },
  checklist: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
    marginTop: 2,
  },
});

export default ContactSupportCard;
