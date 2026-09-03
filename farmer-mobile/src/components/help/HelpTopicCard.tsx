import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';

export interface HelpTopicCardProps {
  title: string;
  icon: string;
  description: string;
  onPress: () => void;
}

export const HelpTopicCard: React.FC<HelpTopicCardProps> = ({
  title,
  icon,
  description,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={styles.wrapper}
    >
      <AppCard style={styles.card}>
        <View style={styles.iconCircle}>
          <AppText variant="h2">{icon}</AppText>
        </View>

        <View style={styles.content}>
          <AppText variant="body" weight="bold" color={theme.colors.textPrimary}>
            {title}
          </AppText>
          <AppText variant="caption" color={theme.colors.textSecondary} style={styles.description}>
            {description}
          </AppText>
        </View>

        <AppText variant="body" color={theme.colors.textMuted} weight="bold">
          ›
        </AppText>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  description: {
    lineHeight: 16,
  },
});

export default HelpTopicCard;
