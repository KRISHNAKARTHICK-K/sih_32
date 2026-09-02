import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { managerApi } from '../../api/managerApi';
import { useAuth } from '../../auth/AuthContext';
import {
  Layers,
  Calendar,
  Plus,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

export const ManagerSlotsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form State
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [capacity, setCapacity] = useState<number>(20);

  const { data: slots, isLoading, error, refetch } = useQuery({
    queryKey: ['manager-slots', user?.centreId, selectedDate],
    queryFn: () => managerApi.getCentreSlots(user?.centreId || '', selectedDate),
    enabled: !!user?.centreId,
  });

  // Create Slot Mutation
  const createSlotMutation = useMutation({
    mutationFn: async () => {
      if (!user?.centreId) throw new Error('No centre ID assigned');
      if (startTime >= endTime) throw new Error('Start time must be strictly before end time');
      if (capacity <= 0) throw new Error('Capacity must be greater than zero');

      return managerApi.createSlot(user.centreId, {
        centreId: user.centreId,
        slotDate: formDate,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        capacity: Number(capacity),
      });
    },
    onSuccess: () => {
      setIsModalOpen(false);
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['manager-slots'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || 'Failed to create slot');
    },
  });

  // Toggle Slot Status Mutation
  const toggleSlotStatusMutation = useMutation({
    mutationFn: async ({ slotId, active }: { slotId: string; active: boolean }) => {
      return managerApi.updateSlotStatus(slotId, active);
    },
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['manager-slots'] });
      queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.message || err.message || 'Failed to update slot status');
    },
  });

  if (isLoading) {
    return <LoadingState message="Loading Slot Capacity & Schedule..." />;
  }

  if (error || !slots) {
    return (
      <ErrorState
        title="Failed to Load Slots"
        message={error instanceof Error ? error.message : 'Could not retrieve centre slots.'}
        onRetry={() => refetch()}
      />
    );
  }

  const totalCapacity = slots.reduce((sum, s) => sum + s.capacity, 0);
  const totalBooked = slots.reduce((sum, s) => sum + s.bookedCount, 0);
  const overallUtilization = totalCapacity > 0 ? (totalBooked * 100) / totalCapacity : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Capacity Management
            </span>
            <span className="text-xs text-neutral-500 font-mono">Centre: {user?.centreName || 'Pollachi'}</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Intake Slot Schedules & Utilization</h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Configure appointment time windows, manage maximum farmer lot capacities, and activate/deactivate booking windows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => {
              setActionError(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs bg-emerald-700 hover:bg-emerald-800"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Slot
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Date & Overall Utilization Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date Selector */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Viewing Slot Date</span>
          <div className="mt-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm font-semibold bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-neutral-800 focus:outline-none focus:border-emerald-600"
            />
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">Showing slots for selected intake date</div>
        </div>

        {/* Total Booked Capacity */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Daily Bookings</span>
          <div className="mt-2 text-2xl font-bold text-neutral-900">
            {totalBooked} <span className="text-sm font-normal text-neutral-500">/ {totalCapacity} Capacity</span>
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {totalCapacity - totalBooked} remaining capacity available
          </div>
        </div>

        {/* Overall Utilization Bar */}
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Daily Utilization</span>
            <span className="text-xs font-bold text-neutral-800">{overallUtilization.toFixed(1)}%</span>
          </div>
          <div className="mt-3 w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full ${overallUtilization > 85 ? 'bg-amber-500' : 'bg-emerald-600'}`}
              style={{ width: `${Math.min(overallUtilization, 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">Calculated from confirmed farmer bookings</div>
        </div>
      </div>

      {/* Slots Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-neutral-200 bg-neutral-50/60 flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-700">Configured Time Windows</span>
          <span className="text-neutral-500 font-mono">
            {slots.length} time slot{slots.length !== 1 ? 's' : ''}
          </span>
        </div>

        {slots.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Time Window</th>
                  <th className="py-2.5 px-4 text-right">Capacity</th>
                  <th className="py-2.5 px-4 text-right">Booked</th>
                  <th className="py-2.5 px-4 text-right">Available</th>
                  <th className="py-2.5 px-4 w-48">Utilization</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {slots.map((s) => {
                  const util = s.capacity > 0 ? (s.bookedCount * 100) / s.capacity : 0;
                  return (
                    <tr key={s.id} className="hover:bg-neutral-50/80 transition">
                      <td className="py-3 px-4 font-medium text-neutral-900">{s.slotDate}</td>
                      <td className="py-3 px-4 font-mono font-bold text-neutral-800">
                        {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-neutral-700">{s.capacity}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900">{s.bookedCount}</td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-emerald-800">
                        {s.availableCapacity}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-neutral-600">{util.toFixed(0)}%</span>
                            <span className="text-neutral-400">
                              {s.bookedCount}/{s.capacity}
                            </span>
                          </div>
                          <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${util > 85 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                              style={{ width: `${Math.min(util, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={s.active ? 'success' : 'danger'}>
                          {s.active ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toggleSlotStatusMutation.mutate({ slotId: s.id, active: !s.active })}
                          className={`text-xs font-semibold hover:underline ${
                            s.active ? 'text-rose-700 hover:text-rose-800' : 'text-emerald-700 hover:text-emerald-800'
                          }`}
                        >
                          {s.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-neutral-500 text-xs">
            <Layers className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="font-semibold text-neutral-700">No slots configured for this date.</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Click "Create Slot" above to schedule intake windows.
            </p>
          </div>
        )}
      </div>

      {/* Create Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">Create Intake Appointment Slot</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Intake Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full border border-neutral-200 rounded px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-neutral-200 rounded px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-neutral-200 rounded px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Farmer Capacity (Lot Count)</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                  className="w-full border border-neutral-200 rounded px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => createSlotMutation.mutate()}
                isLoading={createSlotMutation.isPending}
                className="bg-emerald-700 hover:bg-emerald-800"
              >
                Create Slot
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerSlotsPage;
