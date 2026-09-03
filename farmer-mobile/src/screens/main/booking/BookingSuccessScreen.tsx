import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  ScreenContainer,
  AppCard,
  AppText,
  AppButton,
} from '../../../components';
import { theme } from '../../../theme';
import { useTranslation } from '../../../i18n';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../navigation/types';

type RouteProps = RouteProp<MainStackParamList, 'BookingSuccess'>;
type NavigationProps = NativeStackNavigationProp<MainStackParamList, 'BookingSuccess'>;

export const BookingSuccessScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();
  const { t } = useTranslation();

  const { booking } = route.params;

  const handleReturnHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleViewAllBookings = () => {
    navigation.navigate('BookingsList');
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      {/* Success Badge & Heading */}
      <View style={styles.header}>
        <View style={styles.successIconCircle}>
          <AppText variant="h1" color={theme.colors.textInverse} weight="bold">
            ✓
          </AppText>
        </View>

        <AppText variant="h1" color={theme.colors.primaryDark} style={styles.title}>
          {t('booking.bookingSuccess')}
        </AppText>
        <AppText variant="body" color={theme.colors.textSecondary} align="center">
          {t('booking.bookingSuccessDesc')}
        </AppText>
      </View>

      {/* Digital Queue Token Card */}
      <AppCard style={styles.tokenCard}>
        <View style={styles.tokenHeader}>
          <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
            {t('queue.digitalTokenPass')}
          </AppText>
        </View>

        <View style={styles.tokenBox}>
          <AppText variant="caption" color={theme.colors.textInverse} weight="semibold">
            {t('booking.digitalToken')}
          </AppText>
          <AppText variant="h1" color={theme.colors.textInverse} style={styles.tokenNumber}>
            {booking.queueToken || 'A-XXX'}
          </AppText>
        </View>

        <View style={styles.codeRow}>
          <AppText variant="caption" color={theme.colors.textMuted}>
            {t('booking.bookingReference')}:
          </AppText>
          <AppText variant="body" color={theme.colors.primary} weight="bold">
            {booking.bookingCode}
          </AppText>
        </View>
      </AppCard>

      {/* Booking Summary Card */}
      <AppCard style={styles.detailsCard}>
        <AppText variant="h3" style={styles.detailsTitle}>
          {t('booking.bookingDetailsTitle')}
        </AppText>

        <View style={styles.row}>
          <AppText variant="label" color={theme.colors.textMuted}>
            {t('booking.cropProduce')}
          </AppText>
          <AppText variant="body" weight="bold">
            {booking.cropName}
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <AppText variant="label" color={theme.colors.textMuted}>
            {t('booking.allocatedCentre')}
          </AppText>
          <AppText variant="body" weight="semibold">
            {booking.centreName}
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <AppText variant="label" color={theme.colors.textMuted}>
            {t('booking.step4Date')}
          </AppText>
          <AppText variant="body" weight="semibold">
            {booking.slotDate}
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <AppText variant="label" color={theme.colors.textMuted}>
            {t('booking.deliveryWindow')}
          </AppText>
          <AppText variant="body" weight="semibold">
            {booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)}
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <AppText variant="label" color={theme.colors.textMuted}>
            {t('booking.declaredQuantity')}
          </AppText>
          <AppText variant="body" weight="bold" color={theme.colors.primary}>
            {booking.declaredQuantity} Quintals
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <AppText variant="label" color={theme.colors.textMuted}>
            Status
          </AppText>
          <View style={styles.statusPill}>
            <AppText variant="caption" color={theme.colors.primaryDark} weight="bold">
              ● {booking.status}
            </AppText>
          </View>
        </View>
      </AppCard>

      {/* Notice Card */}
      <AppCard style={styles.noticeCard}>
        <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
          {t('booking.arrivalInstructions')}
        </AppText>
        <AppText variant="caption" color={theme.colors.textSecondary} style={styles.noticeText}>
          {t('booking.arrivalGuidance')}
        </AppText>
      </AppCard>

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <AppButton
          title={t('booking.inspectBookingDetails')}
          variant="primary"
          onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
          style={styles.homeButton}
        />

        <AppButton
          title={t('booking.returnHome')}
          variant="outline"
          onPress={handleReturnHome}
        />

        <AppButton
          title={t('booking.viewAllBookings')}
          variant="outline"
          onPress={handleViewAllBookings}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  tokenCard: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  tokenHeader: {
    marginBottom: theme.spacing.sm,
  },
  tokenBox: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  tokenNumber: {
    fontSize: 32,
    letterSpacing: 2,
    marginTop: 2,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  detailsCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  detailsTitle: {
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  statusPill: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  noticeCard: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    gap: 4,
  },
  noticeText: {
    lineHeight: 18,
  },
  buttonGroup: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  homeButton: {
    height: 52,
  },
});

export default BookingSuccessScreen;
