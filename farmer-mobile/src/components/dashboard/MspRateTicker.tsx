import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { Crop } from '../../types';

export interface MspRateTickerProps {
  crops: Crop[];
}

export const MspRateTicker: React.FC<MspRateTickerProps> = ({ crops }) => {
  if (!crops || crops.length === 0) {
    return null;
  }

  const formatCurrency = (amount?: number): string => {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
          GOVERNMENT MSP RATES (2026-27)
        </AppText>
        <View style={styles.liveIndicator}>
          <View style={styles.greenDot} />
          <AppText variant="caption" color={theme.colors.success} weight="semibold">
            Official
          </AppText>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {crops.map((crop) => (
          <View key={crop.id} style={styles.cropCard}>
            <AppText variant="caption" color={theme.colors.textMuted} weight="semibold">
              {crop.code}
            </AppText>
            <AppText variant="body" weight="bold" color={theme.colors.textPrimary} numberOfLines={1}>
              {crop.name}
            </AppText>
            <View style={styles.priceRow}>
              <AppText variant="body" weight="bold" color={theme.colors.primary}>
                {formatCurrency(crop.currentPrice)}
              </AppText>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                / {crop.unit.toLowerCase()}
              </AppText>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
  },
  scrollList: {
    gap: theme.spacing.sm,
  },
  cropCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minWidth: 150,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: theme.spacing.xs,
  },
});

export default MspRateTicker;
