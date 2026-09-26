import React, { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { UserRole } from '../../types/inventory';
import { Package, Lock, User as UserIcon, Mail, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

interface SignupPageProps {
  onNavigateToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigateToLogin }) => {
  const { signup } = useInventoryStore();

  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('inventory_manager');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time validations
  const isLoginIdValid = loginId.length >= 6 && loginId.length <= 12;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasMinLength = password.length > 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasSpecial;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLoginIdValid) {
      setError('Login ID must be between 6 and 12 characters.');
      return;
    }

    if (!isEmailValid) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must be longer than 8 characters, contain an uppercase letter, lowercase letter, and special character.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match. Please verify Re-Enter Password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = signup(loginId, email, password, fullName || loginId, role);
      if (!res.success) {
        setError(res.error || 'Failed to sign up.');
        setIsLoading(false);
      }
      // On success, state automatically updates currentUser and app switches to Dashboard!
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50 to-slate-200 flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-odoo-700 flex items-center justify-center shadow-lg shadow-odoo-700/20 text-white">
          <Package className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">StockSense</h1>
          <p className="text-xs text-slate-500 font-medium">Create your warehouse operator account</p>
        </div>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-odoo-700 via-purple-600 to-tealbrand-600" />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Sign Up</h2>
            <p className="text-xs text-slate-500 mt-0.5">Register a new enterprise user profile</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-xs font-semibold text-slate-600 hover:text-odoo-700 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input
                id="signup-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jordan Hayes"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-odoo-600 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Role
              </label>
              <select
                id="signup-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-odoo-600 focus:bg-white transition-all"
              >
                <option value="inventory_manager">Inventory Manager</option>
                <option value="warehouse_staff">Warehouse Staff</option>
              </select>
            </div>
          </div>

          {/* Login ID */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Enter Login ID
              </label>
              <span className={`text-[11px] font-medium ${loginId.length > 0 ? (isLoginIdValid ? 'text-emerald-600' : 'text-amber-600') : 'text-slate-400'}`}>
                {loginId.length}/12 chars (must be 6-12)
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                id="signup-loginid"
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="6 to 12 alphanumeric characters"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  loginId.length > 0
                    ? isLoginIdValid
                      ? 'border-emerald-300 focus:ring-emerald-500'
                      : 'border-amber-300 focus:ring-amber-500'
                    : 'border-slate-200 focus:ring-odoo-600'
                }`}
              />
              {loginId.length > 0 && isLoginIdValid && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

          {/* Email ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Enter Email ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@enterprise.com"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-odoo-600 focus:bg-white transition-all"
              />
              {email.length > 0 && isEmailValid && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Enter Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="signup-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-odoo-600 focus:bg-white transition-all"
              />
            </div>

            {/* Password Validation Requirements Grid */}
            <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                Length &gt; 8 characters
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${hasUpper ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                One uppercase letter (A-Z)
              </div>
              <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${hasLower ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                One lowercase letter (a-z)
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${hasSpecial ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                One special character (!@#$)
              </div>
            </div>
          </div>

          {/* Re-Enter Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Re-Enter Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="signup-confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  confirmPassword.length > 0
                    ? passwordsMatch
                      ? 'border-emerald-300 focus:ring-emerald-500'
                      : 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-odoo-600'
                }`}
              />
              {confirmPassword.length > 0 && passwordsMatch && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-[11px] text-rose-600 mt-1">Passwords do not match.</p>
            )}
          </div>

          <button
            id="signup-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3 px-4 bg-odoo-700 hover:bg-odoo-800 active:bg-odoo-900 text-white font-semibold rounded-xl text-sm shadow-md shadow-odoo-700/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                SIGN UP
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <button
            id="to-login-btn"
            type="button"
            onClick={onNavigateToLogin}
            className="font-semibold text-odoo-700 hover:text-odoo-900 hover:underline transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
