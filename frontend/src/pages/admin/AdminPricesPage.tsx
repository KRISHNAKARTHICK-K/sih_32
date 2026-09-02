import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import type { AdminCropPriceCreatePayload } from '../../types/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  DollarSign,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';

export const AdminPricesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [formCropId, setFormCropId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formEffectiveFrom, setFormEffectiveFrom] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [formEffectiveTo, setFormEffectiveTo] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Query: Prices
  const {
    data: prices = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-prices'],
    queryFn: adminApi.getPrices,
  });

  // Query: Crops for dropdown
  const { data: crops = [] } = useQuery({
    queryKey: ['admin-crops'],
    queryFn: () => adminApi.getCrops(true),
  });

  // Mutation: Create Price
  const createPriceMutation = useMutation({
    mutationFn: (payload: AdminCropPriceCreatePayload) => adminApi.createPrice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prices'] });
      queryClient.invalidateQueries({ queryKey: ['admin-crops'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || 'Failed to configure MSP');
    },
  });

  // Mutation: Toggle Status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminApi.updatePriceStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prices'] });
      queryClient.invalidateQueries({ queryKey: ['admin-crops'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const resetForm = () => {
    setFormCropId('');
    setFormPrice('');
    setFormEffectiveFrom(new Date().toISOString().split('T')[0]);
    setFormEffectiveTo('');
    setFormError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const priceNum = parseFloat(formPrice);
    if (!formCropId || isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please select a commodity and specify a valid price > 0.');
      return;
    }

    if (formEffectiveTo && formEffectiveFrom > formEffectiveTo) {
      setFormError('Effective From date cannot be after Effective To date.');
      return;
    }

    createPriceMutation.mutate({
      cropId: formCropId,
      pricePerUnit: priceNum,
      effectiveFrom: formEffectiveFrom,
      effectiveTo: formEffectiveTo || undefined,
    });
  };

  const filteredPrices = prices.filter((p) => {
    const matchesSearch =
      p.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cropCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && p.active) ||
      (statusFilter === 'INACTIVE' && !p.active);

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <LoadingState message="Loading crop MSP price schedule..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load MSP Schedule"
        message={error instanceof Error ? error.message : 'Could not fetch price master data'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Minimum Support Price (MSP) Master</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure statutory government procurement rates, validity periods, and price revisions
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Configure New MSP Rate
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Search by commodity or crop code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active MSP Rates' },
                { value: 'INACTIVE', label: 'Expired / Inactive Rates' },
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
              Statutory MSP Schedule ({filteredPrices.length})
            </CardTitle>
            <CardDescription>Government gazette rates used for automated voucher settlement</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commodity</TableHead>
                <TableHead>Crop Code</TableHead>
                <TableHead>MSP Rate (₹ / Quintal)</TableHead>
                <TableHead>Effective From</TableHead>
                <TableHead>Effective To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                    No price schedules found matching the search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrices.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-semibold text-slate-900 text-xs">
                      {p.cropName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600 font-medium">
                      {p.cropCode}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-bold text-emerald-700 text-xs">
                        ₹{p.pricePerUnit.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / Qntl
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 font-mono">
                      {p.effectiveFrom}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono">
                      {p.effectiveTo || <span className="text-slate-400">Open-ended</span>}
                    </TableCell>
                    <TableCell>
                      {p.active ? (
                        <Badge variant="success" dot>ACTIVE</Badge>
                      ) : (
                        <Badge variant="neutral" dot>EXPIRED</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleStatusMutation.mutate({ id: p.id, active: !p.active })
                        }
                        title={p.active ? 'Deactivate Rate' : 'Activate Rate'}
                        className={p.active ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}
                      >
                        {p.active ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CONFIGURE PRICE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                <h3 className="font-semibold text-slate-900 text-sm">Configure Minimum Support Price</h3>
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
                  Target Commodity <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={formCropId}
                  onChange={(e) => setFormCropId(e.target.value)}
                  options={[
                    { value: '', label: 'Select Commodity...' },
                    ...crops.map((c) => ({
                      value: c.id,
                      label: `${c.name} (${c.code})`,
                    })),
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  MSP Rate (₹ per Quintal) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 2300.00"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  leftIcon={<span className="text-slate-400 text-xs font-bold">₹</span>}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Effective From <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="date"
                    required
                    value={formEffectiveFrom}
                    onChange={(e) => setFormEffectiveFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Effective To (Optional)
                  </label>
                  <Input
                    type="date"
                    value={formEffectiveTo}
                    onChange={(e) => setFormEffectiveTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={createPriceMutation.isPending}>
                  Save MSP Configuration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
