import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  ScreenContainer,
  AppCard,
  AppText,
  AppInput,
  AppButton,
  LanguageSelector,
} from '../../components';
import { theme } from '../../theme';
import { useAuth } from '../../hooks';
import { useTranslation } from '../../i18n';

export const LoginScreen: React.FC = () => {
  const { login, isAuthenticating, error, clearError } = useAuth();
  const { t } = useTranslation();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLogin = async () => {
    setValidationError(null);
    clearError();

    if (!username.trim()) {
      setValidationError(t('auth.usernamePlaceholder'));
      return;
    }

    if (!password) {
      setValidationError(t('auth.passwordPlaceholder'));
      return;
    }

    try {
      await login({ username: username.trim(), password });
    } catch {
      // Error handled by AuthContext state
    }
  };

  const fillCredentials = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setValidationError(null);
    clearError();
  };

  const displayError = validationError || error;

  return (
    <ScreenContainer scrollable style={styles.container}>
      {/* Brand Header */}
      <View style={styles.brandContainer}>
        <View style={styles.logoBadge}>
          <AppText variant="h1" color={theme.colors.textInverse}>
            🌾
          </AppText>
        </View>
        <AppText variant="h1" color={theme.colors.primary} style={styles.brandTitle}>
          AgriProcure
        </AppText>
        <AppText variant="body" color={theme.colors.textSecondary} style={styles.brandSubtitle}>
          {t('auth.title')}
        </AppText>
      </View>

      {/* Language Selector */}
      <LanguageSelector compact />

      {/* Login Card */}
      <AppCard style={styles.card}>
        <View style={styles.cardHeader}>
          <AppText variant="h2" style={styles.cardTitle}>
            {t('auth.title')}
          </AppText>
          <AppText variant="label" color={theme.colors.textMuted}>
            {t('auth.subtitle')}
          </AppText>
        </View>

        {/* Error Alert */}
        {displayError && (
          <View style={styles.errorAlert}>
            <AppText variant="label" color={theme.colors.error} weight="bold" style={styles.errorIcon}>
              ⚠
            </AppText>
            <AppText variant="caption" color={theme.colors.error} style={styles.errorText}>
              {displayError}
            </AppText>
          </View>
        )}

        {/* Inputs */}
        <AppInput
          label={t('auth.usernameLabel')}
          placeholder={t('auth.usernamePlaceholder')}
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            if (displayError) {
              setValidationError(null);
              clearError();
            }
          }}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isAuthenticating}
        />

        <AppInput
          label={t('auth.passwordLabel')}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (displayError) {
              setValidationError(null);
              clearError();
            }
          }}
          autoCapitalize="none"
          editable={!isAuthenticating}
        />

        {/* Submit Button */}
        <AppButton
          title={isAuthenticating ? t('auth.signingIn') : t('auth.signInButton')}
          onPress={handleLogin}
          loading={isAuthenticating}
          style={styles.loginButton}
        />
      </AppCard>

      {/* Demo Quick-Fill Section for Testing */}
      <View style={styles.quickFillSection}>
        <AppText variant="caption" color={theme.colors.textMuted} weight="medium" style={styles.quickFillLabel}>
          QUICK DEMO CREDENTIALS
        </AppText>

        <View style={styles.chipRow}>
          <TouchableOpacity
            style={styles.chip}
            onPress={() => fillCredentials('farmer1', 'Farmer@123')}
            disabled={isAuthenticating}
          >
            <AppText variant="caption" color={theme.colors.primaryDark} weight="semibold">
              Farmer 1 (Muthusamy K)
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chip}
            onPress={() => fillCredentials('farmer2', 'Farmer@123')}
            disabled={isAuthenticating}
          >
            <AppText variant="caption" color={theme.colors.primaryDark} weight="semibold">
              Farmer 2 (Selvaraj P)
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, styles.chipWarn]}
            onPress={() => fillCredentials('operator', 'Operator@123')}
            disabled={isAuthenticating}
          >
            <AppText variant="caption" color={theme.colors.warning} weight="semibold">
              Test Staff Reject (operator)
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chip, styles.chipWarn]}
            onPress={() => fillCredentials('admin', 'Admin@123')}
            disabled={isAuthenticating}
          >
            <AppText variant="caption" color={theme.colors.warning} weight="semibold">
              Test Admin Reject (admin)
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Footer */}
      <View style={styles.footer}>
        <AppText variant="caption" color={theme.colors.textMuted} align="center">
          {t('common.secureSession')}
        </AppText>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  brandTitle: {
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    marginTop: theme.spacing.xs,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  cardHeader: {
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    marginBottom: theme.spacing.xs,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.errorBackground,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  errorIcon: {
    marginRight: theme.spacing.xs,
    fontSize: theme.fontSizes.md,
  },
  errorText: {
    flex: 1,
  },
  loginButton: {
    marginTop: theme.spacing.sm,
  },
  quickFillSection: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  quickFillLabel: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  chip: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  chipWarn: {
    backgroundColor: theme.colors.warningBackground,
    borderColor: '#FDE68A',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
});

export default LoginScreen;
