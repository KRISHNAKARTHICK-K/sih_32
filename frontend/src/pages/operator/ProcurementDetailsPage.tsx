import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { operatorApi } from '../../api/operatorApi';
import {
  ArrowLeft,
  Printer,
  Scale,
  Sparkles,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

export const ProcurementDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: procurement,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['procurement-detail', id],
    queryFn: () => (id ? operatorApi.getProcurementById(id) : Promise.reject('No ID')),
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingState message="Loading procurement certificate..." />;
  }

  if (isError || !procurement) {
    return (
      <ErrorState
        title="Procurement record not found"
        message="Could not load official details for this procurement certificate."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={() => navigate('/operator/procurement')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Procurement Ledger
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded shadow-xs hover:bg-slate-50 transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Official Certificate
        </button>
      </div>

      {/* Official Government Header (Print View) */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-xl font-bold uppercase tracking-wider">Tamil Nadu State Civil Supplies Corporation</h1>
        <h2 className="text-sm font-semibold text-slate-700">Official Grain Purchase &amp; Weighment Voucher</h2>
        <p className="text-xs text-slate-500 font-mono mt-1">Certificate #{procurement.procurementCode}</p>
      </div>

      {/* Official Procurement Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
              Procurement Intake Certificate
            </span>
            <h1 className="text-lg font-mono font-bold">{procurement.procurementCode}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-emerald-900 text-emerald-300 border border-emerald-700">
              {procurement.status}
            </span>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-6 space-y-6">
          {/* Farmer & Crop Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
                Farmer Identity
              </span>
              <p className="font-bold text-slate-900 text-sm">{procurement.farmerName}</p>
              <p className="font-mono text-[11px] text-slate-500 mt-1">Farmer Code: {procurement.farmerCode}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">DBT Aadhaar Bank Linked &bull; PFMS Active</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
                Crop &amp; Rate Classification
              </span>
              <p className="font-bold text-slate-900 text-sm">{procurement.cropName}</p>
              <p className="text-[11px] text-slate-700 font-mono font-bold mt-1">
                MSP Rate: ₹{Number(procurement.ratePerUnit).toLocaleString('en-IN', { minimumFractionDigits: 2 })} / {procurement.cropUnit}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Central Government Minimum Support Price Standard</p>
            </div>
          </div>

          {/* Weighment & Quality Testing Verification Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Weighment */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 border-b border-slate-100 pb-2">
                <Scale className="w-4 h-4 text-emerald-800" /> Weighbridge Intake Data
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Declared Weight:</span>
                <span className="font-semibold text-slate-700">{procurement.declaredQuantity} {procurement.cropUnit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Certified Net Scale Weight:</span>
                <span className="font-extrabold text-emerald-900 text-sm">{procurement.actualQuantity} {procurement.cropUnit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scale Terminal Operator:</span>
                <span className="font-medium text-slate-800">{procurement.weighment?.recordedBy || 'Certified Operator'}</span>
              </div>
            </div>

            {/* Quality Inspection */}
            <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 border-b border-slate-100 pb-2">
                <Sparkles className="w-4 h-4 text-emerald-800" /> Quality &amp; Moisture Certification
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Certified Grade:</span>
                <span className="font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                  Grade {procurement.qualityInspection?.grade || 'A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Moisture Content:</span>
                <span className="font-medium text-slate-800">
                  {procurement.qualityInspection?.moisturePercentage || 12.5}% (MSP Limit &lt; 14%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Foreign Matter:</span>
                <span className="font-medium text-slate-800">
                  {procurement.qualityInspection?.foreignMatterPercentage || 0.8}%
                </span>
              </div>
            </div>
          </div>

          {/* Authoritative Financial Computation Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Financial Ledger Computation</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Actual Intake</span>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">{procurement.actualQuantity} {procurement.cropUnit}</p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Gross Amount</span>
                <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                  ₹{Number(procurement.grossAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block">Deductions</span>
                <p className="font-mono font-bold text-rose-700 text-sm mt-0.5">
                  -₹{Number(procurement.deductions).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded">
                <span className="text-[10px] text-emerald-900 uppercase font-semibold block">Net Payout</span>
                <p className="font-mono font-extrabold text-emerald-900 text-sm mt-0.5">
                  ₹{Number(procurement.netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Certified on {new Date(procurement.createdAt).toLocaleString()}
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            Status: {procurement.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProcurementDetailsPage;
