import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import type { AdminUser, AdminUserCreatePayload } from '../../types/admin';
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
  UserPlus,
  Shield,
  Eye,
  CheckCircle2,
  XCircle,
  Building2,
  X,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Form state
  const [formFullName, setFormFullName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formRole, setFormRole] = useState<'FARMER' | 'OPERATOR' | 'CENTRE_MANAGER' | 'ADMIN'>('OPERATOR');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [formCentreId, setFormCentreId] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formVillage, setFormVillage] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formState, setFormState] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Query: Users
  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  });

  // Query: Centres for dropdown
  const { data: centres = [] } = useQuery({
    queryKey: ['admin-centres'],
    queryFn: adminApi.getCentres,
  });

  // Mutation: Create User
  const createUserMutation = useMutation({
    mutationFn: (payload: AdminUserCreatePayload) => adminApi.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || 'Failed to create user');
    },
  });

  // Mutation: Toggle User Status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      adminApi.updateUserStatus(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const resetForm = () => {
    setFormFullName('');
    setFormUsername('');
    setFormEmail('');
    setFormMobile('');
    setFormRole('OPERATOR');
    setFormPassword('');
    setFormConfirmPassword('');
    setFormCentreId('');
    setFormDesignation('');
    setFormVillage('');
    setFormDistrict('');
    setFormState('');
    setFormError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formUsername.trim() || !formFullName.trim() || !formPassword) {
      setFormError('Please fill in all mandatory fields.');
      return;
    }

    if (formPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    if (formPassword !== formConfirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if ((formRole === 'OPERATOR' || formRole === 'CENTRE_MANAGER') && !formCentreId) {
      setFormError('Please select an assigned procurement centre for operators and managers.');
      return;
    }

    createUserMutation.mutate({
      username: formUsername.trim(),
      fullName: formFullName.trim(),
      email: formEmail.trim() || undefined,
      mobile: formMobile.trim() || undefined,
      role: formRole,
      password: formPassword,
      centreId: formCentreId || undefined,
      designation: formDesignation.trim() || undefined,
      village: formVillage.trim() || undefined,
      district: formDistrict.trim() || undefined,
      state: formState.trim() || undefined,
    });
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.mobile && u.mobile.includes(searchTerm));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ENABLED' && u.enabled) ||
      (statusFilter === 'DISABLED' && !u.enabled);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="danger">ADMIN</Badge>;
      case 'CENTRE_MANAGER':
        return <Badge variant="primary">MANAGER</Badge>;
      case 'OPERATOR':
        return <Badge variant="info">OPERATOR</Badge>;
      case 'FARMER':
        return <Badge variant="success">FARMER</Badge>;
      default:
        return <Badge variant="neutral">{role}</Badge>;
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading system users..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to Load Users"
        message={error instanceof Error ? error.message : 'Could not load users from backend'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System User Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage user accounts, RBAC access levels, and centre operational assignments
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          leftIcon={<UserPlus className="w-3.5 h-3.5" />}
        >
          Create User Account
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Search by name, username, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Roles' },
                { value: 'ADMIN', label: 'Admin' },
                { value: 'CENTRE_MANAGER', label: 'Centre Manager' },
                { value: 'OPERATOR', label: 'Intake Operator' },
                { value: 'FARMER', label: 'Farmer' },
              ]}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ENABLED', label: 'Active / Enabled' },
                { value: 'DISABLED', label: 'Deactivated' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Data Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">
              Registered Accounts ({filteredUsers.length})
            </CardTitle>
            <CardDescription>Direct database records with operational linkage</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Full Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact (Email / Mobile)</TableHead>
                <TableHead>Assigned Centre / Affiliation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                    No users found matching the selected criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900 text-xs">{user.fullName}</div>
                      {user.farmerCode && (
                        <div className="text-[11px] font-mono text-emerald-700">{user.farmerCode}</div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-700">@{user.username}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <div>{user.email || '—'}</div>
                      <div className="text-[11px] text-slate-400">{user.mobile || '—'}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {user.centreName ? (
                        <div>
                          <span className="font-medium text-slate-900">{user.centreName}</span>
                          {user.designation && (
                            <span className="text-[11px] text-slate-500 block">({user.designation})</span>
                          )}
                        </div>
                      ) : user.role === 'ADMIN' ? (
                        <span className="text-xs text-slate-500 italic">Headquarters System</span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.enabled ? (
                        <Badge variant="success" dot>Active</Badge>
                      ) : (
                        <Badge variant="neutral" dot>Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          title="View Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {user.role !== 'ADMIN' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toggleStatusMutation.mutate({ id: user.id, enabled: !user.enabled })
                            }
                            title={user.enabled ? 'Deactivate Account' : 'Activate Account'}
                            className={user.enabled ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}
                          >
                            {user.enabled ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-700" />
                <h3 className="font-semibold text-slate-900 text-sm">Create New User Account</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4">
              {formError && (
                <div className="rounded border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. ramesh_op"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <Input
                    type="email"
                    placeholder="ramesh@agriprocure.gov.in"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Number</label>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Access Role <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  options={[
                    { value: 'OPERATOR', label: 'Intake & Weighbridge Operator' },
                    { value: 'CENTRE_MANAGER', label: 'Procurement Centre Manager' },
                    { value: 'FARMER', label: 'Registered Farmer' },
                    { value: 'ADMIN', label: 'System Administrator' },
                  ]}
                />
              </div>

              {/* Centre assignment for Operator / Manager */}
              {(formRole === 'OPERATOR' || formRole === 'CENTRE_MANAGER') && (
                <div className="rounded-md border border-slate-200 bg-slate-50/50 p-3 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    Centre Assignment Required
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Assigned Procurement Centre <span className="text-rose-500">*</span>
                    </label>
                    <Select
                      value={formCentreId}
                      onChange={(e) => setFormCentreId(e.target.value)}
                      options={[
                        { value: '', label: 'Select Centre...' },
                        ...centres.map((c) => ({
                          value: c.centreId,
                          label: `${c.centreCode} — ${c.centreName} (${c.district})`,
                        })),
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Official Designation</label>
                    <Input
                      placeholder={formRole === 'CENTRE_MANAGER' ? 'Centre Manager' : 'Intake Operator'}
                      value={formDesignation}
                      onChange={(e) => setFormDesignation(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Farmer Profile Fields */}
              {formRole === 'FARMER' && (
                <div className="rounded-md border border-slate-200 bg-slate-50/50 p-3 space-y-3">
                  <div className="text-xs font-semibold text-slate-800">Farmer Demographic Details</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Village</label>
                      <Input
                        placeholder="Village"
                        value={formVillage}
                        onChange={(e) => setFormVillage(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">District</label>
                      <Input
                        placeholder="District"
                        value={formDistrict}
                        onChange={(e) => setFormDistrict(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-0.5">State</label>
                      <Input
                        placeholder="State"
                        value={formState}
                        onChange={(e) => setFormState(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="Min. 6 chars"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={formConfirmPassword}
                    onChange={(e) => setFormConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={createUserMutation.isPending}
                >
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 text-sm">User Profile Dossier</h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Full Name</span>
                <span className="font-semibold text-slate-900">{selectedUser.fullName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Username</span>
                <span className="font-mono text-slate-800">@{selectedUser.username}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Role</span>
                <span>{getRoleBadge(selectedUser.role)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-800">{selectedUser.email || 'None registered'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Mobile</span>
                <span className="font-mono text-slate-800">{selectedUser.mobile || 'None registered'}</span>
              </div>
              {selectedUser.centreName && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Assigned Centre</span>
                  <span className="font-medium text-slate-900">{selectedUser.centreName}</span>
                </div>
              )}
              {selectedUser.designation && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Designation</span>
                  <span className="text-slate-800">{selectedUser.designation}</span>
                </div>
              )}
              {selectedUser.farmerCode && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Farmer Code</span>
                  <span className="font-mono font-semibold text-emerald-700">{selectedUser.farmerCode}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Account Status</span>
                <span>
                  {selectedUser.enabled ? (
                    <Badge variant="success">ENABLED</Badge>
                  ) : (
                    <Badge variant="neutral">DISABLED</Badge>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Account Created</span>
                <span className="text-slate-700">{new Date(selectedUser.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
