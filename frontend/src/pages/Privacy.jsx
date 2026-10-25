import React, { useEffect } from 'react';
import { ArrowLeft, Info, Shield, Lock, FileCode, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  useEffect(() => {
    document.title = 'Privacy — GigOra';
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
            <span className="font-bold block text-indigo-950 mb-1">Live Preview Architecture Disclosure</span>
            <p className="text-indigo-900/90 leading-relaxed font-medium">
              GigOra currently operates as a live preview developer marketplace. Account creation, profile management, and project milestone tracking are live on GigOra's preview deployment. Financial transactions operate strictly in <strong>Simulated Sandbox Escrow (simulated testing without real currency)</strong> mode without real banking charges.
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

          {/* Section 5: Third-Party Processors & Infrastructure */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              5. Third-Party Infrastructure & Sub-processors
            </h2>
            <p>
              To provide reliable services, we rely on established technical service providers:
            </p>
            <ul className="space-y-2 list-disc list-inside text-stone-600 text-sm">
              <li><strong>Database Hosting:</strong> MongoDB Atlas (cloud database with encryption in transit and at rest).</li>
              <li><strong>Email Delivery:</strong> Brevo / Sendinblue (transactional email routing for verification and account security).</li>
              <li><strong>Authentication:</strong> Google Identity Services (OAuth 2.0 verification).</li>
              <li><strong>Application Hosting:</strong> Vercel and Render (cloud container and static edge infrastructure).</li>
            </ul>
          </section>

          {/* Section 6: Uploaded Files & Attachments */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              6. Uploaded Files & Document Attachments
            </h2>
            <p>
              Files uploaded for project briefs, deliverable submissions, or user avatars are checked against strict MIME type rules and binary magic-byte signatures (JPEG, PNG, WEBP, PDF) before being stored. Uploads are strictly restricted to legitimate project documentation and workspace communication.
            </p>
          </section>

          {/* Section 7: Data Retention & Account Deletion */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              7. Data Retention & Account Deletion
            </h2>
            <p>
              Your data is retained for as long as your account remains active. If you request account deletion by emailing <a href="mailto:support@gigora.in" className="text-[#593CFF] font-medium hover:underline">support@gigora.in</a>, all personal identity records and active profile listings will be permanently deleted within 30 days, except where retention is strictly required to comply with statutory legal or tax obligations.
            </p>
          </section>

          {/* Section 8: Indian DPDP Act 2023 Compliance */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              8. Rights Under the Digital Personal Data Protection (DPDP) Act 2023 (India)
            </h2>
            <p>
              In accordance with India's DPDP Act 2023, Indian users have specific statutory rights:
            </p>
            <ul className="space-y-2 list-disc list-inside text-stone-600 text-sm">
              <li><strong>Right to Access:</strong> You may request a summary of the personal data held about you and the processing activities performed.</li>
              <li><strong>Right to Correction & Erasure:</strong> You may request correction of inaccurate data or deletion of data no longer necessary for the purpose it was collected.</li>
              <li><strong>Grievance Redressal:</strong> If you have concerns regarding your data privacy, you may contact our Grievance Officer at <a href="mailto:support@gigora.in" className="text-[#593CFF] font-medium hover:underline">support@gigora.in</a>. We respond to all formal grievance requests within 30 business days.</li>
            </ul>
          </section>

          {/* Section 9: Contact */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#030B3D]">
              9. Contact & Support
            </h2>
            <p>
              For privacy-related questions, data export requests, or general inquiries, please contact our team at <a href="mailto:support@gigora.in" className="font-mono text-[#593CFF] font-semibold hover:underline">support@gigora.in</a>.
            </p>
          </section>

          {/* Navigation Cross Links */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-500 pt-4 border-t border-stone-200">
            <Link to="/about" className="hover:text-[#593CFF] transition-colors">About</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#593CFF] transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/privacy" className="text-[#593CFF] font-bold">Privacy Policy</Link>
            <span>•</span>
            <Link to="/marketplace" className="hover:text-[#593CFF] transition-colors">Marketplace</Link>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-stone-100 text-xs text-stone-400">
            <span>GigOra Technologies · Privacy Policy</span>
            <span className="font-medium text-stone-500">Last updated: October 2026</span>
          </div>

        </div>
      </main>
    </div>
  );
}
