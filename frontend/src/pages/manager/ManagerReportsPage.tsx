import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { managerApi } from '../../api/managerApi';
import { useAuth } from '../../auth/AuthContext';
import {
  FileSpreadsheet,
  Calendar,
  RefreshCw,
  TrendingUp,
  Wheat,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

export const ManagerReportsPage: React.FC = () => {
  const { user } = useAuth();
  const defaultFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const defaultTo = new Date().toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState<string>(defaultFrom);
  const [toDate, setToDate] = useState<string>(defaultTo);

  const { data: reports, isLoading, error, refetch } = useQuery({
    queryKey: ['manager-reports', user?.centreId, fromDate, toDate],
    queryFn: () => managerApi.getReports(user?.centreId, fromDate, toDate),
    enabled: !!user?.centreId,
  });

  if (isLoading) {
    return <LoadingState message="Generating Operational Reports..." />;
  }

  if (error || !reports) {
    return (
      <ErrorState
        title="Failed to Generate Reports"
        message={error instanceof Error ? error.message : 'Could not compute operational statistics.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Executive Reporting
            </span>
            <span className="text-xs text-neutral-500 font-mono">Centre: {user?.centreName || 'Pollachi'}</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Procurement & Operations Analytics</h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Aggregated metrics for crop volumes, MSP disbursement financials, quality distributions, and daily trends.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 text-xs text-neutral-700">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent border-none text-xs focus:outline-none text-neutral-800 font-medium"
            />
            <span className="text-neutral-400">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
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
            Apply
          </Button>
        </div>
      </div>

      {/* 4 Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Bookings */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Bookings</span>
          <div className="mt-2 text-2xl font-bold text-neutral-900">{reports.totalBookings}</div>
          <div className="mt-1 text-xs text-neutral-500">
            {reports.completedBookings} completed • {reports.cancelledBookings} cancelled
          </div>
        </div>

        {/* Total Quantity */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Procured Volume</span>
          <div className="mt-2 text-2xl font-bold text-purple-900">
            {Number(reports.totalQuantity || 0).toFixed(2)} <span className="text-sm font-normal text-neutral-500">Qntl</span>
          </div>
          <div className="mt-1 text-xs text-neutral-500">Across {reports.totalProcurements} intakes</div>
        </div>

        {/* Total Value */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Gross Procurement Value</span>
          <div className="mt-2 text-2xl font-bold text-emerald-800">
            ₹{Number(reports.totalGrossAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Net: ₹{Number(reports.totalNetAmount || 0).toLocaleString('en-IN')}
          </div>
        </div>

        {/* DBT Disbursed */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">DBT Disbursed</span>
          <div className="mt-2 text-2xl font-bold text-blue-800">
            ₹{Number(reports.totalDisbursed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Pending: ₹{Number(reports.pendingDisbursement || 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Grid: Crop Breakdown & Quality Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Breakdown */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Wheat className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-neutral-900">Crop-Wise Procurement Breakdown</h2>
            </div>
            <span className="text-xs text-neutral-500 font-mono">
              {reports.cropSummaries?.length || 0} crop{reports.cropSummaries?.length !== 1 ? 's' : ''}
            </span>
          </div>

          {reports.cropSummaries && reports.cropSummaries.length > 0 ? (
            <div className="space-y-3">
              {reports.cropSummaries.map((c, i) => (
                <div key={i} className="p-3 rounded-lg bg-neutral-50 border border-neutral-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-900">
                    <span>{c.cropName}</span>
                    <span className="font-mono text-emerald-800">
                      ₹{Number(c.totalValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-600">
                    <span>
                      {Number(c.quantity).toFixed(2)} {c.cropUnit}s
                    </span>
                    <span>{c.procurementCount} intake lots</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{
                        width: `${
                          reports.totalQuantity && Number(reports.totalQuantity) > 0
                            ? (Number(c.quantity) * 100) / Number(reports.totalQuantity)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-6 text-center">
              Insufficient crop procurement data for this date range.
            </p>
          )}
        </div>

        {/* Quality Grade Breakdown */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-neutral-900">Quality Assay Distribution</h2>
            </div>
            <span className="text-xs text-neutral-500 font-mono">MSP FAQ Standard</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Grade A (FAQ)</span>
              <span className="text-3xl font-extrabold text-emerald-950 font-mono mt-1 block">
                {reports.gradeACount}
              </span>
              <span className="text-[10px] text-emerald-700 mt-1 block">Full MSP Payout</span>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-center">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Grade B</span>
              <span className="text-3xl font-extrabold text-blue-950 font-mono mt-1 block">
                {reports.gradeBCount}
              </span>
              <span className="text-[10px] text-blue-700 mt-1 block">Standard Grade</span>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-center">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Grade C</span>
              <span className="text-3xl font-extrabold text-amber-950 font-mono mt-1 block">
                {reports.gradeCCount}
              </span>
              <span className="text-[10px] text-amber-700 mt-1 block">Discounted Rate</span>
            </div>

            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-center">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Rejected</span>
              <span className="text-3xl font-extrabold text-rose-950 font-mono mt-1 block">
                {reports.rejectedCount}
              </span>
              <span className="text-[10px] text-rose-700 mt-1 block">Moisture / Foreign Matter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Intake Timeline Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-200 bg-neutral-50/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-neutral-900">Daily Intake & Procurement Timeline</h2>
          </div>
          <span className="text-neutral-500 font-mono">
            {reports.dailyTrends?.length || 0} day{reports.dailyTrends?.length !== 1 ? 's' : ''} in range
          </span>
        </div>

        {reports.dailyTrends && reports.dailyTrends.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-center">Scheduled Bookings</th>
                  <th className="py-2.5 px-4 text-right">Procured Quantity</th>
                  <th className="py-2.5 px-4 text-right">Procurement Value (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {reports.dailyTrends.map((t, i) => (
                  <tr key={i} className="hover:bg-neutral-50/80 transition">
                    <td className="py-3 px-4 font-mono font-medium text-neutral-900">{t.date}</td>
                    <td className="py-3 px-4 text-center font-semibold text-neutral-800">
                      {t.bookingCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-purple-900">
                      {Number(t.procurementQuantity).toFixed(2)} Qntl
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                      ₹{Number(t.procurementValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-neutral-500 text-xs">
            <FileSpreadsheet className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="font-semibold text-neutral-700">No daily intake data found for this date range.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerReportsPage;
