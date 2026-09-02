import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { managerApi } from '../../api/managerApi';
import { useAuth } from '../../auth/AuthContext';
import {
  Scale,
  Search,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import type { Procurement } from '../../types/farmer';

export const ManagerProcurementPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cropFilter, setCropFilter] = useState('ALL');
  const [selectedProcurement, setSelectedProcurement] = useState<Procurement | null>(null);

  const { data: procurements, isLoading, error, refetch } = useQuery({
    queryKey: ['manager-procurements', user?.centreId],
    queryFn: () => managerApi.getCentreProcurements(user?.centreId || ''),
    enabled: !!user?.centreId,
  });

  if (isLoading) {
    return <LoadingState message="Loading Centre Procurement Ledger..." />;
  }

  if (error || !procurements) {
    return (
      <ErrorState
        title="Failed to Load Procurements"
        message={error instanceof Error ? error.message : 'Could not retrieve procurement records.'}
        onRetry={() => refetch()}
      />
    );
  }

  const crops = Array.from(new Set(procurements.map((p) => p.cropName)));

  const filteredProcurements = procurements.filter((p) => {
    const matchesSearch =
      p.procurementCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.farmerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.displayToken && p.displayToken.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesCrop = cropFilter === 'ALL' || p.cropName === cropFilter;

    return matchesSearch && matchesStatus && matchesCrop;
  });

  // Calculate totals
  const totalVolume = filteredProcurements.reduce((sum, p) => sum + (Number(p.actualQuantity) || 0), 0);
  const totalNet = filteredProcurements.reduce((sum, p) => sum + (Number(p.netAmount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Procurement Ledger
            </span>
            <span className="text-xs text-neutral-500 font-mono">Centre: {user?.centreName || 'Pollachi'}</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Centre Crop Procurement Ledger</h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Complete historical registry of official crop intakes, certified weighments, quality grades, and MSP payouts.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Intakes</span>
          <div className="mt-2 text-2xl font-bold text-neutral-900">{filteredProcurements.length}</div>
          <div className="text-xs text-neutral-500 mt-1">Processed crop lots</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Quantity Procured</span>
          <div className="mt-2 text-2xl font-bold text-purple-900">
            {totalVolume.toFixed(2)} <span className="text-sm font-normal text-neutral-500">Quintals</span>
          </div>
          <div className="text-xs text-neutral-500 mt-1">Weighbridge scale certified</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Procurement Value</span>
          <div className="mt-2 text-2xl font-bold text-emerald-800">
            ₹{totalNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-neutral-500 mt-1">Net farmer payment obligation</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by code, farmer, token..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Crop Filter */}
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 text-neutral-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="ALL">All Crops</option>
            {crops.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 text-neutral-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">APPROVED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="WEIGHED">WEIGHED</option>
            <option value="DRAFT">DRAFT</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Procurement Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-200 bg-neutral-50/60 flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-700">Procurement Vouchers</span>
          <span className="text-neutral-500 font-mono">
            Showing {filteredProcurements.length} records
          </span>
        </div>

        {filteredProcurements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4">Procurement Code</th>
                  <th className="py-2.5 px-4">Token</th>
                  <th className="py-2.5 px-4">Farmer</th>
                  <th className="py-2.5 px-4">Crop</th>
                  <th className="py-2.5 px-4 text-right">Actual Qty</th>
                  <th className="py-2.5 px-4 text-right">MSP Rate</th>
                  <th className="py-2.5 px-4 text-right">Net Payout</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Date</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProcurements.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900">{p.procurementCode}</td>
                    <td className="py-3 px-4 font-mono text-emerald-800 font-semibold">{p.displayToken || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{p.farmerName}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">{p.farmerCode}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-800">{p.cropName}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-neutral-900">
                      {p.actualQuantity != null ? Number(p.actualQuantity).toFixed(2) : '—'} {p.cropUnit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-neutral-600">
                      ₹{Number(p.ratePerUnit).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                      ₹{Number(p.netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          p.status === 'COMPLETED' || p.status === 'APPROVED'
                            ? 'success'
                            : p.status === 'WEIGHED'
                            ? 'info'
                            : p.status === 'CANCELLED'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedProcurement(p)}
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Voucher
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-neutral-500 text-xs">
            <Scale className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="font-semibold text-neutral-700">No procurement records found.</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Completed weighments and quality certifications will be recorded here.
            </p>
          </div>
        )}
      </div>

      {/* Procurement Voucher Modal */}
      {selectedProcurement && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-xs text-neutral-500 font-mono">Official Procurement Voucher</span>
                <h3 className="text-base font-bold text-neutral-900">{selectedProcurement.procurementCode}</h3>
              </div>
              <button
                onClick={() => setSelectedProcurement(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100">
                  <span className="text-neutral-500 block text-[11px]">Farmer</span>
                  <span className="font-bold text-neutral-900">{selectedProcurement.farmerName}</span>
                  <span className="text-neutral-400 block font-mono text-[10px]">{selectedProcurement.farmerCode}</span>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100">
                  <span className="text-neutral-500 block text-[11px]">Yard Token</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {selectedProcurement.displayToken || '—'}
                  </span>
                </div>
              </div>

              <div className="bg-neutral-50 p-3 rounded border border-neutral-100 space-y-1.5 font-mono">
                <div className="flex justify-between text-neutral-700">
                  <span>Crop:</span>
                  <span className="font-bold">{selectedProcurement.cropName}</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Actual Scale Quantity:</span>
                  <span className="font-bold">{Number(selectedProcurement.actualQuantity).toFixed(2)} {selectedProcurement.cropUnit}</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>MSP Rate per {selectedProcurement.cropUnit}:</span>
                  <span>₹{Number(selectedProcurement.ratePerUnit).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Gross Value:</span>
                  <span>₹{Number(selectedProcurement.grossAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Deductions:</span>
                  <span>₹{Number(selectedProcurement.deductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-neutral-200 pt-1.5 flex justify-between text-emerald-800 font-bold text-sm">
                  <span>Net Farmer Payout:</span>
                  <span>₹{Number(selectedProcurement.netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedProcurement(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerProcurementPage;
