import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home as HomeIcon, Search, HelpCircle, ShieldCheck } from 'lucide-react';
import Seo from '../components/Seo';

export default function NotFound() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex flex-col justify-between font-sans text-[#243040]">
      <Seo 
        title="Page Not Found — GigOra" 
        description="The requested page could not be found on GigOra."
        noindex={true}
      />
      {/* Mini Header */}
      <header className="py-5 px-6 border-b border-[#DDE5ED] bg-white">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#2F6FAB] text-white font-black text-sm flex items-center justify-center">
              G
            </div>
            <span className="font-bold text-lg text-[#243040]">GigOra</span>
          </Link>
          <Link
            to="/marketplace"
            className="text-xs font-semibold text-[#2F6FAB] hover:underline"
          >
            Browse Gigs →
          </Link>
        </div>
      </header>

      {/* Main 404 Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-[#2F6FAB] bg-[#EAF1F7] px-3.5 py-1.5 rounded-full border border-[#DDE5ED]">
            Error 404
          </span>
          
          <h1 className="text-3xl sm:text-4xl font-display font-black text-[#243040] tracking-tight">
            Page Not Found
          </h1>
          
          <p className="text-sm text-[#5A6675] leading-relaxed">
            The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F2A541] hover:bg-[#D9943A] text-[#243040] px-6 py-3 text-sm font-bold shadow-xs active:scale-95 transition-all"
            >
              <HomeIcon className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <Link
              to="/marketplace"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white border border-[#2F6FAB] text-[#2F6FAB] hover:bg-[#EAF1F7] px-6 py-3 text-sm font-bold shadow-xs active:scale-95 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Explore Marketplace</span>
            </Link>
          </div>

          {/* Quick Helpful Links */}
          <div className="pt-8 border-t border-[#DDE5ED] text-left">
            <p className="text-xs font-bold text-[#243040] mb-3">Popular Pages:</p>
            <ul className="space-y-2 text-xs text-[#5A6675]">
              <li>
                <Link to="/#how-it-works" className="hover:text-[#2F6FAB] transition-colors flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2F6FAB]" />
                  <span>How Milestones Work</span>
                </Link>
              </li>
              <li>
                <Link to="/#faq" className="hover:text-[#2F6FAB] transition-colors flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-[#2F6FAB]" />
                  <span>Frequently Asked Questions</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#2F6FAB] transition-colors flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#EAF1F7] text-[#2F6FAB] text-[9px] flex items-center justify-center font-bold">i</span>
                  <span>About GigOra</span>
                </Link>
              </li>
            </ul>
          </div>
        </motion.div>
      </main>

      {/* Mini Footer */}
      <footer className="py-5 px-6 border-t border-[#DDE5ED] text-center text-xs text-[#5A6675] bg-[#EAF1F7]">
        <p>© {new Date().getFullYear()} GigOra. Built for people who build software.</p>
      </footer>
    </div>
  );
}
