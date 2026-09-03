import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, AppCard, AppText } from '../../components';
import { theme } from '../../theme';
import { AppConfig } from '../../constants';

export const HomePlaceholderScreen: React.FC = () => {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <View style={styles.badge}>
            <AppText variant="caption" color={theme.colors.primaryDark} weight="bold">
              BOOTSTRAP STAGE
            </AppText>
          </View>
          <AppText variant="h1" color={theme.colors.primary} style={styles.title}>
            AgriProcure Farmer
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
            Farmer Mobile Application
          </AppText>
        </View>

        <AppCard style={styles.card}>
          <AppText variant="h3" style={styles.cardTitle}>
            Foundation Ready
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary} style={styles.cardBody}>
            Development build is running.
          </AppText>

          <View style={styles.metaBox}>
            <AppText variant="label" color={theme.colors.textMuted}>
              Target Backend
            </AppText>
            <AppText variant="caption" color={theme.colors.textSecondary} style={styles.apiUrl}>
              {AppConfig.apiBaseUrl}
            </AppText>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  content: {
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  badge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
  card: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  cardTitle: {
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  cardBody: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  metaBox: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  apiUrl: {
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
