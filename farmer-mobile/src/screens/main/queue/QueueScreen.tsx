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
  AppButton,
  ErrorView,
  DigitalTokenPassCard,
  QueueStatsGrid,
  QueueTimeline,
  TokenSwitcher,
  QueueEmptyState,
  QueueSkeleton,
} from '../../../components';
import { theme } from '../../../theme';
import { useLiveQueue } from '../../../hooks';
import { useRoute, useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../navigation/types';

type RouteProps = RouteProp<MainStackParamList, 'Queue'>;
type NavigationProps = NativeStackNavigationProp<MainStackParamList, 'Queue'>;

export const QueueScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();

  const preferredTokenId = route.params?.tokenId;

  const {
    tokens,
    activeToken,
    associatedBooking,
    centreOverview,
    loading,
    refreshing,
    error,
    lastUpdated,
    selectToken,
    refetch,
  } = useLiveQueue(preferredTokenId);

  // Auto-refresh when screen comes into focus
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
            Live Intake Queue
          </AppText>
          <View style={styles.liveBadge}>
            <View style={styles.greenDot} />
            <AppText variant="caption" color={theme.colors.success} weight="semibold">
              Live Auto-Sync
            </AppText>
          </View>
        </View>

        <View style={styles.placeholderBox} />
      </View>

      {/* Screen Body */}
      {loading && !activeToken ? (
        <QueueSkeleton />
      ) : error && !activeToken ? (
        <ErrorView
          title="Queue Status Unavailable"
          message={error}
          onRetry={refetch}
          retryText="Retry Connection"
        />
      ) : !activeToken || tokens.length === 0 ? (
        <QueueEmptyState onBookPress={() => navigation.navigate('BookSlot')} />
      ) : (
        <>
          {/* Multiple Tokens Switcher (if farmer has > 1 token) */}
          <TokenSwitcher
            tokens={tokens}
            selectedTokenId={activeToken.id}
            onSelectToken={selectToken}
          />

          {/* Quick Realtime Stats (Currently Serving, People Ahead, Your Position) */}
          <QueueStatsGrid token={activeToken} overview={centreOverview} />

          {/* Official Digital Token Pass */}
          <DigitalTokenPassCard token={activeToken} booking={associatedBooking} />

          {/* Intake Stage Progression Timeline */}
          <QueueTimeline status={activeToken.status} />

          {/* Help & Navigation Footer */}
          <View style={styles.footerSection}>
            <AppButton
              title="+ Schedule Another Slot"
              variant="outline"
              onPress={() => navigation.navigate('BookSlot')}
              style={styles.scheduleButton}
            />

            {lastUpdated && (
              <AppText variant="caption" color={theme.colors.textMuted} align="center">
                Last synchronized: {lastUpdated.toLocaleTimeString()}
              </AppText>
            )}
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
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
  },
  placeholderBox: {
    width: 50,
  },
  footerSection: {
    marginTop: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  scheduleButton: {
    marginBottom: 4,
  },
});

export default QueueScreen;
