import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  ScreenContainer,
  AppText,
  ErrorView,
  BookingInfoCard,
  BookingScheduleCard,
  BookingQueueCard,
  BookingCancellationCard,
  BookingSkeleton,
} from '../../../components';
import { theme } from '../../../theme';
import { useBookingDetails } from '../../../hooks';
import { useRoute, useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../navigation/types';

type RouteProps = RouteProp<MainStackParamList, 'BookingDetails'>;
type NavigationProps = NativeStackNavigationProp<MainStackParamList, 'BookingDetails'>;

export const BookingDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();

  const { bookingId } = route.params;
  const { booking, loading, refreshing, error, refetch } = useBookingDetails(bookingId);

  // Auto-refresh on focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <ScreenContainer
      scrollable
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <RefreshControl
        refreshing={refreshing}
        onRefresh={refetch}
        colors={[theme.colors.primary]}
        tintColor={theme.colors.primary}
      />

      {/* Header Bar */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <AppText variant="body" weight="bold" color={theme.colors.primaryDark}>
            ← Back
          </AppText>
        </TouchableOpacity>

        <View style={styles.titleGroup}>
          <AppText variant="h3" weight="bold">
            Booking Details
          </AppText>
          {booking && (
            <AppText variant="caption" color={theme.colors.textMuted}>
              {booking.bookingCode}
            </AppText>
          )}
        </View>

        <View style={styles.placeholderBox} />
      </View>

      {/* Body Content */}
      {loading && !booking ? (
        <BookingSkeleton />
      ) : error && !booking ? (
        <ErrorView
          title="Booking Details Unavailable"
          message={error}
          onRetry={refetch}
          retryText="Retry Connection"
        />
      ) : booking ? (
        <>
          {/* Main Booking Information Overview */}
          <BookingInfoCard booking={booking} />

          {/* Schedule & Time Window Details */}
          <BookingScheduleCard
            slotDate={booking.slotDate}
            startTime={booking.startTime}
            endTime={booking.endTime}
            centreName={booking.centreName}
          />

          {/* Queue Token Pass Card */}
          <BookingQueueCard
            queueToken={booking.queueToken}
            onTrackQueue={() => navigation.navigate('Queue')}
          />

          {/* Slot Cancellation & Modification Policy */}
          <BookingCancellationCard />
        </>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  backButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
  },
  titleGroup: {
    alignItems: 'center',
    gap: 2,
  },
  placeholderBox: {
    width: 50,
  },
});

export default BookingDetailsScreen;
