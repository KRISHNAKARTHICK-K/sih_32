import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { operatorApi } from '../../api/operatorApi';
import type { QualityGrade } from '../../types/farmer';
import {
  ArrowLeft,
  CheckCircle2,
  Scale,
  Sparkles,
  Printer,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

export const TokenProcessingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // queueTokenId
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Weighment form state
  const [actualWeight, setActualWeight] = useState<string>('');
  const [weighmentRemarks, setWeighmentRemarks] = useState<string>('');

  // Quality inspection form state
  const [grade, setGrade] = useState<QualityGrade>('A');
  const [moisture, setMoisture] = useState<string>('12.5');
  const [foreignMatter, setForeignMatter] = useState<string>('0.8');
  const [brokenGrain, setBrokenGrain] = useState<string>('1.0');
  const [qualityRemarks, setQualityRemarks] = useState<string>('Meets MSP Fair Average Quality (FAQ) standards.');
  const isApproved = grade !== 'REJECTED';

  const [actionError, setActionError] = useState<string | null>(null);

  // 1. Fetch Queue Token
  const {
    data: token,
    isLoading: isTokenLoading,
    isError: isTokenError,
    refetch: refetchToken,
  } = useQuery({
    queryKey: ['queue-token-detail', id],
    queryFn: () => (id ? operatorApi.getTokenById(id) : Promise.reject('No token ID')),
    enabled: !!id,
  });

  // 2. Fetch/Initialize Procurement for this Token
  const {
    data: procurement,
    isLoading: isProcurementLoading,
  } = useQuery({
    queryKey: ['procurement-for-token', id],
    queryFn: () => (id ? operatorApi.getOrCreateProcurementForToken(id) : Promise.reject('No token ID')),
    enabled: !!id,
  });

  // Verification Mutation
  const verifyFarmerMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error('No token ID');
      return operatorApi.updateTokenStatus(id, 'VERIFIED');
    },
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['queue-token-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['operator-queue-board'] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || 'Verification failed');
    },
  });

  // Weighment Mutation
  const weighmentMutation = useMutation({
    mutationFn: () => {
      if (!procurement?.id) throw new Error('No procurement ID');
      const weightNum = parseFloat(actualWeight);
      if (isNaN(weightNum) || weightNum <= 0) {
        throw new Error('Please enter a valid actual weight greater than 0 Quintals');
      }
      return operatorApi.recordWeighment(procurement.id, {
        actualWeight: weightNum,
        recordedBy: user?.username || 'operator',
        remarks: weighmentRemarks || undefined,
      });
    },
    onSuccess: () => {
      setActionError(null);
      if (id) {
        operatorApi.updateTokenStatus(id, 'QUALITY_CHECK');
      }
      queryClient.invalidateQueries({ queryKey: ['procurement-for-token', id] });
      queryClient.invalidateQueries({ queryKey: ['queue-token-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['operator-queue-board'] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || 'Weighment recording failed');
    },
  });

  // Quality Inspection Mutation
  const inspectionMutation = useMutation({
    mutationFn: () => {
      if (!procurement?.id) throw new Error('No procurement ID');
      return operatorApi.recordInspection(procurement.id, {
        grade,
        moisturePercentage: parseFloat(moisture) || 12.5,
        foreignMatterPercentage: parseFloat(foreignMatter) || 0.8,
        brokenGrainPercentage: parseFloat(brokenGrain) || 1.0,
        inspectedBy: user?.username || 'operator',
        remarks: qualityRemarks,
        approved: isApproved,
      });
    },
    onSuccess: () => {
      setActionError(null);
      if (id) {
        operatorApi.updateTokenStatus(id, 'COMPLETED');
      }
      queryClient.invalidateQueries({ queryKey: ['procurement-for-token', id] });
      queryClient.invalidateQueries({ queryKey: ['queue-token-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['operator-queue-board'] });
      queryClient.invalidateQueries({ queryKey: ['operator-procurements'] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || 'Quality inspection failed');
    },
  });

  if (isTokenLoading || isProcurementLoading) {
    return <LoadingState message="Loading intake terminal station..." />;
  }

  if (isTokenError || !token) {
    return (
      <ErrorState
        title="Token not found"
        message="Could not load details for this queue token."
        onRetry={refetchToken}
      />
    );
  }

  const isVerified = token.status !== 'BOOKED' && token.status !== 'ARRIVED' && token.status !== 'WAITING';
  const hasWeighment = !!procurement?.weighment;
  const hasInspection = !!procurement?.qualityInspection;
  const isCompleted = token.status === 'COMPLETED' || hasInspection;

  // Determine current active pipeline step
  let currentStep = 1;
  if (isCompleted) currentStep = 4;
  else if (hasWeighment) currentStep = 3;
  else if (isVerified) currentStep = 2;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Print Actions */}
      <div className="flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={() => navigate('/operator/queue')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Queue Board
        </button>

        {isCompleted && (
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Intake Receipt
          </button>
        )}
      </div>

      {/* Printable Receipt Banner (Visible only in print mode) */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-xl font-bold uppercase tracking-wider">Tamil Nadu State Civil Supplies Corporation</h1>
        <h2 className="text-sm font-semibold text-slate-700">Official Grain Procurement &amp; Weighment Certificate</h2>
        <p className="text-xs text-slate-500">{token.centreName} &bull; Code: {token.centreCode}</p>
      </div>

      {/* Token Header Banner */}
      <div className="bg-slate-900 text-white rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-emerald-500 text-slate-950">
              Terminal Intake
            </span>
            <span className="text-xs text-slate-300">Booking: <strong className="font-mono text-white">{token.bookingCode}</strong></span>
          </div>
          <h1 className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
            Token {token.displayToken}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Intake Status</span>
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              {token.status}
            </span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-900 print:hidden">
          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 4-Stage Operational Pipeline Indicator */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs print:hidden">
        <div className="grid grid-cols-4 gap-2 text-xs text-center font-semibold">
          <div className={`p-2 rounded border ${currentStep >= 1 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
            <span className="block text-[10px] uppercase text-slate-500">Step 1</span>
            1. Farmer Verification
          </div>
          <div className={`p-2 rounded border ${currentStep >= 2 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
            <span className="block text-[10px] uppercase text-slate-500">Step 2</span>
            2. Weighbridge
          </div>
          <div className={`p-2 rounded border ${currentStep >= 3 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
            <span className="block text-[10px] uppercase text-slate-500">Step 3</span>
            3. Quality Test
          </div>
          <div className={`p-2 rounded border ${currentStep >= 4 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
            <span className="block text-[10px] uppercase text-slate-500">Step 4</span>
            4. Procurement
          </div>
        </div>
      </div>

      {/* Stage 1: Farmer & Appointment Verification */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <h2 className="text-sm font-bold text-slate-900">1. Farmer &amp; Appointment Verification</h2>
          </div>
          {isVerified ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified at Gate
            </span>
          ) : (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
              Pending Physical Verification
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[10px] text-slate-500 uppercase block">Farmer Name</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{token.farmerName}</p>
            <p className="text-[10px] font-mono text-slate-500">Code: {token.farmerCode}</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[10px] text-slate-500 uppercase block">Contact Phone</span>
            <p className="font-medium text-slate-800 text-sm mt-0.5">{token.farmerMobile || 'N/A'}</p>
            <p className="text-[10px] text-slate-500">DBT Bank Linked</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[10px] text-slate-500 uppercase block">Crop &amp; Declared Qty</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{procurement?.cropName || 'Paddy'}</p>
            <p className="text-[10px] font-semibold text-emerald-800">{procurement?.declaredQuantity || 45.00} Quintals</p>
          </div>
        </div>

        {!isVerified && (
          <div className="pt-2 flex justify-end gap-3 print:hidden">
            <button
              type="button"
              disabled={verifyFarmerMutation.isPending}
              onClick={() => verifyFarmerMutation.mutate()}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded shadow-xs transition-colors"
            >
              {verifyFarmerMutation.isPending ? 'Verifying...' : 'Verify Farmer Credentials'}
            </button>
          </div>
        )}
      </div>

      {/* Stage 2: Weighbridge Scale Intake */}
      {isVerified && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-800" />
              <h2 className="text-sm font-bold text-slate-900">2. Certified Weighbridge Scale Intake</h2>
            </div>
            {hasWeighment && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Scale Weighed: {procurement?.actualQuantity} Quintals
              </span>
            )}
          </div>

          {hasWeighment ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 uppercase block">Declared Weight</span>
                <p className="font-bold text-slate-700 text-sm mt-0.5">{procurement?.declaredQuantity} Quintals</p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                <span className="text-[10px] text-emerald-800 uppercase block font-semibold">Certified Scale Weight</span>
                <p className="font-extrabold text-emerald-900 text-sm mt-0.5">{procurement?.actualQuantity} Quintals</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 uppercase block">Scale Operator</span>
                <p className="font-medium text-slate-800 text-sm mt-0.5">{procurement?.weighment?.recordedBy}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {procurement?.weighment?.recordedAt ? new Date(procurement.weighment.recordedAt).toLocaleString() : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 print:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Certified Actual Weight (Quintals) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    placeholder={`e.g. ${procurement?.declaredQuantity || 45.00}`}
                    value={actualWeight}
                    onChange={(e) => setActualWeight(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Declared: {procurement?.declaredQuantity} Quintals
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Weighbridge Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Tractor trolley gross minus tare tare weight"
                    value={weighmentRemarks}
                    onChange={(e) => setWeighmentRemarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={weighmentMutation.isPending || !actualWeight}
                  onClick={() => weighmentMutation.mutate()}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded shadow-xs disabled:opacity-50 transition-colors"
                >
                  {weighmentMutation.isPending ? 'Recording Scale Weight...' : 'Record & Certify Weighment'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stage 3: Quality & Moisture Certification */}
      {hasWeighment && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-800" />
              <h2 className="text-sm font-bold text-slate-900">3. Quality Inspection &amp; Moisture Testing</h2>
            </div>
            {hasInspection && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Grade {procurement?.qualityInspection?.grade} Certified
              </span>
            )}
          </div>

          {hasInspection ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                <span className="text-[10px] text-emerald-800 uppercase block font-semibold">Assigned Grade</span>
                <p className="font-extrabold text-emerald-900 text-sm mt-0.5">
                  Grade {procurement?.qualityInspection?.grade}
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 uppercase block">Moisture Content</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{procurement?.qualityInspection?.moisturePercentage}%</p>
                <span className="text-[10px] text-slate-400">MSP Limit: &lt;14%</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 uppercase block">Foreign Matter</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{procurement?.qualityInspection?.foreignMatterPercentage}%</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 uppercase block">Quality Inspector</span>
                <p className="font-medium text-slate-800 text-sm mt-0.5">{procurement?.qualityInspection?.inspectedBy}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 print:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Quality Grade *
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as QualityGrade)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                  >
                    <option value="A">Grade A (MSP Premium)</option>
                    <option value="B">Grade B (Standard FAQ)</option>
                    <option value="C">Grade C (Allowable)</option>
                    <option value="REJECTED">Rejected (Excess moisture / matter)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Moisture Percentage (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                  <span className="text-[10px] text-slate-400">Max limit: 14%</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Foreign Matter (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={foreignMatter}
                    onChange={(e) => setForeignMatter(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Broken Grain (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={brokenGrain}
                    onChange={(e) => setBrokenGrain(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Quality Remarks
                </label>
                <input
                  type="text"
                  value={qualityRemarks}
                  onChange={(e) => setQualityRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={inspectionMutation.isPending}
                  onClick={() => inspectionMutation.mutate()}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded shadow-xs disabled:opacity-50 transition-colors"
                >
                  {inspectionMutation.isPending ? 'Certifying Quality...' : 'Certify Quality & Finalize Procurement'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stage 4: Procurement Financial Ledger Voucher */}
      {hasInspection && procurement && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-800" />
              <h2 className="text-sm font-bold text-slate-900">4. Official Procurement Financial Summary</h2>
            </div>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-900 text-emerald-400">
              {procurement.procurementCode}
            </span>
          </div>

          {/* Ledger Numbers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] text-slate-500 uppercase block">Certified Weight</span>
              <p className="font-extrabold text-slate-900 text-base mt-0.5">
                {procurement.actualQuantity} {procurement.cropUnit}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] text-slate-500 uppercase block">Authoritative MSP Rate</span>
              <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                ₹{Number(procurement.ratePerUnit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] text-slate-500 uppercase block">Gross Amount</span>
              <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                ₹{Number(procurement.grossAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded">
              <span className="text-[10px] text-emerald-900 uppercase block font-semibold">Net Payout Amount</span>
              <p className="font-mono font-extrabold text-emerald-900 text-base mt-0.5">
                ₹{Number(procurement.netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Direct Benefit Transfer (DBT) Settlement Notice:</p>
            <p>
              Procurement entry has been recorded in the central repository. Payout will be disbursed directly
              to farmer bank account ({token.farmerName} &bull; {token.farmerCode}).
            </p>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-100 print:hidden">
            <span className="text-xs text-slate-500">
              Procurement finalized at {new Date().toLocaleDateString()}
            </span>
            <button
              type="button"
              onClick={() => navigate('/operator/queue')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded transition-colors"
            >
              Return to Queue Board &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenProcessingPage;
