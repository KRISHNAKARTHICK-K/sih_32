import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { FarmerProfile } from '../../types';

export interface ProfileHeaderProps {
  profile: FarmerProfile;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  // Generate initials (e.g. "Muthusamy K" -> "MK")
  const getInitials = (name: string): string => {
    if (!name) return 'FP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <AppCard style={styles.card}>
      <View style={styles.headerContainer}>
        {/* Avatar Circle */}
        <View style={styles.avatarCircle}>
          <AppText variant="h1" color={theme.colors.textInverse} weight="bold">
            {getInitials(profile.fullName)}
          </AppText>
        </View>

        {/* Name & Farmer Code */}
        <View style={styles.identityBlock}>
          <AppText variant="h2" weight="bold" color={theme.colors.textPrimary} style={styles.fullName}>
            {profile.fullName}
          </AppText>

          <View style={styles.badgeRow}>
            <View style={styles.codeBadge}>
              <AppText variant="caption" weight="bold" color={theme.colors.primaryDark}>
                {profile.farmerCode}
              </AppText>
            </View>

            <View style={styles.verifiedBadge}>
              <AppText variant="caption" weight="bold" color={theme.colors.success}>
                ✓ Verified Farmer
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  identityBlock: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  fullName: {
    letterSpacing: -0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  codeBadge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  verifiedBadge: {
    backgroundColor: theme.colors.successBackground,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
});

export default ProfileHeader;
