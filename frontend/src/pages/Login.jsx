import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, ShieldCheck, Zap, Lock } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';
import Seo from '../components/Seo';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  React.useEffect(() => {
    if (user) {
      if (user.role === 'client') {
        navigate('/client/dashboard', { replace: true });
      } else {
        navigate('/freelancer/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail('');
    setFieldErrors({});

    if (!formData.email.trim()) {
      setFieldErrors({ email: 'Please enter your email address' });
      return;
    }
    if (!formData.password) {
      setFieldErrors({ password: 'Please enter your password' });
      return;
    }

    setSubmitting(true);

    try {
      const user = await login({
        email: formData.email.trim(),
        password: formData.password
      });

      if (user.role === 'client') {
        navigate('/client/dashboard');
      } else {
        navigate('/freelancer/dashboard');
      }
    } catch (err) {
      const d = err.response?.data || err.data;
      setError(d?.message || err.message || 'Invalid email or password. Please try again.');
      if (d?.requiresVerification) {
        setUnverifiedEmail(d?.email || formData.email.trim());
      }
      if (Array.isArray(d?.errors)) {
        const fMap = {};
        d.errors.forEach((item) => {
          if (item.field) fMap[item.field] = item.message;
        });
        setFieldErrors(fMap);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden selection:bg-accent-text selection:text-white">
      <Seo 
        title="Sign In to Your Account — GigOra"
        description="Log in to GigOra to access your client or freelancer dashboard, manage milestones, chat in real-time, and track payments."
        canonical="https://gig-ora.vercel.app/login"
      />
      
      {/* Ambient Gradient Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent-text/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-[32rem] h-[32rem] bg-[#8E51FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="w-full max-w-[440px] mx-auto flex items-center justify-between relative z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#030B3D] text-white flex items-center justify-center font-black text-base shadow-md group-hover:scale-105 transition-transform">
            G
          </div>
          <span className="text-xl font-black tracking-tight text-[#030B3D]">GigOra</span>
        </Link>

        <Link 
          to="/" 
          className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-accent-text transition-colors inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/80"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-[440px] mx-auto my-auto relative z-10 pt-4 pb-6">
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#030B3D]">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Log in to see your dashboard, wallet and current projects.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/90 flex flex-col gap-1.5 text-rose-700 text-xs sm:text-sm animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
              {unverifiedEmail && (
                <div className="pl-6.5 text-xs">
                  <Link 
                    to={`/check-email?email=${encodeURIComponent(unverifiedEmail)}`} 
                    className="underline hover:text-rose-900 font-semibold inline-flex items-center gap-1"
                  >
                    Click here to verify or resend email &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 1-Click Google OAuth */}
          <div className="mb-6">
            <GoogleAuthButton 
              isSignup={false} 
              text="Sign in with Google" 
              onError={(msg) => setError(msg)} 
            />
          </div>

          {/* Clean Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50/70 border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all shadow-2xs ${
                  fieldErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-[11px] font-semibold text-rose-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-accent-text hover:underline cursor-pointer"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50/70 border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all shadow-2xs ${
                    fieldErrors.password ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] font-semibold text-rose-600 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl bg-accent-text hover:bg-accent-deep text-white font-bold text-sm shadow-md shadow-accent/20 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-accent-text hover:underline cursor-pointer">
              Create one now
            </Link>
          </div>

        </div>
      </main>

      {/* Trust Badges Footer */}
      <footer className="w-full max-w-[440px] mx-auto text-center relative z-10 pt-2">
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Email-verified accounts
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-blue-500" /> Secure login
          </span>
        </div>
      </footer>

    </div>
  );
}
