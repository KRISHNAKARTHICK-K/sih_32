import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';

export interface FaqItemProps {
  question: string;
  answer: string;
  category?: string;
  defaultExpanded?: boolean;
}

export const FaqItem: React.FC<FaqItemProps> = ({
  question,
  answer,
  category,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);

  return (
    <AppCard style={[styles.card, expanded && styles.cardExpanded]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
        style={styles.headerRow}
      >
        <View style={styles.questionBlock}>
          {category && (
            <AppText variant="caption" color={theme.colors.primary} weight="bold">
              {category.toUpperCase()}
            </AppText>
          )}
          <AppText
            variant="body"
            weight={expanded ? 'bold' : 'semibold'}
            color={theme.colors.textPrimary}
            style={styles.questionText}
          >
            {question}
          </AppText>
        </View>

        <View style={styles.expandIconCircle}>
          <AppText variant="body" weight="bold" color={theme.colors.primaryDark}>
            {expanded ? '−' : '+'}
          </AppText>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.answerBlock}>
          <View style={styles.divider} />
          <AppText variant="body" color={theme.colors.textSecondary} style={styles.answerText}>
            {answer}
          </AppText>
        </View>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: 0,
  },
  cardExpanded: {
    borderColor: '#BBF7D0',
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  questionBlock: {
    flex: 1,
    gap: 2,
  },
  questionText: {
    lineHeight: 22,
  },
  expandIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  answerBlock: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  answerText: {
    lineHeight: 22,
  },
});

export default FaqItem;
