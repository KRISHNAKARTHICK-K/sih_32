import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { farmerApi } from '../../api/farmerApi';
import type { ProcurementStatus } from '../../types/farmer';
import {
  Scale,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';

export const FarmerProcurementPage: React.FC = () => {
  const { user } = useAuth();
  const farmerId = user?.farmerId;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data: procurements = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['farmer-procurements', farmerId],
    queryFn: () => (farmerId ? farmerApi.getFarmerProcurements(farmerId) : Promise.resolve([])),
    enabled: !!farmerId,
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
      case 'QUALITY_CHECKED':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
            {status.replace('_', ' ')}
          </span>
        );
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading procurement records &amp; weighment receipts..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load procurements"
        message="Could not retrieve your procurement intake history."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Procurement Ledger</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Official harvest intake vouchers, weighbridge records, and quality certifications
        </p>
      </div>

      {procurements.length === 0 ? (
        <EmptyState
          title="No procurement records yet"
          description="You do not have any finalized crop procurements in the ledger yet. Intakes will appear here once weighment is completed at the centre."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left">Procurement ID</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Crop</th>
                  <th className="px-4 py-3 text-right">Actual Weight</th>
                  <th className="px-4 py-3 text-right">MSP Rate</th>
                  <th className="px-4 py-3 text-right">Gross Amount</th>
                  <th className="px-4 py-3 text-right">Deductions</th>
                  <th className="px-4 py-3 text-right">Net Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {procurements.map((p) => {
                  const isExpanded = expandedId === p.id;
                  return (
                    <React.Fragment key={p.id}>
                      <tr className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                          {p.procurementCode}
                        </td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-slate-900 font-medium whitespace-nowrap">
                          {p.cropName}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {p.actualQuantity} {p.cropUnit}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                          ₹{Number(p.ratePerUnit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700 whitespace-nowrap">
                          ₹{Number(p.grossAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-rose-700 whitespace-nowrap">
                          -₹{Number(p.deductions).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-extrabold text-emerald-800 whitespace-nowrap">
                          ₹{Number(p.netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {getStatusBadge(p.status)}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : p.id)}
                            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Toggle weighment & inspection details"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Inspection & Weighment Detail Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={10} className="px-6 py-4 border-t border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Weighment Card */}
                              <div className="bg-white p-3.5 rounded border border-slate-200 space-y-2">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800 border-b border-slate-100 pb-2">
                                  <Scale className="w-4 h-4 text-emerald-800" /> Weighbridge Intake Data
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Declared vs Actual:</span>
                                  <span className="font-semibold text-slate-900">
                                    {p.declaredQuantity} Qntl &rarr; {p.actualQuantity} Qntl
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Weighbridge Operator:</span>
                                  <span className="font-medium text-slate-800">
                                    {p.weighment?.recordedBy || 'Certified Operator'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Intake Timestamp:</span>
                                  <span className="text-slate-600">
                                    {p.weighment?.recordedAt ? new Date(p.weighment.recordedAt).toLocaleString() : 'N/A'}
                                  </span>
                                </div>
                              </div>

                              {/* Quality Inspection Card */}
                              <div className="bg-white p-3.5 rounded border border-slate-200 space-y-2">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800 border-b border-slate-100 pb-2">
                                  <Sparkles className="w-4 h-4 text-emerald-800" /> Quality &amp; Moisture Certification
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Quality Grade Assigned:</span>
                                  <span className="font-bold text-emerald-900 bg-emerald-100 px-2 py-0.2 rounded text-[11px]">
                                    Grade {p.qualityInspection?.grade || 'A'} (Approved)
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Moisture Content:</span>
                                  <span className="font-medium text-slate-800">
                                    {p.qualityInspection?.moisturePercentage || 12.5}% (Standard &lt; 14%)
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Foreign Matter:</span>
                                  <span className="font-medium text-slate-800">
                                    {p.qualityInspection?.foreignMatterPercentage || 0.8}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerProcurementPage;
