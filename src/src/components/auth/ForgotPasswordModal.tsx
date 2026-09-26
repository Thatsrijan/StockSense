import React, { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { Mail, KeyRound, Lock, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';

interface ForgotPasswordModalProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onBackToLogin }) => {
  const { resetPassword } = useInventoryStore();

  const [step, setStep] = useState<'request_otp' | 'verify_otp' | 'new_password' | 'success'>('request_otp');
  const [identifier, setIdentifier] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [inputOtp, setInputOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim()) {
      setError('Please enter your Login ID or registered Email.');
      return;
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setStep('verify_otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (inputOtp.trim() !== generatedOtp) {
      setError('Invalid OTP code. Please enter the 6-digit verification code.');
      return;
    }
    setStep('new_password');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const res = resetPassword(identifier, newPassword);
    if (!res.success) {
      setError(res.error || 'Failed to update password.');
      return;
    }

    setStep('success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50 to-slate-200 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-odoo-700 via-purple-600 to-tealbrand-600" />

        {/* Step Progression Indicator */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs font-semibold text-slate-600 hover:text-odoo-700 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </button>
          <div className="text-xs font-medium text-slate-400">
            Step {step === 'request_otp' ? '1' : step === 'verify_otp' ? '2' : step === 'new_password' ? '3' : '4'} of 3
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* STEP 1: REQUEST OTP */}
        {step === 'request_otp' && (
          <div>
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter your Login ID or registered Email to receive an OTP verification code.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Login ID or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. admin_manager or manager@stocksense.io"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-odoo-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                id="send-otp-btn"
                type="submit"
                className="w-full py-2.5 px-4 bg-odoo-700 hover:bg-odoo-800 text-white font-semibold rounded-xl text-sm shadow-md shadow-odoo-700/25 flex items-center justify-center gap-2 transition-all"
              >
                Send OTP Code <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 'verify_otp' && (
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Enter OTP Code</h2>
              <p className="text-sm text-slate-500 mt-1">
                We sent a 6-digit verification code to <span className="font-semibold text-slate-700">{identifier}</span>.
              </p>
            </div>

            {/* Simulated SMS/Email Notification Banner for seamless instant testing */}
            <div className="mb-5 p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 uppercase tracking-wider">
                <KeyRound className="w-4 h-4 text-purple-600" /> Simulated Security Dispatch
              </div>
              <div className="text-sm mt-1">
                Your one-time code is: <strong className="text-lg font-mono tracking-widest text-odoo-800 px-2 py-0.5 bg-white rounded border border-purple-300 ml-1">{generatedOtp}</strong>
              </div>
              <button
                type="button"
                onClick={() => setInputOtp(generatedOtp)}
                className="mt-2 text-xs font-semibold text-odoo-700 hover:text-odoo-900 underline"
              >
                Click to Auto-fill OTP
              </button>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  6-Digit OTP Code
                </label>
                <input
                  id="input-otp"
                  type="text"
                  maxLength={6}
                  required
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-odoo-600 focus:bg-white transition-all"
                />
              </div>

              <button
                id="verify-otp-btn"
                type="submit"
                className="w-full py-2.5 px-4 bg-odoo-700 hover:bg-odoo-800 text-white font-semibold rounded-xl text-sm shadow-md shadow-odoo-700/25 flex items-center justify-center gap-2 transition-all"
              >
                Verify &amp; Continue <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 'new_password' && (
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Set New Password</h2>
              <p className="text-sm text-slate-500 mt-1">
                Create a strong password to protect your warehouse account.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-odoo-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-odoo-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                id="save-new-password-btn"
                type="submit"
                className="w-full py-2.5 px-4 bg-odoo-700 hover:bg-odoo-800 text-white font-semibold rounded-xl text-sm shadow-md shadow-odoo-700/25 flex items-center justify-center gap-2 transition-all"
              >
                Update Password
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Password Reset Complete!</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              Your password has been successfully updated. You can now log in with your new credentials.
            </p>
            <button
              id="back-to-signin-success-btn"
              type="button"
              onClick={onBackToLogin}
              className="w-full py-2.5 px-4 bg-odoo-700 hover:bg-odoo-800 text-white font-semibold rounded-xl text-sm shadow-md shadow-odoo-700/25 transition-all"
            >
              Sign In Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
