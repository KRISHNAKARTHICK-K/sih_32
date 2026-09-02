import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import type { UserRole } from '../../auth/authTypes';
import { AccessDeniedPage } from '../../pages/AccessDeniedPage';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-lg shadow-sm border border-slate-200">
          <Loader2 className="w-5 h-5 text-emerald-700 animate-spin" />
          <span className="text-sm font-medium text-slate-700">Verifying AGRIPROCURE Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
};
