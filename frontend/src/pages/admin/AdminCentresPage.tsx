import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import type { AdminCentreSummary, AdminCentreUpdatePayload } from '../../types/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Building2,
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';

export const AdminCentresPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCentre, setEditingCentre] = useState<AdminCentreSummary | null>(null);

  // Create form state
  const [createName, setCreateName] = useState('');
  const [createAddress, setCreateAddress] = useState('');
  const [createVillage, setCreateVillage] = useState('');
  const [createDistrict, setCreateDistrict] = useState('');
  const [createState, setCreateState] = useState('Tamil Nadu');
  const [createContact, setCreateContact] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editVillage, setEditVillage] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editState, setEditState] = useState('');
  const [editContact, setEditContact] = useState('');

  // Query centres
  const {
    data: centres = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-centres'],
    queryFn: adminApi.getCentres,
  });

  // Mutation: Create Centre
  const createCentreMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      address?: string;
      village?: string;
      district?: string;
      state?: string;
      contactNumber?: string;
    }) => adminApi.createCentre(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-centres'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setIsCreateModalOpen(false);
      resetCreateForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || 'Failed to create centre');
    },
  });

  // Mutation: Edit Centre
  const updateCentreMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminCentreUpdatePayload }) =>
      adminApi.updateCentre(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-centres'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setEditingCentre(null);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || 'Failed to update centre');
    },
  });

  // Mutation: Toggle Active Status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminApi.updateCentreStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-centres'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const resetCreateForm = () => {
    setCreateName('');
    setCreateAddress('');
    setCreateVillage('');
    setCreateDistrict('');
    setCreateState('Tamil Nadu');
    setCreateContact('');
    setFormError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!createName.trim() || !createDistrict.trim()) {
      setFormError('Centre name and district are required.');
      return;
    }

    createCentreMutation.mutate({
      name: createName.trim(),
      address: createAddress.trim() || undefined,
      village: createVillage.trim() || undefined,
      district: createDistrict.trim(),
      state: createState.trim() || 'Tamil Nadu',
      contactNumber: createContact.trim() || undefined,
    });
  };

  const openEditModal = (c: AdminCentreSummary) => {
    setEditingCentre(c);
    setEditName(c.centreName);
    setEditDistrict(c.district);
    setEditState(c.state);
    setEditVillage('');
    setEditAddress('');
    setEditContact('');
    setFormError(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCentre) return;

    updateCentreMutation.mutate({
      id: editingCentre.centreId,
      payload: {
        name: editName.trim(),
        district: editDistrict.trim(),
        state: editState.trim(),
        village: editVillage.trim() || undefined,
        address: editAddress.trim() || undefined,
        contactNumber: editContact.trim() || undefined,
      },
    });
  };

  const filteredCentres = centres.filter((c) => {
    const matchesSearch =
      c.centreName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.centreCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && c.active) ||
      (statusFilter === 'INACTIVE' && !c.active);

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <LoadingState message="Loading procurement centres..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Centres"
        message={error instanceof Error ? error.message : 'Could not fetch centres from server'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Procurement Centres</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage physical procurement stations, geographical jurisdiction, and operational status
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            resetCreateForm();
            setIsCreateModalOpen(true);
          }}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Create Procurement Centre
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Search by centre name, code (PC-...), district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active Centres' },
                { value: 'INACTIVE', label: 'Inactive Centres' },
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
              Procurement Stations ({filteredCentres.length})
            </CardTitle>
            <CardDescription>Official government intake locations</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Centre Code</TableHead>
                <TableHead>Centre Name</TableHead>
                <TableHead>District / State</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Staff</TableHead>
                <TableHead className="text-right">Today's Bookings</TableHead>
                <TableHead className="text-right">Waiting Tokens</TableHead>
                <TableHead className="text-right">Slot Util.</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCentres.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-slate-400 text-xs">
                    No procurement centres found matching the search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCentres.map((c) => (
                  <TableRow key={c.centreId}>
                    <TableCell className="font-mono font-bold text-slate-900 text-xs">
                      {c.centreCode}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900 text-xs">{c.centreName}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div>{c.district}</div>
                      <div className="text-[11px] text-slate-400">{c.state}</div>
                    </TableCell>
                    <TableCell>
                      {c.active ? (
                        <Badge variant="success" dot>ACTIVE</Badge>
                      ) : (
                        <Badge variant="neutral" dot>INACTIVE</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-slate-700">
                      {c.staffCount}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold text-slate-900">
                      {c.todayBookings}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {c.waitingTokens > 0 ? (
                        <span className="text-amber-700 font-semibold">{c.waitingTokens}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-medium">
                      {c.slotUtilization.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(c)}
                          title="Edit Centre Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleStatusMutation.mutate({ id: c.centreId, active: !c.active })
                          }
                          title={c.active ? 'Deactivate Centre' : 'Activate Centre'}
                          className={c.active ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}
                        >
                          {c.active ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CREATE CENTRE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <h3 className="font-semibold text-slate-900 text-sm">Create Procurement Centre</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4">
              {formError && (
                <div className="rounded border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Centre Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Madurai Grain Procurement Centre"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Madurai"
                    value={createDistrict}
                    onChange={(e) => setCreateDistrict(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                  <Input
                    placeholder="e.g. Tamil Nadu"
                    value={createState}
                    onChange={(e) => setCreateState(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Village / Town</label>
                  <Input
                    placeholder="e.g. Melur"
                    value={createVillage}
                    onChange={(e) => setCreateVillage(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contact Phone</label>
                  <Input
                    placeholder="e.g. 0452-2531000"
                    value={createContact}
                    onChange={(e) => setCreateContact(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Physical Address</label>
                <Input
                  placeholder="e.g. Regulated Market Complex, Melur Main Road"
                  value={createAddress}
                  onChange={(e) => setCreateAddress(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={createCentreMutation.isPending}>
                  Create Centre
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CENTRE MODAL */}
      {editingCentre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Edit Centre: {editingCentre.centreCode}
                </h3>
              </div>
              <button onClick={() => setEditingCentre(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Centre Name</label>
                <Input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">District</label>
                  <Input
                    required
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                  <Input
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Village</label>
                  <Input
                    value={editVillage}
                    onChange={(e) => setEditVillage(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Contact Phone</label>
                  <Input
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Address</label>
                <Input
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingCentre(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={updateCentreMutation.isPending}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
