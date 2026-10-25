import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || '';

export default function CheckEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [resending, setResending] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [etherealUrl, setEtherealUrl] = useState('');

  React.useEffect(() => {
    document.title = 'Check Your Email — GigOra';
  }, []);

  const handleResend = async () => {
    if (!email) {
      setErrorMsg('Email address not specified.');
      return;
    }

    setResending(true);
    setStatusMsg('');
    setErrorMsg('');

    try {
      const res = await fetch(`${BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg('A fresh verification link has been sent to your inbox.');
        if (data.etherealUrl) {
          setEtherealUrl(data.etherealUrl);
        }
      } else {
        setErrorMsg(data.message || 'Could not resend email.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error occurred.');
    } finally {
      setResending(false);
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

        <Link 
          to="/login" 
          className="text-xs sm:text-sm font-semibold text-stone-500 hover:text-[#593CFF] transition-colors"
        >
          Back to sign in
        </Link>
      </header>

      {/* Center Card */}
      <main className="w-full max-w-[540px] mx-auto my-auto relative z-10">
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)] p-6 sm:p-10 text-center">
          
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#593CFF] flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Mail className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#030B3D] tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-stone-600 mt-2 max-w-sm mx-auto leading-relaxed">
            We've sent a verification link to{' '}
            <strong className="text-stone-900 font-bold break-all">
              {email || 'your email address'}
            </strong>
            . Please click the link to activate your account.
          </p>

          {/* Status Alert */}
          {statusMsg && (
            <div className="mt-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="mt-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Ethereal Inbox Link (Dev Helper) */}
          {etherealUrl && (
            <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700">
              Dev Mode Email Preview:{' '}
              <a href={etherealUrl} target="_blank" rel="noreferrer" className="underline font-bold">
                Open Test Inbox
              </a>
            </div>
          )}

          {/* Resend Action */}
          <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col items-center gap-3">
            <p className="text-xs text-stone-500">
              Didn't receive the email? Check your spam folder or request a new link.
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="py-2.5 px-6 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending fresh link...</span>
                </>
              ) : (
                <span>Resend verification email</span>
              )}
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-stone-400 py-4 relative z-10">
        © {new Date().getFullYear()} GigOra
      </footer>
    </div>
  );
}
