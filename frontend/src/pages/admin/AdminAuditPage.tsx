import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Search,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');

  // Query: Audit logs
  const {
    data: logs = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin-audit', actionFilter, entityFilter],
    queryFn: () =>
      adminApi.getAuditLogs({
        action: actionFilter !== 'ALL' ? actionFilter : undefined,
        entityType: entityFilter !== 'ALL' ? entityFilter : undefined,
        limit: 200,
      }),
  });

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.userFullName && l.userFullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.entityId && l.entityId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.description && l.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setActionFilter('ALL');
    setEntityFilter('ALL');
  };

  const getActionBadge = (action: string) => {
    if (action.includes('CREATE')) return <Badge variant="success">{action}</Badge>;
    if (action.includes('UPDATE') || action.includes('STATUS')) return <Badge variant="primary">{action}</Badge>;
    if (action.includes('RECORD') || action.includes('INSPECT')) return <Badge variant="info">{action}</Badge>;
    if (action.includes('PAYMENT')) return <Badge variant="warning">{action}</Badge>;
    if (action.includes('LOGIN')) return <Badge variant="neutral">{action}</Badge>;
    return <Badge variant="neutral">{action}</Badge>;
  };

  if (isLoading) {
    return <LoadingState message="Loading immutable security audit trail..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Audit Trail"
        message={error instanceof Error ? error.message : 'Could not fetch audit records from server'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Security &amp; Operational Audit Trail</h1>
            <Badge variant="primary">READ ONLY / IMMUTABLE</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident chronological journal of all mutations, logins, and operational transitions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetFilters} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Search user, entity ID, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
            <Select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Recorded Actions' },
                { value: 'ADMIN_CREATED_USER', label: 'ADMIN_CREATED_USER' },
                { value: 'ADMIN_UPDATED_USER', label: 'ADMIN_UPDATED_USER' },
                { value: 'ADMIN_UPDATED_USER_STATUS', label: 'ADMIN_UPDATED_USER_STATUS' },
                { value: 'ADMIN_CREATED_CENTRE', label: 'ADMIN_CREATED_CENTRE' },
                { value: 'ADMIN_UPDATED_CENTRE', label: 'ADMIN_UPDATED_CENTRE' },
                { value: 'ADMIN_CREATED_CROP', label: 'ADMIN_CREATED_CROP' },
                { value: 'ADMIN_UPDATED_CROP', label: 'ADMIN_UPDATED_CROP' },
                { value: 'ADMIN_CREATED_PRICE', label: 'ADMIN_CREATED_PRICE' },
                { value: 'CREATE_BOOKING', label: 'CREATE_BOOKING' },
                { value: 'WEIGHMENT_RECORDED', label: 'WEIGHMENT_RECORDED' },
                { value: 'QUALITY_INSPECTED', label: 'QUALITY_INSPECTED' },
                { value: 'PAYMENT_PROCESSED', label: 'PAYMENT_PROCESSED' },
              ]}
            />
            <Select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Entity Types' },
                { value: 'USER', label: 'USER' },
                { value: 'CENTRE', label: 'CENTRE' },
                { value: 'CROP', label: 'CROP' },
                { value: 'CROP_PRICE', label: 'CROP_PRICE' },
                { value: 'BOOKING', label: 'BOOKING' },
                { value: 'WEIGHMENT', label: 'WEIGHMENT' },
                { value: 'QUALITY_INSPECTION', label: 'QUALITY_INSPECTION' },
                { value: 'PROCUREMENT', label: 'PROCUREMENT' },
                { value: 'PAYMENT', label: 'PAYMENT' },
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
              Audit Journal ({filteredLogs.length} entries)
            </CardTitle>
            <CardDescription>Direct records from PostgreSQL audit_logs table</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">Timestamp</TableHead>
                <TableHead>Actor / User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Scope</TableHead>
                <TableHead>Entity Reference</TableHead>
                <TableHead>Operational Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No audit records matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs font-mono text-slate-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900 text-xs">@{log.username}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{log.userRole}</div>
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {log.entityType}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-500">
                      {log.entityId ? log.entityId.slice(0, 13) + '...' : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 max-w-md">
                      {log.description || 'System operation executed.'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
