import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { operatorApi } from '../../api/operatorApi';
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';

export const QualityInspectionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const centreId = user?.centreId;
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    data: queueOverview,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['quality-queue', centreId],
    queryFn: () => (centreId ? operatorApi.getQueueOverview(centreId) : Promise.resolve(null)),
    enabled: !!centreId,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return <LoadingState message="Connecting to centre moisture testing laboratory..." />;
  }

  if (isError || !queueOverview) {
    return (
      <ErrorState
        title="Quality Lab Error"
        message="Could not load yard tokens for quality testing."
        onRetry={refetch}
      />
    );
  }

  const activeTokens = queueOverview.activeTokens || [];
  // Tokens awaiting quality inspection
  const qualityTokens = activeTokens.filter(
    (t) => t.status === 'QUALITY_CHECK' || t.status === 'WEIGHING' || t.status === 'PROCESSING'
  );

  const filteredTokens = qualityTokens.filter((token) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      token.displayToken.toLowerCase().includes(q) ||
      token.bookingCode.toLowerCase().includes(q) ||
      token.farmerName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-800" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Quality &amp; Moisture Testing Lab</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Central MSP Fair Average Quality (FAQ) grading &bull; {user?.centreName || 'Pollachi Procurement Centre'}
          </p>
        </div>

        <div className="px-3 py-1.5 bg-purple-50 border border-purple-200 rounded text-xs text-purple-900 font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-700" />
          <span>Moisture Meter Calibrated (&lt; 14.0% Standard)</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search token or farmer for quality inspection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Quality Inspection Queue Table */}
      {filteredTokens.length === 0 ? (
        <EmptyState
          title="No samples awaiting quality testing"
          description="All arrived grain intakes have been certified or are currently undergoing initial check-in."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left">Queue Token</th>
                  <th className="px-4 py-3 text-left">Booking Code</th>
                  <th className="px-4 py-3 text-left">Farmer Name</th>
                  <th className="px-4 py-3 text-left">Contact Mobile</th>
                  <th className="px-4 py-3 text-center">Stage Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredTokens.map((token) => (
                  <tr key={token.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-extrabold text-sm text-slate-900 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded bg-slate-900 text-emerald-400">
                        {token.displayToken}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-800 whitespace-nowrap font-medium">
                      {token.bookingCode}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{token.farmerName}</div>
                      <span className="font-mono text-[10px] text-slate-500">{token.farmerCode}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {token.farmerMobile || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                        {token.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => navigate(`/operator/queue/${token.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                      >
                        Inspect &amp; Grade <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityInspectionPage;
