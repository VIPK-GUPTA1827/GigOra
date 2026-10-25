import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Users, 
  CheckCircle2, 
  Code2, 
  Wallet,
  ChevronDown,
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
  X,
  Lock
} from 'lucide-react';

import AOS from 'aos';
import 'aos/dist/aos.css';
import api from '../utils/api';

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('client');
  const [openFaq, setOpenFaq] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuredGigs, setFeaturedGigs] = useState([]);

  useEffect(() => {
    api.get('/api/gigs?status=open&limit=2')
      .then(res => setFeaturedGigs(res.data || []))
      .catch(() => setFeaturedGigs([]));
  }, []);

  useEffect(() => {
    document.title = 'GigOra — Milestone-Based Marketplace for Technical Talent';
    AOS.refresh();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-600 selection:text-white relative">
      
      {/* 1. TOP FLOATING PILL NAVBAR */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-colors py-3 sm:py-3.5 px-3 sm:px-4 flex justify-center ${
        isScrolled 
          ? 'bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs' 
          : 'bg-transparent'
      }`}>
        <div className="w-full max-w-[1240px] flex flex-col items-center">
          <nav className={`w-full rounded-full backdrop-blur-md px-4 sm:px-7 py-2.5 sm:py-3.5 flex items-center justify-between transition-all duration-300 ${
            isScrolled 
              ? 'bg-white/95 border border-slate-200/90 shadow-[0_12px_36px_rgba(3,11,61,0.12)]' 
              : 'bg-white/90 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)]'
          }`}>
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#030B3D] text-white font-black text-base sm:text-lg shadow-sm group-hover:scale-105 transition-transform">
                G
              </div>
              <span className="text-lg sm:text-xl font-display font-black text-[#030B3D] tracking-tight">GigOra</span>
            </Link>

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
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-menu"
                className="lg:hidden p-2 rounded-full bg-stone-100 text-[#030B3D] hover:bg-stone-200 transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </nav>

          {/* Mobile Dropdown Menu (below pill navbar) */}
          {mobileMenuOpen && (
            <motion.div
              id="mobile-nav-menu"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden w-full mt-2 rounded-3xl bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-[0_16px_36px_rgba(0,0,0,0.12)] p-4 space-y-2 text-sm font-semibold text-[#030B3D]"
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

      {/* 2. HERO SECTION — Clean product-first hero */}
      <section className="relative min-h-[620px] md:min-h-[720px] lg:h-[88vh] lg:min-h-[720px] lg:max-h-[860px] flex items-center bg-[#FAF8F5] border-b border-stone-200/40 overflow-hidden">
        
        {/* Clean brand backdrop glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-[#593CFF]/8 blur-3xl" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full max-w-[1520px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 pt-32 pb-14 md:pt-28 md:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
          <div className="lg:col-span-7 xl:col-span-7 w-full max-w-xl lg:max-w-none bg-[#FAF8F5]/85 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-5 sm:p-0 rounded-3xl border border-[#030B3D]/10 sm:border-0 shadow-xs sm:shadow-none">
            
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
                  Discover Indian tech talent, agree on project expectations, and see how milestone workflows run.
                </motion.p>

                {/* Offer Line */}
                <div className="overflow-hidden mb-5 md:mb-6">
                  <p 
                    className="font-medium text-[#030B3D] leading-[1.45] max-w-[32em] text-xs sm:text-sm bg-[#593CFF]/8 border border-[#593CFF]/20 px-3.5 py-2.5 rounded-xl"
                  >
                    <strong>GigOra is in preview.</strong> Marketplace and workspaces are live; payments run in demo mode, so no real money moves yet.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full">
                  <Link
                    to="/marketplace"
                    className="rounded-full bg-[#593CFF] hover:bg-[#472fe0] px-7 py-3.5 text-sm md:text-base font-bold text-white shadow-[0_16px_32px_-16px_rgba(89,60,255,0.7)] active:scale-95 transition-all text-center min-h-[48px] flex items-center justify-center cursor-pointer"
                  >
                    Browse open projects
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-full bg-white border border-[#030B3D]/20 text-[#030B3D] hover:bg-stone-50 px-6 py-3.5 text-sm md:text-base font-bold shadow-xs active:scale-95 transition-all text-center min-h-[48px] flex items-center justify-center cursor-pointer"
                  >
                    Post a project →
                  </Link>
                  <a
                    href="#how-it-works"
                    className="text-xs sm:text-sm font-bold text-[#030B3D] underline underline-offset-4 hover:no-underline text-center sm:text-left py-2 flex items-center justify-center sm:justify-start cursor-pointer"
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
                  Showcase your work and explore milestone-based freelance collaboration.
                </motion.p>

                {/* Offer Line */}
                <div className="overflow-hidden mb-5 md:mb-6">
                  <p 
                    className="font-medium text-[#030B3D] leading-[1.45] max-w-[32em] text-xs sm:text-sm bg-[#593CFF]/8 border border-[#593CFF]/20 px-3.5 py-2.5 rounded-xl"
                  >
                    <strong>GigOra is in preview.</strong> Marketplace and workspaces are live; payments run in demo mode, so no real money moves yet.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full">
                  <Link
                    to="/marketplace"
                    className="rounded-full bg-[#030B3D] hover:bg-[#593CFF] px-8 py-3.5 text-sm md:text-base font-bold text-white shadow-md active:scale-95 transition-all text-center min-h-[48px] flex items-center justify-center cursor-pointer"
                  >
                    Find work as a freelancer
                  </Link>
                  <a
                    href="#choose-path"
                    className="text-xs sm:text-sm font-bold text-[#030B3D] underline underline-offset-4 hover:no-underline text-center sm:text-left py-2 flex items-center justify-center sm:justify-start cursor-pointer"
                  >
                    See developer perks →
                  </a>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Floating Product Browser Mockup Card */}
          <div className="lg:col-span-5 xl:col-span-5 block mt-8 lg:mt-0 relative" data-aos="fade-up" data-aos-delay="150">
            {/* Browser Frame */}
            <div className="relative max-w-[460px] mx-auto lg:ml-auto rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-15px_rgba(3,11,61,0.18)] overflow-hidden">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/90 border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-[11px] text-slate-500 font-mono">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>gigora.in/marketplace</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live
                </span>
              </div>

              {/* Window Body: Real Marketplace Preview */}
              <div className="p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Featured Open Gigs</span>
                  <Link to="/marketplace" className="text-[11px] font-semibold text-indigo-600 hover:underline">
                    View all →
                  </Link>
                </div>

                {/* Dynamic Gigs from Database or Empty State */}
                {featuredGigs.length === 0 ? (
                  <p className="text-[11px] text-slate-500 text-center py-6">
                    No open projects right now. Check back soon.
                  </p>
                ) : (
                  featuredGigs.map((gig) => (
                    <Link
                      key={gig._id}
                      to={`/gigs/${gig._id}`}
                      className="block rounded-xl border border-slate-200 bg-white p-3.5 hover:border-indigo-300 hover:shadow-xs transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {gig.category}
                        </span>
                        <span className="text-[11px] font-bold text-slate-900">
                          ₹{Number(gig.budget || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <h4 className="mt-2 text-xs font-bold text-slate-900 line-clamp-1">{gig.title}</h4>
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">{gig.description}</p>
                      <div className="mt-2.5 flex gap-1 border-t border-slate-100 pt-2">
                        {(gig.skillsRequired || []).slice(0, 2).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Bottom Quick Bar */}
              <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Demo data · No real payments</span>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-1 font-bold text-[11px] text-indigo-600 hover:text-indigo-700"
                >
                  Explore marketplace →
                </Link>
              </div>
            </div>
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
                <h4 className="font-bold text-xs sm:text-sm text-[#030B3D] leading-tight">
                  Milestone Tracking
                </h4>
                <p className="text-[10px] sm:text-xs text-stone-500 leading-tight mt-0.5 truncate sm:overflow-visible">Live tracking • Demo payments</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 justify-start p-2.5 sm:p-3 rounded-2xl bg-stone-50/80 md:bg-transparent border border-stone-200/60 md:border-0 shadow-xs md:shadow-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-[#030B3D] leading-tight">
                  Proof Portfolios
                </h4>
                <p className="text-[10px] sm:text-xs text-stone-500 leading-tight mt-0.5 truncate sm:overflow-visible">GitHub repos &amp; live prototypes</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. POPULAR TECH SERVICES QUICK ROW */}
      <section id="categories" className="scroll-mt-28 py-8 sm:py-10 bg-slate-50/70 border-b border-slate-200/80 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 xl:gap-5">
            
            {/* 1. AI & ML Services */}
            <button 
              onClick={() => navigate('/marketplace?category=Data%20Science%20%26%20AI')}
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
              onClick={() => navigate('/marketplace?category=Web%20Development')}
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
              onClick={() => navigate('/marketplace?category=Mobile%20App%20Development')}
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
              onClick={() => navigate('/marketplace?category=UI%2FUX%20Design')}
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
              onClick={() => navigate('/marketplace?category=DevOps%20%26%20Cloud')}
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
              onClick={() => navigate('/marketplace?category=Backend%20%26%20APIs')}
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
      <section id="how-it-works" className="scroll-mt-28 py-16 sm:py-20 bg-[#FAF8F5] border-b border-stone-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14" data-aos="fade-up">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#593CFF] bg-[#593CFF]/10 px-4 py-1.5 rounded-full border border-[#593CFF]/20">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#030B3D] tracking-tight mt-3 mb-3">
              How GigOra Works
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              A transparent milestone-based collaboration model, designed for clear project delivery.
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
                  Review deliverables through a demo walkthrough or GitHub pull request before confirming sprint completion.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center text-xs font-semibold text-emerald-600">
                Review · Sprint Confirmation
              </div>
            </div>

          </div>

          {/* Live Workflow Note */}
          <div className="mt-10 p-4 sm:p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 max-w-3xl mx-auto text-center" data-aos="fade-up">
            <p className="text-xs sm:text-sm font-medium text-indigo-950">
              <strong>Notice:</strong> Proposals, milestones, reviews and delivery tracking are live. Payments are demo-only for now.
            </p>
          </div>

        </div>
      </section>

      {/* 5. CHOOSE YOUR PATH (Audience Specific Cards for Client & Freelancer) */}
      <section id="choose-path" className="scroll-mt-28 py-14 lg:py-20 bg-white border-b border-stone-200/80">
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
                  Discuss project requirements and agree on deliverables before work starts. Deliverables and acceptance criteria are agreed upfront.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Milestone deliverables, sprint dates & budgets upfront',
                    'GitHub PR & live staging inspection workflow',
                    'Milestone review and confirmation workflow',
                    'Active workspace for founders and technical talent'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                      <Check className="w-4 h-4 text-[#593CFF] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link 
                to="/signup" 
                className="rounded-full bg-[#030B3D] hover:bg-[#593CFF] text-white text-center py-3.5 px-6 font-bold text-sm shadow-sm hover:shadow-md transition-all block cursor-pointer"
              >
                Join as Client
              </Link>
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
                    'Showcase GitHub repos, commits, and live prototypes',
                    'Milestone scopes agreed and locked before kickoff',
                    'Direct rupee milestone agreements (demo mode)',
                    'Verified talent onboarding & instant proposal submissions'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link 
                to="/signup" 
                className="rounded-full bg-[#593CFF] hover:bg-[#472fe0] text-white text-center py-3.5 px-6 font-bold text-sm shadow-sm hover:shadow-md transition-all block cursor-pointer"
              >
                Join as Freelancer
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 9. CORE FEATURES */}
      <section id="features" className="scroll-mt-28 py-14 lg:py-20 bg-[#FAF8F5] border-b border-stone-200/80 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16" data-aos="fade-up">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#593CFF] bg-[#593CFF]/10 px-4 py-1.5 rounded-full border border-[#593CFF]/20">
              ENGINEERED FOR TRUST
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-[#030B3D] tracking-tight mt-4 mb-4">
              Designed for serious technical projects
            </h2>
            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto">
              Everything you need to run a project, built into one workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { title: 'Proposals & Bidding', desc: 'Clients post projects, freelancers send bids, clients compare and accept.', icon: Users, border: 'hover:border-purple-300' },
              { title: 'Milestone Tracking', desc: 'Split projects into milestones and approve each deliverable step by step.', icon: ShieldCheck, border: 'hover:border-emerald-300' },
              { title: 'Real-time Chat', desc: 'Message your client or freelancer instantly, with read receipts.', icon: Zap, border: 'hover:border-blue-300' },
              { title: 'Reviews & Ratings', desc: 'Clients and freelancers build trust with reviews after completion.', icon: CheckCircle2, border: 'hover:border-amber-300' },
              { title: 'Document Uploads', desc: 'Share briefs, designs and PDFs securely with file validation.', icon: Layers, border: 'hover:border-violet-300' },
              { title: 'Smart Notifications', desc: 'Get updates for proposals, milestones and messages in real time.', icon: Wallet, border: 'hover:border-rose-300' }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                data-aos="fade-up"
                data-aos-delay={idx * 25}
                className={`group p-8 rounded-3xl bg-white border border-stone-200/80 ${feature.border} hover:shadow-[0_20px_40px_-15px_rgba(3,11,61,0.08)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-[#593CFF] shadow-xs group-hover:scale-110 group-hover:bg-[#593CFF] group-hover:text-white transition-all duration-300 mb-5">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-[#030B3D] mb-2.5 group-hover:text-[#593CFF] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed font-normal">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. TRANSPARENT FAQ: Fees, Launch Timing, Verification, Payment Protection */}
      <section id="faq" className="scroll-mt-28 py-14 lg:py-20 bg-white border-b border-stone-200/80">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14" data-aos="fade-up">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#593CFF] bg-[#593CFF]/10 px-4 py-1.5 rounded-full border border-[#593CFF]/20">
              TRANSPARENCY FIRST
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-[#030B3D] tracking-tight mt-4 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Clear answers about how GigOra works today.
            </p>
          </div>

          <div className="space-y-4" data-aos="fade-up" data-aos-delay="50">
            {[
              { q: 'Is GigOra free right now?', a: 'Yes. Browsing projects, posting them and sending proposals are free during preview. Payments run in demo mode, so no real money moves.' },
              { q: 'How do milestones work?', a: 'Clients split a project into milestones. Freelancers submit work for each milestone, and clients review and approve it before it is marked complete.' },
              { q: 'How are freelancer profiles reviewed?', a: 'Profiles are self-serve right now. You can view skills, bio and reviews on each public profile. Formal verification is not live yet.' },
              { q: 'What are the platform fees?', a: 'No fees during preview. Fee details will be published before real payments go live.' }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl border border-stone-200/90 bg-white overflow-hidden shadow-xs hover:border-stone-300 transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  id={`faq-btn-${idx}`}
                  aria-expanded={openFaq === idx}
                  aria-controls={`faq-answer-${idx}`}
                  className="w-full flex items-center justify-between p-6 text-left text-base sm:text-lg font-display font-bold text-[#030B3D] hover:text-[#593CFF] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-stone-100 shrink-0 ml-4 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 bg-[#593CFF] text-white' : 'text-stone-500'}`}>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>
                {openFaq === idx && (
                  <div 
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-btn-${idx}`}
                    className="px-6 pb-6 pt-1 text-sm sm:text-base text-stone-600 border-t border-stone-100 leading-relaxed"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FINAL PRODUCT CTA BANNER */}
      <section className="py-24 lg:py-28 bg-[#030B3D] text-white relative overflow-hidden">
        <div className="absolute -top-20 right-1/4 w-96 h-96 bg-[#593CFF]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-4xl px-4 text-center relative z-10" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight mb-5 text-balance">
            Ready to start your next project?
          </h2>
          <p className="text-base sm:text-lg text-white/70 mb-9 max-w-2xl mx-auto">
            Post a project or find work with clear milestones. Free during preview, payments in demo mode.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup" className="rounded-full bg-[#593CFF] hover:bg-[#472fe0] px-8 py-4 font-bold text-sm active:scale-95 transition-all text-center">
              Post a project
            </Link>
            <Link to="/marketplace" className="rounded-full bg-white/10 border border-white/20 hover:bg-white/15 px-8 py-4 font-bold text-sm active:scale-95 transition-all text-center">
              Browse projects
            </Link>
          </div>
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
                India's milestone-based marketplace for technical talent.
              </p>
              <div className="pt-1 text-[11px] text-slate-500 font-medium">
                Milestone Workflow · Clear Criteria · Portfolio Showcase
              </div>
            </div>
            
            {/* Nav Columns: 2 cols on mobile, 3 on sm/md */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold text-white mb-3.5 uppercase tracking-wider text-[11px]">Product</h4>
                <ul className="space-y-2.5 font-medium">
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                  <li><a href="#choose-path" className="hover:text-white transition-colors">Clients &amp; Devs</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                  <li><Link to="/about" className="text-indigo-400 hover:text-white transition-colors font-bold">About GigOra</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-3.5 uppercase tracking-wider text-[11px]">Solutions</h4>
                <ul className="space-y-2.5 font-medium">
                  <li><Link to="/marketplace?category=Web%20Development" className="text-slate-300 hover:text-white transition-colors">Web &amp; Mobile Apps</Link></li>
                  <li><Link to="/marketplace?category=AI%20%26%20Machine%20Learning" className="text-slate-300 hover:text-white transition-colors">AI &amp; Automation</Link></li>
                  <li><Link to="/marketplace?category=UI%2FUX%20Design" className="text-slate-300 hover:text-white transition-colors">Product Design UI/UX</Link></li>
                  <li><Link to="/marketplace?category=DevOps%20%26%20Cloud" className="text-slate-300 hover:text-white transition-colors">Cloud &amp; DevOps</Link></li>
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <h4 className="font-bold text-white mb-3.5 uppercase tracking-wider text-[11px]">Legal &amp; Trust</h4>
                <ul className="space-y-2.5 font-medium">
                  <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><span className="text-slate-300">Milestone Workflow</span></li>
                  <li><span className="text-slate-300">Code Acceptance Criteria</span></li>
                </ul>
              </div>
            </div>

          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-xs text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <p>© 2026 GigOra Technologies. All rights reserved.</p>
              <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
              <Link to="/about" className="hover:text-slate-300 transition-colors">About</Link>
            </div>
            <p className="font-medium text-slate-400">Built for focused engineering. Zero noise.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
