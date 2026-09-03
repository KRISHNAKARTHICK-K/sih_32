import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  ScreenContainer,
  AppText,
  ErrorView,
  NotificationCard,
  NotificationDetailModal,
  NotificationEmptyState,
  NotificationSkeleton,
} from '../../components';
import { theme } from '../../theme';
import { useNotifications } from '../../hooks';
import { NotificationItem, NotificationType } from '../../types';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';

type NavigationProps = NativeStackNavigationProp<MainStackParamList, 'Notifications'>;

type FilterCategory = 'ALL' | 'UNREAD' | NotificationType;

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();

  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    error,
    markAsRead,
    refetch,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Filtered notification list
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'ALL') {
      return notifications;
    }
    if (activeFilter === 'UNREAD') {
      return notifications.filter((n) => !n.read);
    }
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const handleCardPress = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setModalVisible(true);
    // If unread, mark as read
    if (!notification.read) {
      markAsRead(notification.id).catch(() => {});
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  const filterTabs: { key: FilterCategory; label: string }[] = [
    { key: 'ALL', label: `All (${notifications.length})` },
    { key: 'UNREAD', label: `Unread (${unreadCount})` },
    { key: 'BOOKING', label: 'Bookings' },
    { key: 'QUEUE', label: 'Queue' },
    { key: 'PAYMENT', label: 'Payments' },
  ];

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

      {/* Header Row */}
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
            Notification Center
          </AppText>
          {unreadCount > 0 && (
            <View style={styles.unreadPill}>
              <AppText variant="caption" color={theme.colors.primaryDark} weight="bold">
                {unreadCount} Unread
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.placeholderBox} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.75}
                onPress={() => setActiveFilter(tab.key)}
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
                  {tab.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notification List */}
      {loading && notifications.length === 0 ? (
        <NotificationSkeleton />
      ) : error && notifications.length === 0 ? (
        <ErrorView
          title="Unable to Load Notifications"
          message={error}
          onRetry={refetch}
          retryText="Retry Connection"
        />
      ) : filteredNotifications.length === 0 ? (
        <NotificationEmptyState filterActive={activeFilter !== 'ALL'} />
      ) : (
        <View style={styles.listContainer}>
          {filteredNotifications.map((item) => (
            <NotificationCard
              key={item.id}
              notification={item}
              onPress={handleCardPress}
            />
          ))}
        </View>
      )}

      {/* Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        visible={modalVisible}
        onClose={handleCloseModal}
        onMarkAsRead={markAsRead}
      />
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
  unreadPill: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 1,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  placeholderBox: {
    width: 50,
  },
  filterContainer: {
    marginBottom: theme.spacing.md,
  },
  filterScroll: {
    gap: theme.spacing.xs,
    paddingVertical: 2,
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
});

export default NotificationsScreen;
