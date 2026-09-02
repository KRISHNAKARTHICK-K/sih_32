import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { farmerApi } from '../../api/farmerApi';
import type { ProcurementCentre, Crop, Slot, Booking } from '../../types/farmer';
import {
  Building2,
  Wheat,
  Calendar,
  Clock,
  Scale,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  MapPin,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';

type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

export const NewBookingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);

  // Form Selections
  const [selectedCentre, setSelectedCentre] = useState<ProcurementCentre | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Default to tomorrow
  );
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [declaredQuantity, setDeclaredQuantity] = useState<string>('25.00');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // 1. Fetch Active Procurement Centres
  const {
    data: centres = [],
    isLoading: isCentresLoading,
  } = useQuery({
    queryKey: ['active-centres'],
    queryFn: () => farmerApi.getCentres(true),
  });

  // 2. Fetch Crops
  const {
    data: crops = [],
    isLoading: isCropsLoading,
  } = useQuery({
    queryKey: ['crops'],
    queryFn: () => farmerApi.getCrops(),
  });

  // 3. Fetch Slots for selected Centre & Date
  const {
    data: slots = [],
    isLoading: isSlotsLoading,
    refetch: refetchSlots,
  } = useQuery({
    queryKey: ['centre-slots', selectedCentre?.id, selectedDate],
    queryFn: () => (selectedCentre ? farmerApi.getSlots(selectedCentre.id, selectedDate) : Promise.resolve([])),
    enabled: !!selectedCentre && !!selectedDate,
  });

  // 4. Create Booking Mutation
  const bookingMutation = useMutation({
    mutationFn: farmerApi.createBooking,
    onSuccess: (booking) => {
      setConfirmedBooking(booking);
      setCurrentStep(6); // Move to confirmed screen
      // Invalidate relevant queries so all tables stay completely up to date
      queryClient.invalidateQueries({ queryKey: ['farmer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['farmer-queue'] });
      queryClient.invalidateQueries({ queryKey: ['centre-slots'] });
      queryClient.invalidateQueries({ queryKey: ['farmer-notifications'] });
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        setErrorMessage('This slot is no longer available. It has reached full capacity. Please select another slot.');
        refetchSlots();
        setCurrentStep(3); // Send back to slot selection
      } else {
        const msg = err.response?.data?.message || err.message || 'Unable to complete your booking. Please try again.';
        setErrorMessage(msg);
      }
    },
  });

  const handleNextFromCentre = () => {
    if (!selectedCentre) return;
    setErrorMessage(null);
    setCurrentStep(2);
  };

  const handleNextFromCrop = () => {
    if (!selectedCrop) return;
    setErrorMessage(null);
    setCurrentStep(3);
  };

  const handleNextFromSlot = () => {
    if (!selectedSlot) return;
    if (selectedSlot.availableCapacity <= 0) {
      setErrorMessage('Selected slot is full. Please choose an available time window.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(4);
  };

  const handleNextFromQuantity = () => {
    const qty = parseFloat(declaredQuantity);
    if (isNaN(qty) || qty <= 0) {
      setErrorMessage('Please enter a valid declared quantity greater than 0.');
      return;
    }
    if (qty > 1000) {
      setErrorMessage('Maximum quantity per single booking is 1,000 Quintals.');
      return;
    }
    setErrorMessage(null);
    setCurrentStep(5);
  };

  const handleConfirmSubmission = () => {
    if (!selectedSlot || !selectedCrop) return;
    setErrorMessage(null);
    bookingMutation.mutate({
      farmerId: user?.farmerId,
      slotId: selectedSlot.id,
      cropId: selectedCrop.id,
      declaredQuantity: parseFloat(declaredQuantity),
    });
  };

  // Helper for Slot capacity badge
  const getCapacityBadge = (slot: Slot) => {
    if (slot.availableCapacity <= 0) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
          FULL ({slot.bookedCount}/{slot.capacity})
        </span>
      );
    }
    if (slot.availableCapacity <= 10) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
          LIMITED ({slot.availableCapacity} slots left)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
        AVAILABLE ({slot.availableCapacity} free)
      </span>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Book Procurement Slot</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Reserve an official time window at your regional procurement centre
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/farmer/bookings')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Bookings
        </button>
      </div>

      {/* Multi-step Progress Indicator (Steps 1 to 5) */}
      {currentStep < 6 && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-emerald-900 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 1 ? 'bg-emerald-800 text-white' : 'bg-slate-200'}`}>1</span>
              <span>Centre</span>
            </div>
            <div className="h-px w-8 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-emerald-900 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-emerald-800 text-white' : 'bg-slate-200'}`}>2</span>
              <span>Crop</span>
            </div>
            <div className="h-px w-8 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-emerald-900 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 3 ? 'bg-emerald-800 text-white' : 'bg-slate-200'}`}>3</span>
              <span>Date &amp; Slot</span>
            </div>
            <div className="h-px w-8 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${currentStep >= 4 ? 'text-emerald-900 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 4 ? 'bg-emerald-800 text-white' : 'bg-slate-200'}`}>4</span>
              <span>Quantity</span>
            </div>
            <div className="h-px w-8 bg-slate-200" />
            <div className={`flex items-center gap-1.5 ${currentStep >= 5 ? 'text-emerald-900 font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 5 ? 'bg-emerald-800 text-white' : 'bg-slate-200'}`}>5</span>
              <span>Review</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800 font-medium leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* STEP 1: Select Procurement Centre */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-emerald-800" />
            <h2 className="text-sm font-bold text-slate-900">Step 1: Select Procurement Centre</h2>
          </div>

          {isCentresLoading ? (
            <LoadingState message="Loading active procurement centres..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {centres.map((centre) => {
                const isSelected = selectedCentre?.id === centre.id;
                return (
                  <div
                    key={centre.id}
                    onClick={() => setSelectedCentre(centre)}
                    className={`p-4 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50/70 ring-1 ring-emerald-700 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-semibold text-slate-500 uppercase">
                        {centre.centreCode}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        OPEN
                      </span>
                    </div>
                    <p className="font-semibold text-xs text-slate-900">{centre.name}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {centre.village}, {centre.district}, {centre.state}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              disabled={!selectedCentre}
              onClick={handleNextFromCentre}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded disabled:opacity-50 transition-colors"
            >
              Continue to Crop Selection <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Crop */}
      {currentStep === 2 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Wheat className="w-4 h-4 text-emerald-800" />
              <h2 className="text-sm font-bold text-slate-900">Step 2: Select Crop</h2>
            </div>
            <span className="text-xs text-slate-500">Centre: <strong className="text-slate-800">{selectedCentre?.name}</strong></span>
          </div>

          {isCropsLoading ? (
            <LoadingState message="Loading crops & MSP rates..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {crops.map((crop) => {
                const isSelected = selectedCrop?.id === crop.id;
                return (
                  <div
                    key={crop.id}
                    onClick={() => setSelectedCrop(crop)}
                    className={`p-4 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50/70 ring-1 ring-emerald-700 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                      {crop.code}
                    </span>
                    <p className="font-bold text-xs text-slate-900">{crop.name}</p>
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Current MSP Rate:</span>
                      <span className="text-sm font-extrabold text-emerald-800">
                        ₹{crop.currentPrice} <span className="text-[10px] font-normal text-slate-500">/ {crop.unit}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Centre
            </button>
            <button
              type="button"
              disabled={!selectedCrop}
              onClick={handleNextFromCrop}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded disabled:opacity-50 transition-colors"
            >
              Continue to Date &amp; Slot <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Date & Slot Selection */}
      {currentStep === 3 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-800" />
              <h2 className="text-sm font-bold text-slate-900">Step 3: Select Date &amp; Slot</h2>
            </div>
            <span className="text-xs text-slate-500">
              Crop: <strong className="text-slate-800">{selectedCrop?.name}</strong>
            </span>
          </div>

          {/* Date Selector */}
          <div>
            <label htmlFor="slot-date" className="block text-xs font-semibold text-slate-700 mb-1">
              Procurement Intake Date
            </label>
            <input
              id="slot-date"
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot(null);
              }}
              className="block w-full sm:w-64 px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
            />
          </div>

          {/* Slot Grid */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-slate-700">
              Available Operational Slots ({selectedDate})
            </label>

            {isSlotsLoading ? (
              <LoadingState message="Checking slot availability in real time..." />
            ) : slots.length === 0 ? (
              <div className="p-6 border border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-500">
                No slots configured for this date at {selectedCentre?.name}. Please select another date.
              </div>
            ) : (
              <div className="space-y-2">
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const isFull = slot.availableCapacity <= 0;
                  return (
                    <div
                      key={slot.id}
                      onClick={() => !isFull && setSelectedSlot(slot)}
                      className={`p-3.5 rounded-lg border flex items-center justify-between transition-all ${
                        isFull
                          ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'border-emerald-700 bg-emerald-50/80 ring-1 ring-emerald-700 cursor-pointer'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className={`w-4 h-4 ${isSelected ? 'text-emerald-800' : 'text-slate-400'}`} />
                        <div>
                          <p className="font-semibold text-xs text-slate-900">
                            {slot.startTime.substring(0, 5)} – {slot.endTime.substring(0, 5)}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Capacity: {slot.bookedCount} / {slot.capacity} booked
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getCapacityBadge(slot)}
                        <input
                          type="radio"
                          name="slot-radio"
                          disabled={isFull}
                          checked={isSelected}
                          onChange={() => setSelectedSlot(slot)}
                          className="h-4 w-4 text-emerald-800 focus:ring-emerald-700 border-slate-300"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Crop
            </button>
            <button
              type="button"
              disabled={!selectedSlot || selectedSlot.availableCapacity <= 0}
              onClick={handleNextFromSlot}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded disabled:opacity-50 transition-colors"
            >
              Continue to Quantity <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Quantity Input */}
      {currentStep === 4 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Scale className="w-4 h-4 text-emerald-800" />
            <h2 className="text-sm font-bold text-slate-900">Step 4: Declared Harvest Quantity</h2>
          </div>

          <div className="max-w-md space-y-3">
            <label htmlFor="quantity" className="block text-xs font-semibold text-slate-700">
              Estimated Load to Deliver ({selectedCrop?.unit})
            </label>
            <div className="relative rounded-md shadow-xs">
              <input
                id="quantity"
                type="number"
                step="0.01"
                min="0.1"
                max="1000"
                required
                value={declaredQuantity}
                onChange={(e) => setDeclaredQuantity(e.target.value)}
                placeholder="e.g. 50.00"
                className="block w-full pr-16 pl-3 py-2 text-sm font-semibold border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-semibold text-slate-500">
                {selectedCrop?.unit || 'Quintals'}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Final weight will be recorded at the procurement centre weighbridge.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Slot
            </button>
            <button
              type="button"
              onClick={handleNextFromQuantity}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded transition-colors"
            >
              Review Booking Summary <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Booking Review & Confirmation */}
      {currentStep === 5 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-800" />
            <h2 className="text-sm font-bold text-slate-900">Step 5: Review &amp; Confirm Booking</h2>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Procurement Centre:</span>
              <span className="font-semibold text-slate-900">{selectedCentre?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Crop to Deliver:</span>
              <span className="font-semibold text-slate-900">{selectedCrop?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Date:</span>
              <span className="font-semibold text-slate-900">{selectedDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Scheduled Time Slot:</span>
              <span className="font-semibold text-slate-900">
                {selectedSlot?.startTime.substring(0, 5)} – {selectedSlot?.endTime.substring(0, 5)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Declared Quantity:</span>
              <span className="font-bold text-emerald-800">
                {declaredQuantity} {selectedCrop?.unit || 'Quintals'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 leading-relaxed">
            By confirming, you will be assigned a sequential queue token. Please ensure transport reaches the centre prior to your time window.
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={bookingMutation.isPending}
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Edit
            </button>
            <button
              type="button"
              disabled={bookingMutation.isPending}
              onClick={handleConfirmSubmission}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded shadow-xs disabled:opacity-50 transition-colors"
            >
              {bookingMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating booking...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Booking</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Booking Confirmation Screen (Receipt Voucher) */}
      {currentStep === 6 && confirmedBooking && (
        <div className="bg-white border border-emerald-200 rounded-lg p-6 sm:p-8 shadow-sm text-center space-y-6">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Booking Confirmed
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Voucher Code: <span className="font-mono text-emerald-900">{confirmedBooking.bookingCode}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your appointment has been registered in the AGRIPROCURE central ERP system.
            </p>
          </div>

          {/* Prominent Queue Token Banner */}
          <div className="max-w-xs mx-auto p-4 bg-slate-900 rounded-lg text-white shadow-md">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Your Queue Token
            </span>
            <span className="text-3xl font-mono font-extrabold text-emerald-400 block mt-0.5">
              {confirmedBooking.queueToken || 'A-PENDING'}
            </span>
            <span className="text-[11px] text-slate-300 block mt-1">
              Please arrive before your scheduled slot.
            </span>
          </div>

          {/* Voucher Details Table */}
          <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Procurement Centre:</span>
              <span className="font-semibold text-slate-900">{confirmedBooking.centreName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scheduled Date:</span>
              <span className="font-semibold text-slate-900">{confirmedBooking.slotDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time Window:</span>
              <span className="font-semibold text-slate-900">
                {confirmedBooking.startTime?.substring(0, 5)} – {confirmedBooking.endTime?.substring(0, 5)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Crop:</span>
              <span className="font-semibold text-slate-900">{confirmedBooking.cropName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Declared Quantity:</span>
              <span className="font-bold text-emerald-800">
                {confirmedBooking.declaredQuantity} Quintals
              </span>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/farmer/bookings/${confirmedBooking.id}`)}
              className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              View My Booking
            </button>
            <button
              type="button"
              onClick={() => navigate('/farmer/queue')}
              className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded shadow-xs transition-colors"
            >
              View Live Queue Board
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewBookingPage;
