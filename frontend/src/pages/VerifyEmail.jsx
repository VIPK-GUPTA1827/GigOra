import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BASE = import.meta.env.VITE_API_URL || '';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [verifiedUser, setVerifiedUser] = useState(null);

  // Prevent duplicate execution caused by React 18 StrictMode in development
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    const verifyToken = async () => {
      if (!token) {
        setError('No verification token provided in URL.');
        setSuccess(false);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE}/api/auth/verify-email/${token}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setError('');
          setSuccess(true);
          setVerifiedUser(data.user);
          // Instantly update AuthContext so dashboard banner disappears without requiring reload!
          if (updateUser && data.user) {
            updateUser(data.user);
          }
        } else {
          setSuccess(false);
          setError(data.message || 'Verification link is invalid or expired.');
        }
      } catch (err) {
        setSuccess(false);
        setError(err.message || 'Network error verifying email.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, updateUser]);

  const handleContinue = () => {
    const targetRole = verifiedUser?.role || user?.role;
    if (targetRole === 'client') {
      navigate('/client/dashboard');
    } else if (targetRole === 'freelancer') {
      navigate('/freelancer/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden selection:bg-[#593CFF] selection:text-white">
      {/* Corner glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#593CFF]/8 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-[540px] w-full mx-auto flex items-center justify-between py-4 relative z-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#030B3D] text-white flex items-center justify-center font-black text-sm">
            G
          </div>
          <span className="text-xl font-bold tracking-tight text-[#030B3D]">GigOra</span>
        </Link>
      </header>

      {/* Center Card */}
      <main className="w-full max-w-[540px] mx-auto my-auto relative z-10">
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] p-6 sm:p-10 text-center">
          
          {loading && (
            <div className="py-8 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#593CFF] mx-auto" />
              <h2 className="text-xl font-bold text-[#030B3D]">Verifying your email...</h2>
              <p className="text-xs text-stone-500">Checking your secure token against the database.</p>
            </div>
          )}

          {!loading && success && (
            <div className="py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#030B3D] tracking-tight">
                Email verified successfully!
              </h1>
              <p className="text-sm text-stone-600 max-w-sm mx-auto">
                Your email address has been confirmed and your GigOra account is now fully active.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="py-3 px-8 rounded-xl bg-[#593CFF] hover:bg-[#472fe0] text-white font-bold text-sm shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Continue to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#030B3D] tracking-tight">
                Verification failed
              </h1>
              <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200/80 p-3 rounded-xl max-w-sm mx-auto">
                {error}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/check-email"
                  className="py-2.5 px-6 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm transition-all"
                >
                  Request new verification link
                </Link>
                <Link
                  to="/login"
                  className="py-2.5 px-6 rounded-xl bg-[#030B3D] text-white font-bold text-xs sm:text-sm transition-all"
                >
                  Go to sign in
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-stone-400 py-4 relative z-10">
        © {new Date().getFullYear()} GigOra
      </footer>
    </div>
  );
}
