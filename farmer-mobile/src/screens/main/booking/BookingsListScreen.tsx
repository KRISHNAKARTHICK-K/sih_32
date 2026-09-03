import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import {
  ScreenContainer,
  AppText,
  BookingCard,
  BookingSkeleton,
  BookingEmptyState,
  ErrorView,
} from '../../../components';
import { theme } from '../../../theme';
import { useAuth } from '../../../hooks';
import { bookingService } from '../../../services';
import { Booking } from '../../../types';
import { cacheStorage } from '../../../storage';
import { useTranslation } from '../../../i18n';
import { AppError } from '../../../utils/errorHandler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'BookingsList'>;

export const BookingsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const loadBookings = useCallback(
    async (isRefresh = false) => {
      if (!user?.farmerId) {
        setLoading(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const farmerId = user.farmerId;

      try {
        const data = await bookingService.getFarmerBookings(farmerId);
        setBookings(data);
        await cacheStorage.set(farmerId, 'bookings', data);
      } catch (err) {
        const cached = await cacheStorage.get<Booking[]>(farmerId, 'bookings');
        if (cached && cached.data) {
          setBookings(cached.data);
        } else if (err instanceof AppError) {
          setError(err.message);
        } else {
          setError(t('errors.failedLoadBookings'));
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.farmerId, t]
  );

  // Auto-refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings])
  );

  const handleBookingPress = (booking: Booking) => {
    navigation.navigate('BookingDetails', { bookingId: booking.id });
  };

  const filterOptions = ['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'];

  const filteredBookings = selectedFilter === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status === selectedFilter);

  return (
    <ScreenContainer
      scrollable
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <RefreshControl
        refreshing={refreshing}
        onRefresh={() => loadBookings(true)}
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
            {t('common.back')}
          </AppText>
        </TouchableOpacity>

        <AppText variant="h3" weight="bold">
          {t('booking.mySlotsTitle')}
        </AppText>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('BookSlot')}
          style={styles.newButton}
        >
          <AppText variant="caption" weight="bold" color={theme.colors.primaryDark}>
            {t('booking.bookSlotAction')}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Status Filter Chips */}
      {bookings.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterOptions.map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.75}
                onPress={() => setSelectedFilter(filter)}
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                ]}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  color={isActive ? theme.colors.textInverse : theme.colors.textSecondary}
                >
                  {filter === 'ALL' ? t('common.all') : filter}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Content Area */}
      {loading && bookings.length === 0 ? (
        <BookingSkeleton />
      ) : error && bookings.length === 0 ? (
        <ErrorView
          title={t('errors.failedLoadBookings')}
          message={error}
          onRetry={() => loadBookings(false)}
          retryText={t('common.retry')}
        />
      ) : bookings.length === 0 ? (
        <BookingEmptyState
          onBookPress={() => navigation.navigate('BookSlot')}
        />
      ) : (
        <View style={styles.listContainer}>
          {filteredBookings.length === 0 ? (
            <AppText
              variant="body"
              color={theme.colors.textMuted}
              align="center"
              style={styles.noFilterMatch}
            >
              {t('common.noData')}
            </AppText>
          ) : (
            filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPress={handleBookingPress}
              />
            ))
          )}
        </View>
      )}
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
  newButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  filterScroll: {
    gap: theme.spacing.xs,
    paddingVertical: 2,
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  listContainer: {
    gap: 0,
  },
  noFilterMatch: {
    paddingVertical: theme.spacing.xl,
  },
});

export default BookingsListScreen;
