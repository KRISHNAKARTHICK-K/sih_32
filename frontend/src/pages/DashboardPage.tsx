import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHealthStatus } from '../api/health';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import {
  Server,
  Layers,
  Terminal,
  RefreshCw,
  Clock,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { APP_NAME, APP_DESCRIPTION } from '../constants';

export const DashboardPage: React.FC = () => {
  const {
    data: health,
    isLoading,
    isError,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['system-health'],
    queryFn: fetchHealthStatus,
    refetchInterval: 30000,
    retry: 2,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome to {APP_NAME} — {APP_DESCRIPTION}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Check Connectivity
          </Button>
        </div>
      </div>

      {/* Primary System Status & Architecture Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Live Backend Connection Card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-700" />
                Backend System Status
              </CardTitle>
              <CardDescription>
                Live connectivity check via Spring Boot <code className="text-slate-700 font-mono">/api/health</code>
              </CardDescription>
            </div>
            {isLoading ? (
              <Badge variant="neutral" dot>
                Checking API...
              </Badge>
            ) : isError ? (
              <Badge variant="danger" dot>
                Offline / Unreachable
              </Badge>
            ) : (
              <Badge variant="success" dot>
                Application Online
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Reported Status:</span>
                  <span className="font-semibold text-slate-800">
                    {health?.status ? `● ${health.status}` : isError ? 'Offline' : 'Probing...'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Service Name:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {health?.service || 'AGRIPROCURE'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Last Verified:</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Pending'}
                  </span>
                </div>
              </div>

              {isError && (
                <div className="rounded border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                  <strong>Note:</strong> Could not connect to backend at{' '}
                  <code className="font-mono text-amber-900">
                    {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}
                  </code>
                  . Ensure Spring Boot is running on port 8080.
                </div>
              )}
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Environment: Local Development</span>
              <span className="font-mono text-slate-600">Protocol: HTTP / REST JSON</span>
            </div>
          </CardContent>
        </Card>

        {/* Security & Foundation Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              ERP Core Architecture
            </CardTitle>
            <CardDescription>Foundation stack &amp; modular readiness</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Frontend Stack</span>
              <span className="font-medium text-slate-800">React + TS + Vite</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Styling System</span>
              <span className="font-medium text-slate-800">Tailwind CSS (ERP UI)</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Backend Engine</span>
              <span className="font-medium text-slate-800">Spring Boot 3 + Java</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Persistence</span>
              <span className="font-medium text-slate-800">PostgreSQL + JPA</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Active Phase</span>
              <Badge variant="info">Step 1: Foundation</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Overview Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            System Module Readiness
          </CardTitle>
          <CardDescription>
            High-level architectural blueprint for agricultural operations workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Module</TableHead>
                <TableHead>Scope &amp; Responsibility</TableHead>
                <TableHead className="w-32">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold text-slate-900">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-700" />
                    Core Platform &amp; Health
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  Centralized Axios API client, Error boundary, CORS configuration, and REST Health endpoint.
                </TableCell>
                <TableCell>
                  <Badge variant="success">Operational</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-slate-900">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-500" />
                    Authentication &amp; RBAC
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  Spring Security JWT, role definitions (Farmer, Operator, Manager, Admin), and route guards.
                </TableCell>
                <TableCell>
                  <Badge variant="neutral">Upcoming (Step 3)</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-slate-900">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-500" />
                    Database Schema &amp; Entities
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  PostgreSQL schema design for farmers, procurement centres, slots, queues, and ledger.
                </TableCell>
                <TableCell>
                  <Badge variant="neutral">Upcoming (Step 2)</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
