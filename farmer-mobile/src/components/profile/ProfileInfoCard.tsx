import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { theme } from '../../theme';
import { FarmerProfile } from '../../types';

export interface ProfileInfoCardProps {
  profile: FarmerProfile;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ profile }) => {
  const formatDate = (isoString?: string): string => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <AppCard style={styles.card}>
      <View style={styles.cardHeader}>
        <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
          PERSONAL & FARM LOCATION
        </AppText>
        <AppText variant="h3" style={styles.title}>
          🌾 Registration Details
        </AppText>
      </View>

      <View style={styles.detailsList}>
        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Mobile Number
          </AppText>
          <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
            +91 {profile.mobile}
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Email Address
          </AppText>
          <AppText variant="body" weight="medium" color={theme.colors.textPrimary}>
            {profile.email || 'Not provided'}
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Village / Town
          </AppText>
          <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
            {profile.village || 'N/A'}
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            District
          </AppText>
          <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
            {profile.district || 'N/A'}
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            State
          </AppText>
          <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
            {profile.state || 'N/A'}
          </AppText>
        </View>

        {profile.address ? (
          <>
            <View style={styles.divider} />
            <View style={styles.tableRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Farm Address
              </AppText>
              <AppText variant="body" color={theme.colors.textPrimary} style={styles.addressText}>
                {profile.address}
              </AppText>
            </View>
          </>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.tableRow}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Registered Since
          </AppText>
          <AppText variant="caption" weight="medium" color={theme.colors.textSecondary}>
            {formatDate(profile.createdAt)}
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
  addressText: {
    flex: 1,
    textAlign: 'right',
    marginLeft: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 2,
  },
});

export default ProfileInfoCard;
