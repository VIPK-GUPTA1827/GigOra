import React from 'react';
import { ArrowLeft, Info, Shield, Lock, FileCode, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
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
            Transparency & Security
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-[#030B3D] tracking-tight mt-3 mb-2">
            Privacy Policy
          </h1>
          <p className="text-stone-500 text-sm">Clear, accurate disclosure of how user accounts, profiles, and platform data are managed.</p>
        </div>

        {/* Current Architecture Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs sm:text-sm leading-relaxed mb-8 text-left flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#593CFF] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-indigo-950 mb-1">Early Access Architecture Disclosure</span>
            <p className="text-indigo-900/90 leading-relaxed font-medium">
              GigOra currently operates as an Early Access Developer Marketplace and Architecture Showcase. Account creation, profile management, and project milestone tracking are fully functional in our development environment. Financial transactions operate strictly in <strong>Simulated Sandbox Escrow (simulated testing without real currency)</strong> mode without real banking charges.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-sm space-y-8 text-left text-stone-700 leading-relaxed text-sm sm:text-base">
          
          {/* Section 1: Authentication & Credentials */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#593CFF]" />
              1. Account Authentication & Credential Storage
            </h2>
            <p>
              When you sign up or sign in to GigOra, we collect your name, username, email address, account role (client or freelancer), and password.
            </p>
            <ul className="space-y-2 list-disc list-inside text-stone-600 text-sm">
              <li><strong>Password Security:</strong> Passwords are never stored in plaintext. All passwords are cryptographically salted and hashed using <strong>bcrypt</strong> before being stored in our database.</li>
              <li><strong>Session Management:</strong> Authenticated sessions use signed JSON Web Tokens (JWT) transmitted via HTTP-only, SameSite cookies to protect against cross-site scripting (XSS) and unauthorized token extraction.</li>
              <li><strong>OAuth Sign-In:</strong> If you sign in using Google OAuth, authentication is verified via Google's secure token endpoint, and we only store your public profile name, verified email, and avatar.</li>
            </ul>
          </section>

          {/* Section 2: Professional Profiles & Work Showcase */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D] flex items-center gap-2">
              <FileCode className="w-5 h-5 text-[#593CFF]" />
              2. Profiles, Skills & Portfolio Data
            </h2>
            <p>
              To enable technical matchmaking between clients and software developers:
            </p>
            <ul className="space-y-2 list-disc list-inside text-stone-600 text-sm">
              <li><strong>Freelancer Profiles:</strong> Information you provide—including technical skills (e.g. React, Node.js, Python), professional bio, hourly rate, portfolio links (GitHub repos, live demos), and city/state location—is displayed on your public profile to help clients evaluate your capabilities.</li>
              <li><strong>Client Profiles:</strong> Organization details (company name, industry, team size, website) are stored to provide context to freelancers evaluating your job postings.</li>
              <li><strong>Data Modification:</strong> You have full control over your profile details and can edit or remove portfolio items at any time through your dashboard.</li>
            </ul>
          </section>

          {/* Section 3: Simulated Escrow & Financial Clarity */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              3. Simulated Sandbox Escrow & Payments
            </h2>
            <p>
              We believe in complete honesty regarding platform capabilities:
            </p>
            <ul className="space-y-2 list-disc list-inside text-stone-600 text-sm">
              <li><strong>No Real Banking Credentials Collected:</strong> We do NOT collect, process, or store credit card numbers, debit card details, CVVs, net banking credentials, or live UPI authorization PINs.</li>
              <li><strong>Simulated Demo Wallets:</strong> All wallet balances and milestone funds displayed in the application are simulated test credits used to demonstrate milestone-based contract flows and acceptance rules.</li>
              <li><strong>No Real Financial Risk:</strong> Project bids, milestone escrow locks, and deliverable approval payouts do not charge real bank accounts or credit cards during this preview phase.</li>
            </ul>
          </section>

          {/* Section 4: Data Sharing & Protection */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              4. Data Protection & Zero Third-Party Sale
            </h2>
            <p>
              We strictly respect your privacy:
            </p>
            <ul className="space-y-2 list-disc list-inside text-stone-600 text-sm">
              <li>We do not sell, rent, or trade your personal information to third-party advertisers or data brokers.</li>
              <li>Communications and project proposals between clients and developers are stored strictly to enable collaboration between the participating accounts.</li>
              <li>Transactional emails (such as email verification links and password reset tokens) are transmitted solely to enable account management and security.</li>
            </ul>
          </section>

          {/* Section 5: User Rights & Contact */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              5. Your Rights & Data Inquiries
            </h2>
            <p>
              You have the right to inspect, update, or request the deletion of your account and associated data. For any questions or data requests, please contact our team at <span className="font-mono text-[#593CFF] font-semibold">support@gigora.dev</span>.
            </p>
          </section>

          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-stone-200 text-xs text-stone-500">
            <span>GigOra Technologies · Privacy Policy</span>
            <span className="font-medium text-[#030B3D]">Last updated: October 2026</span>
          </div>

        </div>
      </main>
    </div>
  );
}
