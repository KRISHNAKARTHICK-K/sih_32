import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Wheat, Shield, Lock, User, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { APP_NAME } from '../constants';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both your identifier and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login({ username: username.trim(), password });
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to sign in. Please check your credentials.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded bg-emerald-700 text-white shadow-md">
            <Wheat className="w-6 h-6 text-emerald-200" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight text-white">{APP_NAME}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-700">
                ERP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal leading-none mt-0.5">
              Agricultural Procurement &amp; Queue Management
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-center text-lg font-semibold tracking-tight text-slate-200">
          Sign in to your operational account
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-5 p-3 rounded-md bg-rose-50 border border-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800 leading-relaxed font-medium">
                {error}
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-slate-700">
                Username / Mobile / Email
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin, operator, or farmer1"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 text-emerald-800 focus:ring-emerald-700 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-slate-600 text-xs">
                  Remember session
                </label>
              </div>

              <span className="text-slate-400 cursor-not-allowed hover:text-slate-400" title="Contact System Administrator">
                Forgot password?
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700 shadow-xs transition-colors disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Sign In to ERP</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Panel for Development Review */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5 text-center">
              Development Test Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin', 'Admin@123')}
                className="p-2 border border-slate-200 rounded text-left hover:bg-emerald-50 hover:border-emerald-300 transition-colors flex flex-col"
              >
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Admin
                </span>
                <span className="text-slate-500 font-mono text-[10px]">admin / Admin@123</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('manager', 'Manager@123')}
                className="p-2 border border-slate-200 rounded text-left hover:bg-emerald-50 hover:border-emerald-300 transition-colors flex flex-col"
              >
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Centre Manager
                </span>
                <span className="text-slate-500 font-mono text-[10px]">manager / Manager@123</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('operator', 'Operator@123')}
                className="p-2 border border-slate-200 rounded text-left hover:bg-emerald-50 hover:border-emerald-300 transition-colors flex flex-col"
              >
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Operator
                </span>
                <span className="text-slate-500 font-mono text-[10px]">operator / Operator@123</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('farmer1', 'Farmer@123')}
                className="p-2 border border-slate-200 rounded text-left hover:bg-emerald-50 hover:border-emerald-300 transition-colors flex flex-col"
              >
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Farmer (Muthusamy)
                </span>
                <span className="text-slate-500 font-mono text-[10px]">farmer1 / Farmer@123</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-400">
            AGRIPROCURE ERP &bull; Official Digital Agricultural Procurement System
          </p>
        </div>
      </div>
    </div>
  );
};
