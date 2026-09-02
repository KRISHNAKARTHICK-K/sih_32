import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { managerApi } from '../../api/managerApi';
import { useAuth } from '../../auth/AuthContext';
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  RefreshCw,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import type { Payment } from '../../types/farmer';

export const ManagerPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const { data: payments, isLoading, error, refetch } = useQuery({
    queryKey: ['manager-payments', user?.centreId],
    queryFn: () => managerApi.getCentrePayments(user?.centreId || ''),
    enabled: !!user?.centreId,
  });

  if (isLoading) {
    return <LoadingState message="Loading Centre DBT Disbursements Registry..." />;
  }

  if (error || !payments) {
    return (
      <ErrorState
        title="Failed to Load Payments"
        message={error instanceof Error ? error.message : 'Could not retrieve payment records.'}
        onRetry={() => refetch()}
      />
    );
  }

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.paymentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.procurementCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.farmerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.transactionReference && p.transactionReference.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDisbursed = filteredPayments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalPending = filteredPayments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const paidCount = filteredPayments.filter((p) => p.status === 'PAID').length;
  const pendingCount = filteredPayments.filter((p) => p.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Direct Benefit Transfer (DBT)
            </span>
            <span className="text-xs text-neutral-500 font-mono">Centre: {user?.centreName || 'Pollachi'}</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Farmer DBT Payment Registry</h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Monitor bank account settlements, PFMS direct disbursements, and pending payout vouchers.
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Disbursed DBT Payouts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-800">
            ₹{totalDisbursed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-neutral-500 mt-1">{paidCount} vouchers credited to bank accounts</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Pending Disbursements</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-800">
            ₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-neutral-500 mt-1">{pendingCount} vouchers awaiting clearance</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Payment Records</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-900">{filteredPayments.length}</div>
          <div className="text-xs text-neutral-500 mt-1">Processed at this centre</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by payment code, farmer, txn ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 text-neutral-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-200 bg-neutral-50/60 flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-700">Payment Disbursements</span>
          <span className="text-neutral-500 font-mono">
            Showing {filteredPayments.length} of {payments.length}
          </span>
        </div>

        {filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4">Payment Code</th>
                  <th className="py-2.5 px-4">Procurement</th>
                  <th className="py-2.5 px-4">Farmer</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4">Bank Txn Ref</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Date</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900">{p.paymentCode}</td>
                    <td className="py-3 px-4 font-mono text-neutral-700">{p.procurementCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{p.farmerName}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">{p.farmerCode}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                      ₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{p.paymentMethod}</td>
                    <td className="py-3 px-4 font-mono text-neutral-600">
                      {p.transactionReference || <span className="text-neutral-400">Pending Bank PFMS</span>}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          p.status === 'PAID'
                            ? 'success'
                            : p.status === 'PENDING'
                            ? 'warning'
                            : 'danger'
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
                        onClick={() => setSelectedPayment(p)}
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
            <CreditCard className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="font-semibold text-neutral-700">No payment records found.</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Settlements generated upon approved procurement will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Payment Voucher Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-xs text-neutral-500 font-mono">DBT Payment Advice</span>
                <h3 className="text-base font-bold text-neutral-900">{selectedPayment.paymentCode}</h3>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Beneficiary Farmer</span>
                <span className="font-bold text-neutral-900">{selectedPayment.farmerName}</span>
                <span className="text-neutral-400 block font-mono text-[10px]">{selectedPayment.farmerCode}</span>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Procurement Ref</span>
                <span className="font-mono font-bold text-neutral-900">{selectedPayment.procurementCode}</span>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Disbursement Amount</span>
                <span className="text-base font-bold text-emerald-800 font-mono">
                  ₹{Number(selectedPayment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Status</span>
                <Badge variant={selectedPayment.status === 'PAID' ? 'success' : 'warning'}>
                  {selectedPayment.status}
                </Badge>
              </div>
              <div className="col-span-2 bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Bank PFMS Transaction Reference</span>
                <span className="font-mono font-semibold text-neutral-900">
                  {selectedPayment.transactionReference || 'Awaiting Bank PFMS Clearance'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerPaymentsPage;
