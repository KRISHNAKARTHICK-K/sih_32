import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { managerApi } from '../../api/managerApi';
import { useAuth } from '../../auth/AuthContext';
import {
  Users,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

export const ManagerStaffPage: React.FC = () => {
  const { user } = useAuth();

  const { data: staff, isLoading, error, refetch } = useQuery({
    queryKey: ['manager-staff', user?.centreId],
    queryFn: () => managerApi.getStaff(user?.centreId),
    enabled: !!user?.centreId,
  });

  if (isLoading) {
    return <LoadingState message="Loading Centre Staff Directory..." />;
  }

  if (error || !staff) {
    return (
      <ErrorState
        title="Failed to Load Staff Directory"
        message={error instanceof Error ? error.message : 'Could not retrieve centre personnel.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Personnel & Stations
            </span>
            <span className="text-xs text-neutral-500 font-mono">Centre: {user?.centreName || 'Pollachi'}</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Centre Staff Directory</h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Operational personnel and station operators assigned to this procurement centre.
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

      {/* Staff Table */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-200 bg-neutral-50/60 flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-700">Assigned Operational Personnel</span>
          <span className="text-neutral-500 font-mono">
            {staff.length} staff member{staff.length !== 1 ? 's' : ''}
          </span>
        </div>

        {staff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4">Staff Member</th>
                  <th className="py-2.5 px-4">Username</th>
                  <th className="py-2.5 px-4">Designation</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Contact</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Assigned Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{s.fullName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-700">@{s.username}</td>
                    <td className="py-3 px-4 font-medium text-neutral-800">{s.designation}</td>
                    <td className="py-3 px-4">
                      <Badge variant={s.role === 'CENTRE_MANAGER' ? 'warning' : 'info'}>
                        {s.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {s.email && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Mail className="w-3 h-3 text-neutral-400" />
                          <span>{s.email}</span>
                        </div>
                      )}
                      {s.mobile && (
                        <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          <span>{s.mobile}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={s.active ? 'success' : 'danger'}>
                        {s.active ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-500">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-neutral-500 text-xs">
            <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="font-semibold text-neutral-700">No staff assigned to this centre.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerStaffPage;
