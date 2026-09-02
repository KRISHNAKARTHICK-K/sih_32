import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import type { Farmer } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Users,
  Search,
  Eye,
  X,
  CreditCard,
} from 'lucide-react';

export const AdminFarmersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);

  const {
    data: farmers = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-farmers'],
    queryFn: adminApi.getFarmers,
  });

  const districts = Array.from(new Set(farmers.map((f) => f.district).filter(Boolean)));

  const filteredFarmers = farmers.filter((f) => {
    const matchesSearch =
      f.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.farmerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.mobile && f.mobile.includes(searchTerm)) ||
      (f.village && f.village.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDistrict = districtFilter === 'ALL' || f.district === districtFilter;

    return matchesSearch && matchesDistrict;
  });

  if (isLoading) {
    return <LoadingState message="Loading system-wide farmer registry..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Farmer Registry"
        message={error instanceof Error ? error.message : 'Could not fetch farmer records'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Farmer Master Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System-wide agricultural producer demographic database and bank settlement linkage
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Search by farmer name, code (FAR-...), phone, village..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
            <Select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Districts' },
                ...districts.map((d) => ({ value: d, label: d })),
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
              Registered Producers ({filteredFarmers.length})
            </CardTitle>
            <CardDescription>Verified farmer identities with DBT linkage</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farmer Code</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Contact (Mobile / Email)</TableHead>
                <TableHead>Location (Village / District / State)</TableHead>
                <TableHead>Landholding</TableHead>
                <TableHead>Bank Linkage</TableHead>
                <TableHead>Registered Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFarmers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                    No farmers found matching the search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFarmers.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-mono font-semibold text-emerald-700 text-xs">
                      {f.farmerCode}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 text-xs">{f.fullName}</TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div className="font-mono">{f.mobile}</div>
                      <div className="text-[11px] text-slate-400">{f.email || '—'}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      <div>{f.village || '—'}, {f.district || '—'}</div>
                      <div className="text-[11px] text-slate-400">{f.state || '—'}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-800 font-medium">
                      {f.landHoldingAcre ? `${f.landHoldingAcre} Acres` : '—'}
                    </TableCell>
                    <TableCell>
                      {f.bankAccountNumber ? (
                        <div className="flex items-center gap-1 text-[11px] text-slate-700">
                          <CreditCard className="w-3 h-3 text-blue-600" />
                          <span className="font-mono">••••{f.bankAccountNumber.slice(-4)}</span>
                        </div>
                      ) : (
                        <Badge variant="neutral">Not Linked</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFarmer(f)}
                        title="View Full Profile"
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

      {/* FARMER DETAIL MODAL */}
      {selectedFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <h3 className="font-semibold text-slate-900 text-sm">Farmer Master Record</h3>
              </div>
              <button
                onClick={() => setSelectedFarmer(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Farmer Code</span>
                <span className="font-mono font-bold text-emerald-700">{selectedFarmer.farmerCode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Full Name</span>
                <span className="font-semibold text-slate-900">{selectedFarmer.fullName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Mobile</span>
                <span className="font-mono text-slate-800">{selectedFarmer.mobile}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-800">{selectedFarmer.email || 'None provided'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Village / District / State</span>
                <span className="text-slate-800 font-medium">
                  {selectedFarmer.village}, {selectedFarmer.district}, {selectedFarmer.state}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Address</span>
                <span className="text-slate-700">{selectedFarmer.address || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Landholding</span>
                <span className="font-semibold text-slate-900">
                  {selectedFarmer.landHoldingAcre ? `${selectedFarmer.landHoldingAcre} Acres` : 'Not recorded'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Bank Name</span>
                <span className="font-medium text-slate-800">{selectedFarmer.bankName || 'Not linked'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">IFSC Code</span>
                <span className="font-mono text-slate-800">{selectedFarmer.ifscCode || '—'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Registered On</span>
                <span className="text-slate-700">{new Date(selectedFarmer.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedFarmer(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
