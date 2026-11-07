import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, Loader2, ArrowLeft, ShieldCheck, Zap, Lock } from 'lucide-react';
import PasswordStrengthMeter, { evaluatePassword } from '../components/PasswordStrengthMeter';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function Signup() {
  const navigate = useNavigate();
  const { register, user } = useAuth();

  React.useEffect(() => {
    document.title = 'Create Account — GigOra';
    if (user) {
      if (user.role === 'client') {
        navigate('/client/dashboard', { replace: true });
      } else {
        navigate('/freelancer/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  // Role: 'client' ("I'm hiring") vs 'freelancer' ("I'm a freelancer")
  const [role, setRole] = useState('client');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({ ...prev, name }));
    setFieldErrors(prev => ({ ...prev, name: '' }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    if (field === 'email') setSuggestion('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!formData.name.trim()) {
      setFieldErrors({ name: 'Please enter your full name' });
      return;
    }

    if (!formData.email.trim()) {
      setFieldErrors({ email: 'Please enter your email address' });
      return;
    }

    const pwdEval = evaluatePassword(formData.password);
    if (!pwdEval.isValid) {
      setFieldErrors({ password: pwdEval.message });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setSubmitting(true);
    setSuggestion('');
    try {
      const data = await register({
        name: formData.name.trim(),
        username: (formData.username || formData.name).toLowerCase().trim().replace(/[^a-z0-9_]/g, '_'),
        email: formData.email.trim(),
        password: formData.password,
        role
      });

      if (data?.requiresVerification) {
        localStorage.setItem('pendingEmail', formData.email.trim());
        navigate(`/check-email?email=${encodeURIComponent(formData.email.trim())}`);
      } else {
        if (data?.user?.role === 'client' || role === 'client') {
          navigate('/client/dashboard');
        } else {
          navigate('/freelancer/dashboard');
        }
      }
    } catch (err) {
      const d = err.response?.data || err.data;
      setError(d?.message || err.message || 'Registration failed. Please try again.');
      setSuggestion(d?.suggestion || '');
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
      
      {/* Ambient Gradient Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent-text/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-[32rem] h-[32rem] bg-[#8E51FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="w-full max-w-[460px] mx-auto flex items-center justify-between relative z-10">
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

      {/* Main Signup Card */}
      <main className="w-full max-w-[460px] mx-auto my-auto relative z-10 pt-4 pb-6">
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#030B3D]">
              Join GigOra
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Secure escrow, zero fake emails, verified Indian freelancers & clients.
            </p>
          </div>

          {/* Account Role Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              I want to
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`py-2 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  role === 'client'
                    ? 'bg-accent-text text-white shadow-md shadow-accent/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                I'm hiring (Client)
              </button>
              <button
                type="button"
                onClick={() => setRole('freelancer')}
                className={`py-2 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  role === 'freelancer'
                    ? 'bg-accent-text text-white shadow-md shadow-accent/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                I'm a freelancer
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/90 flex items-start gap-2.5 text-rose-700 text-xs sm:text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* 1-Click Google OAuth */}
          <div className="mb-6">
            <GoogleAuthButton 
              role={role}
              isSignup={true}
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
                or register with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Row 1: Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleNameChange}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50/70 border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all shadow-2xs ${
                    fieldErrors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="choose_username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50/70 border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all shadow-2xs ${
                    fieldErrors.username ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.username && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1">{fieldErrors.username}</p>
                )}
              </div>
            </div>

            {/* Row 2: Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl bg-slate-50/70 border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all shadow-2xs ${
                  fieldErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-[11px] font-semibold text-rose-600 mt-1">{fieldErrors.email}</p>
              )}

              {suggestion && (
                <div className="mt-2 p-2.5 rounded-xl bg-accent-tint border border-accent-soft/90 text-xs text-purple-900 flex items-center justify-between gap-2 animate-in fade-in">
                  <span>Did you mean <b>{suggestion}</b>?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, email: suggestion }));
                      setSuggestion('');
                      setError('');
                      setFieldErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-accent-text text-white font-bold hover:bg-[#472fe0] transition-colors cursor-pointer text-xs"
                  >
                    Use {suggestion}
                  </button>
                </div>
              )}
            </div>

            {/* Row 3: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 12 characters"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50/70 border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all shadow-2xs ${
                    fieldErrors.confirmPassword ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Password Strength Meter */}
            <PasswordStrengthMeter password={formData.password} />

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl bg-accent-text hover:bg-[#472fe0] text-white font-bold text-sm shadow-md shadow-accent/20 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <span>Create Free Account</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-accent-text hover:underline cursor-pointer">
              Sign in here
            </Link>
          </div>

        </div>
      </main>

      {/* Trust Badges Footer */}
      <footer className="w-full max-w-[460px] mx-auto text-center relative z-10 pt-2">
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Safe Escrow
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Fast Payouts
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-blue-500" /> 256-bit Encrypted
          </span>
        </div>
      </footer>

    </div>
  );
}
