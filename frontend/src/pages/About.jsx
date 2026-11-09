import React, { useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Code2, Users, AlertCircle, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  useEffect(() => {
    document.title = 'About — GigOra';
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans selection:bg-accent-text selection:text-white">
      {/* Header */}
      <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 py-4 px-6 sm:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm font-bold text-[#030B3D] hover:text-accent-text transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to GigOra</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-[#030B3D] text-white flex items-center justify-center font-bold text-xs">G</div>
          <span className="font-display font-black text-lg text-[#030B3D]">GigOra</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-8 text-left">
          <span className="text-xs font-mono font-bold text-accent-text bg-accent-text/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Our story
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-[#030B3D] tracking-tight mt-3 mb-3">
            A simpler way to hire and work together
          </h1>
          <p className="text-stone-600 text-base sm:text-lg max-w-2xl leading-relaxed">
            GigOra is a freelance marketplace for tech talent in India. Founders find developers, agree on the scope, and pay as each milestone is delivered.
          </p>
        </div>

        {/* Live Preview Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-accent-tint/80 border border-accent-soft/80 text-indigo-950 text-xs sm:text-sm flex items-start gap-3 mb-8 text-left">
          <AlertCircle className="w-5 h-5 text-accent-text shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-indigo-950 mb-0.5">Live Preview</span>
            <p className="text-indigo-900/90 leading-relaxed">
              The marketplace and workspaces are live. Payments run in demo mode, so no real money moves yet.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-sm space-y-8 text-left text-stone-700 leading-relaxed">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-[#030B3D]">
              Why we're building GigOra
            </h2>
            <p>
              We think hiring and freelancing in tech keeps running into the same problems: unclear requirements, mismatched expectations, and messages that go unanswered.
            </p>
            <p>
              We think it's hard to judge a developer from a resume alone. Developers, in turn, often end up on projects where the scope keeps growing and nobody is sure what "done" means.
            </p>
            <p className="font-medium text-[#030B3D]">
              We think a good freelance platform comes down to three things:
            </p>
          </section>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-white border border-stone-200 text-accent-text flex items-center justify-center font-bold">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#030B3D] text-base">Real work, not just resumes</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Developers can add GitHub and live links to their profile so you judge them by what they've built: real code and live projects.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-white border border-stone-200 text-accent-text flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#030B3D] text-base">Clear milestones</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Agree on what each stage includes, and how you'll know it's done, before work begins.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-white border border-stone-200 text-emerald-600 flex items-center justify-center font-bold">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#030B3D] text-base">Easy to work together</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                One place for startups and tech professionals to talk, share files and deliver work.
              </p>
            </div>
          </div>

          {/* Technical Focus Note */}
          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="text-xl font-display font-bold text-[#030B3D]">
              Where we're starting
            </h2>
            <p>
              We're starting with software engineering, web and mobile development, AI/ML, cloud/DevOps and UI/UX. Staying focused lets us fix what isn't working and learn what both sides actually need.
            </p>
            <p>
              As more people use GigOra and we learn from them, we'll add more tools and more kinds of work.
            </p>
          </section>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/marketplace" className="rounded-full bg-accent-text hover:bg-accent-deep text-white text-center py-3 px-6 font-bold text-sm active:scale-95 transition-all">
              Browse projects
            </Link>
            <Link to="/signup" className="rounded-full border border-[#030B3D]/20 text-[#030B3D] text-center py-3 px-6 font-bold text-sm hover:bg-stone-50 active:scale-95 transition-all">
              Post a project
            </Link>
          </div>

          {/* Navigation Cross Links */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-500 pt-4 border-t border-stone-200">
            <Link to="/about" className="text-accent-text font-bold">About</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-accent-text transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-accent-text transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/marketplace" className="hover:text-accent-text transition-colors">Marketplace</Link>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-stone-100 text-xs text-stone-400">
            <span>GigOra · Live Preview</span>
            <span className="font-medium text-stone-500">Built for India's tech community</span>
          </div>

        </div>
      </main>
    </div>
  );
}
