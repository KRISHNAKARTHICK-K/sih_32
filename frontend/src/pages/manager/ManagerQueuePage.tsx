import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { managerApi } from '../../api/managerApi';
import { useAuth } from '../../auth/AuthContext';
import {
  Users,
  Search,
  Calendar,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

export const ManagerQueuePage: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: queueOverview, isLoading, error, refetch } = useQuery({
    queryKey: ['manager-queue-board', user?.centreId, selectedDate],
    queryFn: () => managerApi.getCentreQueue(user?.centreId || '', selectedDate),
    enabled: !!user?.centreId,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return <LoadingState message="Loading Yard Queue Monitor..." />;
  }

  if (error || !queueOverview) {
    return (
      <ErrorState
        title="Failed to Load Queue"
        message={error instanceof Error ? error.message : 'Could not retrieve yard queue data.'}
        onRetry={() => refetch()}
      />
    );
  }

  const tokens = queueOverview.activeTokens || [];
  const waitingTokens = tokens.filter(
    (t) => t.status === 'WAITING' || t.status === 'ARRIVED' || t.status === 'BOOKED'
  );
  const nextToken = waitingTokens.length > 0 ? waitingTokens[0] : null;

  const filteredTokens = tokens.filter((t) => {
    const matchesSearch =
      t.displayToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bookingCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Yard Monitor
            </span>
            <span className="text-xs text-neutral-500 font-mono">10s Auto-Sync</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Yard Queue Board</h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Monitor real-time yard token progression from gate arrival through weighbridge and lab grading.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 text-xs text-neutral-700">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-xs focus:outline-none text-neutral-800 font-medium"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Top Banner: Serving & Next Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Currently Serving */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Currently Serving
          </span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-emerald-950">
            {queueOverview.currentServingToken || 'None'}
          </div>
          <div className="mt-1 text-xs text-emerald-800">
            Active at intake station
          </div>
        </div>

        {/* Up Next */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
            Next In Line
          </span>
          <div className="mt-2 text-3xl font-extrabold font-mono text-blue-950">
            {nextToken ? nextToken.displayToken : 'None'}
          </div>
          <div className="mt-1 text-xs text-blue-800">
            {nextToken ? `${nextToken.farmerName} (${nextToken.bookingCode})` : 'Queue clear'}
          </div>
        </div>

        {/* Waiting Count */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
            Waiting in Yard
          </span>
          <div className="mt-2 text-3xl font-extrabold text-amber-950">
            {queueOverview.waitingCount}
          </div>
          <div className="mt-1 text-xs text-amber-800">
            Total {queueOverview.totalTokens} tokens issued today
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by token, farmer, booking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 text-neutral-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="ALL">All Queue Statuses</option>
            <option value="WAITING">WAITING</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="PROCESSING">PROCESSING / WEIGHING</option>
            <option value="QUALITY_CHECK">QUALITY CHECK</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-200 bg-neutral-50/60 flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-700">Yard Tokens</span>
          <span className="text-neutral-500 font-mono">
            Showing {filteredTokens.length} of {tokens.length}
          </span>
        </div>

        {filteredTokens.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4">Token</th>
                  <th className="py-2.5 px-4">Farmer</th>
                  <th className="py-2.5 px-4">Booking Code</th>
                  <th className="py-2.5 px-4 text-center">Yard Pos</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Created Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredTokens.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900">{t.displayToken}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{t.farmerName}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">{t.farmerCode}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-700">{t.bookingCode}</td>
                    <td className="py-3 px-4 text-center font-bold text-neutral-800">
                      #{t.queuePosition}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          t.status === 'COMPLETED' || t.status === 'APPROVED'
                            ? 'success'
                            : t.status === 'QUALITY_CHECK'
                            ? 'warning'
                            : t.status === 'PROCESSING' || t.status === 'WEIGHING'
                            ? 'info'
                            : 'neutral'
                        }
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-500">
                      {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-neutral-500 text-xs">
            <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="font-semibold text-neutral-700">No queue tokens found.</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Farmers arriving at the centre gate will appear in this yard queue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerQueuePage;
