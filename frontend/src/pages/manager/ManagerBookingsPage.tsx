import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { managerApi } from '../../api/managerApi';
import { useAuth } from '../../auth/AuthContext';
import {
  Calendar,
  Search,
  Filter,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import type { Booking } from '../../types/farmer';

export const ManagerBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: bookings, isLoading, error, refetch } = useQuery({
    queryKey: ['manager-bookings', user?.centreId],
    queryFn: () => managerApi.getCentreBookings(user?.centreId || ''),
    enabled: !!user?.centreId,
  });

  if (isLoading) {
    return <LoadingState message="Loading Centre Bookings Registry..." />;
  }

  if (error || !bookings) {
    return (
      <ErrorState
        title="Failed to Load Bookings"
        message={error instanceof Error ? error.message : 'Could not retrieve bookings registry.'}
        onRetry={() => refetch()}
      />
    );
  }

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.farmerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.queueToken && b.queueToken.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesDate = !dateFilter || b.slotDate === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Procurement Centre Registry
            </span>
            <span className="text-xs text-neutral-500 font-mono">Centre: {user?.centreName || 'Pollachi'}</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Farmer Booking Schedule</h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            View, search, and monitor all farmer intake appointments scheduled for this centre.
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

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search booking, token, farmer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5 text-neutral-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-neutral-700 focus:outline-none focus:border-emerald-600"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-[11px] text-neutral-500 hover:text-neutral-800 underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-200 bg-neutral-50/60 flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-700">Scheduled Appointments</span>
          <span className="text-neutral-500 font-mono">
            Showing {filteredBookings.length} of {bookings.length}
          </span>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4">Booking Code</th>
                  <th className="py-2.5 px-4">Token</th>
                  <th className="py-2.5 px-4">Farmer</th>
                  <th className="py-2.5 px-4">Crop</th>
                  <th className="py-2.5 px-4 text-right">Declared Qty</th>
                  <th className="py-2.5 px-4">Date & Slot</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900">{b.bookingCode}</td>
                    <td className="py-3 px-4">
                      {b.queueToken ? (
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {b.queueToken}
                        </span>
                      ) : (
                        <span className="text-neutral-400 font-mono text-[11px]">Pending Arrival</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{b.farmerName}</div>
                      <div className="text-[11px] text-neutral-500 font-mono">{b.farmerCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-neutral-800">{b.cropName}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-neutral-900">
                      {Number(b.declaredQuantity).toFixed(2)} Qntl
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      <div className="font-medium text-neutral-800">{b.slotDate}</div>
                      <div className="text-[11px] text-neutral-500">
                        {b.startTime.substring(0, 5)} - {b.endTime.substring(0, 5)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          b.status === 'COMPLETED'
                            ? 'success'
                            : b.status === 'CONFIRMED'
                            ? 'info'
                            : b.status === 'CANCELLED'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {b.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-neutral-500 text-xs">
            <Calendar className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="font-semibold text-neutral-700">No bookings match the filter.</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Try clearing filters or changing search criteria.</p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-xs text-neutral-500 font-mono">Booking Voucher</span>
                <h3 className="text-base font-bold text-neutral-900">{selectedBooking.bookingCode}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Farmer</span>
                <span className="font-bold text-neutral-900">{selectedBooking.farmerName}</span>
                <span className="text-neutral-400 block font-mono text-[10px]">{selectedBooking.farmerCode}</span>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Queue Token</span>
                <span className="font-mono font-bold text-emerald-800">
                  {selectedBooking.queueToken || 'Not Arrived Yet'}
                </span>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Crop & Quantity</span>
                <span className="font-bold text-neutral-900">{selectedBooking.cropName}</span>
                <span className="text-neutral-500 block font-mono text-[11px]">
                  {Number(selectedBooking.declaredQuantity).toFixed(2)} Quintals
                </span>
              </div>
              <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100">
                <span className="text-neutral-500 block text-[11px]">Appointment Slot</span>
                <span className="font-bold text-neutral-900">{selectedBooking.slotDate}</span>
                <span className="text-neutral-500 block text-[11px]">
                  {selectedBooking.startTime.substring(0, 5)} - {selectedBooking.endTime.substring(0, 5)}
                </span>
              </div>
              <div className="col-span-2 bg-neutral-50 p-2.5 rounded border border-neutral-100 flex items-center justify-between">
                <span className="text-neutral-500 text-[11px]">Booking Status:</span>
                <Badge variant={selectedBooking.status === 'COMPLETED' ? 'success' : 'info'}>
                  {selectedBooking.status}
                </Badge>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerBookingsPage;
