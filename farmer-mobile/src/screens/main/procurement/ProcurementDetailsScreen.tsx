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
  AppCard,
  ErrorView,
  WeighmentCard,
  QualityInspectionCard,
  PaymentStatusCard,
  ProcurementSkeleton,
} from '../../../components';
import { theme } from '../../../theme';
import { useProcurementDetails } from '../../../hooks';
import { useRoute, useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../navigation/types';

type RouteProps = RouteProp<MainStackParamList, 'ProcurementDetails'>;
type NavigationProps = NativeStackNavigationProp<MainStackParamList, 'ProcurementDetails'>;

export const ProcurementDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();

  const { procurementId } = route.params;

  const {
    procurement,
    payment,
    loading,
    refreshing,
    error,
    refetch,
  } = useProcurementDetails(procurementId);

  // Auto-refresh on focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const formatDate = (isoString?: string): string => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return isoString;
    }
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
            Intake Slip Details
          </AppText>
          {procurement && (
            <AppText variant="caption" color={theme.colors.textMuted}>
              {procurement.procurementCode}
            </AppText>
          )}
        </View>

        <View style={styles.placeholderBox} />
      </View>

      {/* Body Content */}
      {loading && !procurement ? (
        <ProcurementSkeleton />
      ) : error && !procurement ? (
        <ErrorView
          title="Intake Slip Unavailable"
          message={error}
          onRetry={refetch}
          retryText="Retry Connection"
        />
      ) : procurement ? (
        <>
          {/* Main Procurement Overview Card */}
          <AppCard style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.govtBadge}>
                <AppText variant="caption" color={theme.colors.primaryDark} weight="bold">
                  OFFICIAL INTAKE RECEIPT
                </AppText>
              </View>

              <View style={styles.statusPill}>
                <AppText variant="caption" weight="bold" color={theme.colors.success}>
                  ● {procurement.status}
                </AppText>
              </View>
            </View>

            <View style={styles.cropTitleBlock}>
              <AppText variant="caption" color={theme.colors.textMuted}>
                Crop Produce
              </AppText>
              <AppText variant="h2" weight="bold" color={theme.colors.primary}>
                {procurement.cropName}
              </AppText>
            </View>

            {/* Financial Summary Box */}
            <View style={styles.financeBox}>
              <View style={styles.financeRow}>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  Net Weight:
                </AppText>
                <AppText variant="body" weight="bold" color={theme.colors.textPrimary}>
                  {procurement.actualQuantity > 0 ? procurement.actualQuantity : procurement.declaredQuantity} {procurement.cropUnit || 'Quintals'}
                </AppText>
              </View>

              <View style={styles.financeRow}>
                <AppText variant="body" color={theme.colors.textSecondary}>
                  MSP Rate:
                </AppText>
                <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
                  ₹{procurement.ratePerUnit.toLocaleString('en-IN')} / {procurement.cropUnit || 'Qtl'}
                </AppText>
              </View>

              {procurement.deductions > 0 && (
                <View style={styles.financeRow}>
                  <AppText variant="body" color={theme.colors.error}>
                    Deductions:
                  </AppText>
                  <AppText variant="body" weight="semibold" color={theme.colors.error}>
                    - ₹{procurement.deductions.toLocaleString('en-IN')}
                  </AppText>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.financeRow}>
                <AppText variant="h3" weight="bold" color={theme.colors.textPrimary}>
                  Net Settlement:
                </AppText>
                <AppText variant="h2" weight="bold" color={theme.colors.success}>
                  ₹{procurement.netAmount.toLocaleString('en-IN')}
                </AppText>
              </View>
            </View>

            {/* Reference Details */}
            <View style={styles.detailsList}>
              <View style={styles.tableRow}>
                <AppText variant="label" color={theme.colors.textMuted}>
                  Intake Slip Code
                </AppText>
                <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
                  {procurement.procurementCode}
                </AppText>
              </View>

              <View style={styles.divider} />

              <View style={styles.tableRow}>
                <AppText variant="label" color={theme.colors.textMuted}>
                  Farmer
                </AppText>
                <AppText variant="body" weight="semibold" color={theme.colors.textPrimary}>
                  {procurement.farmerName} ({procurement.farmerCode})
                </AppText>
              </View>

              {procurement.displayToken ? (
                <>
                  <View style={styles.divider} />
                  <View style={styles.tableRow}>
                    <AppText variant="label" color={theme.colors.textMuted}>
                      Queue Token
                    </AppText>
                    <AppText variant="body" weight="bold" color={theme.colors.primaryDark}>
                      {procurement.displayToken}
                    </AppText>
                  </View>
                </>
              ) : null}

              <View style={styles.divider} />

              <View style={styles.tableRow}>
                <AppText variant="label" color={theme.colors.textMuted}>
                  Created At
                </AppText>
                <AppText variant="caption" weight="medium" color={theme.colors.textSecondary}>
                  {formatDate(procurement.createdAt)}
                </AppText>
              </View>
            </View>
          </AppCard>

          {/* Section 1: Weighment Slip */}
          <WeighmentCard
            weighment={procurement.weighment}
            cropUnit={procurement.cropUnit}
          />

          {/* Section 2: Quality Inspection */}
          <QualityInspectionCard
            qualityInspection={procurement.qualityInspection}
          />

          {/* Section 3: DBT Payment & Settlement */}
          <PaymentStatusCard
            payment={payment}
            procurement={procurement}
          />
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
  summaryCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  govtBadge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  statusPill: {
    backgroundColor: theme.colors.successBackground,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  cropTitleBlock: {
    gap: 2,
  },
  financeBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
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
});

export default ProcurementDetailsScreen;
