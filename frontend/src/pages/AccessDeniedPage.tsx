import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, user } = useAuth();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-rose-200 rounded-lg p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">403 — Access Denied</h1>
        <p className="text-xs text-slate-600 mt-2">
          Your current account role (<span className="font-semibold text-slate-900">{role || 'USER'}</span>) does not have sufficient permissions to access this ERP module or resource.
        </p>

        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-left text-xs text-slate-600">
          <div className="flex justify-between py-0.5">
            <span className="text-slate-500">Authenticated User:</span>
            <span className="font-medium text-slate-800">{user?.username}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-slate-500">Security Clearance:</span>
            <span className="font-mono text-emerald-800 font-semibold">{user?.role}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Safe Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
