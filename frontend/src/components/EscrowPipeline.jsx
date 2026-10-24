import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Lock, CheckCircle2, ArrowRight, 
  Smartphone, Eye, Landmark, Zap, Sparkles, AlertCircle
} from 'lucide-react';

const STAGES = [
  {
    id: 'deposit',
    step: '01',
    title: 'Milestone Escrow (Preview)',
    subtitle: 'Simulated contract funding in sandbox',
    badge: 'Preview Mode',
    mockup: {
      headline: 'Milestone 1 Funded: Core SaaS Auth & API',
      amount: '₹5,000.00 (Demo)',
      status: 'Sandbox demo — Simulated currency',
      statusColor: 'text-amber-700 bg-amber-50 border-amber-300',
      detailTitle: 'Escrow Architecture Sandbox',
      detailText: 'Client locks simulated contract funds in sandbox demo mode (simulated demo — no real currency). Demonstrates upcoming scheduled trust account workflow.',
      bullet: 'Simulated sandbox balance for testing contract workflows.'
    }
  },
  {
    id: 'build',
    step: '02',
    title: 'Milestone In-Progress (Preview)',
    subtitle: 'Work tracked against agreed scope',
    badge: 'Preview Mode',
    mockup: {
      headline: 'Work in Progress: Repository Active',
      amount: '₹5,000.00 (Demo)',
      status: 'Active Milestone Scope',
      statusColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      detailTitle: 'Milestone Tracking & Communication',
      detailText: 'Direct in-app messaging and GitHub project links. Clear deliverables defined in contract: "Next.js 14 App router, Auth, Tailwind layout".',
      bullet: 'Structured milestones aligned before development starts.'
    }
  },
  {
    id: 'review',
    step: '03',
    title: 'Deliverable Review (Planned)',
    subtitle: 'Inspect live demo, code, or design files',
    badge: 'Planned Feature',
    mockup: {
      headline: 'Deliverables Submitted for Review',
      amount: '₹5,000.00 (Demo)',
      status: 'Planned: Deliverable Inspection',
      statusColor: 'text-blue-700 bg-blue-50 border-blue-200',
      detailTitle: 'Inspection Window (Planned Feature)',
      detailText: 'Planned workflow: Client receives preview deployment link and PR. Request revisions or verify acceptance with a single click before releasing funds.',
      bullet: 'Deliverable review workflow will be enabled in upcoming production release.'
    }
  },
  {
    id: 'release',
    step: '04',
    title: 'UPI & Bank Settlement (Planned)',
    subtitle: 'Direct INR settlement upon sign-off',
    badge: 'Planned Feature',
    mockup: {
      headline: 'Milestone Approved & Released',
      amount: '₹5,000.00 (Demo)',
      status: 'Planned Integration: UPI / Bank',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      detailTitle: 'Direct Settlement Workflow (Planned)',
      detailText: 'Planned integration: Live payout directly to Indian freelancer UPI ID / Bank Account. In current sandbox demo, test simulated contract releases.',
      bullet: 'Sandbox demo mode without real currency. Live bank settlement is a planned feature.'
    }
  }
];

const EscrowPipeline = () => {
  const [activeStage, setActiveStage] = useState(0);
  const current = STAGES[activeStage];

  return (
    <section id="how-it-works" className="py-20 bg-white border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-300 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Escrow Architecture (Sandbox / Blueprint Mode)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How GigOra Escrow Architecture Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2.5 leading-relaxed">
            Designed to protect freelancers and clients through milestone verification. Current platform runs on simulated sandbox balance while real payment gateway integration is in progress.
          </p>
        </div>

        {/* Interactive Stepper Navigation (Not Boring Boxes!) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {STAGES.map((stage, idx) => {
            const isSelected = activeStage === idx;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStage(idx)}
                className={`p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/15 shadow-md shadow-indigo-600/5'
                    : 'bg-[#F8FAFC] border-slate-200/90 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    STEP {stage.step}
                  </span>
                  <span className={`text-[10px] font-bold ${
                    isSelected ? 'text-indigo-700' : 'text-slate-400'
                  }`}>
                    {stage.badge}
                  </span>
                </div>
                <div className={`text-xs sm:text-sm font-black transition-colors ${
                  isSelected ? 'text-slate-900' : 'text-slate-700'
                }`}>
                  {stage.title}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {stage.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Stage Inspection Panel */}
        <div className="bg-[#FAF9FE] rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Stage Explanation & Rules */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  {current.step}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {current.title}
                </h3>
              </div>

              <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
                <p className="font-semibold text-slate-800">
                  {current.mockup.detailTitle}
                </p>
                <p>
                  {current.mockup.detailText}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{current.mockup.bullet}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-500 font-medium">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Planned: Direct UPI & Bank Settlement Integration</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  to="/register?intent=hire"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Contract Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                  Sandbox demo — No real money involved
                </span>
              </div>
            </div>

            {/* Right Column: Simulated Live Escrow Vault Card */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-lg shadow-slate-200/50 space-y-5">
                
                {/* Vault Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">GigOra Contract Sandbox (Preview)</div>
                      <div className="text-[10px] text-slate-400 font-mono">CONTRACT #GIG-2026-IN</div>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${current.mockup.statusColor}`}>
                    {current.mockup.status}
                  </span>
                </div>

                {/* Milestone Amount Display */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Milestone Budget</span>
                    <span className="text-2xl font-black text-slate-900">{current.mockup.amount}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Settlement Method</span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1 justify-end">
                      <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                      Sandbox Simulation
                    </span>
                  </div>
                </div>

                {/* Milestone Deliverable Item */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800">
                    {current.mockup.headline}
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
                      style={{ width: `${(activeStage + 1) * 25}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-0.5">
                    <span>Progress: {(activeStage + 1) * 25}%</span>
                    <span>Stage {activeStage + 1} of 4</span>
                  </div>
                </div>

                {/* Live Vault Assurance Badge */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Sandbox Demo — Simulated Testing Only</span>
                  </div>
                  <span className="text-slate-400">Escrow ID: ESC-98234-IN</span>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default EscrowPipeline;
