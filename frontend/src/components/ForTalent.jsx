import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, ShieldCheck, Banknote, ArrowRight, 
  CheckCircle2, Lock, Users, Sparkles, Building2, UserCheck
} from 'lucide-react';

const ForTalent = () => {
  const [activeRole, setActiveRole] = useState('freelancer');

  return (
    <section className="py-20 bg-white border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Card with Soft Lavender / Iris Light Gradient */}
        <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 p-8 sm:p-12 lg:p-16 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
          
          {/* Subtle Ambient Glow Accents */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl pointer-events-none"></div>

          {/* Role Switcher Pill */}
          <div className="relative z-10 flex justify-center mb-10">
            <div className="inline-flex p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveRole('freelancer')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeRole === 'freelancer'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>For Freelancers & Students</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRole('client')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeRole === 'client'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>For Businesses & Startups</span>
              </button>
            </div>
          </div>

          {/* Conditional Content: Freelancer vs Client */}
          {activeRole === 'freelancer' ? (
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Build Your Indian Tech Career</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Work directly with business clients. <br />
                  <span className="text-indigo-600">Never chase unpaid invoices.</span>
                </h2>

                <p className="text-slate-600 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
                  Track project milestones and review scopes before you write code. Deliver quality work, get approved, and test simulated contract deliverables in our developer sandbox.
                </p>

                {/* 3 Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-indigo-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-sm">
                      <Banknote className="w-4 h-4" />
                      <span>Direct Contracts</span>
                    </div>
                    <p className="text-xs text-slate-500">Transparent milestone scopes for every project</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Simulated Escrow</span>
                    </div>
                    <p className="text-xs text-slate-500">Tested via our developer sandbox workflow</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold text-sm">
                      <Zap className="w-4 h-4" />
                      <span>Direct UPI Payout</span>
                    </div>
                    <p className="text-xs text-slate-500">Zero dollar conversion fees or wire delays</p>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    to="/register?intent=freelancer"
                    className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <span>Apply as Talent Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="text-xs text-slate-500 font-medium">
                    Showcase your GitHub, Figma, or Portfolio
                  </span>
                </div>
              </div>

              {/* Right Visual: Light Escrow Guarantee Box */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="bg-white rounded-2xl border border-indigo-200/80 p-6 sm:p-7 max-w-sm w-full shadow-lg shadow-indigo-500/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-slate-900">Talent Protection Checklist</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active Shield
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900">Milestone Upfront Funding</div>
                        <div className="text-slate-500 text-[11px]">Client must deposit 100% of milestone value.</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900">Code Submission Timestamp</div>
                        <div className="text-slate-500 text-[11px]">Submission locked cryptographically on platform.</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-emerald-900">Auto-Release on Inspection</div>
                        <div className="text-emerald-700 text-[11px]">If no disputes in 72 hours, payout auto-triggers.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>For Indian Businesses & Startups</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Hire skilled Indian tech talent. <br />
                  <span className="text-indigo-600">Pay only when completely satisfied.</span>
                </h2>

                <p className="text-slate-600 text-sm sm:text-base max-w-xl font-normal leading-relaxed">
                  Post requirements for free, review custom bids from Indian developers, and track contracts milestone by milestone with simulated escrow demo mode.
                </p>

                {/* 3 Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-indigo-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>Free Job Posting</span>
                    </div>
                    <p className="text-xs text-slate-500">Zero upfront fees to post and receive proposals</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                      <UserCheck className="w-4 h-4" />
                      <span>Curated Profiles</span>
                    </div>
                    <p className="text-xs text-slate-500">Evaluated on GitHub repositories and real portfolios</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold text-sm">
                      <Lock className="w-4 h-4" />
                      <span>Approval Control</span>
                    </div>
                    <p className="text-xs text-slate-500">Funds released only after you test deliverables</p>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    to="/register?intent=hire"
                    className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <span>Post a Project Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="text-xs text-slate-500 font-medium">
                    Receive bids in under 2 hours
                  </span>
                </div>
              </div>

              {/* Right Visual: Client Control Box */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="bg-white rounded-2xl border border-indigo-200/80 p-6 sm:p-7 max-w-sm w-full shadow-lg shadow-indigo-500/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-black text-slate-900">Client Escrow Dashboard</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Client in Charge
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>Milestone 1: Prototype Deliverable</span>
                        <span className="text-indigo-600">₹3,500</span>
                      </div>
                      <div className="text-[11px] text-slate-500">Submitted 2 hours ago • Live demo URL active</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" className="py-2 px-3 rounded-xl bg-emerald-600 text-white font-bold text-[11px] text-center shadow-xs">
                        Approve & Release
                      </button>
                      <button type="button" className="py-2 px-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-[11px] text-center hover:bg-slate-200">
                        Request Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default ForTalent;
