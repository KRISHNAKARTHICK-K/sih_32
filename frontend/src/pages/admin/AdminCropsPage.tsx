import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import type { Crop } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Package,
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  Tag,
} from 'lucide-react';

export const AdminCropsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);

  // Create form state
  const [createCode, setCreateCode] = useState('');
  const [createName, setCreateName] = useState('');
  const [createUnit, setCreateUnit] = useState('QUINTAL');
  const [formError, setFormError] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState('QUINTAL');

  // Query: Crops
  const {
    data: crops = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-crops'],
    queryFn: () => adminApi.getCrops(false),
  });

  // Mutation: Create Crop
  const createCropMutation = useMutation({
    mutationFn: (payload: { code: string; name: string; unit: string }) =>
      adminApi.createCrop(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crops'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setIsCreateModalOpen(false);
      resetCreateForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || 'Failed to create crop');
    },
  });

  // Mutation: Edit Crop
  const updateCropMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; unit?: string } }) =>
      adminApi.updateCrop(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crops'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setEditingCrop(null);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || 'Failed to update crop');
    },
  });

  // Mutation: Toggle Active Status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminApi.updateCropStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crops'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const resetCreateForm = () => {
    setCreateCode('');
    setCreateName('');
    setCreateUnit('QUINTAL');
    setFormError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!createCode.trim() || !createName.trim()) {
      setFormError('Crop code and crop name are mandatory.');
      return;
    }

    createCropMutation.mutate({
      code: createCode.trim().toUpperCase(),
      name: createName.trim(),
      unit: createUnit.trim().toUpperCase(),
    });
  };

  const openEditModal = (c: Crop) => {
    setEditingCrop(c);
    setEditName(c.name);
    setEditUnit(c.unit);
    setFormError(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrop) return;

    updateCropMutation.mutate({
      id: editingCrop.id,
      payload: {
        name: editName.trim(),
        unit: editUnit.trim().toUpperCase(),
      },
    });
  };

  const filteredCrops = crops.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && c.active) ||
      (statusFilter === 'INACTIVE' && !c.active);

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <LoadingState message="Loading crop master data..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Crops"
        message={error instanceof Error ? error.message : 'Could not fetch crops from server'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Crop Master Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain agricultural commodity master data, standard units, and procurement eligibility
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
          Add Crop Commodity
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Search by commodity name or code (e.g. PADDY, WHEAT)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active Commodities' },
                { value: 'INACTIVE', label: 'Deactivated Commodities' },
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
              Approved Commodities ({filteredCrops.length})
            </CardTitle>
            <CardDescription>Government sanctioned procurement commodities</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Crop Code</TableHead>
                <TableHead>Commodity Name</TableHead>
                <TableHead>Standard Unit</TableHead>
                <TableHead>Active MSP Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCrops.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No crops found matching the search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCrops.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-bold text-slate-900 text-xs">
                      {c.code}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 text-xs">{c.name}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">{c.unit}</TableCell>
                    <TableCell>
                      {c.currentPrice && c.currentPrice > 0 ? (
                        <span className="font-mono font-semibold text-emerald-700 text-xs">
                          ₹{c.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / {c.unit}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">No active MSP</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.active ? (
                        <Badge variant="success" dot>ACTIVE</Badge>
                      ) : (
                        <Badge variant="neutral" dot>INACTIVE</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(c)}
                          title="Edit Commodity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleStatusMutation.mutate({ id: c.id, active: !c.active })
                          }
                          title={c.active ? 'Deactivate Commodity' : 'Activate Commodity'}
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

      {/* CREATE CROP MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-700" />
                <h3 className="font-semibold text-slate-900 text-sm">Add Crop Commodity</h3>
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
                  Crop Identifier Code <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. MUSTARD, SOYBEAN, MAIZE"
                  value={createCode}
                  onChange={(e) => setCreateCode(e.target.value.toUpperCase())}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Commodity Display Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Yellow Mustard (FAQ Grade)"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Standard Intake Unit</label>
                <Select
                  value={createUnit}
                  onChange={(e) => setCreateUnit(e.target.value)}
                  options={[
                    { value: 'QUINTAL', label: 'Quintal (100 kg)' },
                    { value: 'MT', label: 'Metric Ton (1,000 kg)' },
                    { value: 'KG', label: 'Kilogram (kg)' },
                  ]}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={createCropMutation.isPending}>
                  Save Commodity
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CROP MODAL */}
      {editingCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Edit Commodity: {editingCrop.code}
                </h3>
              </div>
              <button onClick={() => setEditingCrop(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Commodity Name</label>
                <Input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Intake Unit</label>
                <Select
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  options={[
                    { value: 'QUINTAL', label: 'Quintal (100 kg)' },
                    { value: 'MT', label: 'Metric Ton (1,000 kg)' },
                    { value: 'KG', label: 'Kilogram (kg)' },
                  ]}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingCrop(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={updateCropMutation.isPending}>
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
