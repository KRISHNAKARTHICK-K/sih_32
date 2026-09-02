import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { managerApi } from '../../api/managerApi';
import { useAuth } from '../../auth/AuthContext';
import {
  Calendar,
  RefreshCw,
  Users,
  CheckCircle2,
  AlertTriangle,
  Scale,
  CreditCard,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

export const ManagerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: dashboard, isLoading, error, refetch } = useQuery({
    queryKey: ['manager-dashboard', user?.centreId, selectedDate],
    queryFn: () => managerApi.getDashboard(user?.centreId, selectedDate),
    refetchInterval: 10000, // 10s live yard sync
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return <LoadingState message="Loading Centre Manager Operations Control..." />;
  }

  if (error || !dashboard) {
    return (
      <ErrorState
        title="Failed to Load Manager Dashboard"
        message={error instanceof Error ? error.message : 'Could not retrieve operational statistics.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Centre Operations Control
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              Code: {dashboard.centreCode || user?.centreCode || 'PC-001'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {dashboard.centreName || user?.centreName || 'Pollachi Procurement Centre'}
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Logged in as <span className="font-semibold text-neutral-900">@{user?.username}</span> (Centre Manager)
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
            onClick={handleRefresh}
            isLoading={isRefreshing}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 8 Enterprise KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Today's Bookings */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Today's Bookings</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{dashboard.todayBookingsCount}</span>
            <span className="text-xs text-neutral-500">Farmers</span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between border-t border-neutral-100 pt-2">
            <span>Scheduled Intake</span>
            <Link to="/manager/bookings" className="text-emerald-700 font-medium hover:underline">View</Link>
          </div>
        </div>

        {/* 2. Waiting in Queue */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Waiting in Yard</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{dashboard.waitingTokensCount}</span>
            <span className="text-xs text-neutral-500">Tokens</span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between border-t border-neutral-100 pt-2">
            <span>Active Yard Queue</span>
            <Link to="/manager/queue" className="text-emerald-700 font-medium hover:underline">Monitor</Link>
          </div>
        </div>

        {/* 3. Currently Serving */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Currently Serving</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-800 font-mono">{dashboard.currentlyServingToken || 'None'}</span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between border-t border-neutral-100 pt-2">
            <span>Intake Station</span>
            <Link to="/manager/operations" className="text-emerald-700 font-medium hover:underline">Station</Link>
          </div>
        </div>

        {/* 4. Completed Today */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Completed Intakes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-800">{dashboard.completedProcurementsCount}</span>
            <span className="text-xs text-neutral-500">Lots</span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between border-t border-neutral-100 pt-2">
            <span>Procured Today</span>
            <Link to="/manager/procurement" className="text-emerald-700 font-medium hover:underline">Ledger</Link>
          </div>
        </div>

        {/* 5. Total Quantity */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Procured Volume</span>
            <Scale className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-neutral-900">
              {dashboard.totalProcurementQuantity != null ? Number(dashboard.totalProcurementQuantity).toFixed(2) : '0.00'}
            </span>
            <span className="text-xs text-neutral-500">Qntl</span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between border-t border-neutral-100 pt-2">
            <span>Certified Scale Intake</span>
            <span className="text-neutral-400">MSP FAQ</span>
          </div>
        </div>

        {/* 6. Total Value */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Procurement Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-emerald-800">
              ₹{dashboard.totalProcurementValue != null ? Number(dashboard.totalProcurementValue).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between border-t border-neutral-100 pt-2">
            <span>Government MSP Payout</span>
            <Link to="/manager/reports" className="text-emerald-700 font-medium hover:underline">Report</Link>
          </div>
        </div>

        {/* 7. Pending Payments */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Pending Payments</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700">{dashboard.pendingPaymentsCount}</span>
            <span className="text-xs text-neutral-500">Vouchers</span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between border-t border-neutral-100 pt-2">
            <span>₹{Number(dashboard.pendingPaymentsAmount || 0).toLocaleString('en-IN')}</span>
            <Link to="/manager/payments" className="text-emerald-700 font-medium hover:underline">DBT</Link>
          </div>
        </div>

        {/* 8. Slot Utilization */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Slot Utilization</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{dashboard.slotUtilizationPercentage}%</span>
            <span className="text-xs text-neutral-500">({dashboard.bookedSlotCapacity}/{dashboard.totalSlotCapacity})</span>
          </div>
          <div className="mt-2 w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full ${dashboard.slotUtilizationPercentage > 85 ? 'bg-amber-500' : 'bg-emerald-600'}`}
              style={{ width: `${Math.min(dashboard.slotUtilizationPercentage, 100)}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
            <span>Capacity Status</span>
            <Link to="/manager/slots" className="text-emerald-700 font-medium hover:underline">Manage</Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Yard Operations & Operational Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Centre Operations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Yard Snapshot */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-neutral-900">Live Yard Operations</h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono">10s Auto-Sync</span>
            </div>

            {/* Currently Serving Focus Box */}
            <div className="mb-5 p-4 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Currently Serving at Station
              </span>
              {dashboard.currentlyServing ? (
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold font-mono text-emerald-900">
                        {dashboard.currentlyServing.displayToken}
                      </span>
                      <Badge variant="info">{dashboard.currentlyServing.status}</Badge>
                    </div>
                    <p className="text-xs text-neutral-700 mt-1">
                      <span className="font-semibold">{dashboard.currentlyServing.farmerName}</span> ({dashboard.currentlyServing.farmerCode}) • Booking <span className="font-mono">{dashboard.currentlyServing.bookingCode}</span>
                    </p>
                  </div>
                  <Link
                    to={`/manager/operations`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white text-xs font-medium rounded hover:bg-emerald-800 transition"
                  >
                    View Station Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-neutral-600 mt-2">
                  No token actively in weighing/quality intake right now. Token <span className="font-mono font-semibold">{dashboard.currentlyServingToken}</span> is assigned.
                </p>
              )}
            </div>

            {/* Up Next Tokens Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Up Next in Yard ({dashboard.upNextTokens?.length || 0})
                </span>
                <Link to="/manager/queue" className="text-xs text-emerald-700 hover:underline font-medium">
                  View Full Yard Queue →
                </Link>
              </div>

              {dashboard.upNextTokens && dashboard.upNextTokens.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-neutral-200 rounded">
                    <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                      <tr>
                        <th className="py-2 px-3">Token</th>
                        <th className="py-2 px-3">Farmer</th>
                        <th className="py-2 px-3">Booking</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Position</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {dashboard.upNextTokens.map((t, idx) => (
                        <tr key={t.id} className="hover:bg-neutral-50/60">
                          <td className="py-2 px-3 font-mono font-bold text-neutral-900">{t.displayToken}</td>
                          <td className="py-2 px-3 text-neutral-800">{t.farmerName}</td>
                          <td className="py-2 px-3 font-mono text-neutral-600">{t.bookingCode}</td>
                          <td className="py-2 px-3">
                            <Badge variant={t.status === 'VERIFIED' ? 'success' : 'neutral'}>
                              {t.status}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-neutral-700">#{idx + 1}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 py-3 text-center bg-neutral-50 rounded border border-neutral-100">
                  No farmers currently waiting in queue.
                </p>
              )}
            </div>

            {/* Stage Distribution Breakdown */}
            <div className="mt-5 pt-4 border-t border-neutral-100 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="bg-neutral-50 p-2 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Waiting</span>
                <span className="text-sm font-bold text-neutral-900">{dashboard.waitingCount}</span>
              </div>
              <div className="bg-neutral-50 p-2 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Verified</span>
                <span className="text-sm font-bold text-emerald-700">{dashboard.verifiedCount}</span>
              </div>
              <div className="bg-neutral-50 p-2 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Processing</span>
                <span className="text-sm font-bold text-blue-700">{dashboard.processingCount}</span>
              </div>
              <div className="bg-neutral-50 p-2 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Quality Lab</span>
                <span className="text-sm font-bold text-purple-700">{dashboard.qualityCheckCount}</span>
              </div>
              <div className="bg-neutral-50 p-2 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Completed</span>
                <span className="text-sm font-bold text-emerald-800">{dashboard.completedCount}</span>
              </div>
              <div className="bg-neutral-50 p-2 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Cancelled</span>
                <span className="text-sm font-bold text-neutral-400">{dashboard.cancelledCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Operational Alerts & Quick Navigation */}
        <div className="space-y-6">
          {/* Operational Alerts */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-100">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-bold text-neutral-900">Operational Alerts</h2>
            </div>

            {dashboard.operationalAlerts && dashboard.operationalAlerts.length > 0 ? (
              <div className="space-y-2.5">
                {dashboard.operationalAlerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-xs ${
                      alert.level === 'CRITICAL'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : alert.level === 'WARNING'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-blue-50 border-blue-200 text-blue-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{alert.title}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{alert.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-neutral-500 bg-neutral-50 rounded border border-neutral-100">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <span className="font-semibold text-neutral-800 block">No Operational Alerts</span>
                All intake stations and yard capacity operating within normal thresholds.
              </div>
            )}
          </div>

          {/* Quick Management Links */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-5">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
              Operational Management
            </h2>
            <div className="space-y-2 text-xs">
              <Link
                to="/manager/operations"
                className="flex items-center justify-between p-2.5 rounded bg-neutral-50 hover:bg-neutral-100 text-neutral-800 transition"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-700" />
                  <span className="font-medium">Operations Center</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </Link>

              <Link
                to="/manager/slots"
                className="flex items-center justify-between p-2.5 rounded bg-neutral-50 hover:bg-neutral-100 text-neutral-800 transition"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-700" />
                  <span className="font-medium">Slot Schedules & Capacity</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </Link>

              <Link
                to="/manager/staff"
                className="flex items-center justify-between p-2.5 rounded bg-neutral-50 hover:bg-neutral-100 text-neutral-800 transition"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-700" />
                  <span className="font-medium">Centre Staff Directory</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </Link>

              <Link
                to="/manager/reports"
                className="flex items-center justify-between p-2.5 rounded bg-neutral-50 hover:bg-neutral-100 text-neutral-800 transition"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-700" />
                  <span className="font-medium">Analytics & Reports</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;
