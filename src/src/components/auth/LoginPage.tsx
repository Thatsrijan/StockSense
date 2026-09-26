import React, { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { Package, Lock, User as UserIcon, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onNavigateToSignup: () => void;
  onNavigateToForgot: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToSignup, onNavigateToForgot }) => {
  const { login } = useInventoryStore();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(loginId, password);
      if (!res.success) {
        setError(res.error || 'Invalid Login Id or Password');
      }
      setIsLoading(false);
    }, 250);
  };

  const handleQuickLogin = (userType: 'manager' | 'staff') => {
    if (userType === 'manager') {
      setLoginId('admin_manager');
      setPassword('Admin@123');
      login('admin_manager', 'Admin@123');
    } else {
      setLoginId('warehouse_staff');
      setPassword('Staff@123');
      login('warehouse_staff', 'Staff@123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50 to-slate-200 flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-odoo-700 flex items-center justify-center shadow-lg shadow-odoo-700/20 text-white">
          <Package className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            StockSense
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-odoo-100 text-odoo-800 border border-odoo-200">
              IMS Enterprise
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">Real-time Modular Inventory Management System</p>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-odoo-700 via-purple-600 to-tealbrand-600" />

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Sign In</h2>
          <p className="text-sm text-slate-500 mt-1">
            Access your inventory dashboard and warehouse operations
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Login ID or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                id="login-id-input"
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="e.g. admin_manager or email"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-odoo-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={onNavigateToForgot}
                className="text-xs font-medium text-odoo-700 hover:text-odoo-900 transition-colors"
              >
                Forget Password ?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-odoo-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-odoo-700 hover:bg-odoo-800 active:bg-odoo-900 text-white font-semibold rounded-xl text-sm shadow-md shadow-odoo-700/25 flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                SIGN IN
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <button
            id="to-signup-btn"
            type="button"
            onClick={onNavigateToSignup}
            className="font-semibold text-odoo-700 hover:text-odoo-900 hover:underline transition-colors"
          >
            Sign Up
          </button>
        </div>

        {/* Demo Credentials Helper */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Demo Logins (1-Click Fill & Sign In):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('manager')}
              className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-900 text-left transition-colors"
            >
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> Manager
              </div>
              <div className="text-[11px] text-purple-600 mt-0.5">admin_manager / Admin@123</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('staff')}
              className="p-2.5 rounded-lg border border-teal-200 bg-teal-50/60 hover:bg-teal-100 text-teal-900 text-left transition-colors"
            >
              <div className="font-bold flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-teal-700" /> Warehouse Staff
              </div>
              <div className="text-[11px] text-teal-600 mt-0.5">warehouse_staff / Staff@123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
