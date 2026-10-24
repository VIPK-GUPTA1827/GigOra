import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Compass, Menu, X, ArrowRight,
  Sparkles, ShieldCheck
} from 'lucide-react';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All India');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const cityQuery = selectedCity !== 'All India' ? `&city=${selectedCity}` : '';
    navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}${cityQuery}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all">

      {/* ── Main Navigation Bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        
        {/* Brand Logo */}
        <Logo size="md" />

        {/* Central Clean Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/marketplace"
            className={`text-xs font-semibold text-slate-600 hover:${theme.textAccent} px-3.5 py-2 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5`}
          >
            <Compass className={`w-3.5 h-3.5 ${theme.textAccent}`} />
            Explore Gigs
          </Link>
          <a
            href="#categories"
            className={`text-xs font-semibold text-slate-600 hover:${theme.textAccent} px-3.5 py-2 rounded-lg hover:bg-slate-50 transition`}
          >
            Categories
          </a>
          <a
            href="#how-it-works"
            className={`text-xs font-semibold text-slate-600 hover:${theme.textAccent} px-3.5 py-2 rounded-lg hover:bg-slate-50 transition`}
          >
            How It Works
          </a>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium px-3.5 py-2 bg-slate-50 rounded-lg border border-slate-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Milestone Workflow</span>
          </div>
        </nav>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3.5 py-2 rounded-xl transition"
          >
            Sign in
          </Link>

          <Link
            to="/signup"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            Join GigOra
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            to="/login"
            className="text-xs font-bold text-slate-700 px-2 py-1"
          >
            Sign in
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-5 space-y-4 shadow-lg">
          <form onSubmit={handleSearch} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 border border-slate-200">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills, gigs, developers..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Search
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              Explore Gigs
            </Link>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center shadow-sm transition"
              >
                Join GigOra
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
