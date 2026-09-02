import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { farmerApi } from '../../api/farmerApi';
import {
  CalendarPlus,
  CalendarCheck,
  Clock,
  PackageCheck,
  CreditCard,
  Wheat,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

export const FarmerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const farmerId = user?.farmerId;

  // 1. Fetch Farmer Bookings
  const {
    data: bookings = [],
    isLoading: isBookingsLoading,
    isError: isBookingsError,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ['farmer-bookings', farmerId],
    queryFn: () => (farmerId ? farmerApi.getFarmerBookings(farmerId) : Promise.resolve([])),
    enabled: !!farmerId,
  });

  // 2. Fetch Farmer Queue Tokens
  const {
    data: queueTokens = [],
    isLoading: isQueueLoading,
  } = useQuery({
    queryKey: ['farmer-queue', farmerId],
    queryFn: () => (farmerId ? farmerApi.getFarmerQueue(farmerId) : Promise.resolve([])),
    enabled: !!farmerId,
    refetchInterval: 10000,
  });

  // 3. Fetch Farmer Procurements
  const {
    data: procurements = [],
    isLoading: isProcurementLoading,
  } = useQuery({
    queryKey: ['farmer-procurements', farmerId],
    queryFn: () => (farmerId ? farmerApi.getFarmerProcurements(farmerId) : Promise.resolve([])),
    enabled: !!farmerId,
  });

  // 4. Fetch Farmer Payments
  const {
    data: payments = [],
    isLoading: isPaymentsLoading,
  } = useQuery({
    queryKey: ['farmer-payments', farmerId],
    queryFn: () => (farmerId ? farmerApi.getFarmerPayments(farmerId) : Promise.resolve([])),
    enabled: !!farmerId,
  });

  if (isBookingsLoading || isQueueLoading || isProcurementLoading || isPaymentsLoading) {
    return <LoadingState message="Loading your Farmer Operations Dashboard..." />;
  }

  if (isBookingsError) {
    return (
      <ErrorState
        title="Unable to load farmer profile"
        message="Could not retrieve your agricultural procurement operations."
        onRetry={refetchBookings}
      />
    );
  }

  // Find next upcoming / active booking
  const nextBooking = bookings.find((b) => b.status === 'CONFIRMED' || b.status === 'PENDING') || bookings[0];
  const activeQueueToken = queueTokens.find((q) => q.status !== 'COMPLETED' && q.status !== 'CANCELLED') || queueTokens[0];
  const latestProcurement = procurements[0];
  const latestPayment = payments[0];

  return (
    <div className="space-y-6">
      {/* 1. Farmer Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            <Wheat className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Good day, {user?.fullName || user?.username}
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                {user?.farmerCode || 'FAR-VERIFIED'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
              {user?.mobile && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> +91 {user.mobile}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Coimbatore District, Tamil Nadu
              </span>
              <span className="flex items-center gap-1 text-emerald-800 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> DBT Direct Benefit Transfer Enrolled
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => navigate('/farmer/bookings/new')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded shadow-xs transition-colors"
          >
            <CalendarPlus className="w-4 h-4" />
            Book Procurement Slot
          </button>
        </div>
      </div>

      {/* 2. Operations Status Row (Next Booking & Active Queue) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Booking Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-800" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Upcoming Booking
                </h2>
              </div>
              {nextBooking && (
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-emerald-100 text-emerald-800">
                  {nextBooking.status}
                </span>
              )}
            </div>

            {nextBooking ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Code:</span>
                  <span className="font-mono font-semibold text-slate-900">{nextBooking.bookingCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Centre:</span>
                  <span className="font-medium text-slate-800">{nextBooking.centreName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Date &amp; Slot:</span>
                  <span className="font-semibold text-slate-900">
                    {nextBooking.slotDate} ({nextBooking.startTime.substring(0, 5)} - {nextBooking.endTime.substring(0, 5)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Crop &amp; Declared Quantity:</span>
                  <span className="font-medium text-emerald-900">
                    {nextBooking.cropName} ({nextBooking.declaredQuantity} Quintals)
                  </span>
                </div>
                {nextBooking.queueToken && (
                  <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between">
                    <span className="text-[11px] font-medium text-emerald-900">Issued Queue Token:</span>
                    <span className="font-mono font-bold text-sm text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {nextBooking.queueToken}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No upcoming slot bookings found.</p>
                <button
                  type="button"
                  onClick={() => navigate('/farmer/bookings/new')}
                  className="mt-3 inline-flex items-center gap-1 text-emerald-800 font-semibold hover:underline"
                >
                  Schedule your visit now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {nextBooking && (
            <div className="pt-3 mt-3 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => navigate(`/farmer/bookings/${nextBooking.id}`)}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-1"
              >
                View Full Voucher <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Live Queue Monitor Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-800" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Live Queue Token
                </h2>
              </div>
              {activeQueueToken && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live Polling
                </span>
              )}
            </div>

            {activeQueueToken ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-900 text-white rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Your Token</span>
                    <p className="text-2xl font-mono font-bold text-emerald-400 leading-tight">
                      {activeQueueToken.displayToken}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Current Status</span>
                    <p className="text-xs font-semibold text-white bg-slate-800 px-2 py-1 rounded mt-0.5">
                      {activeQueueToken.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center">
                    <span className="text-[10px] text-slate-500 block">People Ahead</span>
                    <span className="text-base font-bold text-slate-800">
                      {activeQueueToken.peopleAhead}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center">
                    <span className="text-[10px] text-slate-500 block">Centre</span>
                    <span className="text-xs font-medium text-slate-800 truncate block">
                      {activeQueueToken.centreName}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>You have no active queue tokens for today.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Queue tokens are automatically issued when booking a slot.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-right">
            <button
              type="button"
              onClick={() => navigate('/farmer/queue')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-1"
            >
              Open Live Queue Board <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Recent Activity Row (Procurements & Payments) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest Procurement Record */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-800" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Latest Procurement Intake
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/farmer/procurement')}
              className="text-[11px] font-semibold text-emerald-800 hover:underline"
            >
              View All ({procurements.length})
            </button>
          </div>

          {latestProcurement ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Procurement ID:</span>
                <span className="font-mono font-semibold text-slate-900">{latestProcurement.procurementCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Crop &amp; Actual Qty:</span>
                <span className="font-medium text-slate-800">
                  {latestProcurement.cropName} &bull; {latestProcurement.actualQuantity} {latestProcurement.cropUnit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Net Settled Amount:</span>
                <span className="font-bold text-slate-900">
                  ₹{Number(latestProcurement.netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Intake Status:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  {latestProcurement.status}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-3 text-center">No past procurements recorded yet.</p>
          )}
        </div>

        {/* Latest Payment Disbursement */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-800" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Latest Payment Disbursement
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/farmer/payments')}
              className="text-[11px] font-semibold text-emerald-800 hover:underline"
            >
              View All ({payments.length})
            </button>
          </div>

          {latestPayment ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Voucher Code:</span>
                <span className="font-mono font-semibold text-slate-900">{latestPayment.paymentCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Disbursed:</span>
                <span className="font-bold text-emerald-800 text-sm">
                  ₹{Number(latestPayment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono text-slate-700">{latestPayment.transactionReference || 'Processing'}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Status:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  {latestPayment.status}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-3 text-center">No payment disbursements recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboardPage;
