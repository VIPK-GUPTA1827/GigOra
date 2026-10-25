import React from 'react';
import { ArrowLeft, ShieldCheck, Code2, Users, AlertCircle, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Header */}
      <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 py-4 px-6 sm:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-sm font-bold text-[#030B3D] hover:text-[#593CFF] transition-colors">
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
          <span className="text-xs font-mono font-bold text-[#593CFF] bg-[#593CFF]/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Our Story & Vision
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-[#030B3D] tracking-tight mt-3 mb-3">
            Building a better way to work together
          </h1>
          <p className="text-stone-600 text-base sm:text-lg max-w-2xl leading-relaxed">
            GigOra is a milestone-based freelance marketplace for technical talent in India. It helps founders discover developers, agree on scope, and manage delivery milestone by milestone.
          </p>
        </div>

        {/* Short Development Note Callout */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs sm:text-sm flex items-start gap-3 mb-8 text-left">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-950 mb-0.5">Development In Progress</span>
            <p className="text-amber-900/90 leading-relaxed">
              We’re still building GigOra. Features and processes may change before launch.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-sm space-y-8 text-left text-stone-700 leading-relaxed">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-[#030B3D]">
              Why We Are Building GigOra
            </h2>
            <p>
              In India, technical hiring and freelancing often run into the same friction: vague requirements, misaligned expectations, and communication gaps between founders and developers.
            </p>
            <p>
              Founders frequently struggle to find developers whose technical capabilities can be evaluated through real code rather than polished resumes. At the same time, software engineers often take on projects where scope creep and unclear milestones create frustration.
            </p>
            <p className="font-medium text-[#030B3D]">
              We believe a freelance platform for developers should be built around technical clarity and transparent milestones:
            </p>
          </section>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-white border border-stone-200 text-[#593CFF] flex items-center justify-center font-bold">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#030B3D] text-base">Proof Over Resumes</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Evaluating engineers through real work — GitHub repositories, live demo projects, and concrete code architecture.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-white border border-stone-200 text-indigo-600 flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#030B3D] text-base">Milestone Clarity</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Clear sprint scopes and measurable acceptance criteria agreed upon upfront before work begins.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-white border border-stone-200 text-emerald-600 flex items-center justify-center font-bold">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#030B3D] text-base">Simple Collaboration</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                A straightforward way for Indian startups and tech professionals to communicate and deliver together.
              </p>
            </div>
          </div>

          {/* Technical Focus Note */}
          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="text-xl font-display font-bold text-[#030B3D]">
              Focused Start & Future Direction
            </h2>
            <p>
              We are starting with a dedicated focus on <strong>Software Engineering, Web & Mobile Development, AI/ML, Cloud DevOps, and Product UI/UX</strong>. Focusing on technology disciplines first allows us to refine our review processes and understand what both sides need most.
            </p>
            <p>
              As GigOra grows and our core platform features are tested with real users, we plan to expand our tools and explore additional creative and technical disciplines.
            </p>
          </section>

          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-stone-200 text-xs text-stone-500">
            <span>GigOra Technologies · Early Access Preview</span>
            <span className="font-medium text-[#030B3D]">Building for India's tech ecosystem</span>
          </div>

        </div>
      </main>
    </div>
  );
}
