import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';
import { AppText } from './AppText';

export interface LoadingViewProps {
  message?: string;
  style?: ViewStyle;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = 'Loading...',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && (
        <AppText variant="body" color={theme.colors.textSecondary} style={styles.message}>
          {message}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  message: {
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});
