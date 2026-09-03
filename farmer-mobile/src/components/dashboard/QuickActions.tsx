import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { useTranslation } from '../../i18n';

export interface QuickActionsProps {
  onActionPress?: (actionId: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onActionPress,
}) => {
  const { t } = useTranslation();

  const actions = [
    {
      id: 'booking',
      title: t('dashboard.actionBookSlot'),
      subtitle: t('dashboard.actionBookSlotDesc'),
      icon: '🗓️',
      color: theme.colors.primary,
      bgColor: theme.colors.primaryMuted,
    },
    {
      id: 'queue',
      title: t('dashboard.actionLiveQueue'),
      subtitle: t('dashboard.actionLiveQueueDesc'),
      icon: '🎫',
      color: theme.colors.info,
      bgColor: theme.colors.infoBackground,
    },
    {
      id: 'procurement',
      title: t('dashboard.actionIntakeSlips'),
      subtitle: t('dashboard.actionIntakeSlipsDesc'),
      icon: '📋',
      color: theme.colors.warning,
      bgColor: theme.colors.warningBackground,
    },
    {
      id: 'payments',
      title: t('dashboard.actionPayments'),
      subtitle: t('dashboard.actionPaymentsDesc'),
      icon: '💳',
      color: theme.colors.success,
      bgColor: theme.colors.successBackground,
    },
  ];

  const handlePress = (id: string, title: string) => {
    if (onActionPress) {
      onActionPress(id);
    } else {
      Alert.alert(title, title);
    }
  };

  return (
    <View style={styles.container}>
      <AppText variant="caption" color={theme.colors.textMuted} weight="bold" style={styles.sectionHeader}>
        {t('dashboard.quickActionsTitle').toUpperCase()}
      </AppText>

      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            activeOpacity={0.75}
            onPress={() => handlePress(action.id, action.title)}
            style={styles.actionCard}
          >
            <View style={[styles.iconBox, { backgroundColor: action.bgColor }]}>
              <AppText variant="h2">{action.icon}</AppText>
            </View>
            <AppText variant="body" weight="bold" color={theme.colors.textPrimary} style={styles.actionTitle}>
              {action.title}
            </AppText>
            <AppText variant="caption" color={theme.colors.textMuted} numberOfLines={1}>
              {action.subtitle}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionTitle: {
    marginBottom: 2,
  },
});

export default QuickActions;
