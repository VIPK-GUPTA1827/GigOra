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
  Search,
  Cpu,
  Palette,
  Smartphone,
  Cloud,
  Terminal,
  Database,
  Check,
  Menu,
  X
} from 'lucide-react';

import AOS from 'aos';
import 'aos/dist/aos.css';
import api from '../utils/api';
import Seo from '../components/Seo';

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('client');
  const [openFaq, setOpenFaq] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredGigs, setFeaturedGigs] = useState([]);

  useEffect(() => {
    api.get('/api/gigs?status=open&limit=2')
      .then(res => setFeaturedGigs(res.data || []))
      .catch(() => setFeaturedGigs([]));
  }, []);

  useEffect(() => {
    AOS.refresh();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/marketplace');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] font-sans text-[#243040] selection:bg-[#2F6FAB] selection:text-white relative">
      <Seo canonical="https://gig-ora.vercel.app/" />
      
      {/* 1. TOP FLOATING NAVBAR (Sky Blue & Amber Theme) */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 py-3 px-3 sm:px-6 flex justify-center ${
        isScrolled 
          ? 'bg-[#EAF1F7]/95 backdrop-blur-md border-b border-[#DDE5ED] shadow-xs' 
          : 'bg-transparent'
      }`}>
        <div className="w-full max-w-[1240px] flex flex-col items-center">
          <nav className={`w-full rounded-full backdrop-blur-md px-4 sm:px-7 py-2.5 sm:py-3 flex items-center justify-between transition-all duration-300 ${
            isScrolled 
              ? 'bg-white/95 border border-[#DDE5ED] shadow-sm' 
              : 'bg-white/90 border border-[#DDE5ED]/80 shadow-xs'
          }`}>
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#2F6FAB] text-white font-black text-base sm:text-lg shadow-xs group-hover:bg-[#255889] transition-colors">
                G
              </div>
              <span className="text-lg sm:text-xl font-display font-black text-[#243040] tracking-tight">GigOra</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-[14px] font-semibold text-[#5A6675]">
              <a href="#how-it-works" className="hover:text-[#2F6FAB] transition-colors py-1">
                How It Works
              </a>
              <a href="#categories" className="hover:text-[#2F6FAB] transition-colors py-1">
                Tech Services
              </a>
              <a href="#choose-path" className="hover:text-[#2F6FAB] transition-colors py-1">
                Clients &amp; Devs
              </a>
              <a href="#faq" className="hover:text-[#2F6FAB] transition-colors py-1">
                FAQ
              </a>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link 
                to="/login"
                className="text-xs sm:text-sm font-bold text-[#243040] hover:text-[#2F6FAB] px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="rounded-full bg-[#F2A541] hover:bg-[#D9943A] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#243040] shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Post a Project
              </Link>
              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className="lg:hidden p-2 rounded-full bg-[#EAF1F7] text-[#243040] hover:bg-[#DDE5ED] transition-colors"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </nav>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden w-full mt-2 rounded-2xl bg-white border border-[#DDE5ED] shadow-lg p-4 space-y-2 text-sm font-semibold text-[#243040]"
            >
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl hover:bg-[#EAF1F7] transition-colors"
              >
                How It Works
              </a>
              <a 
                href="#categories" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl hover:bg-[#EAF1F7] transition-colors"
              >
                Tech Services
              </a>
              <a 
                href="#choose-path" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl hover:bg-[#EAF1F7] transition-colors"
              >
                Clients &amp; Devs
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl hover:bg-[#EAF1F7] transition-colors"
              >
                FAQ
              </a>
              <div className="pt-3 border-t border-[#DDE5ED] flex items-center gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl border border-[#DDE5ED] text-xs font-bold text-[#243040]"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl bg-[#F2A541] text-[#243040] text-xs font-bold shadow-xs hover:bg-[#D9943A]"
                >
                  Post a Project
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* 2. SUB-NAV CATEGORY PILLS (Mockup Feature) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-24 sm:pt-28 pb-6 px-4 flex justify-center"
      >
        <div className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar py-1 max-w-full">
          {[
            { label: 'Fullstack Web', cat: 'Web Development' },
            { label: 'Mobile Apps', cat: 'Mobile App Development' },
            { label: 'AI & ML', cat: 'Data Science & AI' },
            { label: 'UI/UX Design', cat: 'UI/UX Design' },
            { label: 'Cloud & DevOps', cat: 'DevOps & Cloud' }
          ].map((pill, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => navigate(`/marketplace?category=${encodeURIComponent(pill.cat)}`)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#5A6675] bg-white border border-[#DDE5ED] hover:border-[#2F6FAB] hover:text-[#2F6FAB] hover:bg-[#EAF1F7] transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
            >
              {pill.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 3. HERO SECTION (Spacious Wide SaaS Layout) */}
      <section className="relative pt-8 pb-20 sm:pb-24 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-center">
            
            {/* Left Column: Content, Search Bar, CTAs */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-7 xl:col-span-7 space-y-6 max-w-2xl"
            >
              
              {/* Headline */}
              <h1 className="font-display font-black text-[#243040] tracking-tight leading-[1.14] text-3xl sm:text-4xl md:text-5xl lg:text-[3.35rem]">
                Hire Indian developers and designers, <span className="text-[#2F6FAB]">one milestone at a time.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#5A6675] font-normal leading-relaxed">
                Find developers and designers, agree on what you expect, and track the work milestone by milestone.
              </p>

              {/* Honest Preview Notice */}
              <div className="bg-[#EAF1F7] border border-[#DDE5ED] px-4 py-3 rounded-xl text-xs sm:text-sm text-[#243040] font-medium leading-relaxed">
                <strong>GigOra is in preview.</strong> Marketplace and workspaces are live; payments run in demo mode, so no real money moves yet.
              </div>

              {/* Search Bar Input */}
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <div className="flex items-center bg-white border border-[#DDE5ED] rounded-full p-2 shadow-xs focus-within:border-[#2F6FAB] focus-within:ring-2 focus-within:ring-[#2F6FAB]/15 transition-all">
                  <Search className="w-4 h-4 text-[#5A6675] ml-3.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What skill are you looking for?"
                    className="w-full bg-transparent px-3 py-2 text-sm text-[#243040] placeholder-[#5A6675]/70 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-[#F2A541] hover:bg-[#D9943A] text-[#243040] px-6 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Browse Gigs
                  </button>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                  <Link
                    to="/signup"
                    className="rounded-full bg-[#F2A541] hover:bg-[#D9943A] text-[#243040] px-7 py-3.5 text-sm font-bold shadow-xs transition-colors block text-center cursor-pointer"
                  >
                    Hire Tech Talent
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                  <Link
                    to="/marketplace"
                    className="rounded-full bg-white border border-[#2F6FAB] text-[#2F6FAB] hover:bg-[#EAF1F7] px-7 py-3.5 text-sm font-bold shadow-xs transition-colors block text-center cursor-pointer"
                  >
                    Work as a Freelancer
                  </Link>
                </motion.div>
              </div>

            </motion.div>

            {/* Right Column: Angular Geometric Frame with Developer Image */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="lg:col-span-5 xl:col-span-5 relative flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-[460px] aspect-[4/4.5] group">
                
                {/* Angular Geometric Background Frame (#2F6FAB) */}
                <div className="absolute inset-0 rounded-3xl bg-[#2F6FAB] translate-x-3.5 translate-y-3.5 -rotate-1 transition-transform duration-300 group-hover:translate-x-4 group-hover:translate-y-4" />
                
                {/* Alt Backdrop Card (#EAF1F7) */}
                <div className="absolute inset-0 rounded-3xl bg-[#EAF1F7] -translate-x-1.5 -translate-y-1.5 transition-transform duration-300 group-hover:-translate-x-2 group-hover:-translate-y-2" />

                {/* Main Visual Image (3D Developer Character) */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white transition-all duration-300 group-hover:shadow-lg">
                  <img
                    src="/images/gigora_3d_developer_hero.jpg"
                    alt="GigOra 3D Developer working on milestone project"
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                </div>

              </div>
            </motion.div>

          </div>

          {/* 4. THREE PROOF CARDS STRIP (Mockup Layout) */}
          <div className="mt-16 sm:mt-20 pt-10 border-t border-[#DDE5ED] grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Milestone Escrow */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-5 border border-[#DDE5ED] hover:border-[#2F6FAB] hover:shadow-xs transition-colors flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EAF1F7] text-[#2F6FAB] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-[#243040] text-sm sm:text-base">Milestone Escrow</h3>
                <p className="text-xs text-[#5A6675] mt-1 leading-relaxed">
                  Agree on milestones first. Payment stays safely locked until the agreed deliverable is submitted.
                </p>
              </div>
            </motion.div>

            {/* Card 2: PR & Staging Reviews */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="bg-white rounded-2xl p-5 border border-[#DDE5ED] hover:border-[#2F6FAB] hover:shadow-xs transition-colors flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EAF1F7] text-[#2F6FAB] flex items-center justify-center shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-[#243040] text-sm sm:text-base">PR &amp; Staging Reviews</h3>
                <p className="text-xs text-[#5A6675] mt-1 leading-relaxed">
                  Inspect code via pull requests and live staging links before approving each milestone release.
                </p>
              </div>
            </motion.div>

            {/* Card 3: About GigOra */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="bg-white rounded-2xl p-5 border border-[#DDE5ED] hover:border-[#2F6FAB] hover:shadow-xs transition-colors flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EAF1F7] text-[#2F6FAB] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-[#243040] text-sm sm:text-base">About GigOra</h3>
                <p className="text-xs text-[#5A6675] mt-1 leading-relaxed">
                  A dedicated milestone platform built for technical founders and Indian software developers.
                </p>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* 5. POPULAR TECH SERVICES SECTION (Background: Alt #EAF1F7) */}
      <section id="categories" className="scroll-mt-24 py-16 bg-[#EAF1F7] border-y border-[#DDE5ED]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2F6FAB] bg-white px-3.5 py-1.5 rounded-full border border-[#DDE5ED]">
              EXPLORE TALENT BY DOMAIN
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#243040] mt-3 mb-2">
              Popular Tech Services
            </h2>
            <p className="text-[#5A6675] text-sm">
              Work with vetted freelancers across modern technical stacks.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {[
              { title: 'AI & ML', sub: 'LLMs & Vision', icon: Cpu, cat: 'Data Science & AI' },
              { title: 'Fullstack Web', sub: 'React, Next, Node', icon: Code2, cat: 'Web Development' },
              { title: 'Mobile Apps', sub: 'Flutter, React Native', icon: Smartphone, cat: 'Mobile App Development' },
              { title: 'UI/UX Design', sub: 'Figma & Design Systems', icon: Palette, cat: 'UI/UX Design' },
              { title: 'Cloud & DevOps', sub: 'AWS, Docker & CI/CD', icon: Cloud, cat: 'DevOps & Cloud' },
              { title: 'Data & Backend', sub: 'SQL, Python & APIs', icon: Database, cat: 'Backend & APIs' }
            ].map((item, idx) => (
              <motion.button 
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/marketplace?category=${encodeURIComponent(item.cat)}`)}
                className="text-left group p-4 rounded-2xl bg-white border border-[#DDE5ED] hover:border-[#2F6FAB] hover:shadow-sm transition-colors cursor-pointer"
              >
                <div className="h-9 w-9 rounded-xl bg-[#EAF1F7] text-[#2F6FAB] flex items-center justify-center mb-3 group-hover:bg-[#2F6FAB] group-hover:text-white transition-colors">
                  <item.icon className="h-4.5 w-4.5" />
                </div>
                <p className="font-bold text-[#243040] text-xs sm:text-sm group-hover:text-[#2F6FAB] transition-colors truncate">
                  {item.title}
                </p>
                <p className="text-[11px] text-[#5A6675] mt-0.5 truncate">
                  {item.sub}
                </p>
              </motion.button>
            ))}
          </div>

        </div>
      </section>

      {/* 6. HOW IT WORKS: 3 STEPS (Background: Main #F7F9FB) */}
      <section id="how-it-works" className="scroll-mt-24 py-16 sm:py-20 bg-[#F7F9FB]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2F6FAB] bg-[#EAF1F7] px-3.5 py-1.5 rounded-full border border-[#DDE5ED]">
              SIMPLE 3-STEP PROCESS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#243040] mt-3 mb-2">
              How GigOra Works
            </h2>
            <p className="text-[#5A6675] text-sm">
              Three steps from idea to delivered work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-2xl p-7 border border-[#DDE5ED] hover:border-[#2F6FAB] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-display font-black text-[#2F6FAB]/40">01</span>
                  <div className="w-10 h-10 rounded-xl bg-[#EAF1F7] text-[#2F6FAB] flex items-center justify-center">
                    <Terminal className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-display font-bold text-[#243040] mb-2">
                  1. Share your project
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6675] leading-relaxed">
                  Tell us what you're building, what skills you need and what you expect to get. Freelancers who fit will send you proposals.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#DDE5ED] text-xs font-semibold text-[#2F6FAB]">
                Clear scope, no spam
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-2xl p-7 border border-[#DDE5ED] hover:border-[#2F6FAB] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-display font-black text-[#2F6FAB]/40">02</span>
                  <div className="w-10 h-10 rounded-xl bg-[#EAF1F7] text-[#2F6FAB] flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-display font-bold text-[#243040] mb-2">
                  2. Agree on milestones
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6675] leading-relaxed">
                  Agree on what gets delivered, by when and for how much, before work starts. Milestones keep everyone on the same page.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#DDE5ED] text-xs font-semibold text-[#2F6FAB]">
                Work in stages
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-2xl p-7 border border-[#DDE5ED] hover:border-[#2F6FAB] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-display font-black text-[#2F6FAB]/40">03</span>
                  <div className="w-10 h-10 rounded-xl bg-[#EAF1F7] text-[#2F6FAB] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-display font-bold text-[#243040] mb-2">
                  3. Review the work
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6675] leading-relaxed">
                  Check the work through a demo or a GitHub pull request, then mark the milestone as done.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#DDE5ED] text-xs font-semibold text-[#2F6FAB]">
                Review and sign off
              </div>
            </motion.div>

          </div>

          <div className="mt-8 p-3.5 rounded-xl bg-[#EAF1F7] border border-[#DDE5ED] text-center max-w-2xl mx-auto">
            <p className="text-xs font-medium text-[#243040]">
              <strong>Notice:</strong> Proposals, milestones, reviews and tracking all work today. Payments are demo-only for now.
            </p>
          </div>

        </div>
      </section>

      {/* 7. CHOOSE YOUR PATH (Background: Alt #EAF1F7) */}
      <section id="choose-path" className="scroll-mt-24 py-16 sm:py-20 bg-[#EAF1F7] border-y border-[#DDE5ED]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2F6FAB] bg-white px-3.5 py-1.5 rounded-full border border-[#DDE5ED]">
              FOR CLIENTS &amp; FREELANCERS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#243040] mt-3 mb-2">
              Made for clients and freelancers
            </h2>
            <p className="text-[#5A6675] text-sm">
              Hiring for your startup or looking for your next project? GigOra keeps both sides clear on what's expected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* Client Card */}
            <div className="rounded-2xl p-7 sm:p-8 bg-white border border-[#DDE5ED] hover:border-[#2F6FAB] hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1F7] text-[#2F6FAB] text-xs font-bold mb-4">
                  <Users className="w-3.5 h-3.5" /> For Founders &amp; Clients
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-[#243040] mb-2.5">
                  Build your product in clear stages
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6675] mb-5 leading-relaxed">
                  Talk through what you need and agree on the deliverables before work starts.
                </p>
                <ul className="space-y-2.5 mb-7">
                  {[
                    'Deliverables, dates and budget fixed upfront',
                    'Review work on GitHub or a live staging site',
                    "Approve each milestone when you're happy with it",
                    'A shared workspace for you and your freelancer'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#243040]">
                      <Check className="w-4 h-4 text-[#2F6FAB] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link 
                to="/signup" 
                className="rounded-full bg-[#F2A541] hover:bg-[#D9943A] text-[#243040] text-center py-3 px-6 font-bold text-sm shadow-xs transition-all block cursor-pointer"
              >
                Join as Client
              </Link>
            </div>

            {/* Freelancer Card */}
            <div className="rounded-2xl p-7 sm:p-8 bg-white border border-[#DDE5ED] hover:border-[#2F6FAB] hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1F7] text-[#2F6FAB] text-xs font-bold mb-4">
                  <Code2 className="w-3.5 h-3.5" /> For Tech Freelancers &amp; Devs
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-[#243040] mb-2.5">
                  Show your work. Find projects with a clear scope.
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6675] mb-5 leading-relaxed">
                  You'll know the scope, timeline and terms before you start, so there are no surprises halfway through.
                </p>
                <ul className="space-y-2.5 mb-7">
                  {[
                    'Share your GitHub repos and live projects',
                    'Scope agreed before you start',
                    'Milestone amounts in rupees (demo mode)',
                    'Quick signup and easy proposals'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#243040]">
                      <Check className="w-4 h-4 text-[#2F6FAB] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link 
                to="/signup" 
                className="rounded-full bg-white border border-[#2F6FAB] text-[#2F6FAB] hover:bg-[#EAF1F7] text-center py-3 px-6 font-bold text-sm shadow-xs transition-all block cursor-pointer"
              >
                Join as Freelancer
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 8. CORE PLATFORM FEATURES (Background: Main #F7F9FB) */}
      <section id="features" className="scroll-mt-24 py-16 sm:py-20 bg-[#F7F9FB]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2F6FAB] bg-[#EAF1F7] px-3.5 py-1.5 rounded-full border border-[#DDE5ED]">
              EVERYTHING YOU NEED
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#243040] mt-3 mb-2">
              Built for Technical Delivery
            </h2>
            <p className="text-[#5A6675] text-sm">
              Proposals, messages, files and milestones in one clean workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Proposals & Bidding', desc: 'Clients post projects, freelancers send proposals, and clients pick the best fit.', icon: Users },
              { title: 'Milestone Tracking', desc: "Break a project into milestones and approve each one as it's delivered.", icon: ShieldCheck },
              { title: 'Real-time Chat', desc: 'Message your client or freelancer directly in your workspace.', icon: Zap },
              { title: 'Reviews & Ratings', desc: 'Leave reviews after a project ends.', icon: CheckCircle2 },
              { title: 'Document Uploads', desc: 'Share briefs, designs and PDFs directly in your project workspace.', icon: Layers },
              { title: 'Smart Notifications', desc: 'Get notified when proposals, milestones or messages come in.', icon: Wallet }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-2xl bg-white border border-[#DDE5ED] hover:border-[#2F6FAB] hover:shadow-xs transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF1F7] text-[#2F6FAB] flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-display font-bold text-[#243040] mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6675] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. TRANSPARENT FAQ (Background: Alt #EAF1F7) */}
      <section id="faq" className="scroll-mt-24 py-16 sm:py-20 bg-[#EAF1F7] border-t border-[#DDE5ED]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2F6FAB] bg-white px-3.5 py-1.5 rounded-full border border-[#DDE5ED]">
              STRAIGHT ANSWERS
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#243040] mt-3 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-[#5A6675] text-sm">
              Honest answers about how GigOra works right now.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { q: 'Is GigOra free right now?', a: 'Yes. Browsing projects, posting them and sending proposals are free during preview. Payments run in demo mode, so no real money moves.' },
              { q: 'How do milestones work?', a: 'Clients split a project into milestones. Freelancers submit work for each milestone, and clients review and approve it before it is marked complete.' },
              { q: 'How are freelancer profiles reviewed?', a: "Anyone can create a profile for now. You can see skills, bio and reviews on each one. We don't verify profiles yet." },
              { q: 'What are the platform fees?', a: 'No fees during preview. Fee details will be published before real payments go live.' }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="rounded-xl border border-[#DDE5ED] bg-white overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-[#243040] hover:text-[#2F6FAB] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-[#EAF1F7] shrink-0 ml-3 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 bg-[#2F6FAB] text-white' : 'text-[#5A6675]'}`}>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </div>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5A6675] border-t border-[#DDE5ED]/60 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. FINAL PRODUCT CTA BANNER (Soft Charcoal #243040 + Amber Accent #F2A541) */}
      <section className="py-16 sm:py-20 bg-[#243040] text-white relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10 space-y-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight text-balance">
            Ready to start your next project?
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto">
            Post a project or find work with clear milestones. Free during preview, payments in demo mode.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
            <Link 
              to="/signup" 
              className="rounded-full bg-[#F2A541] hover:bg-[#D9943A] text-[#243040] px-7 py-3 text-sm font-bold shadow-xs active:scale-95 transition-all text-center"
            >
              Post a project
            </Link>
            <Link 
              to="/marketplace" 
              className="rounded-full bg-white/10 border border-white/25 hover:bg-white/20 text-white px-7 py-3 text-sm font-bold active:scale-95 transition-all text-center"
            >
              Browse projects
            </Link>
          </div>
        </div>
      </section>

      {/* 11. FOOTER (Background: Alt #EAF1F7, Text: #5A6675, Links: #2F6FAB) */}
      <footer className="bg-[#EAF1F7] text-[#5A6675] py-12 border-t border-[#DDE5ED] text-xs">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
            
            {/* Brand Column */}
            <div className="md:col-span-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2F6FAB] text-white font-bold text-sm">G</div>
                <span className="text-base font-bold text-[#243040] tracking-tight">
                  GigOra
                </span>
                <span className="text-[9px] bg-white text-[#2F6FAB] font-bold px-1.5 py-0.5 rounded border border-[#DDE5ED]">IN</span>
              </div>
              <p className="text-[#5A6675] max-w-sm text-xs leading-relaxed">
                India's milestone-based marketplace for technical talent.
              </p>
              <div className="pt-0.5 text-[11px] text-[#5A6675]/80">
                Milestones · Clear scope · Portfolios
              </div>
            </div>
            
            {/* Links Columns */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold text-[#243040] mb-3 uppercase tracking-wider text-[11px]">Product</h4>
                <ul className="space-y-2 font-medium">
                  <li><a href="/#how-it-works" className="hover:text-[#2F6FAB] transition-colors">How it works</a></li>
                  <li><a href="/#choose-path" className="hover:text-[#2F6FAB] transition-colors">Clients &amp; Devs</a></li>
                  <li><a href="/#features" className="hover:text-[#2F6FAB] transition-colors">Features</a></li>
                  <li><a href="/#faq" className="hover:text-[#2F6FAB] transition-colors">FAQ</a></li>
                  <li><Link to="/about" className="text-[#2F6FAB] hover:underline font-bold">About GigOra</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-[#243040] mb-3 uppercase tracking-wider text-[11px]">Solutions</h4>
                <ul className="space-y-2 font-medium">
                  <li><Link to="/marketplace?category=Web%20Development" className="hover:text-[#2F6FAB] transition-colors">Web &amp; Mobile Apps</Link></li>
                  <li><Link to="/marketplace?category=Data%20Science%20%26%20AI" className="hover:text-[#2F6FAB] transition-colors">AI &amp; Automation</Link></li>
                  <li><Link to="/marketplace?category=UI%2FUX%20Design" className="hover:text-[#2F6FAB] transition-colors">Product Design UI/UX</Link></li>
                  <li><Link to="/marketplace?category=DevOps%20%26%20Cloud" className="hover:text-[#2F6FAB] transition-colors">Cloud &amp; DevOps</Link></li>
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <h4 className="font-bold text-[#243040] mb-3 uppercase tracking-wider text-[11px]">Legal &amp; Trust</h4>
                <ul className="space-y-2 font-medium">
                  <li><Link to="/terms" className="hover:text-[#2F6FAB] transition-colors">Terms of Service</Link></li>
                  <li><Link to="/privacy" className="hover:text-[#2F6FAB] transition-colors">Privacy Policy</Link></li>
                  <li><a href="/#how-it-works" className="hover:text-[#2F6FAB] transition-colors">Milestone Workflow</a></li>
                  <li><a href="/#faq" className="hover:text-[#2F6FAB] transition-colors">Demo Payment Mode</a></li>
                </ul>
              </div>
            </div>

          </div>
          
          <div className="pt-6 border-t border-[#DDE5ED] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <p>© {new Date().getFullYear()} GigOra. All rights reserved.</p>
              <Link to="/terms" className="hover:text-[#2F6FAB] transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-[#2F6FAB] transition-colors">Privacy</Link>
              <Link to="/about" className="hover:text-[#2F6FAB] transition-colors">About</Link>
            </div>
            <p className="font-medium text-[#243040]">Built for people who build software.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
