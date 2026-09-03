import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { QueueToken } from '../../types';

export interface TokenSwitcherProps {
  tokens: QueueToken[];
  selectedTokenId: string;
  onSelectToken: (tokenId: string) => void;
}

export const TokenSwitcher: React.FC<TokenSwitcherProps> = ({
  tokens,
  selectedTokenId,
  onSelectToken,
}) => {
  if (tokens.length <= 1) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AppText variant="caption" color={theme.colors.textMuted} weight="bold" style={styles.label}>
        SWITCH ACTIVE TOKEN ({tokens.length} TOKENS)
      </AppText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
        {tokens.map((token) => {
          const isSelected = token.id === selectedTokenId;

          return (
            <TouchableOpacity
              key={token.id}
              activeOpacity={0.75}
              onPress={() => onSelectToken(token.id)}
              style={[styles.pill, isSelected && styles.pillActive]}
            >
              <AppText
                variant="caption"
                weight="bold"
                color={isSelected ? theme.colors.textInverse : theme.colors.textPrimary}
              >
                🎫 {token.displayToken} ({token.status})
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
    letterSpacing: 0.5,
  },
  scrollList: {
    gap: theme.spacing.sm,
    paddingVertical: 2,
  },
  pill: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
});

export default TokenSwitcher;
