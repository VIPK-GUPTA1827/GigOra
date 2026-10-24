import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, FilePlus2, ShieldCheck, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const WaysToWork = () => {
  const pathways = [
    {
      id: 'gigs',
      title: 'Browse Ready Gigs',
      tagline: 'Pre-packaged services with clear deliverables & fixed prices.',
      badge: 'Fast Turnaround',
      icon: ShoppingBag,
      points: [
        'Starting at ₹1,500 with zero hidden costs',
        'Guaranteed delivery in 2 to 7 days',
        'Direct checkout with UPI or Net Banking'
      ],
      cta: 'Explore Gigs Catalog',
      to: '/marketplace?type=gigs',
      primary: false
    },
    {
      id: 'custom-job',
      title: 'Post a Custom Project',
      tagline: 'Tell us your exact requirements and receive tailored bids.',
      badge: 'Most Popular',
      icon: FilePlus2,
      points: [
        'Free to post — no upfront platform fees',
        'Receive proposals from skilled developers directly',
        'Interview and negotiate milestones directly'
      ],
      cta: 'Post a Project Free',
      to: '/register?intent=hire',
      primary: true
    },
    {
      id: 'escrow-contracts',
      title: 'Milestone Contract Sandbox',
      tagline: 'Test structured scopes and simulated milestone workflows.',
      badge: 'Sandbox Preview',
      icon: ShieldCheck,
      points: [
        'Sandbox simulation mode (No real currency involved)',
        'Step-by-step milestone delivery and scope tracking',
        'Planned production release with banking integration'
      ],
      cta: 'Learn About Sandbox',
      to: '#how-it-works',
      primary: false
    }
  ];

  return (
    <section className="py-20 bg-slate-50/70 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Hiring Flexibility</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Work Your Way on GigOra
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Whether you need a quick fixed-price deliverable or a dedicated full-stack engineer, choose the model that fits your workflow.
          </p>
        </div>

        {/* 3 Pathway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pathways.map((path) => {
            const Icon = path.icon;
            return (
              <div 
                key={path.id}
                className={`rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between border ${
                  path.primary 
                    ? 'bg-white border-blue-600 ring-2 ring-blue-600/10 shadow-xl shadow-blue-600/5 -translate-y-1' 
                    : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      path.primary ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      path.primary ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {path.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    {path.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                    {path.tagline}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    {path.points.map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-slate-100">
                  <Link
                    to={path.to}
                    className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                      path.primary 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-98' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span>{path.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WaysToWork;
