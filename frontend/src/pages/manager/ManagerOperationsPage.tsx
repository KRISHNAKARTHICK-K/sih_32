import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { managerApi } from '../../api/managerApi';
import { useAuth } from '../../auth/AuthContext';
import {
  Activity,
  Calendar,
  Search,
  Users,
  Scale,
  FlaskConical,
  CheckCircle2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/common/LoadingState';

export const ManagerOperationsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'weighment' | 'quality' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [detailModalItem, setDetailModalItem] = useState<{ type: 'booking' | 'queue' | 'procurement'; item: any } | null>(null);

  // Queries
  const { data: queueOverview, isLoading, refetch: refetchQueue } = useQuery({
    queryKey: ['manager-operations-queue', user?.centreId, selectedDate],
    queryFn: () => managerApi.getCentreQueue(user?.centreId || '', selectedDate),
    enabled: !!user?.centreId,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return <LoadingState message="Loading Centre Operational View..." />;
  }

  // Filter Tokens based on tab & search
  const tokens = queueOverview?.activeTokens || [];
  const filteredTokens = tokens.filter((t) => {
    // Search
    const matchesSearch =
      t.displayToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bookingCode.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filtering
    if (activeTab === 'weighment') {
      return t.status === 'VERIFIED' || t.status === 'PROCESSING' || t.status === 'WEIGHING';
    }
    if (activeTab === 'quality') {
      return t.status === 'QUALITY_CHECK';
    }
    if (activeTab === 'completed') {
      return t.status === 'COMPLETED' || t.status === 'APPROVED';
    }
    return true;
  });

  // Calculate station metrics
  const waitingWeighment = tokens.filter((t) => t.status === 'VERIFIED' || t.status === 'PROCESSING' || t.status === 'WEIGHING').length;
  const waitingQuality = tokens.filter((t) => t.status === 'QUALITY_CHECK').length;
  const completedToday = tokens.filter((t) => t.status === 'COMPLETED' || t.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Operations Oversight
            </span>
            <span className="text-xs text-neutral-500 font-mono">Centre: {user?.centreName || 'Pollachi'}</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Live Intake Station Oversight</h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Monitor real-time yard arrivals, weighbridge queues, and lab quality inspections across stations.
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
            onClick={() => refetchQueue()}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Station Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`text-left p-4 rounded-lg border transition ${
            activeTab === 'all'
              ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300 shadow-sm'
              : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Yard Tokens</span>
            <Users className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-900">{tokens.length}</div>
          <div className="mt-1 text-xs text-neutral-500">All stages combined</div>
        </button>

        <button
          onClick={() => setActiveTab('weighment')}
          className={`text-left p-4 rounded-lg border transition ${
            activeTab === 'weighment'
              ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300 shadow-sm'
              : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Awaiting Weighbridge</span>
            <Scale className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-800">{waitingWeighment}</div>
          <div className="mt-1 text-xs text-neutral-500">Verified & In-Scale</div>
        </button>

        <button
          onClick={() => setActiveTab('quality')}
          className={`text-left p-4 rounded-lg border transition ${
            activeTab === 'quality'
              ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-300 shadow-sm'
              : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Awaiting Quality Lab</span>
            <FlaskConical className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-800">{waitingQuality}</div>
          <div className="mt-1 text-xs text-neutral-500">Moisture & Assay Testing</div>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`text-left p-4 rounded-lg border transition ${
            activeTab === 'completed'
              ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300 shadow-sm'
              : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Completed Intakes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-800">{completedToday}</div>
          <div className="mt-1 text-xs text-neutral-500">Procured & Vouchered</div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by token, farmer name, booking code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-neutral-500 font-medium">Stage:</span>
          <span className="text-xs font-semibold text-neutral-800 uppercase bg-neutral-100 px-2 py-1 rounded">
            {activeTab}
          </span>
        </div>
      </div>

      {/* Operational Station Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-neutral-900">
              {activeTab === 'all' && 'All Station Tokens'}
              {activeTab === 'weighment' && 'Weighbridge Intake Queue'}
              {activeTab === 'quality' && 'Quality & Moisture Lab Queue'}
              {activeTab === 'completed' && 'Finalized Intake Records'}
            </h2>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            {filteredTokens.length} record{filteredTokens.length !== 1 ? 's' : ''}
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
                  <th className="py-2.5 px-4">Queue Pos</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Created Time</th>
                  <th className="py-2.5 px-4 text-right">Oversight</th>
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
                    <td className="py-3 px-4 font-medium text-neutral-700">#{t.queuePosition}</td>
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
                    <td className="py-3 px-4 text-neutral-500">
                      {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setDetailModalItem({ type: 'queue', item: t })}
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-neutral-500 text-xs">
            <Activity className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="font-semibold text-neutral-700">No records matching active filter.</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Select another station tab or search query.
            </p>
          </div>
        )}
      </div>

      {/* Record Inspection Modal */}
      {detailModalItem && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                Yard Token Inspection: {detailModalItem.item.displayToken}
              </h3>
              <button
                onClick={() => setDetailModalItem(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Farmer</span>
                <span className="font-bold text-neutral-900">{detailModalItem.item.farmerName}</span>
                <span className="text-neutral-400 block font-mono text-[10px]">{detailModalItem.item.farmerCode}</span>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Booking Code</span>
                <span className="font-mono font-bold text-neutral-900">{detailModalItem.item.bookingCode}</span>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Status</span>
                <Badge variant="info">{detailModalItem.item.status}</Badge>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Yard Position</span>
                <span className="font-bold text-neutral-900">#{detailModalItem.item.queuePosition}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setDetailModalItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerOperationsPage;
