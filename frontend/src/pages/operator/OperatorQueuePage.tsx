import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { operatorApi } from '../../api/operatorApi';
import type { QueueStatus, QueueToken } from '../../types/farmer';
import {
  Search,
  PhoneForwarded,
  AlertCircle,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';

export const OperatorQueuePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const centreId = user?.centreId;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [callError, setCallError] = useState<string | null>(null);

  // Fetch Queue Overview with 10s auto-polling
  const {
    data: queueOverview,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['operator-queue-board', centreId, selectedDate],
    queryFn: () => (centreId ? operatorApi.getQueueOverview(centreId, selectedDate) : Promise.resolve(null)),
    enabled: !!centreId,
    refetchInterval: 10000,
  });

  // Call Next Token Mutation
  const callNextMutation = useMutation({
    mutationFn: () => (centreId ? operatorApi.callNextWaitingToken(centreId, selectedDate) : Promise.reject('No centre ID')),
    onSuccess: (token) => {
      setCallError(null);
      queryClient.invalidateQueries({ queryKey: ['operator-queue-board'] });
      queryClient.invalidateQueries({ queryKey: ['operator-queue-overview'] });
      navigate(`/operator/queue/${token.id}`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'No waiting tokens in queue or call conflict.';
      setCallError(msg);
    },
  });

  if (isLoading) {
    return <LoadingState message="Loading yard queue board..." />;
  }

  if (isError || !queueOverview) {
    return (
      <ErrorState
        title="Unable to load queue"
        message="Could not retrieve queue board records for this centre."
        onRetry={refetch}
      />
    );
  }

  const allTokens = queueOverview.activeTokens || [];

  // Filter and search tokens
  const filteredTokens = allTokens.filter((token) => {
    const matchesStatus = statusFilter === 'ALL' || token.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      token.displayToken.toLowerCase().includes(query) ||
      token.bookingCode.toLowerCase().includes(query) ||
      token.farmerName.toLowerCase().includes(query) ||
      token.farmerCode.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case 'BOOKED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            BOOKED
          </span>
        );
      case 'ARRIVED':
      case 'WAITING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            WAITING
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
            VERIFIED
          </span>
        );
      case 'PROCESSING':
      case 'WEIGHING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
            PROCESSING
          </span>
        );
      case 'QUALITY_CHECK':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
            QUALITY CHECK
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  const getActionButton = (token: QueueToken) => {
    switch (token.status) {
      case 'BOOKED':
      case 'ARRIVED':
      case 'WAITING':
        return (
          <button
            type="button"
            onClick={() => navigate(`/operator/queue/${token.id}`)}
            className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition-colors"
          >
            Verify / Process &rarr;
          </button>
        );
      case 'VERIFIED':
      case 'PROCESSING':
      case 'WEIGHING':
      case 'QUALITY_CHECK':
        return (
          <button
            type="button"
            onClick={() => navigate(`/operator/queue/${token.id}`)}
            className="px-2.5 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
          >
            Continue Intake &rarr;
          </button>
        );
      case 'COMPLETED':
        return (
          <button
            type="button"
            onClick={() => navigate(`/operator/queue/${token.id}`)}
            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            View Voucher
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Queue Management Board</h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>Yard intake tokens for <strong className="text-slate-700">{user?.centreName || 'Pollachi'}</strong></span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              10s Real-time Sync
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
          />
          <button
            type="button"
            disabled={callNextMutation.isPending}
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

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search token (e.g. A-006), booking, or farmer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-500 uppercase shrink-0">Filter Status:</span>
          {(['ALL', 'WAITING', 'VERIFIED', 'PROCESSING', 'QUALITY_CHECK', 'COMPLETED'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs font-semibold rounded shrink-0 transition-colors ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Operational Queue Table */}
      {filteredTokens.length === 0 ? (
        <EmptyState
          title="No queue tokens found"
          description="No farmer queue tokens match the selected filters for this procurement date."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left">Token</th>
                  <th className="px-4 py-3 text-left">Booking Code</th>
                  <th className="px-4 py-3 text-left">Farmer</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredTokens.map((token) => (
                  <tr key={token.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 font-mono font-extrabold text-sm rounded bg-slate-900 text-emerald-400">
                        {token.displayToken}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {token.bookingCode}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{token.farmerName}</div>
                      <span className="font-mono text-[10px] text-slate-500">{token.farmerCode}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-medium">
                      {token.farmerMobile || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {token.queueDate}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {getStatusBadge(token.status)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {getActionButton(token)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Showing {filteredTokens.length} of {allTokens.length} tokens</span>
            <span>Refreshes automatically every 10s</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorQueuePage;
