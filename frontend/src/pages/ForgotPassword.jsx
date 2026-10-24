import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, AlertCircle, CheckCircle2, Loader2, ArrowLeft, ExternalLink } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [etherealUrl, setEtherealUrl] = useState('');
  const [mailMode, setMailMode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
        setMailMode(data.mailMode || '');
        if (data.etherealUrl) {
          setEtherealUrl(data.etherealUrl);
        }
      } else {
        setError(data.message || 'Unable to send reset link. Please check your email and try again.');
      }
    } catch (err) {
      setError(err.message || 'Network error occurred. Please try again.');
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
          
          {!submitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-7">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#593CFF] flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                  PASSWORD RECOVERY
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#030B3D] tracking-tight">
                  Forgot your password?
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1.5 font-medium max-w-sm mx-auto">
                  Enter your email address and we'll send you a secure link to reset your password.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-rose-700 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] border border-stone-200/80 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#593CFF] focus:bg-white transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#593CFF] hover:bg-[#4a2fe6] active:bg-[#3f25d4] text-white font-bold text-sm tracking-wide shadow-md shadow-[#593CFF]/20 hover:shadow-lg hover:shadow-[#593CFF]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Footer link */}
              <div className="mt-6 text-center text-xs text-stone-500">
                Remember your password?{' '}
                <Link to="/login" className="font-bold text-[#593CFF] hover:underline">
                  Sign in
                </Link>
              </div>
            </>
          ) : (
            /* Success confirmation screen */
            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-extrabold text-[#030B3D] tracking-tight">
                {mailMode === 'ethereal' ? 'Development test email' : 'Check your inbox'}
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 mt-2 font-medium leading-relaxed max-w-sm mx-auto">
                {mailMode === 'ethereal' ? (
                  <>This app is using Ethereal test mode, so the reset email will <strong>not</strong> arrive in Gmail. Use the test preview below instead.</>
                ) : (
                  <>If an account exists for{' '}
                    <span className="font-bold text-[#030B3D]">{email}</span>, you will receive a secure password reset link.</>
                )}
              </p>

              {mailMode !== 'ethereal' && (
                <div className="my-6 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-500 leading-relaxed text-left">
                  <p className="font-semibold text-stone-700 mb-1">Important details:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>The reset link will expire in <strong>30 minutes</strong>.</li>
                    <li>Each link is strictly single-use for your security.</li>
                    <li>Check your spam folder if you don't see it within 2 minutes.</li>
                  </ul>
                </div>
              )}

              {/* Dev mode Ethereal direct link */}
              {etherealUrl && (
                <div className="mb-6 p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 text-left">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#593CFF] mb-1">
                    Development Email Preview
                  </div>
                  <p className="text-xs text-stone-600 mb-2">
                    Ethereal test mail captured locally:
                  </p>
                  <a
                    href={etherealUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#593CFF] bg-white border border-purple-200 px-3 py-1.5 rounded-lg shadow-xs hover:bg-purple-100/50 transition-all"
                  >
                    <span>Open in Ethereal Mailbox</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {mailMode === 'ethereal' && !etherealUrl && (
                <p className="my-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-xs leading-relaxed text-amber-800">
                  No test preview was returned. Check the backend terminal for an Ethereal/email setup error. To deliver reset emails to Gmail, configure SMTP credentials in your local backend .env file.
                </p>
              )}

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); }}
                  className="w-full py-3 px-4 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs transition-all cursor-pointer"
                >
                  Didn't receive an email? Send again
                </button>

                <Link
                  to="/login"
                  className="block w-full py-3.5 px-4 rounded-xl bg-[#030B3D] hover:bg-[#081559] text-white font-bold text-xs tracking-wide transition-all text-center"
                >
                  Return to Sign in
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
