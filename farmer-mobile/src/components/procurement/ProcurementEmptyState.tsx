import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { AppButton } from '../common/AppButton';
import { theme } from '../../theme';

export interface ProcurementEmptyStateProps {
  onBookPress: () => void;
}

export const ProcurementEmptyState: React.FC<ProcurementEmptyStateProps> = ({
  onBookPress,
}) => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.iconCircle}>
        <AppText variant="h1">⚖️</AppText>
      </View>

      <AppText variant="h2" weight="bold" style={styles.title}>
        No Procurement Records Yet
      </AppText>

      <AppText variant="body" color={theme.colors.textSecondary} align="center" style={styles.description}>
        Your verified weighment slips, quality inspection certificates, and DBT payment records will appear here once your produce is delivered.
      </AppText>

      <AppButton
        title="+ Schedule Delivery Slot"
        onPress={onBookPress}
        style={styles.actionBtn}
      />
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    maxWidth: 320,
    lineHeight: 20,
  },
  actionBtn: {
    marginTop: theme.spacing.sm,
    width: '100%',
    maxWidth: 260,
  },
});

export default ProcurementEmptyState;
