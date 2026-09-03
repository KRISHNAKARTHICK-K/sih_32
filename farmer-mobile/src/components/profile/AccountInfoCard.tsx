import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';

export interface AccountInfoCardProps {
  username?: string;
  role?: string;
}

export const AccountInfoCard: React.FC<AccountInfoCardProps> = ({
  username,
  role = 'FARMER',
}) => {
  return (
    <AppCard style={styles.card}>
      <View style={styles.cardHeader}>
        <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
          SECURITY & SESSION
        </AppText>
        <AppText variant="h3" style={styles.title}>
          🔒 Account Security
        </AppText>
      </View>

      <View style={styles.detailsList}>
        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Login Username
          </AppText>
          <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
            {username || 'N/A'}
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Assigned Role
          </AppText>
          <View style={styles.roleBadge}>
            <AppText variant="caption" weight="bold" color={theme.colors.primaryDark}>
              {role}
            </AppText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Token Storage
          </AppText>
          <AppText variant="caption" weight="medium" color={theme.colors.success}>
            ✓ Hardware Secure Keystore
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            API Gateway
          </AppText>
          <AppText variant="caption" weight="medium" color={theme.colors.textSecondary}>
            AgriProcure Spring Boot Direct
          </AppText>
        </View>
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
  cardHeader: {
    gap: 2,
  },
  title: {
    marginTop: 2,
  },
  detailsList: {
    gap: theme.spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  roleBadge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 2,
  },
});

export default AccountInfoCard;
