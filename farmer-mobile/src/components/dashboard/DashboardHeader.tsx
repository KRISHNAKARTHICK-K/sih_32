import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { User } from '../../types';
import { useTranslation } from '../../i18n';

export interface DashboardHeaderProps {
  user: User | null;
  unreadCount?: number;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  unreadCount = 0,
  onNotificationPress,
  onProfilePress,
}) => {
  const { t } = useTranslation();

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greetingMorning');
    if (hour < 17) return t('dashboard.greetingAfternoon');
    return t('dashboard.greetingEvening');
  };

  const displayName = user?.fullName || user?.username || 'Farmer';
  const farmerCode = user?.farmerCode || 'FAR-000000';

  const IdentityWrapper = onProfilePress ? TouchableOpacity : View;

  return (
    <View style={styles.headerContainer}>
      <IdentityWrapper
        activeOpacity={0.75}
        onPress={onProfilePress}
        style={styles.leftGroup}
      >
        <View style={styles.greetingRow}>
          <AppText variant="caption" color={theme.colors.textMuted} weight="semibold">
            {getGreeting().toUpperCase()},
          </AppText>
        </View>

        <AppText variant="h1" color={theme.colors.textPrimary} style={styles.farmerName}>
          {displayName} 👋
        </AppText>

        <View style={styles.badgeRow}>
          <View style={styles.codeBadge}>
            <AppText variant="caption" color={theme.colors.primaryDark} weight="bold">
              {t('dashboard.farmerIdPrefix')} {farmerCode}
            </AppText>
          </View>
          <View style={styles.verifiedBadge}>
            <AppText variant="caption" color={theme.colors.success} weight="semibold">
              {t('dashboard.profileLink')}
            </AppText>
          </View>
        </View>
      </IdentityWrapper>

      {/* Notification Bell with Unread Badge */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onNotificationPress}
        style={styles.notificationButton}
      >
        <AppText variant="h2" style={styles.bellIcon}>
          🔔
        </AppText>
        {unreadCount > 0 && (
          <View style={styles.unreadDot}>
            <AppText variant="caption" color={theme.colors.textInverse} weight="bold" style={styles.unreadText}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </AppText>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
  },
  leftGroup: {
    flex: 1,
  },
  greetingRow: {
    marginBottom: 2,
  },
  farmerName: {
    fontSize: theme.fontSizes.xxl,
    letterSpacing: -0.5,
    marginBottom: theme.spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  codeBadge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  verifiedBadge: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bellIcon: {
    fontSize: 18,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: theme.colors.card,
  },
  unreadText: {
    fontSize: 9,
    lineHeight: 11,
  },
});

export default DashboardHeader;
