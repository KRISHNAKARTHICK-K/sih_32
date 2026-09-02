import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import type { Procurement } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  FileText,
  Search,
  Eye,
  X,
  RotateCcw,
} from 'lucide-react';

export const AdminProcurementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cropFilter, setCropFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProcurement, setSelectedProcurement] = useState<Procurement | null>(null);

  // Query: Procurements
  const {
    data: procurements = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-procurements'],
    queryFn: adminApi.getProcurements,
  });

  // Query: Crops
  const { data: crops = [] } = useQuery({
    queryKey: ['admin-crops'],
    queryFn: () => adminApi.getCrops(false),
  });

  const filteredProcurements = procurements.filter((p) => {
    const matchesSearch =
      p.procurementCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.farmerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.displayToken && p.displayToken.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCrop = cropFilter === 'ALL' || p.cropId === cropFilter;
    const matchesGrade = gradeFilter === 'ALL' || (p.qualityInspection && p.qualityInspection.grade === gradeFilter);
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesCrop && matchesGrade && matchesStatus;
  });

  // Aggregates
  const totalVolume = filteredProcurements.reduce((acc, curr) => acc + (curr.actualQuantity || 0), 0);
  const totalValue = filteredProcurements.reduce((acc, curr) => acc + (curr.netAmount || 0), 0);

  const getGradeBadge = (grade?: string) => {
    switch (grade) {
      case 'A':
      case 'GRADE_A':
        return <Badge variant="success">GRADE A (FAQ)</Badge>;
      case 'B':
      case 'GRADE_B':
        return <Badge variant="info">GRADE B</Badge>;
      case 'C':
      case 'GRADE_C':
        return <Badge variant="neutral">GRADE C</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED</Badge>;
      default:
        return <span className="text-xs text-slate-400 font-mono">—</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">COMPLETED</Badge>;
      case 'PAYMENT_PENDING':
        return <Badge variant="primary">PAYMENT PENDING</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral">CANCELLED</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCropFilter('ALL');
    setGradeFilter('ALL');
    setStatusFilter('ALL');
  };

  if (isLoading) {
    return <LoadingState message="Loading system-wide procurement ledger..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Procurement Ledger"
        message={error instanceof Error ? error.message : 'Could not fetch records'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Procurement Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated intake transactions, certified weighbridge recordings, and MSP disbursements
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetFilters} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
          Reset Filters
        </Button>
      </div>

      {/* Summary Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-slate-700">
          <CardContent className="p-3.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filtered Intakes</span>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{filteredProcurements.length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-teal-600">
          <CardContent className="p-3.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Procured Volume</span>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
              {totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              <span className="text-xs font-normal text-slate-500 ml-1">Qntl</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-3.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Payout Ledger</span>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
              ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Search code, farmer, token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
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
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Quality Grades' },
                { value: 'A', label: 'Grade A (FAQ)' },
                { value: 'B', label: 'Grade B' },
                { value: 'C', label: 'Grade C' },
                { value: 'REJECTED', label: 'Rejected' },
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
              Procurement Receipts ({filteredProcurements.length})
            </CardTitle>
            <CardDescription>Official government procurement records</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt Code</TableHead>
                <TableHead>Farmer / Token</TableHead>
                <TableHead>Commodity</TableHead>
                <TableHead className="text-right">Actual Qty</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="text-right">MSP Rate</TableHead>
                <TableHead className="text-right">Gross (₹)</TableHead>
                <TableHead className="text-right">Net Payout (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcurements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-slate-400 text-xs">
                    No procurement records found matching the search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProcurements.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono font-bold text-slate-900 text-xs">
                      {p.procurementCode}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900 text-xs">{p.farmerName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{p.farmerCode}</div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-800">{p.cropName}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold text-slate-900">
                      {p.actualQuantity ? `${p.actualQuantity} Qntl` : '—'}
                    </TableCell>
                    <TableCell>{getGradeBadge(p.qualityInspection?.grade)}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-slate-600">
                      ₹{p.ratePerUnit?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-slate-700">
                      ₹{p.grossAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-emerald-700">
                      ₹{p.netAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{getStatusBadge(p.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProcurement(p)}
                        title="View Official Certificate"
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

      {/* PROCUREMENT DETAILS MODAL */}
      {selectedProcurement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" />
                <h3 className="font-semibold text-slate-900 text-sm">Procurement Certificate</h3>
              </div>
              <button onClick={() => setSelectedProcurement(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Procurement Code</span>
                <span className="font-mono font-bold text-slate-900">{selectedProcurement.procurementCode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Farmer / Code</span>
                <span className="font-medium text-slate-900">
                  {selectedProcurement.farmerName} ({selectedProcurement.farmerCode})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Commodity &amp; Grade</span>
                <span className="text-slate-900 font-medium">
                  {selectedProcurement.cropName} — {selectedProcurement.qualityInspection?.grade || 'Inspected'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Certified Weight</span>
                <span className="font-mono font-bold text-slate-900">{selectedProcurement.actualQuantity} Quintals</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Statutory MSP Rate</span>
                <span className="font-mono text-slate-900">₹{selectedProcurement.ratePerUnit} / Qntl</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Gross Amount</span>
                <span className="font-mono text-slate-900">₹{selectedProcurement.grossAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Deductions</span>
                <span className="font-mono text-rose-600">₹{selectedProcurement.deductions?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 bg-emerald-50/50 p-2 rounded">
                <span className="font-semibold text-emerald-900">Net Payable Amount</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  ₹{selectedProcurement.netAmount?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Recorded At</span>
                <span className="text-slate-700">{new Date(selectedProcurement.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedProcurement(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
