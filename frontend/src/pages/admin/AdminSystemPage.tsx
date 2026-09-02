import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Server,
  Database,
  Cpu,
  RefreshCw,
  Clock,
  HardDrive,
} from 'lucide-react';

export const AdminSystemPage: React.FC = () => {
  const {
    data: health,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: adminApi.getSystemHealth,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <LoadingState message="Connecting to system diagnostics..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="System Diagnostics Offline"
        message={error instanceof Error ? error.message : 'Could not retrieve backend telemetry'}
        onRetry={() => refetch()}
      />
    );
  }

  if (!health) return null;

  const formatUptime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const memoryPercent = health.jvmMaxMemoryMB > 0
    ? Math.round((health.jvmUsedMemoryMB / health.jvmMaxMemoryMB) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Health &amp; Infrastructure</h1>
            <Badge variant="primary">LIVE TELEMETRY</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational connectivity diagnostics, JVM runtime statistics, and persistence engine status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Last probe: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Just now'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Probe System
          </Button>
        </div>
      </div>

      {/* Core Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backend API */}
        <Card className="border-l-4 border-l-emerald-600">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Backend REST Engine
              </CardTitle>
              <Server className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="success" dot className="text-xs font-bold">
                ● {health.backendStatus}
              </Badge>
              <span className="text-xs text-slate-600">Spring Boot 3.3.5</span>
            </div>
            <p className="text-[11px] text-slate-500">Port 8080 / Non-blocking REST JSON API</p>
          </CardContent>
        </Card>

        {/* Database Connection */}
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Persistence Connection
              </CardTitle>
              <Database className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="success" dot className="text-xs font-bold">
                ● {health.databaseStatus}
              </Badge>
              <span className="text-xs text-slate-600 font-mono">{health.databaseDialect}</span>
            </div>
            <p className="text-[11px] text-slate-500">JDBC Connection pool verified valid (&lt;2s)</p>
          </CardContent>
        </Card>

        {/* Process Uptime */}
        <Card className="border-l-4 border-l-indigo-600">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Service Uptime
              </CardTitle>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            <div className="text-lg font-bold font-mono text-slate-900">
              {formatUptime(health.uptimeSeconds)}
            </div>
            <p className="text-[11px] text-slate-500">Continuous execution since last restart</p>
          </CardContent>
        </Card>
      </div>

      {/* JVM Heap & Resource Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-slate-700" />
              JVM Memory Utilization
            </CardTitle>
            <CardDescription>Java Virtual Machine heap memory allocation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Heap Utilization</span>
                <span className="font-mono font-bold text-slate-900">
                  {health.jvmUsedMemoryMB} MB / {health.jvmMaxMemoryMB} MB ({memoryPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(memoryPercent, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
              <div className="p-2.5 rounded border border-slate-100 bg-slate-50/50">
                <span className="text-slate-400 block text-[10px] uppercase">Used Heap</span>
                <span className="font-mono font-bold text-slate-800">{health.jvmUsedMemoryMB} MB</span>
              </div>
              <div className="p-2.5 rounded border border-slate-100 bg-slate-50/50">
                <span className="text-slate-400 block text-[10px] uppercase">Free Heap</span>
                <span className="font-mono font-bold text-slate-800">{health.jvmFreeMemoryMB} MB</span>
              </div>
              <div className="p-2.5 rounded border border-slate-100 bg-slate-50/50">
                <span className="text-slate-400 block text-[10px] uppercase">Max Allocated</span>
                <span className="font-mono font-bold text-slate-800">{health.jvmMaxMemoryMB} MB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-700" />
              Runtime Environment &amp; Topology
            </CardTitle>
            <CardDescription>Server execution context parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">JDK Version</span>
              <span className="font-mono font-medium text-slate-800">Java 25 (OpenJDK HotSpot 64-Bit)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Persistence Framework</span>
              <span className="font-medium text-slate-800">Hibernate 6 / Spring Data JPA</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Security Provider</span>
              <span className="font-medium text-slate-800">Spring Security (BCrypt + JWT HMAC-SHA256)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Active Connection Pool</span>
              <span className="font-mono font-semibold text-emerald-700">{health.activeConnectionPool} HikariCP Threads</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">System Environment</span>
              <Badge variant="neutral">{health.environment}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
