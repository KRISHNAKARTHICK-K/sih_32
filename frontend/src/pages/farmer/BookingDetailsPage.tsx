import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { farmerApi } from '../../api/farmerApi';
import {
  ArrowLeft,
  Printer,
} from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

export const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: booking,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['booking-detail', id],
    queryFn: () => (id ? farmerApi.getBookingById(id) : Promise.reject('No ID provided')),
    enabled: !!id,
  });

  if (isLoading) {
    return <LoadingState message="Loading procurement booking voucher..." />;
  }

  if (isError || !booking) {
    return (
      <ErrorState
        title="Booking not found"
        message="Could not load details for this booking voucher."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Back Action */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/farmer/bookings')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Bookings
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" /> Print Voucher
        </button>
      </div>

      {/* Official Voucher Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* Voucher Header Banner */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
              Official Procurement Voucher
            </span>
            <h1 className="text-lg font-mono font-bold">{booking.bookingCode}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-emerald-900 text-emerald-300 border border-emerald-700">
              {booking.status}
            </span>
          </div>
        </div>

        {/* Voucher Body */}
        <div className="p-6 space-y-6">
          {/* Prominent Token Display */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
                Assigned Queue Token
              </span>
              <p className="text-xs text-emerald-700 mt-0.5">
                Present this token code upon arrival at the intake weighbridge.
              </p>
            </div>
            <div className="px-4 py-2 bg-slate-900 text-emerald-400 font-mono font-extrabold text-2xl rounded shadow-xs">
              {booking.queueToken || 'PENDING'}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
                Procurement Centre
              </span>
              <p className="font-bold text-slate-900">{booking.centreName}</p>
              <p className="text-[11px] text-slate-500 mt-1">Tamil Nadu State Civil Supplies Corporation</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
                Appointment Schedule
              </span>
              <p className="font-bold text-slate-900">{booking.slotDate}</p>
              <p className="text-[11px] text-slate-700 font-medium mt-1">
                Window: {booking.startTime?.substring(0, 5)} – {booking.endTime?.substring(0, 5)}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
                Crop &amp; Declared Quantity
              </span>
              <p className="font-bold text-slate-900">{booking.cropName}</p>
              <p className="text-sm font-extrabold text-emerald-800 mt-1">
                {booking.declaredQuantity} Quintals
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
                Farmer Identity
              </span>
              <p className="font-bold text-slate-900">{booking.farmerName}</p>
              <p className="font-mono text-[11px] text-slate-500 mt-1">Code: {booking.farmerCode}</p>
            </div>
          </div>

          {/* Operational Guidance */}
          <div className="p-3 bg-slate-100 rounded text-[11px] text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Operational Notes for Farmer:</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
              <li>Keep your mobile phone accessible for SMS and live queue notifications.</li>
              <li>Moisture testing will be conducted as per Central MSP standards before unloading.</li>
              <li>Settlement amounts will be credited directly to your registered DBT bank account.</li>
            </ul>
          </div>
        </div>

        {/* Voucher Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Created on {new Date(booking.createdAt).toLocaleString()}
          </span>
          <button
            type="button"
            onClick={() => navigate('/farmer/queue')}
            className="text-xs font-semibold text-emerald-800 hover:underline"
          >
            Track Live Queue &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
