import React, { useEffect } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
  useEffect(() => {
    document.title = 'Terms — GigOra';
  }, []);

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
        <div className="mb-6 text-left">
          <span className="text-xs font-mono font-bold text-[#593CFF] bg-[#593CFF]/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Terms of Service
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-[#030B3D] tracking-tight mt-3 mb-2">
            Terms of Service
          </h1>
          <p className="text-stone-500 text-sm">Preview Terms · Last updated October 2026</p>
        </div>

        {/* Live Preview Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300/80 text-amber-950 text-xs sm:text-sm leading-relaxed mb-8 text-left flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-950 mb-1">Live Preview Notice</span>
            <p className="text-amber-900/90 leading-relaxed font-medium">
              GigOra is running as a live preview. Marketplace features are functional. Payments run in demo mode only — no real money is held, transferred, or processed.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-sm space-y-8 text-left text-stone-700 leading-relaxed text-sm sm:text-base">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              1. Platform Status & Scope
            </h2>
            <p>
              GigOra is currently a live preview freelance marketplace for technical talent in India. Marketplace browsing, project posting, proposals, and milestone collaboration tools are functional. Payments currently operate in a simulated demo mode.
            </p>
            <p>
              The platform focuses on <strong>Software Development, Cloud & DevOps, AI/ML, and Product UI/UX</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              2. Eligibility & Accounts
            </h2>
            <p>
              You must be at least 18 years old to create an account and enter into project agreements on GigOra. Users agree to maintain only one primary account per person or legal entity, and provide accurate profile information.
            </p>
            <p>
              You are responsible for safeguarding your login credentials and for all activities that occur under your account.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              3. Milestone Workflow
            </h2>
            <p>
              GigOra provides structured milestone tools to assist users in defining project scope, timelines, and deliverables:
            </p>
            <ul className="space-y-2 list-disc list-inside text-stone-600 text-sm">
              <li><strong>Scope Definition:</strong> Encouraging clients and freelancers to agree on clear acceptance criteria before work begins.</li>
              <li><strong>Deliverable Review:</strong> Providing mechanisms for reviewing code changes, pull requests, and staging environments.</li>
              <li><strong>Milestone Tracking:</strong> Milestone tracking is live. A proposal accepted by a client creates milestones; freelancers submit work, clients review and approve each milestone, and completion is required before a project is marked finished.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              4. Payments (Demo Mode)
            </h2>
            <p>
              Specific payment rails, escrow protection, and commercial settlement timelines will be governed by updated production terms prior to the launch of real transactions.
            </p>
            <p className="text-xs text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 font-semibold">
              ⚠️ Sandbox Simulation • No Real Currency: All wallet balances, escrow contract numbers, and payout calculations displayed in the dashboard and preview mockups are simulated for workflow demonstration purposes only. No real currency is held, transferred, or processed.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              5. Intellectual Property & Work Ownership
            </h2>
            <p>
              Code ownership for custom deliverables transfers to the client after full milestone sign-off and final payment, unless a custom agreement says otherwise. Freelancers retain ownership of pre-existing tools, libraries, or background IP incorporated into deliverables.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              6. Acceptable Use & Conduct
            </h2>
            <p>
              We expect all participants in the GigOra community to interact professionally and honestly. You agree not to post fake or misleading profile details, send unsolicited spam, engage in harassment, or scrape platform data.
            </p>
            <p>
              Misrepresenting skills, engaging in abusive behavior, or attempting unauthorized access to preview services may result in account suspension or removal.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              7. Dispute Resolution
            </h2>
            <p>
              During preview mode, disputes regarding project deliverables or milestone approval are mediated informally by the GigOra admin team. Because payments operate in demo mode, monetary chargebacks or fund clawbacks are not available.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              8. Limitation of Liability
            </h2>
            <p>
              GigOra is provided on an "as is" and "as available" basis during preview. To the maximum extent permitted by applicable law, GigOra Technologies and its team shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of this preview service.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              9. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in India.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              10. Updates to These Terms & Contact
            </h2>
            <p>
              These are preview terms. They will be replaced by binding production Terms of Service before real payments go live. For inquiries, contact <a href="mailto:support@gigora.in" className="font-mono text-[#593CFF] font-semibold hover:underline">support@gigora.in</a>.
            </p>
          </section>

          {/* Navigation Cross Links */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-500 pt-4 border-t border-stone-200">
            <Link to="/about" className="hover:text-[#593CFF] transition-colors">About</Link>
            <span>•</span>
            <Link to="/terms" className="text-[#593CFF] font-bold">Terms of Service</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-[#593CFF] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/marketplace" className="hover:text-[#593CFF] transition-colors">Marketplace</Link>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-stone-100 text-xs text-stone-400">
            <span>GigOra Technologies · Terms of Service</span>
            <span className="font-medium text-stone-500">Last updated: October 2026</span>
          </div>

        </div>
      </main>
    </div>
  );
}
