import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, ShieldCheck, Zap, Lock, Sparkles } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';

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
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both email and password');
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
        // Direct to freelancer dashboard upon login; profile completion is prompted inside the dashboard
        navigate('/freelancer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden selection:bg-[#593CFF] selection:text-white">
      
      {/* Ambient Gradient Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#593CFF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-[32rem] h-[32rem] bg-[#8E51FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between relative z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#030B3D] text-white flex items-center justify-center font-black text-base shadow-md group-hover:scale-105 transition-transform">
            G
          </div>
          <span className="text-xl font-black tracking-tight text-[#030B3D]">GigOra</span>
        </Link>

        <Link 
          to="/" 
          className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-[#593CFF] transition-colors inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/80"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to home</span>
        </Link>
      </header>

      {/* Center Main Card */}
      <main className="w-full max-w-[460px] mx-auto my-auto relative z-10 pt-4 pb-6">
        
        {/* Subtle Marketplace Trust Pill */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-600 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>India's Hyperlocal Freelance Marketplace</span>
          </div>
        </div>

        {/* Elevated White Glass Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.08)] p-7 sm:p-9">
          
          {/* Card Header */}
          <div className="text-center mb-7">
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#030B3D] tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
              Welcome back! Access your gigs, proposals, and milestones.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/90 flex items-start gap-2.5 text-rose-700 text-xs sm:text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* 1-Click Google OAuth (Primary Quick Action) */}
          <div className="mb-6">
            <GoogleAuthButton 
              text="Continue with Google" 
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
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-slate-50/70 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#593CFF] focus:bg-white transition-all shadow-2xs"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#593CFF] hover:underline cursor-pointer"
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
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50/70 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#593CFF] focus:bg-white transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#593CFF] hover:bg-[#472fe0] text-white font-bold text-sm shadow-md shadow-[#593CFF]/20 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In to GigOra</span>
                )}
              </button>
              <p className="text-[11px] text-amber-700 bg-amber-50/70 border border-amber-200/60 rounded-lg p-2 text-center mt-2.5 font-medium">
                Preview release • Sandbox simulation (no real money)
              </p>
            </div>
          </form>

          {/* Create Account Link */}
          <div className="mt-7 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/signup" className="font-bold text-[#593CFF] hover:underline">
              Create an account
            </Link>
          </div>

        </div>

        {/* Trust Badges Strip (Contra/Upwork style micro-trust) */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Milestone Escrow (Sandbox Mode)</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#593CFF]" />
            <span>Curated Developer Showcase</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>256-bit Encrypted</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-3 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-1">
          <Link to="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
        </div>
        <p className="text-[11px]">© {new Date().getFullYear()} GigOra. All rights reserved.</p>
      </footer>

    </div>
  );
}
