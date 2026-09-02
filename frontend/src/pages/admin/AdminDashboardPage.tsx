import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Users,
  Building2,
  CalendarCheck,
  Clock,
  Package,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  Activity,
  ArrowRight,
  TrendingUp,
  FileText,
  DollarSign,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.getDashboard,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <LoadingState message="Loading system-wide administration overview..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Admin Dashboard"
        message={error instanceof Error ? error.message : 'Could not fetch system metrics from server.'}
        onRetry={() => refetch()}
      />
    );
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Administration &amp; Governance</h1>
            <Badge variant="primary">HEADQUARTERS CONTROL</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            System-wide operational telemetry, master data controls, and audit surveillance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Last synced: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Just now'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* 8 Real System KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Farmers */}
        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Farmers</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {dashboard.totalFarmers.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Verified agricultural producers</p>
          </CardContent>
        </Card>

        {/* Active Centres */}
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Centres</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {dashboard.activeCentres.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Procurement stations online</p>
          </CardContent>
        </Card>

        {/* Today Bookings */}
        <Card className="border-l-4 border-l-indigo-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Bookings</span>
              <CalendarCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {dashboard.todayBookings.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Scheduled farmer intakes</p>
          </CardContent>
        </Card>

        {/* Active Queue */}
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Yard Tokens</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-2 font-mono">
              {dashboard.activeQueueTokens.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Vehicles in queue / processing</p>
          </CardContent>
        </Card>

        {/* Procured Volume */}
        <Card className="border-l-4 border-l-teal-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Procured Volume</span>
              <Package className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {dashboard.totalProcurementQuantity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              <span className="text-xs font-normal text-slate-500 ml-1">Qntl</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Cumulative weighbridge intake</p>
          </CardContent>
        </Card>

        {/* Procurement Value */}
        <Card className="border-l-4 border-l-emerald-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Procurement</span>
              <TrendingUp className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              ₹{dashboard.totalProcurementValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Authoritative MSP payout ledger</p>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card className="border-l-4 border-l-rose-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending DBT</span>
              <CreditCard className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-rose-700 mt-2 font-mono">
              ₹{dashboard.pendingPaymentsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-rose-600 mt-0.5 font-medium">
              {dashboard.pendingPaymentsCount} vouchers awaiting PFMS clearance
            </p>
          </CardContent>
        </Card>

        {/* Active System Users */}
        <Card className="border-l-4 border-l-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Accounts</span>
              <ShieldCheck className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {dashboard.activeUsersCount.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Enabled user credentials</p>
          </CardContent>
        </Card>
      </div>

      {/* SYSTEM OPERATIONS — Procurement Centre Summaries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-700" />
              Procurement Centre Operations Overview
            </CardTitle>
            <CardDescription>
              Live operational metrics across all registered procurement centres
            </CardDescription>
          </div>
          <Link to="/admin/centres">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Manage Centres
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Centre Code</TableHead>
                <TableHead>Centre Name &amp; District</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Staff</TableHead>
                <TableHead className="text-right">Today Bookings</TableHead>
                <TableHead className="text-right">Waiting Tokens</TableHead>
                <TableHead>Serving</TableHead>
                <TableHead className="text-right">Volume (Qntl)</TableHead>
                <TableHead className="text-right">Value (₹)</TableHead>
                <TableHead className="text-right">Pending (₹)</TableHead>
                <TableHead className="text-right">Slot Util.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.centreSummaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-slate-400">
                    No procurement centres found in database.
                  </TableCell>
                </TableRow>
              ) : (
                dashboard.centreSummaries.map((c) => (
                  <TableRow key={c.centreId}>
                    <TableCell className="font-mono font-medium text-slate-900">{c.centreCode}</TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{c.centreName}</div>
                      <div className="text-[11px] text-slate-500">{c.district}, {c.state}</div>
                    </TableCell>
                    <TableCell>
                      {c.active ? (
                        <Badge variant="success">ACTIVE</Badge>
                      ) : (
                        <Badge variant="neutral">INACTIVE</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{c.staffCount}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold text-slate-900">
                      {c.todayBookings}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {c.waitingTokens > 0 ? (
                        <span className="text-amber-700 font-semibold">{c.waitingTokens}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.currentlyServing && c.currentlyServing !== 'None' ? (
                        <Badge variant="primary">{c.currentlyServing}</Badge>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {c.procurementQuantity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold text-slate-900">
                      ₹{c.procurementValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {c.pendingPayments > 0 ? (
                        <span className="text-rose-600 font-medium">
                          ₹{c.pendingPayments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-emerald-700">₹0.00</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-medium">
                      {c.slotUtilization.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Two Column Grid: Recent System Activity & Governance Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-700" />
                Recent System Activity
              </CardTitle>
              <CardDescription>Immutable audit logs captured from recent platform operations</CardDescription>
            </div>
            <Link to="/admin/audit">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View Full Audit
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {dashboard.recentActivity.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No recent system activity recorded.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {dashboard.recentActivity.map((log) => (
                  <div key={log.id} className="p-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/60">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral" className="text-[10px] uppercase font-mono">
                          {log.action}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-800">
                          {log.username}
                        </span>
                        <span className="text-[11px] text-slate-400">({log.userRole})</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">{log.description || 'System operation executed'}</p>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Governance Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Master Governance
            </CardTitle>
            <CardDescription>Core ERP configuration controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-800 transition"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>User Accounts &amp; Roles</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/admin/crops"
              className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-800 transition"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Crop Master Registry</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/admin/prices"
              className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-800 transition"
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>MSP Price Configurations</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/admin/procurement"
              className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-800 transition"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>System Procurement Ledger</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/admin/system"
              className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-800 transition"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>System Health &amp; Telemetry</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
