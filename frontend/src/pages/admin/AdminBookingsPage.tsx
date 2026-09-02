import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import type { Booking } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  CalendarCheck,
  Search,
  Eye,
  X,
  RotateCcw,
} from 'lucide-react';

export const AdminBookingsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [centreFilter, setCentreFilter] = useState('ALL');
  const [cropFilter, setCropFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Query: Bookings
  const {
    data: bookings = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: adminApi.getBookings,
  });

  // Query: Centres for filter
  const { data: centres = [] } = useQuery({
    queryKey: ['admin-centres'],
    queryFn: adminApi.getCentres,
  });

  // Query: Crops for filter
  const { data: crops = [] } = useQuery({
    queryKey: ['admin-crops'],
    queryFn: () => adminApi.getCrops(false),
  });

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.farmerCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCentre = centreFilter === 'ALL' || b.centreId === centreFilter;
    const matchesCrop = cropFilter === 'ALL' || b.cropId === cropFilter;
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesDate = !dateFilter || b.slotDate === dateFilter;

    return matchesSearch && matchesCentre && matchesCrop && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="primary">CONFIRMED</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">COMPLETED</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral">CANCELLED</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCentreFilter('ALL');
    setCropFilter('ALL');
    setStatusFilter('ALL');
    setDateFilter('');
  };

  if (isLoading) {
    return <LoadingState message="Loading system-wide booking registry..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Bookings"
        message={error instanceof Error ? error.message : 'Could not fetch bookings from server'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System-Wide Booking Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated intake appointments across all agricultural procurement centres
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetFilters} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
          Reset Filters
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Input
              placeholder="Search code, farmer..."
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
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Crops' },
                ...crops.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'CONFIRMED', label: 'Confirmed' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
            />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">
              Intake Appointments ({filteredBookings.length})
            </CardTitle>
            <CardDescription>Scheduled farmer deliveries with issued tokens</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Code</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Procurement Centre</TableHead>
                <TableHead>Commodity</TableHead>
                <TableHead>Slot Date &amp; Window</TableHead>
                <TableHead className="text-right">Declared Qty</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400 text-xs">
                    No bookings found matching the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono font-bold text-slate-900 text-xs">
                      {b.bookingCode}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900 text-xs">{b.farmerName}</div>
                      <div className="text-[11px] font-mono text-emerald-700">{b.farmerCode}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">{b.centreName}</TableCell>
                    <TableCell className="text-xs font-medium text-slate-800">{b.cropName}</TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div>{b.slotDate}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {b.startTime?.slice(0, 5)} - {b.endTime?.slice(0, 5)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold text-slate-900">
                      {b.declaredQuantity} Qntl
                    </TableCell>
                    <TableCell>
                      {b.queueToken ? (
                        <Badge variant="primary">{b.queueToken}</Badge>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(b.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBooking(b)}
                        title="View Voucher"
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

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Booking Appointment Voucher</h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Booking Reference</span>
                <span className="font-mono font-bold text-slate-900">{selectedBooking.bookingCode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Farmer Name / Code</span>
                <span className="text-slate-900 font-medium">
                  {selectedBooking.farmerName} ({selectedBooking.farmerCode})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Procurement Centre</span>
                <span className="font-semibold text-slate-900">{selectedBooking.centreName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Commodity</span>
                <span className="font-medium text-slate-900">{selectedBooking.cropName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Slot Date &amp; Time</span>
                <span className="font-mono text-slate-800">
                  {selectedBooking.slotDate} ({selectedBooking.startTime?.slice(0, 5)} - {selectedBooking.endTime?.slice(0, 5)})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Declared Quantity</span>
                <span className="font-mono font-bold text-slate-900">{selectedBooking.declaredQuantity} Quintals</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Queue Token</span>
                <span>
                  {selectedBooking.queueToken ? (
                    <Badge variant="primary">{selectedBooking.queueToken}</Badge>
                  ) : (
                    'Not Assigned'
                  )}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Booking Status</span>
                <span>{getStatusBadge(selectedBooking.status)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Created Timestamp</span>
                <span className="text-slate-700">{new Date(selectedBooking.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
