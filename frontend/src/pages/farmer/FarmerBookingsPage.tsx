import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { farmerApi } from '../../api/farmerApi';
import type { BookingStatus } from '../../types/farmer';
import {
  CalendarPlus,
  Eye,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';

export const FarmerBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const farmerId = user?.farmerId;

  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['farmer-bookings', farmerId],
    queryFn: () => (farmerId ? farmerApi.getFarmerBookings(farmerId) : Promise.resolve([])),
    enabled: !!farmerId,
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
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
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
    return <LoadingState message="Loading your procurement bookings..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load your bookings"
        message="Failed to retrieve procurement appointments from the server."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header & New Booking Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Procurement appointment reservations &amp; entry tokens
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/farmer/bookings/new')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded shadow-xs transition-colors"
        >
          <CalendarPlus className="w-4 h-4" /> Book New Slot
        </button>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="You haven't scheduled any procurement visits yet. Book a slot to receive an official queue token."
          action={
            <button
              type="button"
              onClick={() => navigate('/farmer/bookings/new')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded shadow-xs transition-colors"
            >
              <CalendarPlus className="w-4 h-4" /> Book a Procurement Slot
            </button>
          }
        />
      ) : (
        /* ERP Compact Table */
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-left">Booking ID</th>
                  <th className="px-4 py-3 text-left">Centre</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Time Window</th>
                  <th className="px-4 py-3 text-left">Crop</th>
                  <th className="px-4 py-3 text-right">Declared Qty</th>
                  <th className="px-4 py-3 text-center">Queue Token</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {booking.bookingCode}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {booking.centreName}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                      {booking.slotDate}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {booking.startTime?.substring(0, 5)} – {booking.endTime?.substring(0, 5)}
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium whitespace-nowrap">
                      {booking.cropName}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {booking.declaredQuantity} Qntl
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {booking.queueToken ? (
                        <span className="font-mono font-bold px-2 py-0.5 bg-slate-900 text-emerald-400 rounded text-[11px]">
                          {booking.queueToken}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => navigate(`/farmer/bookings/${booking.id}`)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
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

export default FarmerBookingsPage;
