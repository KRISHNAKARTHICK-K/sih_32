import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from './AppText';
import { AppCard } from './AppCard';
import { theme } from '../../theme';
import { useTranslation, SUPPORTED_LANGUAGES, Language } from '../../i18n';

export interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { language, setLanguage, t } = useTranslation();

  return (
    <AppCard style={styles.card}>
      {!compact && (
        <View style={styles.header}>
          <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
            {t('profile.languageSection')}
          </AppText>
          <AppText variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
            {t('profile.selectLanguage')}
          </AppText>
        </View>
      )}

      <View style={styles.buttonRow}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              activeOpacity={0.8}
              onPress={() => setLanguage(lang.code)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${lang.label} - ${lang.nativeLabel}`}
              style={[
                styles.langButton,
                isSelected && styles.langButtonActive,
              ]}
            >
              <View style={styles.contentRow}>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>

                <View style={styles.labelGroup}>
                  <AppText
                    variant="body"
                    weight="bold"
                    color={isSelected ? theme.colors.primaryDark : theme.colors.textPrimary}
                  >
                    {lang.nativeLabel}
                  </AppText>
                  <AppText
                    variant="caption"
                    color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                  >
                    {lang.label}
                  </AppText>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  header: {
    gap: 2,
  },
  subtitle: {
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  langButton: {
    flex: 1,
    minHeight: 52,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    justifyContent: 'center',
  },
  langButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: theme.colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  labelGroup: {
    gap: 1,
  },
});

export default LanguageSelector;
