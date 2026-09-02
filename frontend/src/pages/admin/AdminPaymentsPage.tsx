import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import type { Payment } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  CreditCard,
  Search,
  Eye,
  X,
  RotateCcw,
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [centreFilter, setCentreFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Query: Payments
  const {
    data: payments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: adminApi.getPayments,
  });

  // Query: Centres for filter
  const { data: centres = [] } = useQuery({
    queryKey: ['admin-centres'],
    queryFn: adminApi.getCentres,
  });

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.paymentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.farmerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.procurementCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.transactionReference && p.transactionReference.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPI calculations
  const totalPaid = filteredPayments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalPending = filteredPayments
    .filter((p) => p.status === 'PENDING')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success">DISBURSED / PAID</Badge>;
      case 'PENDING':
        return <Badge variant="primary">PENDING CLEARANCE</Badge>;
      case 'FAILED':
        return <Badge variant="danger">FAILED</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCentreFilter('ALL');
    setStatusFilter('ALL');
  };

  if (isLoading) {
    return <LoadingState message="Loading system-wide DBT payment registry..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Payments"
        message={error instanceof Error ? error.message : 'Could not fetch payments'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System DBT Payment Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct Benefit Transfer (DBT) disbursement registry, PFMS clearance telemetry, and bank vouchers
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetFilters} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
          Reset Filters
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-slate-700">
          <CardContent className="p-3.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Vouchers</span>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{filteredPayments.length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-3.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disbursed Volume</span>
            <div className="text-xl font-bold text-emerald-700 mt-1 font-mono">
              ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-rose-500">
          <CardContent className="p-3.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending DBT</span>
            <div className="text-xl font-bold text-rose-700 mt-1 font-mono">
              ₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Search code, farmer, bank UTR reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
            <Select
              value={centreFilter}
              onChange={(e) => setCentreFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Centres' },
                ...centres.map((c) => ({ value: c.centreId, label: c.centreName })),
              ]}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'PAID', label: 'Disbursed / Paid' },
                { value: 'PENDING', label: 'Pending Clearance' },
                { value: 'FAILED', label: 'Failed' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">
              Payment Transactions ({filteredPayments.length})
            </CardTitle>
            <CardDescription>PFMS bank transfer records with cryptographic audit references</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Code</TableHead>
                <TableHead>Procurement / Farmer</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Payout Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bank / PFMS Reference</TableHead>
                <TableHead>Processed Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                    No payment vouchers found matching the criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono font-bold text-slate-900 text-xs">
                      {p.paymentCode}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900 text-xs">{p.farmerName}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {p.procurementCode} ({p.farmerCode})
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 font-mono">{p.paymentMethod || 'DBT_BANK'}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-emerald-700 text-xs">
                      ₹{p.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{getStatusBadge(p.status)}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-700">
                      {p.transactionReference ? (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {p.transactionReference}
                        </span>
                      ) : (
                        <span className="text-slate-400">Awaiting UTR</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {p.processedAt ? new Date(p.processedAt).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPayment(p)}
                        title="View Disbursement Voucher"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PAYMENT DETAILS MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <h3 className="font-semibold text-slate-900 text-sm">DBT Disbursement Advice</h3>
              </div>
              <button onClick={() => setSelectedPayment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Payment Reference</span>
                <span className="font-mono font-bold text-slate-900">{selectedPayment.paymentCode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Procurement ID</span>
                <span className="font-mono text-slate-800">{selectedPayment.procurementCode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Beneficiary Farmer</span>
                <span className="font-semibold text-slate-900">
                  {selectedPayment.farmerName} ({selectedPayment.farmerCode})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Payment Channel</span>
                <span className="font-mono text-slate-900">{selectedPayment.paymentMethod || 'DIRECT_BENEFIT_TRANSFER'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 bg-emerald-50/50 p-2 rounded">
                <span className="font-semibold text-emerald-900">DBT Transfer Amount</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  ₹{selectedPayment.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Payment Status</span>
                <span>{getStatusBadge(selectedPayment.status)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">PFMS / Bank UTR</span>
                <span className="font-mono text-slate-900">
                  {selectedPayment.transactionReference || 'Awaiting clearance'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Processed At</span>
                <span className="text-slate-700">
                  {selectedPayment.processedAt ? new Date(selectedPayment.processedAt).toLocaleString() : 'Pending'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
