import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  ScreenContainer,
  AppButton,
  AppText,
  ErrorView,
  DashboardHeader,
  MetricsGrid,
  UpcomingBookingCard,
  LiveQueueCard,
  ProcurementSummaryCard,
  PaymentSummaryCard,
  QuickActions,
  MspRateTicker,
  DashboardSkeleton,
} from '../../components';
import { theme } from '../../theme';
import { useAuth, useFarmerDashboard } from '../../hooks';
import { useTranslation } from '../../i18n';
import { Booking, QueueToken, Procurement } from '../../types';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const {
    activeBooking,
    activeQueueToken,
    latestProcurement,
    latestPayment,
    crops,
    unreadNotifications,
    totalDisbursedAmount,
    totalProcuredQuantity,
    loading,
    refreshing,
    error,
    refetch,
  } = useFarmerDashboard();

  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  // Automatically refresh dashboard data when screen gains focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleLogout = () => {
    Alert.alert(
      t('auth.signOutTitle'),
      t('auth.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.signOutButton'),
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logout();
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleActionPress = (actionId: string) => {
    switch (actionId) {
      case 'booking':
        navigation.navigate('BookSlot');
        break;
      case 'queue':
        navigation.navigate('Queue', activeQueueToken ? { tokenId: activeQueueToken.id } : undefined);
        break;
      case 'procurement':
        navigation.navigate('Procurements');
        break;
      case 'payments':
        if (latestProcurement) {
          navigation.navigate('ProcurementDetails', { procurementId: latestProcurement.id });
        } else {
          navigation.navigate('Procurements');
        }
        break;
    }
  };

  const handleViewBookingDetails = (booking: Booking) => {
    navigation.navigate('BookingDetails', { bookingId: booking.id });
  };

  const handleTrackQueue = (token?: QueueToken) => {
    navigation.navigate('Queue', token ? { tokenId: token.id } : undefined);
  };

  const handleViewProcurement = (proc?: Procurement) => {
    if (proc) {
      navigation.navigate('ProcurementDetails', { procurementId: proc.id });
    } else {
      navigation.navigate('Procurements');
    }
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  // If initial load encountered a critical error
  if (error && loading) {
    return (
      <ScreenContainer style={styles.container}>
        <ErrorView
          title={t('errors.serverError')}
          message={error}
          onRetry={refetch}
          retryText={t('common.retry')}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refetch}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Dashboard Top Header */}
      <DashboardHeader
        user={user}
        unreadCount={unreadNotifications}
        onNotificationPress={handleNotificationPress}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Quick Metrics Grid */}
          <MetricsGrid
            activeBooking={activeBooking}
            activeQueueToken={activeQueueToken}
            totalProcuredQuantity={totalProcuredQuantity}
            totalDisbursedAmount={totalDisbursedAmount}
          />

          {/* Upcoming Booking Card */}
          <UpcomingBookingCard
            booking={activeBooking}
            onBookPress={() => navigation.navigate('BookSlot')}
            onViewDetailsPress={handleViewBookingDetails}
          />

          {/* Live Queue Tracker Card */}
          <LiveQueueCard
            queueToken={activeQueueToken}
            onTrackQueuePress={handleTrackQueue}
          />

          {/* Quick Action Navigation Grid */}
          <QuickActions onActionPress={handleActionPress} />

          {/* Government MSP Rate Ticker */}
          <MspRateTicker crops={crops} />

          {/* Procurement Intake Summary */}
          <ProcurementSummaryCard
            procurement={latestProcurement}
            onPress={handleViewProcurement}
          />

          {/* DBT Payment Summary */}
          <PaymentSummaryCard payment={latestPayment} />

          {/* Sign Out Button */}
          <View style={styles.logoutSection}>
            <AppButton
              title={t('auth.signOutButton')}
              variant="outline"
              onPress={handleLogout}
              loading={loggingOut}
              style={styles.logoutButton}
            />

            <AppText variant="caption" color={theme.colors.textMuted} align="center" style={styles.securityNote}>
              {t('common.secureSession')}
            </AppText>
          </View>
        </>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  logoutSection: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  logoutButton: {
    marginBottom: theme.spacing.md,
  },
  securityNote: {
    marginBottom: theme.spacing.md,
  },
});

export default HomeScreen;
