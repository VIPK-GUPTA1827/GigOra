import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, IndianRupee, MapPin, Clock, Briefcase, CheckCircle2, Loader2, Send } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function GigDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bidAmount, setBidAmount] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/api/gigs/${id}`);
        if (!cancelled) {
          setGig(res.data);
          setBidAmount(String(res.data.budget || ''));
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Project not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      await api.post('/api/proposals', {
        gigId: id,
        coverLetter: coverLetter.trim(),
        bidAmount: Number(bidAmount),
        estimatedTime
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Failed to send proposal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading project...
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <Briefcase className="w-10 h-10 text-slate-300 mb-3" />
        <p className="text-slate-900 font-semibold">{error || 'Project not found'}</p>
        <Link to="/marketplace" className="mt-4 text-sm text-indigo-600 font-semibold hover:underline">
          Back to marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user && (gig.client?._id === user._id || user.role === 'admin');
  const isFreelancer = user?.role === 'freelancer';
  const canApply = gig.status === 'open' && !isOwner;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5">
          <ArrowLeft className="w-4 h-4" /> Back to marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {gig.category}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{gig.status}</span>
                {gig.experienceLevel && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {gig.experienceLevel}
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-bold text-slate-900">{gig.title}</h1>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4" /> {formatINR(gig.budget)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {gig.locationType || 'remote'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {gig.duration}
                </span>
              </div>

              <div className="mt-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-2">Project description</h2>
                <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{gig.description}</p>
              </div>

              {gig.skillsRequired?.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold text-slate-900 mb-2">Skills required</h2>
                  <div className="flex flex-wrap gap-2">
                    {gig.skillsRequired.map((skill) => (
                      <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {gig.milestones?.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold text-slate-900 mb-2">Milestones</h2>
                  <div className="space-y-2">
                    {gig.milestones.map((m, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {i + 1}. {m.title}
                          </p>
                          {m.description && <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          {formatINR(m.amount || m.budget)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs text-slate-500">Posted by</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {gig.client?.name || gig.client?.username || 'Client'}
              </p>
              {gig.client?._id && (
                <Link to={`/profile/${gig.client._id}`} className="mt-1 inline-block text-xs text-indigo-600 hover:underline">
                  View profile
                </Link>
              )}

              {isOwner && (
                <Link
                  to="/client/dashboard"
                  className="mt-4 block text-center rounded-xl bg-slate-900 text-white text-sm font-semibold py-2.5 hover:bg-slate-800"
                >
                  Manage this project
                </Link>
              )}

              {!user && (
                <Link
                  to="/login"
                  className="mt-4 block text-center rounded-xl bg-indigo-600 text-white text-sm font-semibold py-2.5 hover:bg-indigo-700"
                >
                  Log in to apply
                </Link>
              )}

              {user && !isFreelancer && !isOwner && (
                <p className="mt-4 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2.5">
                  Only freelancer accounts can submit proposals. Switch to your freelancer workspace to apply.
                </p>
              )}
            </div>

            {isFreelancer && canApply && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-slate-900">Submit a proposal</h2>

                {submitted ? (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-3 text-sm text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Proposal sent! The client will review it and get back to you.</span>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="mt-3 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700">Your bid (₹)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700">Estimated time</label>
                      <input
                        type="text"
                        required
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(e.target.value)}
                        placeholder="e.g. 2 weeks"
                        className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700">Cover letter</label>
                      <textarea
                        required
                        minLength={15}
                        rows={5}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Why are you a good fit for this project?"
                        className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
                      />
                    </div>

                    {submitError && (
                      <p role="alert" className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                        {submitError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {submitting ? 'Sending...' : 'Send proposal'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
