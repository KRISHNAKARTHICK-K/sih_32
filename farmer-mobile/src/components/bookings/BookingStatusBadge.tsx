import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { BookingStatus } from '../../types';

export interface BookingStatusBadgeProps {
  status: BookingStatus | string;
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'CONFIRMED':
        return {
          bg: theme.colors.primaryMuted,
          text: theme.colors.primaryDark,
          border: '#BBF7D0',
          label: '● CONFIRMED',
        };
      case 'COMPLETED':
        return {
          bg: theme.colors.successBackground,
          text: theme.colors.success,
          border: '#BBF7D0',
          label: '✓ COMPLETED',
        };
      case 'PENDING':
        return {
          bg: theme.colors.warningBackground,
          text: theme.colors.warning,
          border: '#FDE68A',
          label: '⏳ PENDING',
        };
      case 'CANCELLED':
        return {
          bg: theme.colors.errorBackground,
          text: theme.colors.error,
          border: '#FECACA',
          label: '✕ CANCELLED',
        };
      default:
        return {
          bg: theme.colors.surface,
          text: theme.colors.textSecondary,
          border: theme.colors.border,
          label: `● ${status}`,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
    >
      <AppText variant="caption" weight="bold" color={config.text}>
        {config.label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});

export default BookingStatusBadge;
