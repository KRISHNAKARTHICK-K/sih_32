import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { NotificationItem, NotificationType } from '../../types';

export interface NotificationCardProps {
  notification: NotificationItem;
  onPress: (notification: NotificationItem) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
}) => {
  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'BOOKING':
        return { icon: '📅', label: 'BOOKING', bg: theme.colors.infoBackground, text: theme.colors.info, border: '#BAE6FD' };
      case 'QUEUE':
        return { icon: '🎫', label: 'QUEUE', bg: theme.colors.primaryMuted, text: theme.colors.primaryDark, border: '#BBF7D0' };
      case 'PROCUREMENT':
        return { icon: '⚖️', label: 'INTAKE', bg: theme.colors.warningBackground, text: theme.colors.warning, border: '#FDE68A' };
      case 'PAYMENT':
        return { icon: '💳', label: 'DBT PAYMENT', bg: theme.colors.successBackground, text: theme.colors.success, border: '#BBF7D0' };
      case 'SYSTEM':
      default:
        return { icon: '📢', label: 'SYSTEM', bg: theme.colors.surface, text: theme.colors.textSecondary, border: theme.colors.border };
    }
  };

  const formatDate = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (isToday) {
        return `Today, ${timeStr}`;
      }
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
    } catch {
      return isoString;
    }
  };

  const badge = getTypeBadge(notification.type);
  const isUnread = !notification.read;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => onPress(notification)}
    >
      <AppCard
        style={[
          styles.card,
          isUnread && styles.unreadCard,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.badgeGroup}>
            <View style={[styles.typeBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
              <AppText variant="caption" weight="bold" color={badge.text}>
                {badge.icon} {badge.label}
              </AppText>
            </View>

            {isUnread && (
              <View style={styles.unreadDot} />
            )}
          </View>

          <AppText variant="caption" color={theme.colors.textMuted}>
            {formatDate(notification.createdAt)}
          </AppText>
        </View>

        <AppText
          variant="body"
          weight={isUnread ? 'bold' : 'semibold'}
          color={isUnread ? theme.colors.textPrimary : theme.colors.textSecondary}
          style={styles.title}
          numberOfLines={1}
        >
          {notification.title}
        </AppText>

        <AppText
          variant="caption"
          color={isUnread ? theme.colors.textSecondary : theme.colors.textMuted}
          style={styles.message}
          numberOfLines={2}
        >
          {notification.message}
        </AppText>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: 4,
  },
  unreadCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  title: {
    marginTop: 2,
  },
  message: {
    lineHeight: 18,
  },
});

export default NotificationCard;
