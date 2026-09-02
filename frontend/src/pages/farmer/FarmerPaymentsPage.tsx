import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { farmerApi } from '../../api/farmerApi';
import type { PaymentStatus } from '../../types/farmer';
import {
  ShieldCheck,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';

export const FarmerPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const farmerId = user?.farmerId;

  const {
    data: payments = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['farmer-payments', farmerId],
    queryFn: () => (farmerId ? farmerApi.getFarmerPayments(farmerId) : Promise.resolve([])),
    enabled: !!farmerId,
  });

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            PAID
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            FAILED
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
            PROCESSING
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            PENDING
          </span>
        );
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading DBT direct benefit payment disbursements..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load payments"
        message="Could not retrieve your payment disbursement ledger."
        onRetry={refetch}
      />
    );
  }

  // Calculate total disbursed to this farmer
  const totalPaidAmount = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-5">
      {/* Header & DBT Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Direct Benefit Transfer (DBT) Payments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time government bank disbursement vouchers &amp; settlement references
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 font-semibold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>DBT Account Active &bull; PFMS Verified</span>
        </div>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          title="No payment records yet"
          description="Your payment disbursements will appear here once your harvested crops are weighed and approved at the procurement centre."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left">Payment Voucher</th>
                  <th className="px-4 py-3 text-left">Procurement ID</th>
                  <th className="px-4 py-3 text-right">Settled Amount</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Bank Transaction Reference</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Processed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {payment.paymentCode}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                      {payment.procurementCode}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-extrabold text-emerald-800 text-sm whitespace-nowrap">
                      ₹{Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap font-medium">
                      {payment.paymentMethod || 'DBT Direct Transfer'}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">
                      {payment.transactionReference ? (
                        <span className="font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                          {payment.transactionReference}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Payment processing</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {getPaymentStatusBadge(payment.status)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 whitespace-nowrap">
                      {payment.processedAt
                        ? new Date(payment.processedAt).toLocaleDateString()
                        : new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Summary Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Total Disbursed to Account:
            </span>
            <span className="font-extrabold text-slate-900 text-sm">
              ₹{totalPaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerPaymentsPage;
