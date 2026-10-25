import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import PasswordStrengthMeter, { evaluatePassword } from '../components/PasswordStrengthMeter';

const BASE = import.meta.env.VITE_API_URL || '';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenInvalid, setTokenInvalid] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a new password');
      return;
    }

    const pwdEval = evaluatePassword(password);
    if (!pwdEval.isValid) {
      setError(pwdEval.message);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${BASE}/api/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to update password');
        if (res.status === 400 && (data.message?.includes('Invalid') || data.message?.includes('expired'))) {
          setTokenInvalid(true);
        }
      }
    } catch (err) {
      setError(err.message || 'A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between py-6 px-4 sm:px-6 relative overflow-hidden selection:bg-[#593CFF] selection:text-white">
      
      {/* Corner purple glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#593CFF]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8E51FF]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="max-w-[540px] w-full mx-auto flex items-center justify-between py-4 relative z-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#030B3D] text-white flex items-center justify-center font-black text-sm">
            G
          </div>
          <span className="text-xl font-bold tracking-tight text-[#030B3D]">GigOra</span>
        </Link>

        <Link 
          to="/login" 
          className="text-xs sm:text-sm font-semibold text-stone-500 hover:text-[#593CFF] transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </header>

      {/* Center Panel */}
      <main className="w-full max-w-[540px] mx-auto my-auto relative z-10">
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] p-6 sm:p-10">
          
          {!success ? (
            <>
              {/* Header */}
              <div className="text-center mb-7">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#593CFF] flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                  NEW CREDENTIALS
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#030B3D] tracking-tight">
                  Set new password
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1.5 font-medium max-w-sm mx-auto">
                  Choose a secure password for your GigOra account.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-rose-700 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{error}</span>
                    {tokenInvalid && (
                      <div className="mt-2">
                        <Link
                          to="/forgot-password"
                          className="font-bold underline text-rose-800 hover:text-rose-900 inline-flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Request a new reset link
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    NEW PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 12 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#593CFF] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password Strength Meter */}
                  <PasswordStrengthMeter password={password} />
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    CONFIRM NEW PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#593CFF] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || tokenInvalid}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#593CFF] hover:bg-[#4a2fe6] active:bg-[#3f25d4] text-white font-bold text-sm tracking-wide shadow-md shadow-[#593CFF]/20 hover:shadow-lg hover:shadow-[#593CFF]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating password...</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Success confirmation screen */
            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-extrabold text-[#030B3D] tracking-tight">
                Password updated!
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 mt-2 font-medium leading-relaxed max-w-sm mx-auto">
                Your password has been reset successfully. You can now log into your account using your new credentials.
              </p>

              <div className="pt-6">
                <Link
                  to="/login"
                  className="block w-full py-3.5 px-4 rounded-xl bg-[#593CFF] hover:bg-[#4a2fe6] text-white font-bold text-sm tracking-wide shadow-md shadow-[#593CFF]/20 transition-all text-center"
                >
                  Sign in with new password
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[540px] w-full mx-auto text-center py-4 text-xs text-stone-400 relative z-10">
        GigOra © {new Date().getFullYear()} • Secure Authentication
      </footer>
    </div>
  );
}
