import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Users, 
  Search, 
  CheckCircle2, 
  Code2, 
  Wallet,
  ChevronDown,
  Sparkles,
  Layers,
  ChevronRight,
  Cpu,
  Palette,
  Smartphone,
  Cloud,
  Terminal,
  Database,
  Check,
  Globe,
  Menu,
  X
} from 'lucide-react';

import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState('client');
  const [activeCategory, setActiveCategory] = useState('Web & App');
  const [openFaq, setOpenFaq] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [waitlistDone, setWaitlistDone] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    AOS.refresh();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-600 selection:text-white relative">
      
      {/* 1. TOP FLOATING PILL NAVBAR */}
      <div className="fixed top-3.5 sm:top-5 left-0 right-0 z-50 px-3 sm:px-4 pointer-events-none flex justify-center">
        <div className="pointer-events-auto w-full max-w-[1240px] flex flex-col items-center">
          <nav className={`w-full rounded-full backdrop-blur-md px-4 sm:px-7 py-2.5 sm:py-3.5 flex items-center justify-between transition-all duration-300 ${
            isScrolled 
              ? 'bg-white/95 border border-slate-200/90 shadow-[0_12px_36px_rgba(3,11,61,0.12)]' 
              : 'bg-white/90 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)]'
          }`}>
            
            {/* Brand Logo */}
            <a href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#030B3D] text-white font-black text-base sm:text-lg shadow-sm group-hover:scale-105 transition-transform">
                G
              </div>
              <span className="text-lg sm:text-xl font-display font-black text-[#030B3D] tracking-tight">GigOra</span>
            </a>

            {/* Desktop Navigation Links — only on lg (1024px+) to prevent any cramping */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-[15px] font-medium text-[#030B3D]/80">
              <a href="#how-it-works" className="hover:text-[#593CFF] transition-colors relative group py-1">
                <span>How It Works</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#593CFF] to-[#AA85FF] group-hover:w-full transition-all duration-200"></span>
              </a>
              <a href="#categories" className="hover:text-[#593CFF] transition-colors relative group py-1">
                <span>Tech Services</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#593CFF] to-[#AA85FF] group-hover:w-full transition-all duration-200"></span>
              </a>
              <a href="#choose-path" className="hover:text-[#593CFF] transition-colors relative group py-1">
                <span>Clients &amp; Devs</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#593CFF] to-[#AA85FF] group-hover:w-full transition-all duration-200"></span>
              </a>
              <a href="#faq" className="hover:text-[#593CFF] transition-colors relative group py-1">
                <span>FAQ</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#593CFF] to-[#AA85FF] group-hover:w-full transition-all duration-200"></span>
              </a>
            </div>

            {/* Right Action: Sign In + Sign Up + Mobile Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link 
                to="/login"
                className="hidden sm:inline-flex text-xs sm:text-sm font-bold text-[#030B3D] hover:text-[#593CFF] px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="rounded-full bg-[#030B3D] hover:bg-[#593CFF] px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Sign Up
              </Link>
              {/* Mobile Hamburger Button (visible on < lg) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className="lg:hidden p-2 rounded-full bg-stone-100 text-[#030B3D] hover:bg-stone-200 transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </nav>

          {/* Mobile Dropdown Menu (below pill navbar) */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden w-full mt-2 rounded-3xl bg-white/98 backdrop-blur-md border border-stone-200/80 shadow-[0_16px_36px_rgba(0,0,0,0.12)] p-4 space-y-2 text-sm font-semibold text-[#030B3D]"
            >
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl hover:bg-stone-100/80 transition-colors"
              >
                How It Works
              </a>
              <a 
                href="#categories" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl hover:bg-stone-100/80 transition-colors"
              >
                Tech Services
              </a>
              <a 
                href="#choose-path" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl hover:bg-stone-100/80 transition-colors"
              >
                Clients &amp; Devs
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl hover:bg-stone-100/80 transition-colors"
              >
                FAQ
              </a>
              <div className="pt-3 border-t border-stone-100 flex items-center gap-2 px-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-[#030B3D] hover:bg-stone-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl bg-[#593CFF] text-white text-xs font-bold shadow-xs hover:bg-[#472fe0]"
                >
                  Sign Up
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 2. HERO SECTION — Natural full-bleed editorial hero */}
      <section className="relative min-h-[620px] md:min-h-[720px] lg:h-[88vh] lg:min-h-[720px] lg:max-h-[860px] flex items-center bg-[#FAF6EF] border-b border-stone-200/40 overflow-hidden">
        
        {/* Full-bleed background workspace photo */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <img
            src="/images/gigora_hero_clean.jpg"
            alt="Indian Software Engineer Working at Workstation"
            className="w-full h-full object-cover object-center"
          />
          {/* Desktop editorial gradient overlay: 0.85 on left and 0.60 mid-way to keep photo visible while text stays sharp */}
          <div 
            className="absolute inset-0 hidden lg:block" 
            style={{
              background: 'linear-gradient(90deg, rgba(250, 247, 241, 0.85) 0%, rgba(250, 247, 241, 0.60) 45%, rgba(250, 247, 241, 0.08) 100%)'
            }} 
          />
          {/* Mobile and Tablet backdrop overlay: strong solid cream directly behind text, fading at the bottom to show photo */}
          <div 
            className="absolute inset-0 lg:hidden" 
            style={{
              background: 'linear-gradient(180deg, rgba(250, 247, 241, 1) 0%, rgba(250, 247, 241, 0.98) 55%, rgba(250, 247, 241, 0.94) 75%, rgba(250, 247, 241, 0.70) 88%, rgba(250, 247, 241, 0.25) 100%)'
            }} 
          />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full max-w-[1520px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 pt-32 pb-14 md:pt-28 md:pb-16 flex items-center">
          <div className="w-full max-w-xl lg:max-w-[580px] xl:max-w-[620px] bg-[#FAF6EF]/85 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-5 sm:p-0 rounded-3xl border border-[#030B3D]/10 sm:border-0 shadow-xs sm:shadow-none">
            
            {/* Audience-Specific Choice Switcher */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mb-4 md:mb-6"
            >
              <p className="text-xs sm:text-sm font-bold text-[#030B3D] tracking-[0.02em] opacity-80 mb-2">
                What are you looking to do?
              </p>
              <div className="grid grid-cols-2 sm:inline-flex p-1 rounded-full bg-[#030B3D]/[0.06] backdrop-blur-xs border border-[#030B3D]/[0.12] w-full sm:w-auto shadow-xs">
                <button
                  onClick={() => setActiveTab('client')}
                  className={`px-2.5 sm:px-5 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm md:text-base font-bold transition-all min-h-[42px] text-center cursor-pointer ${
                    activeTab === 'client'
                      ? 'bg-[#593CFF] text-white shadow-xs'
                      : 'text-[#030B3D] hover:bg-[#030B3D]/[0.08]'
                  }`}
                >
                  Hire Indian Tech Talent
                </button>
                <button
                  onClick={() => setActiveTab('freelancer')}
                  className={`px-2.5 sm:px-5 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm md:text-base font-bold transition-all min-h-[42px] text-center cursor-pointer ${
                    activeTab === 'freelancer'
                      ? 'bg-[#593CFF] text-white shadow-xs'
                      : 'text-[#030B3D] hover:bg-[#030B3D]/[0.08]'
                  }`}
                >
                  Work as a Freelancer
                </button>
              </div>
              <p className="text-xs md:text-sm text-[#030B3D] opacity-75 mt-2 leading-[1.45]">
                {activeTab === 'client' 
                  ? "Work with Indian tech freelancers through clear milestones, agreed scope, and simple reviews."
                  : "Show your portfolio and find serious projects with clear milestones."
                }
              </p>
            </motion.div>

            {/* Dynamic Content based on activeTab */}
            {activeTab === 'client' ? (
              <div key="client-content">
                {/* Eyebrow Label */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-xs md:text-sm font-bold uppercase tracking-[0.08em] text-[#593CFF] mb-2.5 md:mb-3"
                >
                  FOR FOUNDERS &amp; TECH TEAMS
                </motion.p>

                {/* Headline */}
                <h1
                  className="font-display font-black text-[#030B3D] tracking-[-0.03em] mb-4 md:mb-4 text-balance"
                  style={{ fontSize: 'clamp(2.1rem, 3.4vw + 0.3rem, 3.3rem)', lineHeight: '1.1' }}
                >
                  <span className="block">
                    Hire India's tech talent,
                  </span>
                  <span className="block text-[#593CFF]">
                    milestone by milestone.
                  </span>
                </h1>

                {/* Body Text */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.95, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-[#030B3D] leading-[1.55] max-w-[32em] font-medium mb-3.5 md:mb-4"
                  style={{ fontSize: 'clamp(0.95rem, 1.05vw + 0.15rem, 1.15rem)' }}
                >
                  Discover Indian tech talent, agree on project expectations, and preview milestone workflows.
                </motion.p>

                {/* Offer Line */}
                <div className="overflow-hidden mb-5 md:mb-6">
                  <p 
                    className="font-medium text-[#030B3D] leading-[1.45] max-w-[32em] text-xs sm:text-sm bg-[#593CFF]/8 border border-[#593CFF]/20 px-3.5 py-2.5 rounded-xl"
                  >
                    📌 <strong>GigOra is in development.</strong> Explore this preview—marketplace and payment features are not live yet.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 w-full">
                  <a
                    href="#waitlist"
                    className="rounded-full bg-gradient-to-r from-[#595CFF] to-[#E7A4FF] px-8 py-3.5 text-base md:text-lg font-bold text-white shadow-[0_16px_32px_-16px_rgba(89,60,255,0.7)] hover:brightness-105 active:scale-95 transition-all text-center min-h-[48px] flex items-center justify-center cursor-pointer"
                  >
                    Join Early Access
                  </a>
                  <a
                    href="#how-it-works"
                    className="text-base md:text-[17px] font-bold text-[#030B3D] underline underline-offset-4 hover:no-underline text-center sm:text-left py-2 min-h-[48px] flex items-center justify-center sm:justify-start cursor-pointer"
                  >
                    See how milestones work →
                  </a>
                </div>
              </div>
            ) : (
              <div key="freelancer-content">
                {/* Eyebrow Label */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-xs md:text-sm font-bold uppercase tracking-[0.08em] text-[#593CFF] mb-2.5 md:mb-3"
                >
                  FOR SOFTWARE ENGINEERS &amp; DEVELOPERS
                </motion.p>

                {/* Headline */}
                <h1
                  className="font-display font-black text-[#030B3D] tracking-[-0.03em] mb-4 md:mb-4 text-balance"
                  style={{ fontSize: 'clamp(2.1rem, 3.4vw + 0.3rem, 3.3rem)', lineHeight: '1.1' }}
                >
                  <span className="block">
                    Show your work and
                  </span>
                  <span className="block text-[#593CFF]">
                    find projects with clear milestones.
                  </span>
                </h1>

                {/* Body Text */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.95, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-[#030B3D] leading-[1.55] max-w-[32em] font-medium mb-3.5 md:mb-4"
                  style={{ fontSize: 'clamp(0.95rem, 1.05vw + 0.15rem, 1.15rem)' }}
                >
                  Showcase your work and explore our planned milestone-based freelance collaboration model.
                </motion.p>

                {/* Offer Line */}
                <div className="overflow-hidden mb-5 md:mb-6">
                  <p 
                    className="font-medium text-[#030B3D] leading-[1.45] max-w-[32em] text-xs sm:text-sm bg-[#593CFF]/8 border border-[#593CFF]/20 px-3.5 py-2.5 rounded-xl"
                  >
                    📌 <strong>GigOra is in development.</strong> Explore this preview—marketplace and payment features are not live yet.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 w-full">
                  <a
                    href="#waitlist"
                    className="rounded-full bg-[#030B3D] hover:bg-[#593CFF] px-8 py-3.5 text-base md:text-lg font-bold text-white shadow-md active:scale-95 transition-all text-center min-h-[48px] flex items-center justify-center cursor-pointer"
                  >
                    Join Early Access as Dev
                  </a>
                  <a
                    href="#choose-path"
                    className="text-base md:text-[17px] font-bold text-[#030B3D] underline underline-offset-4 hover:no-underline text-center sm:text-left py-2 min-h-[48px] flex items-center justify-center sm:justify-start cursor-pointer"
                  >
                    See developer perks →
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 2.5 TRUST STRIP: Proof you can genuinely give right now */}
      <section className="bg-white border-b border-stone-200/80 py-5 sm:py-6 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 items-stretch">
            
            <div className="flex items-center gap-2.5 sm:gap-3 justify-start p-2.5 sm:p-3 rounded-2xl bg-stone-50/80 md:bg-transparent border border-stone-200/60 md:border-0 shadow-xs md:shadow-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#593CFF]/10 text-[#593CFF] flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-[#030B3D] leading-tight">100% India-Focused</h4>
                <p className="text-[10px] sm:text-xs text-stone-500 leading-tight mt-0.5 truncate sm:overflow-visible">Built for Indian founders &amp; devs</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 justify-start p-2.5 sm:p-3 rounded-2xl bg-stone-50/80 md:bg-transparent border border-stone-200/60 md:border-0 shadow-xs md:shadow-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Code2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-[#030B3D] leading-tight">Developer Showcase</h4>
                <p className="text-[10px] sm:text-xs text-stone-500 leading-tight mt-0.5 truncate sm:overflow-visible">Web, Mobile, AI &amp; Cloud prototypes</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 justify-start p-2.5 sm:p-3 rounded-2xl bg-stone-50/80 md:bg-transparent border border-stone-200/60 md:border-0 shadow-xs md:shadow-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-[#030B3D] leading-tight flex items-center gap-1.5">
                  Milestone Tracking
                  <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-300">Preview</span>
                </h4>
                <p className="text-[10px] sm:text-xs text-stone-500 leading-tight mt-0.5 truncate sm:overflow-visible">Sandbox demo • No real currency</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 justify-start p-2.5 sm:p-3 rounded-2xl bg-stone-50/80 md:bg-transparent border border-stone-200/60 md:border-0 shadow-xs md:shadow-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-[#030B3D] leading-tight flex items-center gap-1.5">
                  Proof Portfolios
                  <span className="text-[9px] font-bold bg-indigo-50 text-[#593CFF] px-1.5 py-0.2 rounded border border-indigo-200">Preview</span>
                </h4>
                <p className="text-[10px] sm:text-xs text-stone-500 leading-tight mt-0.5 truncate sm:overflow-visible">GitHub repos &amp; live prototypes</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. POPULAR TECH SERVICES QUICK ROW */}
      <section id="categories" className="py-8 sm:py-10 bg-slate-50/70 border-b border-slate-200/80 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 xl:gap-5">
            
            {/* 1. AI & ML Services */}
            <button 
              onClick={() => {
                setActiveCategory('AI & ML');
                const el = document.getElementById('category-details');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              data-aos="fade-up" 
              data-aos-delay="0"
              className="text-left group p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:bg-purple-600 group-hover:text-white group-hover:scale-110 transition-all shadow-sm">
                <Cpu className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-purple-600 transition-colors truncate sm:overflow-visible">AI &amp; ML Services</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate sm:overflow-visible">LLMs &amp; Neural Nets</p>
            </button>

            {/* 2. Fullstack & Web */}
            <button 
              onClick={() => {
                setActiveCategory('Web & App');
                const el = document.getElementById('category-details');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              data-aos="fade-up" 
              data-aos-delay="30"
              className="text-left group p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all shadow-sm">
                <Code2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors truncate sm:overflow-visible">Fullstack &amp; Web</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate sm:overflow-visible">React, Next.js, Node</p>
            </button>

            {/* 3. Mobile Apps */}
            <button 
              onClick={() => {
                setActiveCategory('Web & App');
                const el = document.getElementById('category-details');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              data-aos="fade-up" 
              data-aos-delay="60"
              className="text-left group p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-110 transition-all shadow-sm">
                <Smartphone className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-600 transition-colors truncate sm:overflow-visible">Mobile Apps</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate sm:overflow-visible">Flutter &amp; React Native</p>
            </button>

            {/* 4. UI/UX & Design */}
            <button 
              onClick={() => {
                setActiveCategory('UI/UX Design');
                const el = document.getElementById('category-details');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              data-aos="fade-up" 
              data-aos-delay="90"
              className="text-left group p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-pink-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:bg-pink-600 group-hover:text-white group-hover:scale-110 transition-all shadow-sm">
                <Palette className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-pink-600 transition-colors truncate sm:overflow-visible">UI/UX &amp; Design</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate sm:overflow-visible">Figma &amp; Prototypes</p>
            </button>

            {/* 5. Cloud & DevOps */}
            <button 
              onClick={() => {
                setActiveCategory('DevOps & Cloud');
                const el = document.getElementById('category-details');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              data-aos="fade-up" 
              data-aos-delay="120"
              className="text-left group p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:bg-amber-600 group-hover:text-white group-hover:scale-110 transition-all shadow-sm">
                <Cloud className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-amber-600 transition-colors truncate sm:overflow-visible">Cloud &amp; DevOps</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate sm:overflow-visible">AWS, Docker &amp; CI/CD</p>
            </button>

            {/* 6. Data & Backend */}
            <button 
              onClick={() => {
                setActiveCategory('Backend APIs');
                const el = document.getElementById('category-details');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              data-aos="fade-up" 
              data-aos-delay="150"
              className="text-left group p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:bg-cyan-600 group-hover:text-white group-hover:scale-110 transition-all shadow-sm">
                <Database className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-cyan-600 transition-colors truncate sm:overflow-visible">Data &amp; Backend</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate sm:overflow-visible">SQL, Python &amp; APIs</p>
            </button>

          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS: 3 SIMPLE STEPS (Clear & Consolidated) */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-[#FAF8F5] border-b border-stone-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14" data-aos="fade-up">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#593CFF] bg-[#593CFF]/10 px-4 py-1.5 rounded-full border border-[#593CFF]/20">
              PLANNED WORKFLOW PREVIEW
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#030B3D] tracking-tight mt-3 mb-3">
              How GigOra Is Planned to Work
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              A preview of our planned collaboration model, designed for clear milestone delivery.
            </p>
          </div>

          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Step 1 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="0"
              className="bg-white rounded-3xl p-7 sm:p-8 border border-stone-200 shadow-xs hover:shadow-md hover:border-[#593CFF]/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl font-display font-black text-[#593CFF]/30 group-hover:text-[#593CFF] transition-colors">01</span>
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 text-[#593CFF] flex items-center justify-center font-bold shadow-xs">
                    <Terminal className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold text-[#030B3D] mb-2.5">
                  1. Share your project
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Tell us what you're building, which skills you need, and what you expect to receive. Then connect with freelancers who match your project.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center text-xs font-semibold text-[#593CFF]">
                Clear Scope · No Spam Pitches
              </div>
            </div>

            {/* Step 2 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="50"
              className="bg-white rounded-3xl p-7 sm:p-8 border border-stone-200 shadow-xs hover:shadow-md hover:border-[#593CFF]/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl font-display font-black text-[#593CFF]/30 group-hover:text-[#593CFF] transition-colors">02</span>
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold text-[#030B3D] mb-2.5">
                  2. Agree on milestones
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Agree on the deliverables, timeline, and budget before work begins. Clear milestones help everyone stay on the same page.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center text-xs font-semibold text-indigo-600">
                Phased Sprints · Clear Milestones
              </div>
            </div>

            {/* Step 3 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="100"
              className="bg-white rounded-3xl p-7 sm:p-8 border border-stone-200 shadow-xs hover:shadow-md hover:border-[#593CFF]/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl font-display font-black text-[#593CFF]/30 group-hover:text-[#593CFF] transition-colors">03</span>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold text-[#030B3D] mb-2.5">
                  3. Review the work
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Review planned deliverables through a demo walkthrough or GitHub pull request before confirming sprint completion.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center text-xs font-semibold text-emerald-600">
                Planned Review · Sprint Confirmation
              </div>
            </div>

          </div>

          {/* Planned Workflow Note */}
          <div className="mt-10 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 max-w-3xl mx-auto text-center" data-aos="fade-up">
            <p className="text-xs sm:text-sm font-medium text-amber-950">
              📌 <strong>Notice:</strong> This workflow is still being developed. Project matching, milestone reviews, and payments are not live on GigOra yet.
            </p>
          </div>

        </div>
      </section>

      {/* 5. CHOOSE YOUR PATH (Audience Specific Cards for Client & Freelancer) */}
      <section id="choose-path" className="py-20 lg:py-24 bg-white border-b border-stone-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14" data-aos="fade-up">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#593CFF] bg-[#593CFF]/10 px-4 py-1.5 rounded-full border border-[#593CFF]/20">
              CHOOSE YOUR PATH
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#030B3D] tracking-tight mt-3 mb-3">
              Built for both sides of the contract
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Whether you're hiring for your startup or looking for your next freelance project, GigOra helps both sides work with clearer expectations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Client Card */}
            <div 
              data-aos="fade-up"
              data-aos-delay="0"
              className="rounded-3xl p-8 sm:p-10 bg-[#FAF8F5] border border-stone-200 hover:border-[#593CFF]/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-[#593CFF] text-xs font-bold mb-5">
                  <Users className="w-3.5 h-3.5" /> For Founders &amp; Clients
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-[#030B3D] mb-3">
                  Build your product with clear milestones
                </h3>
                <p className="text-sm text-stone-600 mb-6 leading-relaxed">
                  Discuss project requirements and agree on deliverables before work starts. Deliverables and acceptance criteria are planned upfront (Matching features under development).
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Planned milestone deliverables, sprint dates & budgets upfront',
                    'GitHub PR & live staging inspection workflow (Planned for launch)',
                    'Milestone review and confirmation workflow (Planned for launch)',
                    'Join preview cohort for upcoming platform launch'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                      <Check className="w-4 h-4 text-[#593CFF] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a 
                href="#waitlist" 
                className="rounded-full bg-[#030B3D] hover:bg-[#593CFF] text-white text-center py-3.5 px-6 font-bold text-sm shadow-sm hover:shadow-md transition-all block cursor-pointer"
              >
                Join as Client
              </a>
            </div>

            {/* Freelancer Card */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="50"
              className="rounded-3xl p-8 sm:p-10 bg-[#FAF8F5] border border-stone-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-5">
                  <Code2 className="w-3.5 h-3.5" /> For Tech Freelancers &amp; Devs
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-[#030B3D] mb-3">
                  Show your work. Find projects with clear milestones.
                </h3>
                <p className="text-sm text-stone-600 mb-6 leading-relaxed">
                  Know the scope, timeline, and terms before you start work. Milestone criteria are agreed upfront, so you code with full confidence.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Showcase GitHub repos, commits, and live prototypes (Preview)',
                    'Milestone scopes agreed and locked before kickoff (Planned for launch)',
                    'Direct rupee milestone agreements (Planned for launch)',
                    'Join early preview cohort for technical talent onboarding'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a 
                href="#waitlist" 
                className="rounded-full bg-[#593CFF] hover:bg-[#472fe0] text-white text-center py-3.5 px-6 font-bold text-sm shadow-sm hover:shadow-md transition-all block cursor-pointer"
              >
                Join as Freelancer
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* 6. CATEGORY DEEP-DIVE: "What do you build on GigOra?" */}
      <section id="category-details" className="py-20 lg:py-24 bg-[#FAF8F5] border-b border-stone-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Section Header: Question + Pill Filter Tags */}
          <div className="mb-10 text-left" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#030B3D] tracking-tight mb-6">
              What do you build on GigOra?
            </h2>

            {/* Interactive Pill Filter Tags */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5">
              {['Web & App', 'AI & ML', 'DevOps & Cloud', 'Backend APIs', 'UI/UX Design', 'Fullstack MVP', 'Something Else'].map((tag) => {
                const isSelected = activeCategory === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveCategory(tag)}
                    className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-200 cursor-pointer active:scale-95 ${
                      isSelected 
                        ? 'bg-white border-[#593CFF] text-[#593CFF] shadow-[0_2px_12px_rgba(89,60,255,0.12)] scale-102 ring-1 ring-[#593CFF]' 
                        : 'bg-white/80 border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-white hover:text-stone-900'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Subtitle */}
            {(() => {
              const categoryDetails = {
                'Web & App': {
                  subtitle: 'Whatever the web or mobile stack (React, Next.js, Node, Flutter), clear milestones help align deliverable expectations and sprint reviews upon code inspection (Planned feature).',
                  photo: '/images/gigora_web_dev_exact.jpg',
                  photoAlt: 'Fullstack & Mobile developer working on clean web app architecture',
                  cards: [
                    {
                      icon: ShieldCheck,
                      title: 'Keep milestone deliverables clear',
                      desc: 'Deliverables and acceptance criteria planned before kickoff. Milestone review workflow is planned for launch.',
                      color: 'text-[#593CFF]',
                      hoverBg: 'group-hover:bg-[#593CFF]'
                    },
                    {
                      icon: Wallet,
                      title: 'Planned domestic INR terms',
                      desc: 'Planned milestone agreements in Indian Rupees without foreign conversion fees (Planned for launch).',
                      color: 'text-indigo-600',
                      hoverBg: 'group-hover:bg-indigo-600'
                    },
                    {
                      icon: Terminal,
                      title: 'Inspect live code & test environments',
                      desc: 'Planned GitHub pull request & staging URL review workflows designed to keep project scope aligned (Planned for launch).',
                      color: 'text-emerald-600',
                      hoverBg: 'group-hover:bg-emerald-600'
                    }
                  ]
                },
                'AI & ML': {
                  subtitle: 'From fine-tuning LLMs, RAG pipelines, and LangChain to PyTorch model training, verify inference latency and API accuracy before approving milestones.',
                  photo: '/images/gigora_aiml_exact.jpg',
                  photoAlt: 'AI and Machine Learning engineer deploying neural network inference models',
                  cards: [
                    {
                      icon: ShieldCheck,
                      title: 'Benchmark-backed milestone signoff',
                      desc: 'Lock milestones against clear model accuracy, latency limits, and eval benchmarks before sign-off.',
                      color: 'text-purple-600',
                      hoverBg: 'group-hover:bg-purple-600'
                    },
                    {
                      icon: Terminal,
                      title: 'Live API endpoint & notebook review',
                      desc: 'Test real inference endpoints, inspect Jupyter notebooks, and verify GPU cost optimization on staging before milestone completion.',
                      color: 'text-indigo-600',
                      hoverBg: 'group-hover:bg-indigo-600'
                    },
                    {
                      icon: Wallet,
                      title: 'Milestone billing for tech teams',
                      desc: 'Structured milestone records and deliverables designed specifically for Indian startups and tech teams.',
                      color: 'text-emerald-600',
                      hoverBg: 'group-hover:bg-emerald-600'
                    }
                  ]
                },
                'DevOps & Cloud': {
                  subtitle: 'Production cloud infrastructure — AWS/GCP server setup, Docker containerization, database hosting, and automated zero-downtime deployment pipelines.',
                  photo: '/images/gigora_devops_exact.jpg',
                  photoAlt: 'DevOps engineer configuring cloud architecture and servers',
                  cards: [
                    {
                      icon: Terminal,
                      title: 'IaC verification & zero downtime tests',
                      desc: 'Inspect Terraform / Pulumi scripts and test staging cluster failover before approving the cloud migration milestone.',
                      color: 'text-amber-600',
                      hoverBg: 'group-hover:bg-amber-600'
                    },
                    {
                      icon: ShieldCheck,
                      title: 'Strict secrets & IAM access safety',
                      desc: 'Sprint workflows follow least-privilege access guidelines with sign-off granted only after deployment passes smoke tests.',
                      color: 'text-[#593CFF]',
                      hoverBg: 'group-hover:bg-[#593CFF]'
                    },
                    {
                      icon: Wallet,
                      title: 'Sign-off upon staging pass',
                      desc: 'Approve milestone completion the moment CI/CD passes automated pipeline checks.',
                      color: 'text-emerald-600',
                      hoverBg: 'group-hover:bg-emerald-600'
                    }
                  ]
                },
                'Backend APIs': {
                  subtitle: 'High-throughput microservices, PostgreSQL schema optimization, Redis caching, payment gateways, and documented REST/GraphQL APIs.',
                  photo: '/images/gigora_backend_exact.jpg',
                  photoAlt: 'Backend engineer optimizing database queries and REST APIs',
                  cards: [
                    {
                      icon: Terminal,
                      title: 'Postman test suites & Swagger docs',
                      desc: 'Milestones include complete Swagger/Postman API documentation and unit test coverage before sign-off is requested.',
                      color: 'text-cyan-600',
                      hoverBg: 'group-hover:bg-cyan-600'
                    },
                    {
                      icon: ShieldCheck,
                      title: 'Structured database migrations (Preview)',
                      desc: 'Safeguard your data architecture. Milestone deliverables include migration scripts and schema validation.',
                      color: 'text-[#593CFF]',
                      hoverBg: 'group-hover:bg-[#593CFF]'
                    },
                    {
                      icon: Wallet,
                      title: 'Clear milestone pricing in INR',
                      desc: 'Complete sprint deliverables cleanly once API latency benchmarks and integration test suites pass inspection.',
                      color: 'text-emerald-600',
                      hoverBg: 'group-hover:bg-emerald-600'
                    }
                  ]
                },
                'UI/UX Design': {
                  subtitle: 'Product design systems, high-fidelity Figma components, interactive prototypes, and design-to-code tokens ready for developer handoff.',
                  photo: '/images/gigora_uiux_exact.jpg',
                  photoAlt: 'UI/UX designer refining interactive product prototypes in Figma',
                  cards: [
                    {
                      icon: ShieldCheck,
                      title: 'Figma component & token sign-off',
                      desc: 'Review responsive mobile and desktop screen variants and interactive prototypes before milestone sign-off.',
                      color: 'text-pink-600',
                      hoverBg: 'group-hover:bg-pink-600'
                    },
                    {
                      icon: Terminal,
                      title: 'Developer-ready design specs',
                      desc: 'Zero ambiguity handoff with typography scale, spacing tokens, and exportable vector assets included in the milestone.',
                      color: 'text-[#593CFF]',
                      hoverBg: 'group-hover:bg-[#593CFF]'
                    },
                    {
                      icon: Wallet,
                      title: 'Sign-off on prototype approval',
                      desc: 'Designers complete their sprint deliverable upon client interactive prototype review and approved handoff.',
                      color: 'text-emerald-600',
                      hoverBg: 'group-hover:bg-emerald-600'
                    }
                  ]
                },
                'Fullstack MVP': {
                  subtitle: 'From zero to production launch in 2 to 4 weeks. Build functional SaaS products, marketplaces, and internal tools with clean milestone stages.',
                  photo: '/images/gigora_mvp_exact.jpg',
                  photoAlt: 'Fullstack founder and developer building rapid MVP startup sprint',
                  cards: [
                    {
                      icon: ShieldCheck,
                      title: 'Phased sprint milestone structure',
                      desc: 'Break your MVP into 3 clear sprints: Auth & Database, Core Workflow, and Launch. Work proceeds one sprint at a time.',
                      color: 'text-[#593CFF]',
                      hoverBg: 'group-hover:bg-[#593CFF]'
                    },
                    {
                      icon: Terminal,
                      title: 'Production URL & code ownership (Planned)',
                      desc: 'Staging verification on Vercel/AWS and intellectual property transfer terms are planned for upcoming launch.',
                      color: 'text-indigo-600',
                      hoverBg: 'group-hover:bg-indigo-600'
                    },
                    {
                      icon: Wallet,
                      title: 'Phased completion per sprint',
                      desc: 'Keep momentum high. Each sprint closes cleanly upon approval of agreed features.',
                      color: 'text-emerald-600',
                      hoverBg: 'group-hover:bg-emerald-600'
                    }
                  ]
                },
                'Something Else': {
                  subtitle: 'Custom technical requirements — automated scrapers, browser extensions, smart contracts, or legacy refactoring with customized milestone terms.',
                  photo: '/images/gigora_custom_exact.jpg',
                  photoAlt: 'Software engineer building custom technical solutions, scrapers, and extensions',
                  cards: [
                    {
                      icon: ShieldCheck,
                      title: 'Custom acceptance criteria lock',
                      desc: 'Define custom test cases, performance constraints, and deliverables before initiating the milestone.',
                      color: 'text-[#593CFF]',
                      hoverBg: 'group-hover:bg-[#593CFF]'
                    },
                    {
                      icon: Terminal,
                      title: 'Direct code review & walkthrough',
                      desc: 'Schedule a live demo walkthrough and inspect the codebase before milestone sign-off. (Integrated payments currently unavailable).',
                      color: 'text-indigo-600',
                      hoverBg: 'group-hover:bg-indigo-600'
                    },
                    {
                      icon: Wallet,
                      title: 'Transparent agreement terms',
                      desc: 'Transparent agreement process with clear scope definitions and milestone deliverables.',
                      color: 'text-emerald-600',
                      hoverBg: 'group-hover:bg-emerald-600'
                    }
                  ]
                }
              };

              const current = categoryDetails[activeCategory] || categoryDetails['Web & App'];

              return (
                <p className="text-base sm:text-lg text-stone-600 max-w-3xl leading-relaxed transition-all duration-300">
                  {current.subtitle}
                </p>
              );
            })()}
          </div>

          {/* Two-Column Grid: Photo Left + 3 Stacked Cards Right */}
          {(() => {
            const categoryDetails = {
              'Web & App': {
                photo: '/images/gigora_web_dev_exact.jpg',
                photoAlt: 'Fullstack & Mobile developer working on clean web app architecture',
                cards: [
                  {
                    icon: ShieldCheck,
                    title: 'Keep milestone deliverables clear',
                    desc: 'Deliverables and acceptance criteria planned before kickoff. Milestone review workflow is planned for launch.',
                    color: 'text-[#593CFF]',
                    hoverBg: 'group-hover:bg-[#593CFF]'
                  },
                  {
                    icon: Wallet,
                    title: 'Planned domestic INR terms',
                    desc: 'Planned milestone agreements in Indian Rupees without foreign conversion fees (Planned for launch).',
                    color: 'text-indigo-600',
                    hoverBg: 'group-hover:bg-indigo-600'
                  },
                  {
                    icon: Terminal,
                    title: 'Inspect live code & test environments',
                    desc: 'Planned GitHub pull request & staging URL review workflows designed to keep project scope aligned (Planned for launch).',
                    color: 'text-emerald-600',
                    hoverBg: 'group-hover:bg-emerald-600'
                  }
                ]
              },
              'AI & ML': {
                photo: '/images/gigora_aiml_exact.jpg',
                photoAlt: 'AI and Machine Learning engineer deploying neural network models',
                cards: [
                  {
                    icon: ShieldCheck,
                    title: 'Benchmark-backed milestone signoff',
                    desc: 'Lock milestones against clear model accuracy, latency limits, and eval benchmarks before signoff.',
                    color: 'text-purple-600',
                    hoverBg: 'group-hover:bg-purple-600'
                  },
                  {
                    icon: Terminal,
                    title: 'Live API endpoint & notebook review',
                    desc: 'Test real inference endpoints, inspect Jupyter notebooks, and verify GPU cost optimization on staging.',
                    color: 'text-indigo-600',
                    hoverBg: 'group-hover:bg-indigo-600'
                  },
                  {
                    icon: Wallet,
                    title: 'Milestone billing for tech teams',
                    desc: 'Structured agreements and milestone tracking designed for Indian startups and developers.',
                    color: 'text-emerald-600',
                    hoverBg: 'group-hover:bg-emerald-600'
                  }
                ]
              },
              'DevOps & Cloud': {
                photo: '/images/gigora_devops_exact.jpg',
                photoAlt: 'DevOps engineer configuring cloud architecture and servers',
                cards: [
                  {
                    icon: Terminal,
                    title: 'IaC verification & failover tests',
                    desc: 'Inspect Terraform / Pulumi scripts and test staging cluster failover before approving the cloud migration.',
                    color: 'text-amber-600',
                    hoverBg: 'group-hover:bg-amber-600'
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Strict secrets & IAM access safety',
                    desc: 'Sprint workflows follow least-privilege access guidelines with sign-off granted only after smoke tests pass.',
                    color: 'text-[#593CFF]',
                    hoverBg: 'group-hover:bg-[#593CFF]'
                  },
                  {
                    icon: Wallet,
                    title: 'Sign-off upon staging pass',
                    desc: 'Milestone completion is approved the moment automated CI/CD pipeline checks pass.',
                    color: 'text-emerald-600',
                    hoverBg: 'group-hover:bg-emerald-600'
                  }
                ]
              },
              'Backend APIs': {
                photo: '/images/gigora_backend_exact.jpg',
                photoAlt: 'Backend engineer optimizing database queries and REST APIs',
                cards: [
                  {
                    icon: Terminal,
                    title: 'Postman test suites & Swagger docs',
                    desc: 'Milestones include complete Swagger/Postman API documentation and unit test coverage before sign-off.',
                    color: 'text-cyan-600',
                    hoverBg: 'group-hover:bg-cyan-600'
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Structured database migrations (Preview)',
                    desc: 'Safeguard your data architecture. Milestone deliverables include migration scripts and schema validation.',
                    color: 'text-[#593CFF]',
                    hoverBg: 'group-hover:bg-[#593CFF]'
                  },
                  {
                    icon: Wallet,
                    title: 'Clear milestone terms in INR',
                    desc: 'Complete sprint deliverables cleanly once API latency benchmarks and integration test suites pass inspection.',
                    color: 'text-emerald-600',
                    hoverBg: 'group-hover:bg-emerald-600'
                  }
                ]
              },
              'UI/UX Design': {
                photo: '/images/gigora_uiux_exact.jpg',
                photoAlt: 'UI/UX designer refining interactive product prototypes in Figma',
                cards: [
                  {
                    icon: ShieldCheck,
                    title: 'Figma component & token sign-off',
                    desc: 'Review responsive mobile and desktop screen variants and interactive prototypes before releasing milestone approval.',
                    color: 'text-pink-600',
                    hoverBg: 'group-hover:bg-pink-600'
                  },
                  {
                    icon: Terminal,
                    title: 'Developer-ready design specs',
                    desc: 'Zero ambiguity handoff with typography scale, spacing tokens, and exportable vector assets included.',
                    color: 'text-[#593CFF]',
                    hoverBg: 'group-hover:bg-[#593CFF]'
                  },
                  {
                    icon: Wallet,
                    title: 'Sign-off on prototype approval',
                    desc: 'Designers complete their sprint deliverable upon client interactive prototype review and approved handoff.',
                    color: 'text-emerald-600',
                    hoverBg: 'group-hover:bg-emerald-600'
                  }
                ]
              },
              'Fullstack MVP': {
                photo: '/images/gigora_mvp_exact.jpg',
                photoAlt: 'Fullstack founder and developer building rapid MVP startup sprint',
                cards: [
                  {
                    icon: ShieldCheck,
                    title: 'Phased sprint milestone structure',
                    desc: 'Break your MVP into 3 clear sprints: Auth & Database, Core Workflow, and Launch. Work proceeds one sprint at a time.',
                    color: 'text-[#593CFF]',
                    hoverBg: 'group-hover:bg-[#593CFF]'
                  },
                  {
                    icon: Terminal,
                    title: 'Production URL & code ownership (Planned)',
                    desc: 'Staging verification on Vercel/AWS and intellectual property transfer terms are planned for upcoming launch.',
                    color: 'text-indigo-600',
                    hoverBg: 'group-hover:bg-indigo-600'
                  },
                  {
                    icon: Wallet,
                    title: 'Phased completion per sprint',
                    desc: 'Keep momentum high. Each sprint closes cleanly upon approval of agreed features.',
                    color: 'text-emerald-600',
                    hoverBg: 'group-hover:bg-emerald-600'
                  }
                ]
              },
              'Something Else': {
                photo: '/images/gigora_custom_exact.jpg',
                photoAlt: 'Software engineer building custom technical solutions, scrapers, and extensions',
                cards: [
                  {
                    icon: ShieldCheck,
                    title: 'Custom acceptance criteria lock',
                    desc: 'Define custom test cases, performance constraints, and deliverables before initiating the milestone.',
                    color: 'text-[#593CFF]',
                    hoverBg: 'group-hover:bg-[#593CFF]'
                  },
                  {
                    icon: Terminal,
                    title: 'Direct code review & walkthrough',
                    desc: 'Schedule a live demo walkthrough and inspect the codebase before milestone sign-off. (Integrated payments currently unavailable).',
                    color: 'text-indigo-600',
                    hoverBg: 'group-hover:bg-indigo-600'
                  },
                  {
                    icon: Wallet,
                    title: 'Transparent agreement terms',
                    desc: 'Transparent agreement process with clear scope definitions and milestone deliverables.',
                    color: 'text-emerald-600',
                    hoverBg: 'group-hover:bg-emerald-600'
                  }
                ]
              }
            };

            const current = categoryDetails[activeCategory] || categoryDetails['Web & App'];

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                
                {/* Left: Authentic Photo */}
                <div className="lg:col-span-7" data-aos="fade-right" data-aos-delay="0">
                  <div className="relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/90 aspect-[16/10] bg-stone-100 group">
                    <img 
                      src={current.photo} 
                      alt={current.photoAlt} 
                      className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </div>

                {/* Right: 3 Stacked Cards */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  {current.cards.map((card, idx) => {
                    const IconComp = card.icon;
                    return (
                      <div 
                        key={idx}
                        data-aos="fade-left" 
                        data-aos-delay={idx * 50}
                        className="bg-[#FAF6EF] rounded-2xl p-5 sm:p-6 border border-stone-200/90 hover:bg-white hover:border-[#593CFF]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`h-11 w-11 rounded-xl bg-white border border-stone-200/80 ${card.color} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 ${card.hoverBg} group-hover:text-white transition-all duration-300`}>
                            <IconComp className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-display font-bold text-[#030B3D] mb-1.5 group-hover:text-[#593CFF] transition-colors">
                              {card.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                              {card.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })()}
        </div>
      </section>

      {/* 7. VERIFIED STANDARDS (What every GigOra contract includes) */}
      <section className="py-20 lg:py-24 bg-white border-b border-stone-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: Text & Checkmark List */}
            <div className="lg:col-span-6 space-y-6 text-left" data-aos="fade-right">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#030B3D] tracking-tight leading-tight">
                Can I hire technical talent across India with milestone clarity?
              </h2>

              <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
                Our goal is to help tech founders in Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Pune, and across India collaborate with specialized developers with planned structured sprint protection (In development).
              </p>

              <div>
                <p className="text-sm font-bold text-[#030B3D] mb-3">What we plan to include in future milestone agreements:</p>
                <div className="space-y-3">
                  {[
                    'Milestone-structured workflow — reviews happen before sprint sign-off.',
                    'Direct GitHub PR & live staging link verification for transparent sprint reviews.',
                    'Planned milestone clarity for founders, agreed delivery terms for developers.',
                    'Direct rupee milestone agreements with clear acceptance criteria.',
                    'Objective criteria so deliverables are unambiguous from day one.'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-stone-700 hover:text-stone-900 transition-colors">
                      <Check className="h-4 w-4 text-[#593CFF] shrink-0 mt-1 font-bold" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm font-bold text-stone-800 pt-1">
                Planned milestone agreements aim to include these standards. Fee schedules will be published transparently before launch.
              </p>
            </div>

            {/* Right: Authentic Photograph */}
            <div className="lg:col-span-6" data-aos="fade-left" data-aos-delay="50">
              <div className="relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/90 aspect-[4/3] bg-stone-100 group">
                <img 
                  src="/images/gigora_success_founder.jpg" 
                  alt="Founder smiling in modern office working with remote developer" 
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. TWO PRINCIPLES FOUNDERS & DEVELOPERS CAN TRUST */}
      <section className="py-20 lg:py-24 bg-[#FAF8F5] border-b border-stone-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10 text-left" data-aos="fade-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#030B3D] tracking-tight mb-3">
              Clear rules founders and developers can trust
            </h2>
            <p className="text-base sm:text-lg text-stone-600 max-w-2xl">
              Two important operational principles before you initiate your first sprint contract.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box 1 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="0"
              className="bg-white rounded-2xl p-7 border border-[#593CFF]/40 shadow-xs hover:border-[#593CFF] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <h3 className="text-lg sm:text-xl font-display font-bold text-[#030B3D] mb-2.5">
                Milestones require clear scope definition upfront
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Clear milestones protect against misunderstandings and unpaid work, but cannot solve vague requirements. Every sprint must have agreed acceptance criteria and measurable outcomes before kickoff.
              </p>
            </div>

            {/* Box 2 */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="50"
              className="bg-white rounded-2xl p-7 border border-[#593CFF]/40 shadow-xs hover:border-[#593CFF] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <h3 className="text-lg sm:text-xl font-display font-bold text-[#030B3D] mb-2.5">
                Deliverables are reviewed before milestone sign-off (Preview Feature)
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Milestone completion requires explicit client review and acceptance. Work is checked against agreed acceptance criteria before the sprint is marked complete (Preview Mode).
              </p>
            </div>

          </div>

          <p className="text-xs text-stone-400 mt-6 text-left" data-aos="fade-up" data-aos-delay="100">
            GigOra acts as a milestone facilitation and collaboration marketplace for software development services.
          </p>

        </div>
      </section>

      {/* 9. CORE FEATURES */}
      <section id="features" className="py-20 lg:py-28 bg-white relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#593CFF] bg-[#593CFF]/10 px-4 py-1.5 rounded-full border border-[#593CFF]/20">
              ENGINEERED FOR TRUST
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-[#030B3D] tracking-tight mt-4 mb-4">
              Designed for serious technical projects
            </h2>
            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto">
              Planned tools designed to support milestone tracking and deliverable reviews without administrative clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: 'Milestone-Based Approvals (Planned)',
                desc: 'Milestones and acceptance criteria planned before work begins, assuring both sides of clear delivery expectations (Planned for launch).',
                icon: ShieldCheck,
                badge: 'Planned',
                border: 'hover:border-purple-300'
              },
              {
                title: 'Domestic INR Clarity (Planned)',
                desc: 'Planned direct INR milestone agreements designed for Indian businesses and developers without exchange hurdles (In development).',
                icon: Wallet,
                badge: 'Planned',
                border: 'hover:border-emerald-300'
              },
              {
                title: 'Proof-Led Portfolios',
                desc: 'Evaluate developers through real GitHub commits, live staged apps, and design artifacts rather than generic CV resumes.',
                icon: CheckCircle2,
                badge: 'Portfolios',
                border: 'hover:border-blue-300'
              },
              {
                title: 'Early Access Priority',
                desc: 'Join during our early community rollout to connect with our founding team and participate in early preview cohort access.',
                icon: Zap,
                badge: 'Rollout',
                border: 'hover:border-amber-300'
              },
              {
                title: 'Sprint Previews (Planned)',
                desc: 'Planned sprint feedback loops, test environments, and branch commits tracked directly against active milestones (Under development).',
                icon: Layers,
                badge: 'Planned',
                border: 'hover:border-violet-300'
              },
              {
                title: 'Dispute Mediation (Planned)',
                desc: 'A structured mediation protocol under development to help resolve milestone discrepancies objectively once production launches.',
                icon: Users,
                badge: 'Under Development',
                border: 'hover:border-rose-300'
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                data-aos="fade-up"
                data-aos-delay={idx * 25}
                className={`group p-8 rounded-3xl bg-[#FAF6EF]/60 border border-stone-200/80 ${feature.border} hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(3,11,61,0.08)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-[#593CFF] shadow-xs group-hover:scale-110 group-hover:bg-[#593CFF] group-hover:text-white transition-all duration-300">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 bg-white px-2.5 py-1 rounded-full border border-stone-200/80">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-bold text-[#030B3D] mb-2.5 group-hover:text-[#593CFF] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed font-normal">
                    {feature.desc}
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center text-xs font-bold text-[#030B3D] group-hover:text-[#593CFF] transition-colors">
                  <span>Learn more</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. TRANSPARENT FAQ: Fees, Launch Timing, Verification, Payment Protection */}
      <section id="faq" className="py-20 lg:py-28 bg-[#FAF6EF] border-t border-stone-200/80">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14" data-aos="fade-up">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#593CFF] bg-[#593CFF]/10 px-4 py-1.5 rounded-full border border-[#593CFF]/20">
              TRANSPARENCY FIRST
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-[#030B3D] tracking-tight mt-4 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Clear answers about fees, launch plans, freelancer profiles, and milestones.
            </p>
          </div>

          <div className="space-y-4" data-aos="fade-up" data-aos-delay="50">
            {[
              {
                q: 'How does the waitlist work?',
                a: 'Submitted emails are stored only in your local browser (localStorage) for this preview demo; no invitations or emails are sent from this form.'
              },
              {
                q: 'How are freelancer profiles reviewed?',
                a: 'The freelancer review process is still in development; profiles are not currently being verified on the live site.'
              },
              {
                q: 'How do milestones and payments work?',
                a: 'The milestone workflow and payment processing are planned features; payments are not currently processed on GigOra.'
              },
              {
                q: 'What are the platform fees?',
                a: 'Future marketplace fees will be announced prior to launch. Exploring this preview is completely free.'
              }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl border border-stone-200/90 bg-white overflow-hidden shadow-xs hover:border-stone-300 transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-6 text-left text-base sm:text-lg font-display font-bold text-[#030B3D] hover:text-[#593CFF] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-stone-100 shrink-0 ml-4 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 bg-[#593CFF] text-white' : 'text-stone-500'}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-stone-600 border-t border-stone-100 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 11. EARLY ACCESS WAITLIST CTA */}
      <section id="waitlist" className="py-24 lg:py-32 bg-[#030B3D] text-white relative overflow-hidden">
        {/* Luxury Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#593CFF]/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#E7A4FF]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10" data-aos="zoom-in" data-aos-duration="600">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 text-violet-200 border border-white/15 mb-6 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#E7A4FF]" /> EARLY ACCESS PROGRAM
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight mb-5 text-balance">
            Bring clarity to your next technical hire.
          </h2>
          <p className="text-base sm:text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join Indian founders and senior software engineers building together in clear milestones.
          </p>

          {waitlistDone ? (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 max-w-lg mx-auto text-sm text-violet-100 backdrop-blur-md text-left sm:text-center space-y-2">
              <p className="font-bold text-white text-base">✓ Preview action completed!</p>
              <p className="text-violet-200/90 text-xs sm:text-sm leading-relaxed">
                Your email has been saved locally in your browser (<code className="bg-white/15 px-1.5 py-0.5 rounded text-white font-mono text-xs">localStorage</code>) for this preview demo. GigOra is currently in active development, and waitlist emails are not yet transmitted to a remote server.
              </p>
            </div>
          ) : (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const input = form.querySelector('input[type="email"]');
                if (input && input.value) {
                  try {
                    localStorage.setItem('gigora_waitlist_email', input.value);
                  } catch (_err) {
                    // Ignore storage quota errors
                  }
                  setWaitlistDone(true);
                }
              }} 
              className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3"
            >
              <input 
                type="email" 
                placeholder="Enter your work email address" 
                className="px-5 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#595CFF] focus:bg-white/15 text-sm flex-grow backdrop-blur-md shadow-inner transition-all"
                required
              />
              <button 
                type="submit" 
                className="rounded-full bg-gradient-to-r from-[#595CFF] to-[#E7A4FF] px-8 py-4 text-white font-bold text-sm hover:brightness-105 active:scale-95 transition-all shadow-[0_12px_28px_-8px_rgba(89,92,255,0.65)] shrink-0 cursor-pointer"
              >
                Join Early Access
              </button>
            </form>
          )}
          <p className="text-xs text-white/50 mt-4 font-medium">Preview demo · Email stored locally in browser storage only.</p>
        </div>
      </section>

      {/* 12. RESPONSIVE BALANCED FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-14 border-t border-slate-800 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            
            {/* Brand Col */}
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">G</div>
                <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  GigOra
                  <span className="text-[9px] bg-indigo-950 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-700/60">IN</span>
                </span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed text-xs">
                India's milestone-based marketplace in the making, connecting technical talent with startup teams.
              </p>
              <div className="pt-1 text-[11px] text-slate-500 font-medium">
                Milestone Workflow · Clear Criteria · Portfolio Showcase
              </div>
            </div>
            
            {/* Nav Columns: 2 cols on mobile, 3 on sm/md */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <h5 className="font-bold text-white mb-3.5 uppercase tracking-wider text-[11px]">Product</h5>
                <ul className="space-y-2.5 font-medium">
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                  <li><a href="#choose-path" className="hover:text-white transition-colors">Clients &amp; Devs</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                  <li><a href="/about" className="text-indigo-400 hover:text-white transition-colors font-bold">About GigOra</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-white mb-3.5 uppercase tracking-wider text-[11px]">Solutions</h5>
                <ul className="space-y-2.5 font-medium">
                  <li><span className="text-slate-300">Web &amp; Mobile Apps</span></li>
                  <li><span className="text-slate-300">AI &amp; Automation</span></li>
                  <li><span className="text-slate-300">Product Design UI/UX</span></li>
                  <li><span className="text-slate-300">Cloud &amp; DevOps</span></li>
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <h5 className="font-bold text-white mb-3.5 uppercase tracking-wider text-[11px]">Legal &amp; Trust</h5>
                <ul className="space-y-2.5 font-medium">
                  <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><span className="text-slate-300">Milestone Workflow</span></li>
                  <li><span className="text-slate-300">Code Acceptance Criteria</span></li>
                </ul>
              </div>
            </div>

          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-xs text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <p>© 2026 GigOra Technologies. All rights reserved.</p>
              <a href="/terms" className="hover:text-slate-300 transition-colors">Terms</a>
              <a href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</a>
              <a href="/about" className="hover:text-slate-300 transition-colors">About</a>
            </div>
            <p className="font-medium text-slate-400">Built for focused engineering. Zero noise.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
