import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';

export const HelpHeader: React.FC = () => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <AppText variant="h1">🤝</AppText>
        </View>

        <View style={styles.textBlock}>
          <AppText variant="h2" weight="bold" color={theme.colors.textPrimary}>
            How can we help you?
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary} style={styles.subtext}>
            Find step-by-step guidance on booking delivery slots, tracking queue tokens, intake weighment, and DBT settlements.
          </AppText>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  subtext: {
    lineHeight: 18,
  },
});

export default HelpHeader;
