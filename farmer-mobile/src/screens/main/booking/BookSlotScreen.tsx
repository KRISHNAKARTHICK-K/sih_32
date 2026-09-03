import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  ScreenContainer,
  AppCard,
  AppText,
  AppButton,
  AppInput,
  LoadingView,
  ErrorView,
} from '../../../components';
import { theme } from '../../../theme';
import { useAuth } from '../../../hooks';
import { useNetworkStatus } from '../../../context';
import { useTranslation } from '../../../i18n';
import {
  centreService,
  cropService,
  slotService,
  bookingService,
} from '../../../services';
import {
  ProcurementCentre,
  Crop,
  Slot,
  Booking,
} from '../../../types';
import { AppError } from '../../../utils/errorHandler';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'BookSlot'>;

type Step = 'CENTRE' | 'CROP' | 'SLOT' | 'REVIEW';

export const BookSlotScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState<Step>('CENTRE');

  // Master Data
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  // Selections
  const [selectedCentre, setSelectedCentre] = useState<ProcurementCentre | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [declaredQuantity, setDeclaredQuantity] = useState<string>('25');
  const [quantityError, setQuantityError] = useState<string | null>(null);

  // States
  const [loadingCentres, setLoadingCentres] = useState<boolean>(true);
  const [loadingCrops, setLoadingCrops] = useState<boolean>(false);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Centres on Mount
  const loadCentres = useCallback(async () => {
    setLoadingCentres(true);
    setErrorMessage(null);
    try {
      const data = await centreService.getAllCentres(true);
      setCentres(data);
    } catch (err) {
      if (err instanceof AppError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to load procurement centres. Please check connection.');
      }
    } finally {
      setLoadingCentres(false);
    }
  }, []);

  useEffect(() => {
    loadCentres();
  }, [loadCentres]);

  // Fetch Crops when entering Crop step
  const loadCrops = useCallback(async () => {
    setLoadingCrops(true);
    setErrorMessage(null);
    try {
      const data = await cropService.getActiveCrops();
      setCrops(data);
    } catch (err) {
      if (err instanceof AppError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to load eligible crops.');
      }
    } finally {
      setLoadingCrops(false);
    }
  }, []);

  // Fetch Slots when centre is selected
  const loadSlots = useCallback(async (centreId: string) => {
    setLoadingSlots(true);
    setErrorMessage(null);
    try {
      const data = await slotService.getSlotsByCentre(centreId);
      setSlots(data);
      // Auto select first available date
      if (data.length > 0) {
        const uniqueDates = Array.from(new Set(data.map((s) => s.slotDate))).sort();
        if (uniqueDates.length > 0) {
          setSelectedDate(uniqueDates[0]);
        }
      }
    } catch (err) {
      if (err instanceof AppError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to retrieve delivery slots for this centre.');
      }
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // Unique dates extracted from slots
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(slots.map((s) => s.slotDate))).sort();
    return dates;
  }, [slots]);

  // Slots filtered by selected date
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return slots.filter((s) => s.slotDate === selectedDate);
  }, [slots, selectedDate]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Estimated MSP calculation
  const estimatedGrossAmount = useMemo(() => {
    const qty = parseFloat(declaredQuantity);
    const price = selectedCrop?.currentPrice || 0;
    if (isNaN(qty) || qty <= 0) return 0;
    return qty * price;
  }, [declaredQuantity, selectedCrop]);

  // Step 1 -> Step 2
  const handleSelectCentre = (centre: ProcurementCentre) => {
    setSelectedCentre(centre);
    loadCrops();
    setCurrentStep('CROP');
  };

  // Step 2 -> Step 3
  const handleSelectCrop = (crop: Crop) => {
    setSelectedCrop(crop);
    if (selectedCentre) {
      loadSlots(selectedCentre.id);
    }
    setCurrentStep('SLOT');
  };

  // Step 3 -> Step 4
  const handleSelectSlot = (slot: Slot) => {
    if (slot.availableCapacity <= 0 || !slot.active) {
      Alert.alert('Slot Unavailable', 'This time slot is full. Please select another slot.');
      return;
    }
    setSelectedSlot(slot);
    setCurrentStep('REVIEW');
  };

  // Back Navigation between Wizard Steps
  const handleStepBack = () => {
    setErrorMessage(null);
    if (currentStep === 'REVIEW') {
      setCurrentStep('SLOT');
    } else if (currentStep === 'SLOT') {
      setCurrentStep('CROP');
    } else if (currentStep === 'CROP') {
      setCurrentStep('CENTRE');
    } else {
      navigation.goBack();
    }
  };

  // Final Submit Handler
  const handleConfirmBooking = async () => {
    if (submitting) return; // Prevent double submission

    if (!isOnline) {
      Alert.alert(
        t('offline.internetRequired'),
        t('offline.cannotBookOffline')
      );
      return;
    }

    setQuantityError(null);
    setErrorMessage(null);

    const qty = parseFloat(declaredQuantity);
    if (isNaN(qty) || qty <= 0) {
      setQuantityError('Please enter a valid positive quantity in quintals.');
      return;
    }

    if (qty > 1000) {
      setQuantityError('Quantity exceeds maximum permitted single-slot limit (1000 Qtl).');
      return;
    }

    if (!selectedSlot || !selectedCrop || !selectedCentre) {
      setErrorMessage('Incomplete booking configuration. Please restart booking flow.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        farmerId: user?.farmerId,
        slotId: selectedSlot.id,
        cropId: selectedCrop.id,
        declaredQuantity: qty,
      };

      const createdBooking = await bookingService.createBooking(payload);

      // Navigate to success screen with created booking details
      navigation.replace('BookingSuccess', { booking: createdBooking });
    } catch (err) {
      if (err instanceof AppError) {
        if (err.statusCode === 409 || err.type === 'CONFLICT') {
          setErrorMessage('The selected slot is now full. Please pick another available slot.');
          // Refresh slots
          if (selectedCentre) {
            loadSlots(selectedCentre.id);
          }
          setCurrentStep('SLOT');
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage('Failed to confirm booking. Please check connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Render Step Progress Bar
  const renderProgressBar = () => {
    const steps: { key: Step; label: string; num: number }[] = [
      { key: 'CENTRE', label: 'Centre', num: 1 },
      { key: 'CROP', label: 'Crop', num: 2 },
      { key: 'SLOT', label: 'Date & Slot', num: 3 },
      { key: 'REVIEW', label: 'Review', num: 4 },
    ];

    const currentIdx = steps.findIndex((s) => s.key === currentStep);

    return (
      <View style={styles.progressContainer}>
        {steps.map((step, idx) => {
          const isActive = idx === currentIdx;
          const isDone = idx < currentIdx;

          return (
            <View key={step.key} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isActive && styles.stepCircleActive,
                  isDone && styles.stepCircleDone,
                ]}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  color={isActive || isDone ? theme.colors.textInverse : theme.colors.textMuted}
                >
                  {isDone ? '✓' : step.num}
                </AppText>
              </View>
              <AppText
                variant="caption"
                weight={isActive ? 'bold' : 'regular'}
                color={isActive ? theme.colors.primary : theme.colors.textMuted}
                style={styles.stepLabel}
              >
                {step.label}
              </AppText>
            </View>
          );
        })}
      </View>
    );
  };

  // Main Render Content by Step
  const renderStepContent = () => {
    if (errorMessage && !loadingCentres && !loadingCrops && !loadingSlots) {
      return (
        <View style={styles.errorBanner}>
          <AppText variant="caption" color={theme.colors.error} weight="bold">
            ⚠ {errorMessage}
          </AppText>
        </View>
      );
    }

    // STEP 1: CENTRE SELECTION
    if (currentStep === 'CENTRE') {
      if (loadingCentres) {
        return <LoadingView message="Loading procurement centres..." />;
      }

      if (centres.length === 0) {
        return (
          <ErrorView
            title="No Procurement Centres"
            message="No active procurement centres are available for booking currently."
            onRetry={loadCentres}
          />
        );
      }

      return (
        <View style={styles.stepContent}>
          <AppText variant="h2" style={styles.sectionHeading}>
            Select Procurement Centre
          </AppText>
          <AppText variant="label" color={theme.colors.textMuted} style={styles.sectionSub}>
            Choose the nearest regulated market yard for harvest delivery
          </AppText>

          {centres.map((centre) => {
            const isSelected = selectedCentre?.id === centre.id;
            return (
              <TouchableOpacity
                key={centre.id}
                activeOpacity={0.75}
                onPress={() => handleSelectCentre(centre)}
              >
                <AppCard
                  style={[
                    styles.selectionCard,
                    isSelected && styles.selectionCardActive,
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.codeBadge}>
                      <AppText variant="caption" color={theme.colors.primaryDark} weight="bold">
                        {centre.centreCode}
                      </AppText>
                    </View>
                    <View style={styles.statusPill}>
                      <AppText variant="caption" color={theme.colors.success} weight="semibold">
                        ● Open for Intake
                      </AppText>
                    </View>
                  </View>

                  <AppText variant="h3" weight="bold" color={theme.colors.textPrimary} style={styles.cardMainTitle}>
                    {centre.name}
                  </AppText>

                  <AppText variant="caption" color={theme.colors.textSecondary} style={styles.cardAddress}>
                    📍 {centre.address}, {centre.village}, {centre.district}, {centre.state}
                  </AppText>

                  {centre.contactNumber && (
                    <AppText variant="caption" color={theme.colors.textMuted}>
                      📞 Contact: {centre.contactNumber}
                    </AppText>
                  )}
                </AppCard>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    // STEP 2: CROP SELECTION
    if (currentStep === 'CROP') {
      if (loadingCrops) {
        return <LoadingView message="Loading eligible crops & MSP rate card..." />;
      }

      return (
        <View style={styles.stepContent}>
          <AppText variant="h2" style={styles.sectionHeading}>
            Select Crop Produce
          </AppText>
          <AppText variant="label" color={theme.colors.textMuted} style={styles.sectionSub}>
            Selected Centre: {selectedCentre?.name}
          </AppText>

          {crops.map((crop) => {
            const isSelected = selectedCrop?.id === crop.id;
            return (
              <TouchableOpacity
                key={crop.id}
                activeOpacity={0.75}
                onPress={() => handleSelectCrop(crop)}
              >
                <AppCard
                  style={[
                    styles.selectionCard,
                    isSelected && styles.selectionCardActive,
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.codeBadge}>
                      <AppText variant="caption" color={theme.colors.primaryDark} weight="bold">
                        {crop.code}
                      </AppText>
                    </View>
                    <View style={styles.priceTag}>
                      <AppText variant="body" color={theme.colors.primary} weight="bold">
                        {formatCurrency(crop.currentPrice || 0)}
                      </AppText>
                      <AppText variant="caption" color={theme.colors.textSecondary}>
                        / {crop.unit.toLowerCase()}
                      </AppText>
                    </View>
                  </View>

                  <AppText variant="h3" weight="bold" color={theme.colors.textPrimary} style={styles.cardMainTitle}>
                    {crop.name}
                  </AppText>

                  <AppText variant="caption" color={theme.colors.textMuted}>
                    Government Guaranteed Minimum Support Price
                  </AppText>
                </AppCard>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    // STEP 3: DATE & TIME SLOT SELECTION
    if (currentStep === 'SLOT') {
      if (loadingSlots) {
        return <LoadingView message="Loading available delivery time slots..." />;
      }

      if (slots.length === 0) {
        return (
          <View style={styles.stepContent}>
            <AppText variant="h2" style={styles.sectionHeading}>
              No Slots Available
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary} style={styles.sectionSub}>
              There are no active procurement slots configured for {selectedCentre?.name} currently.
            </AppText>
            <AppButton title="Choose Another Centre" onPress={handleStepBack} variant="outline" />
          </View>
        );
      }

      return (
        <View style={styles.stepContent}>
          <AppText variant="h2" style={styles.sectionHeading}>
            Select Delivery Slot
          </AppText>
          <AppText variant="label" color={theme.colors.textMuted} style={styles.sectionSub}>
            {selectedCrop?.name} at {selectedCentre?.name}
          </AppText>

          {/* Date Selector Pills */}
          <AppText variant="caption" color={theme.colors.textMuted} weight="bold" style={styles.subHeading}>
            AVAILABLE DATES
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datePillsContainer}>
            {availableDates.map((dateStr) => {
              const isDateSelected = selectedDate === dateStr;
              return (
                <TouchableOpacity
                  key={dateStr}
                  activeOpacity={0.75}
                  onPress={() => setSelectedDate(dateStr)}
                  style={[
                    styles.datePill,
                    isDateSelected && styles.datePillActive,
                  ]}
                >
                  <AppText
                    variant="caption"
                    color={isDateSelected ? theme.colors.textInverse : theme.colors.textSecondary}
                    weight="bold"
                  >
                    📅 {dateStr}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Time Slots Grid */}
          <AppText variant="caption" color={theme.colors.textMuted} weight="bold" style={styles.subHeading}>
            SELECT TIME WINDOW
          </AppText>

          {slotsForSelectedDate.length === 0 ? (
            <AppCard style={styles.emptySlotCard}>
              <AppText variant="body" color={theme.colors.textSecondary} align="center">
                No slots configured for the selected date.
              </AppText>
            </AppCard>
          ) : (
            slotsForSelectedDate.map((slot) => {
              const isSlotFull = slot.availableCapacity <= 0 || !slot.active;
              const isSelected = selectedSlot?.id === slot.id;

              return (
                <TouchableOpacity
                  key={slot.id}
                  activeOpacity={0.75}
                  disabled={isSlotFull}
                  onPress={() => handleSelectSlot(slot)}
                >
                  <AppCard
                    style={[
                      styles.slotCard,
                      isSelected && styles.selectionCardActive,
                      isSlotFull && styles.slotCardFull,
                    ]}
                  >
                    <View style={styles.slotRow}>
                      <View style={styles.slotTimeGroup}>
                        <AppText variant="h3" weight="bold" color={isSlotFull ? theme.colors.textMuted : theme.colors.textPrimary}>
                          {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                        </AppText>
                        <AppText variant="caption" color={theme.colors.textMuted}>
                          {slot.slotDate}
                        </AppText>
                      </View>

                      <View
                        style={[
                          styles.capacityBadge,
                          isSlotFull ? styles.capacityBadgeFull : styles.capacityBadgeOpen,
                        ]}
                      >
                        <AppText
                          variant="caption"
                          weight="bold"
                          color={isSlotFull ? theme.colors.error : theme.colors.primaryDark}
                        >
                          {isSlotFull ? 'FULL' : `${slot.availableCapacity} / ${slot.capacity} Available`}
                        </AppText>
                      </View>
                    </View>
                  </AppCard>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      );
    }

    // STEP 4: QUANTITY & REVIEW
    if (currentStep === 'REVIEW') {
      return (
        <View style={styles.stepContent}>
          <AppText variant="h2" style={styles.sectionHeading}>
            Review & Confirm Slot
          </AppText>
          <AppText variant="label" color={theme.colors.textMuted} style={styles.sectionSub}>
            Verify delivery details and specify expected produce quantity
          </AppText>

          {/* Quantity Input Card */}
          <AppCard style={styles.quantityCard}>
            <AppText variant="caption" color={theme.colors.textMuted} weight="bold">
              DECLARED PRODUCE QUANTITY
            </AppText>

            <AppInput
              label={`Quantity in ${selectedCrop?.unit || 'Quintals'}`}
              keyboardType="decimal-pad"
              value={declaredQuantity}
              onChangeText={(val) => {
                setDeclaredQuantity(val);
                setQuantityError(null);
              }}
              error={quantityError || undefined}
              helperText="Enter estimated net weight of produce to be delivered"
              containerStyle={styles.quantityInputContainer}
            />

            {/* Estimated Value Calculation */}
            {estimatedGrossAmount > 0 && (
              <View style={styles.calcBox}>
                <AppText variant="caption" color={theme.colors.textSecondary}>
                  Estimated Minimum Support Price Value:
                </AppText>
                <AppText variant="h2" color={theme.colors.success} weight="bold">
                  {formatCurrency(estimatedGrossAmount)}
                </AppText>
                <AppText variant="caption" color={theme.colors.textMuted}>
                  ({declaredQuantity} Qtl @ {formatCurrency(selectedCrop?.currentPrice || 0)}/Qtl)
                </AppText>
              </View>
            )}
          </AppCard>

          {/* Booking Summary Card */}
          <AppCard style={styles.summaryCard}>
            <AppText variant="h3" style={styles.summaryTitle}>
              Booking Details
            </AppText>

            <View style={styles.summaryRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Farmer
              </AppText>
              <AppText variant="body" weight="semibold">
                {user?.fullName} ({user?.farmerCode})
              </AppText>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Procurement Centre
              </AppText>
              <AppText variant="body" weight="semibold">
                {selectedCentre?.name}
              </AppText>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Crop Produce
              </AppText>
              <AppText variant="body" weight="bold" color={theme.colors.primary}>
                {selectedCrop?.name}
              </AppText>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Delivery Date
              </AppText>
              <AppText variant="body" weight="semibold">
                {selectedSlot?.slotDate}
              </AppText>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <AppText variant="label" color={theme.colors.textMuted}>
                Time Window
              </AppText>
              <AppText variant="body" weight="semibold">
                {selectedSlot?.startTime.substring(0, 5)} - {selectedSlot?.endTime.substring(0, 5)}
              </AppText>
            </View>
          </AppCard>

          {/* Submission Buttons */}
          <View style={styles.buttonGroup}>
            <AppButton
              title="Confirm & Book Slot"
              onPress={handleConfirmBooking}
              loading={submitting}
              style={styles.confirmButton}
            />

            <AppButton
              title="Change Time Slot"
              variant="outline"
              onPress={handleStepBack}
              disabled={submitting}
            />
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleStepBack}
          style={styles.backButton}
        >
          <AppText variant="body" weight="bold" color={theme.colors.primaryDark}>
            ← Back
          </AppText>
        </TouchableOpacity>

        <AppText variant="h3" weight="bold">
          Book Procurement Slot
        </AppText>

        <View style={styles.placeholderBox} />
      </View>

      {/* Wizard Progress Bar */}
      {renderProgressBar()}

      {/* Step View Content */}
      {renderStepContent()}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  backButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
  },
  placeholderBox: {
    width: 50,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: theme.colors.primary,
  },
  stepCircleDone: {
    backgroundColor: theme.colors.success,
  },
  stepLabel: {
    fontSize: 10,
  },
  stepContent: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  sectionHeading: {
    letterSpacing: -0.5,
  },
  sectionSub: {
    marginTop: -theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  subHeading: {
    marginTop: theme.spacing.xs,
    letterSpacing: 0.5,
  },
  selectionCard: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  selectionCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0FDF4',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  codeBadge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusPill: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  cardMainTitle: {
    marginTop: 2,
  },
  cardAddress: {
    lineHeight: 18,
  },
  datePillsContainer: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  datePill: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  datePillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  slotCard: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  slotCardFull: {
    opacity: 0.5,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotTimeGroup: {
    gap: 2,
  },
  capacityBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  capacityBadgeOpen: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: '#BBF7D0',
  },
  capacityBadgeFull: {
    backgroundColor: theme.colors.errorBackground,
    borderColor: '#FECACA',
  },
  emptySlotCard: {
    padding: theme.spacing.xl,
  },
  quantityCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  quantityInputContainer: {
    marginTop: theme.spacing.sm,
    marginBottom: 0,
  },
  calcBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    gap: 2,
    marginTop: theme.spacing.xs,
  },
  summaryCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  summaryTitle: {
    marginBottom: theme.spacing.sm,
  },
  summaryRow: {
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
  buttonGroup: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  confirmButton: {
    height: 52,
  },
  errorBanner: {
    backgroundColor: theme.colors.errorBackground,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
});

export default BookSlotScreen;
