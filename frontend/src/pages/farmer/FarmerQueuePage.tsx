import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { farmerApi } from '../../api/farmerApi';
import type { QueueToken, QueueStatus } from '../../types/farmer';
import {
  Activity,
  CheckCircle2,
  CalendarPlus,
  RefreshCw,
  Truck,
  Scale,
  Sparkles,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';

const STATUS_LABELS: Record<QueueStatus, string> = {
  BOOKED: 'Booked',
  ARRIVED: 'Arrived at Gate',
  VERIFIED: 'Entry Verified',
  WAITING: 'Waiting in Yard',
  PROCESSING: 'Under Processing',
  WEIGHING: 'Weighbridge Intake',
  QUALITY_CHECK: 'Quality Check & Moisture Testing',
  APPROVED: 'Approved for Unloading',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const FarmerQueuePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const farmerId = user?.farmerId;

  // 1. Fetch Farmer Queue Tokens with 10s auto-polling
  const {
    data: tokens = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['farmer-queue', farmerId],
    queryFn: () => (farmerId ? farmerApi.getFarmerQueue(farmerId) : Promise.resolve([])),
    enabled: !!farmerId,
    // Poll every 10s only if user has active tokens
    refetchInterval: (query) => {
      const data = query.state.data as QueueToken[] | undefined;
      const hasActive = data?.some((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
      return hasActive ? 10000 : false;
    },
  });

  // Pick the most relevant active queue token
  const activeToken = useMemo(() => {
    return (
      tokens.find((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED') ||
      tokens[0] ||
      null
    );
  }, [tokens]);

  // 2. Fetch Centre Queue Overview for the active token's centre
  const { data: queueOverview } = useQuery({
    queryKey: ['centre-queue-overview', activeToken?.centreId, activeToken?.queueDate],
    queryFn: () =>
      activeToken
        ? farmerApi.getQueueOverview(activeToken.centreId, activeToken.queueDate)
        : Promise.resolve(null),
    enabled: !!activeToken,
    refetchInterval: activeToken && activeToken.status !== 'COMPLETED' ? 10000 : false,
  });

  if (isLoading) {
    return <LoadingState message="Connecting to live queue management system..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load queue status"
        message="Could not retrieve real-time token tracking information."
        onRetry={refetch}
      />
    );
  }

  if (!activeToken) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Live Queue Token</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time gate and intake status</p>
        </div>
        <EmptyState
          title="No active queue token"
          description="You do not have an active queue token scheduled for today. Book a procurement slot to receive an entry token."
          action={
            <button
              type="button"
              onClick={() => navigate('/farmer/bookings/new')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded shadow-xs transition-colors"
            >
              <CalendarPlus className="w-4 h-4" /> Book Procurement Slot
            </button>
          }
        />
      </div>
    );
  }

  const isCompleted = activeToken.status === 'COMPLETED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Polling indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Live Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time yard queue position at <strong className="text-slate-800">{activeToken.centreName}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 shadow-xs">
            <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
            <span>{isCompleted ? 'Queue Closed' : 'Live Auto-Polling (10s)'}</span>
            {isFetching && <RefreshCw className="w-3 h-3 text-slate-400 animate-spin ml-1" />}
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="p-1.5 bg-white border border-slate-200 rounded text-slate-600 hover:text-slate-900 shadow-xs transition-colors"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Token Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Active Token Card */}
        <div className="bg-slate-900 text-white rounded-lg p-6 flex flex-col justify-between shadow-md">
          <div>
            <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
              Your Entry Token
            </span>
            <div className="mt-2 text-4xl font-mono font-extrabold text-emerald-400">
              {activeToken.displayToken}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Booking: {activeToken.bookingCode}
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-800 text-xs text-slate-300">
            Date: <span className="font-semibold text-white">{activeToken.queueDate}</span>
          </div>
        </div>

        {/* Current Serving Token */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
              Currently Serving
            </span>
            <div className="mt-2 text-4xl font-mono font-extrabold text-slate-900">
              {queueOverview?.currentServingToken || activeToken.displayToken}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active token at weighbridge/dock
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Total in yard today:</span>
            <span className="font-bold text-slate-900">{queueOverview?.totalTokens || 1}</span>
          </div>
        </div>

        {/* People Ahead Count */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
              Farmers Ahead of You
            </span>
            <div className="mt-2 text-4xl font-mono font-extrabold text-emerald-800">
              {activeToken.peopleAhead}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeToken.peopleAhead === 0 ? 'Your vehicle is up next!' : 'Vehicles ahead in the queue'}
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Current Phase:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              {STATUS_LABELS[activeToken.status] || activeToken.status}
            </span>
          </div>
        </div>
      </div>

      {/* Queue Progression Pipeline */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Activity className="w-4 h-4 text-emerald-800" />
          <h2 className="text-sm font-bold text-slate-900">Procurement Intake Stages</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
          <div className={`p-3 rounded-lg border ${['ARRIVED', 'VERIFIED', 'WAITING', 'WEIGHING', 'QUALITY_CHECK', 'APPROVED', 'COMPLETED'].includes(activeToken.status) ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <Truck className="w-5 h-5 mx-auto mb-1 text-emerald-800" />
            <span>1. Gate Arrival</span>
          </div>
          <div className={`p-3 rounded-lg border ${['VERIFIED', 'WAITING', 'WEIGHING', 'QUALITY_CHECK', 'APPROVED', 'COMPLETED'].includes(activeToken.status) ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-800" />
            <span>2. Entry Verified</span>
          </div>
          <div className={`p-3 rounded-lg border ${['WEIGHING', 'QUALITY_CHECK', 'APPROVED', 'COMPLETED'].includes(activeToken.status) ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <Scale className="w-5 h-5 mx-auto mb-1 text-emerald-800" />
            <span>3. Weighbridge</span>
          </div>
          <div className={`p-3 rounded-lg border ${['QUALITY_CHECK', 'APPROVED', 'COMPLETED'].includes(activeToken.status) ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <Sparkles className="w-5 h-5 mx-auto mb-1 text-emerald-800" />
            <span>4. Quality Check</span>
          </div>
          <div className={`p-3 rounded-lg border ${['COMPLETED'].includes(activeToken.status) ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-800" />
            <span>5. Intake Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerQueuePage;
