import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, AppCard, AppText } from '../../components';
import { theme } from '../../theme';

export const LoginPlaceholderScreen: React.FC = () => {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <AppCard style={styles.card}>
          <AppText variant="h2" color={theme.colors.primary} style={styles.title}>
            Farmer Authentication
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
            Authentication flow will be implemented in Step 3.
          </AppText>
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
  },
  card: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
});
