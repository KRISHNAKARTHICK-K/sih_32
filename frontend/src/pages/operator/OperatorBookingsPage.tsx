import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { operatorApi } from '../../api/operatorApi';
import type { BookingStatus } from '../../types/farmer';
import {
  CalendarCheck,
  Search,
  ArrowRight,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';

export const OperatorBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const centreId = user?.centreId;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['operator-centre-bookings', centreId],
    queryFn: () => (centreId ? operatorApi.getCentreBookings(centreId) : Promise.resolve([])),
    enabled: !!centreId,
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            CONFIRMED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
            COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            CANCELLED
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
    return <LoadingState message="Loading centre booking registrations..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load bookings"
        message="Could not retrieve scheduled bookings for this centre."
        onRetry={refetch}
      />
    );
  }

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      b.bookingCode.toLowerCase().includes(query) ||
      b.farmerName.toLowerCase().includes(query) ||
      b.farmerCode.toLowerCase().includes(query) ||
      (b.queueToken && b.queueToken.toLowerCase().includes(query)) ||
      b.cropName.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-800" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Centre Bookings Registry</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered farmer intake appointments &bull; {user?.centreName || 'Pollachi Procurement Centre'}
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded">
          Total Bookings: <strong>{bookings.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search booking ID, token (e.g. A-006), or farmer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-500 uppercase shrink-0">Filter Status:</span>
          {(['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs font-semibold rounded shrink-0 transition-colors ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="No farmer slot bookings matched your search query."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left">Booking Code</th>
                  <th className="px-4 py-3 text-left">Assigned Token</th>
                  <th className="px-4 py-3 text-left">Farmer</th>
                  <th className="px-4 py-3 text-left">Crop</th>
                  <th className="px-4 py-3 text-right">Declared Quantity</th>
                  <th className="px-4 py-3 text-left">Slot Window</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {b.bookingCode}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-emerald-800">
                      {b.queueToken ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {b.queueToken}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal italic">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{b.farmerName}</div>
                      <span className="font-mono text-[10px] text-slate-500">{b.farmerCode}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium whitespace-nowrap">
                      {b.cropName}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {b.declaredQuantity} Quintals
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      <div>{b.slotDate}</div>
                      <span className="text-[10px] text-slate-400">{b.startTime?.substring(0, 5)} - {b.endTime?.substring(0, 5)}</span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {getStatusBadge(b.status)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => navigate('/operator/queue')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                      >
                        Yard Queue <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorBookingsPage;
