import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ScreenContainer,
  AppText,
  AppCard,
  AppButton,
  ErrorView,
  ProfileHeader,
  ProfileInfoCard,
  AccountInfoCard,
  LanguageSelector,
  ProfileSkeleton,
} from '../../components';
import { theme } from '../../theme';
import { useAuth, useFarmerProfile } from '../../hooks';
import { useTranslation } from '../../i18n';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';

type NavigationProps = NativeStackNavigationProp<MainStackParamList, 'Profile'>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const { user, logout } = useAuth();
  const { profile, loading, refreshing, error, refetch } = useFarmerProfile();
  const { t } = useTranslation();

  const [signingOut, setSigningOut] = useState<boolean>(false);

  // Auto-refresh on focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleSignOut = () => {
    Alert.alert(
      t('auth.signOutTitle'),
      t('auth.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.signOutButton'),
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            try {
              await logout();
            } finally {
              setSigningOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer
      scrollable
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refetch}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <AppText variant="body" weight="bold" color={theme.colors.primaryDark}>
            {t('common.back')}
          </AppText>
        </TouchableOpacity>

        <AppText variant="h3" weight="bold">
          {t('profile.title')}
        </AppText>

        <View style={styles.placeholderBox} />
      </View>

      {/* Content Area */}
      {loading && !profile ? (
        <ProfileSkeleton />
      ) : error && !profile ? (
        <ErrorView
          title={t('errors.failedLoadProfile')}
          message={error}
          onRetry={refetch}
          retryText={t('common.retry')}
        />
      ) : profile ? (
        <>
          {/* Top Profile Header with Initials Avatar */}
          <ProfileHeader profile={profile} />

          {/* Registration & Location Details */}
          <ProfileInfoCard profile={profile} />

          {/* Multilingual Language Selector */}
          <LanguageSelector />

          {/* Account Security Details */}
          <AccountInfoCard username={user?.username} role={user?.role} />

          {/* Help & Support Navigation Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Help')}
            style={styles.helpLink}
          >
            <AppCard style={styles.helpCard}>
              <View style={styles.helpRow}>
                <View style={styles.helpLeft}>
                  <View style={styles.helpIconCircle}>
                    <AppText variant="h2">🤝</AppText>
                  </View>
                  <View style={styles.helpText}>
                    <AppText variant="body" weight="bold" color={theme.colors.textPrimary}>
                      {t('profile.helpLinkTitle')}
                    </AppText>
                    <AppText variant="caption" color={theme.colors.textSecondary}>
                      {t('profile.helpLinkSubtitle')}
                    </AppText>
                  </View>
                </View>
                <AppText variant="body" weight="bold" color={theme.colors.primary}>
                  ›
                </AppText>
              </View>
            </AppCard>
          </TouchableOpacity>

          {/* Secure Sign Out Section */}
          <View style={styles.signOutSection}>
            <AppButton
              title={t('auth.signOutButton')}
              variant="outline"
              onPress={handleSignOut}
              loading={signingOut}
              style={styles.signOutButton}
            />

            <AppText variant="caption" color={theme.colors.textMuted} align="center" style={styles.securityWatermark}>
              {t('common.secureSession')}
            </AppText>
          </View>
        </>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  backButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
  },
  placeholderBox: {
    width: 50,
  },
  helpLink: {
    marginBottom: theme.spacing.md,
  },
  helpCard: {
    padding: theme.spacing.md,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  helpIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    flex: 1,
    gap: 2,
  },
  signOutSection: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  signOutButton: {
    marginBottom: 4,
  },
  securityWatermark: {
    marginBottom: theme.spacing.md,
  },
});

export default ProfileScreen;
