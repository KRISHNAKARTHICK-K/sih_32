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
  ProcurementCard,
  ProcurementEmptyState,
  ProcurementSkeleton,
} from '../../../components';
import { theme } from '../../../theme';
import { useProcurements } from '../../../hooks';
import { Procurement } from '../../../types';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../navigation/types';

type NavigationProps = NativeStackNavigationProp<MainStackParamList, 'Procurements'>;

export const ProcurementsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();

  const {
    procurements,
    loading,
    refreshing,
    error,
    refetch,
  } = useProcurements();

  // Auto-refresh on focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleProcurementPress = (item: Procurement) => {
    navigation.navigate('ProcurementDetails', { procurementId: item.id });
  };

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
            My Procurements
          </AppText>
          {procurements.length > 0 && (
            <View style={styles.countPill}>
              <AppText variant="caption" color={theme.colors.primaryDark} weight="bold">
                {procurements.length} Record{procurements.length !== 1 ? 's' : ''}
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.placeholderBox} />
      </View>

      {/* Content Area */}
      {loading && procurements.length === 0 ? (
        <ProcurementSkeleton />
      ) : error && procurements.length === 0 ? (
        <ErrorView
          title="Procurement Records Unavailable"
          message={error}
          onRetry={refetch}
          retryText="Retry Connection"
        />
      ) : procurements.length === 0 ? (
        <ProcurementEmptyState onBookPress={() => navigation.navigate('BookSlot')} />
      ) : (
        <View style={styles.listContainer}>
          {procurements.map((item) => (
            <ProcurementCard
              key={item.id}
              procurement={item}
              onPress={handleProcurementPress}
            />
          ))}
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
  titleGroup: {
    alignItems: 'center',
    gap: 2,
  },
  countPill: {
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
  listContainer: {
    gap: 0,
  },
});

export default ProcurementsScreen;
