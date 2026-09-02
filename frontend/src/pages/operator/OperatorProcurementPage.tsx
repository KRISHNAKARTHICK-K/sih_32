import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { operatorApi } from '../../api/operatorApi';
import type { ProcurementStatus } from '../../types/farmer';
import {
  FileSpreadsheet,
  Search,
  ArrowRight,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';

export const OperatorProcurementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const centreId = user?.centreId;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const {
    data: procurements = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['operator-procurement-records', centreId],
    queryFn: () => (centreId ? operatorApi.getCentreProcurements(centreId) : Promise.resolve([])),
    enabled: !!centreId,
  });

  const getStatusBadge = (status: ProcurementStatus) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            {status}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            CANCELLED
          </span>
        );
      case 'WEIGHED':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading centre procurement intake ledgers..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load procurement records"
        message="Could not retrieve procurement entries for this centre."
        onRetry={refetch}
      />
    );
  }

  const filteredProcurements = procurements.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.procurementCode.toLowerCase().includes(query) ||
      p.farmerName.toLowerCase().includes(query) ||
      p.farmerCode.toLowerCase().includes(query) ||
      p.cropName.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-800" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Centre Procurement Ledger</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Official government crop purchase records &bull; {user?.centreName || 'Pollachi Procurement Centre'}
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded">
          Total Records: <strong>{procurements.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search procurement ID, farmer code, or crop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-500 uppercase shrink-0">Filter Status:</span>
          {(['ALL', 'APPROVED', 'COMPLETED', 'WEIGHED', 'DRAFT'] as const).map((status) => (
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
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Procurement Ledger Table */}
      {filteredProcurements.length === 0 ? (
        <EmptyState
          title="No procurement records found"
          description="No finalized crop purchases match the selected filter criteria."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left">Procurement ID</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Farmer</th>
                  <th className="px-4 py-3 text-left">Crop</th>
                  <th className="px-4 py-3 text-right">Actual Weight</th>
                  <th className="px-4 py-3 text-right">MSP Rate</th>
                  <th className="px-4 py-3 text-right">Net Payout</th>
                  <th className="px-4 py-3 text-center">Quality Grade</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredProcurements.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {p.procurementCode}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{p.farmerName}</div>
                      <span className="font-mono text-[10px] text-slate-500">{p.farmerCode}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium whitespace-nowrap">
                      {p.cropName}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {p.actualQuantity} {p.cropUnit}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                      ₹{Number(p.ratePerUnit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-extrabold text-emerald-800 text-sm whitespace-nowrap">
                      ₹{Number(p.netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {p.qualityInspection ? (
                        <span className="font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                          Grade {p.qualityInspection.grade}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => navigate(`/operator/procurement/${p.id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      >
                        Receipt <ArrowRight className="w-3 h-3" />
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

export default OperatorProcurementPage;
