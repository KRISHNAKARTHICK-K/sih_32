import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { operatorApi } from '../../api/operatorApi';
import {
  Activity,
  Building2,
  ArrowRight,
  PhoneForwarded,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

export const OperatorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const centreId = user?.centreId;

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [callError, setCallError] = useState<string | null>(null);

  // 1. Fetch Queue Overview for Centre
  const {
    data: queueOverview,
    isLoading: isQueueLoading,
    isError: isQueueError,
    refetch: refetchQueue,
  } = useQuery({
    queryKey: ['operator-queue-overview', centreId, selectedDate],
    queryFn: () => (centreId ? operatorApi.getQueueOverview(centreId, selectedDate) : Promise.resolve(null)),
    enabled: !!centreId,
    refetchInterval: 10000,
  });

  // 2. Fetch Centre Procurements for Today's Stats
  const {
    data: procurements = [],
    isLoading: isProcurementLoading,
  } = useQuery({
    queryKey: ['operator-procurements', centreId],
    queryFn: () => (centreId ? operatorApi.getCentreProcurements(centreId) : Promise.resolve([])),
    enabled: !!centreId,
  });

  // Call Next Token Mutation (Pessimistic DB lock on backend)
  const callNextMutation = useMutation({
    mutationFn: () => (centreId ? operatorApi.callNextWaitingToken(centreId, selectedDate) : Promise.reject('No centre ID')),
    onSuccess: (token) => {
      setCallError(null);
      queryClient.invalidateQueries({ queryKey: ['operator-queue-overview'] });
      navigate(`/operator/queue/${token.id}`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'No waiting tokens in queue or call conflict.';
      setCallError(msg);
    },
  });

  if (isQueueLoading || isProcurementLoading) {
    return <LoadingState message="Loading operations command center..." />;
  }

  if (isQueueError || !queueOverview) {
    return (
      <ErrorState
        title="Unable to load operator dashboard"
        message="Could not retrieve queue operations for your assigned procurement centre."
        onRetry={refetchQueue}
      />
    );
  }

  const activeTokens = queueOverview.activeTokens || [];
  const currentServing = activeTokens.find((t) => t.status === 'PROCESSING' || t.status === 'WEIGHING' || t.status === 'QUALITY_CHECK') || activeTokens[0];
  const waitingTokens = activeTokens.filter((t) => t.status === 'WAITING' || t.status === 'ARRIVED' || t.status === 'BOOKED');
  const pendingQuality = activeTokens.filter((t) => t.status === 'QUALITY_CHECK' || t.status === 'WEIGHING');
  const completedToday = queueOverview.completedCount || 0;

  return (
    <div className="space-y-6">
      {/* Centre Command Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-800" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {user?.centreName || 'Pollachi Procurement Centre'}
            </h1>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 text-emerald-400">
              {user?.centreCode || 'PC-001'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>Intake Station Terminal &bull; Operator: <strong className="text-slate-700">@{user?.username}</strong></span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Yard Polling
            </span>
          </p>
        </div>

        {/* Date Selector & Call Next Action */}
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
          />
          <button
            type="button"
            disabled={callNextMutation.isPending || waitingTokens.length === 0}
            onClick={() => callNextMutation.mutate()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded shadow-xs disabled:opacity-50 transition-colors"
          >
            <PhoneForwarded className="w-4 h-4" />
            {callNextMutation.isPending ? 'Calling...' : 'Call Next Token'}
          </button>
        </div>
      </div>

      {callError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>{callError}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Waiting in Queue</span>
          <span className="text-2xl font-bold text-amber-700 block mt-1">
            {queueOverview.waitingCount}
          </span>
          <span className="text-[10px] text-slate-400">Farmers in yard</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Currently Serving</span>
          <span className="text-2xl font-mono font-extrabold text-emerald-800 block mt-1">
            {queueOverview.currentServingToken || 'None'}
          </span>
          <span className="text-[10px] text-slate-400">Dock intake active</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Completed Today</span>
          <span className="text-2xl font-bold text-slate-900 block mt-1">
            {completedToday}
          </span>
          <span className="text-[10px] text-slate-400">Intakes finalized</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Pending Verification</span>
          <span className="text-2xl font-bold text-blue-700 block mt-1">
            {activeTokens.filter((t) => t.status === 'ARRIVED' || t.status === 'BOOKED').length}
          </span>
          <span className="text-[10px] text-slate-400">Gate check required</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Pending Quality</span>
          <span className="text-2xl font-bold text-purple-700 block mt-1">
            {pendingQuality.length}
          </span>
          <span className="text-[10px] text-slate-400">Moisture lab tests</span>
        </div>
      </div>

      {/* Operational Focus Row: Currently Serving & Queue Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Focus Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-800" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Active Intake Station Focus
                </h2>
              </div>
              {currentServing && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  {currentServing.status}
                </span>
              )}
            </div>

            {currentServing ? (
              <div className="space-y-3">
                <div className="p-4 bg-slate-900 text-white rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-emerald-400">Active Token</span>
                    <p className="text-3xl font-mono font-extrabold text-emerald-400 mt-0.5">
                      {currentServing.displayToken}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Booking Voucher</span>
                    <p className="text-xs font-mono font-bold text-white mt-0.5">
                      {currentServing.bookingCode}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-[10px] text-slate-500 block">Farmer Name</span>
                    <span className="font-bold text-slate-900">{currentServing.farmerName}</span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {currentServing.farmerCode}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <span className="text-[10px] text-slate-500 block">Contact Phone</span>
                    <span className="font-medium text-slate-800">{currentServing.farmerMobile || 'N/A'}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Queue Date: {currentServing.queueDate}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No active token currently under intake processing.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click "Call Next Token" to advance the waiting queue.
                </p>
              </div>
            )}
          </div>

          {currentServing && (
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Ready for weighment &amp; quality test</span>
              <button
                type="button"
                onClick={() => navigate(`/operator/queue/${currentServing.id}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
              >
                Open Processing Station <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Up Next in Waiting Queue */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-800" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Next in Queue ({waitingTokens.length} Waiting)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/operator/queue')}
                className="text-[11px] font-semibold text-emerald-800 hover:underline"
              >
                Full Queue Board &rarr;
              </button>
            </div>

            {waitingTokens.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-600/60 mx-auto mb-2" />
                <p>Yard queue is currently clear.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {waitingTokens.slice(0, 4).map((token, index) => (
                  <div
                    key={token.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {token.displayToken}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">{token.farmerName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{token.bookingCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">Position #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => navigate(`/operator/queue/${token.id}`)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                      >
                        Process
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-right">
            <button
              type="button"
              onClick={() => navigate('/operator/procurement')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
            >
              View Today's Procurements ({procurements.length}) &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboardPage;
