import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    step: '01',
    title: 'Define Scope & Hire',
    description: 'Browse developer profiles or post your project. Chat directly with talent to align on deliverables and deadlines.',
    badge: 'Zero Upfront Cost'
  },
  {
    step: '02',
    title: 'Simulate Milestone Escrow',
    description: 'Test simulated milestone funding in our sandbox environment (simulated demo — no real currency). Review clear sprint deliverables.',
    badge: 'Sandbox Demo'
  },
  {
    step: '03',
    title: 'Review & Approve Release',
    description: 'Inspect completed code or design deliverables. Test simulated release upon client milestone sign-off (Planned production workflow).',
    badge: 'Preview Feature'
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-[#F8FAFC] border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Milestone Sandbox (Preview)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How GigOra Manages Project Milestones
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Eliminating scope creep and payment confusion through clear milestone tracking and contract sandbox preview.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((item, idx) => (
            <div 
              key={item.step}
              className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl font-black text-blue-600/30">
                    {item.step}
                  </span>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Milestone Scope Tracking (Preview)</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner CTA */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-black text-slate-900">
              Ready to hire or showcase your freelance services?
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Join Indian developers, designers, and fast-growing businesses.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-blue-600/20 active:scale-95 text-center cursor-pointer"
            >
              Create Free Account
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
