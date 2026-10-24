import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ShieldCheck, ArrowRight, MapPin, 
  Sparkles, CheckCircle2, Zap, Lock
} from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('All India');

  const handleSearch = (e) => {
    e.preventDefault();
    const cityQuery = city !== 'All India' ? `&city=${city}` : '';
    navigate(`/marketplace?search=${encodeURIComponent(query)}${cityQuery}`);
  };

  return (
    <div className="relative overflow-hidden pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/70 bg-gradient-to-b from-white via-indigo-50/20 to-[#FAF9FE]">
      
      {/* Background Soft Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-200/25 rounded-full blur-3xl pointer-events-none -z-10"></div>
      
      <div className="max-w-5xl mx-auto text-center space-y-8">
        
        {/* Eyebrow Trust Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold tracking-wide shadow-xs animate-in fade-in duration-300">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Milestone Escrow (Sandbox Mode) • Developer Showcase</span>
        </div>

        {/* High-Impact Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] max-w-4xl mx-auto">
          Hire India’s Top Tech Talent. <br />
          <span className="text-indigo-600">Work with 100% confidence.</span>
        </h1>

        {/* Descriptive Subtitle */}
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
          Connect directly with Indian developers, designers, and software engineers. Review developer code portfolios and explore simulated milestone workflows in our contract sandbox (Preview Mode).
        </p>

        {/* Central Premium Search Bar */}
        <form 
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-center gap-2 bg-white border border-slate-300/90 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-500/10 p-2.5 rounded-2xl shadow-xl shadow-slate-200/60 transition max-w-3xl mx-auto"
        >
          {/* City Hub Selector */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 border-b sm:border-b-0 sm:border-r border-slate-200 text-slate-700 text-xs font-semibold w-full sm:w-auto shrink-0">
            <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              aria-label="City Location"
              className="bg-transparent text-slate-800 outline-none cursor-pointer pr-2 text-xs font-bold"
            >
              <option value="All India">All India (Remote)</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Pune">Pune</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>

          {/* Search Query Input */}
          <div className="flex items-center gap-3 px-3 py-2 flex-grow w-full">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What skill or service are you looking for? (e.g. MERN, Python, UI/UX)..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none font-medium"
            />
          </div>

          {/* Search CTA Button */}
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-indigo-600/25 active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Search Talent</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Popular Trending Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-500 font-medium">
          <span className="text-slate-700 font-bold">Popular Services:</span>
          {['React & Next.js', 'Python & FastAPI', 'Figma UI/UX', 'AI Automation', 'Video Editing', 'Flutter Mobile'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setQuery(tag);
                navigate(`/marketplace?search=${encodeURIComponent(tag)}`);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition shadow-2xs cursor-pointer font-semibold"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* 3 Core Trust Guarantees */}
        <div className="pt-8 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900">Zero Platform Fee</div>
              <div className="text-xs text-slate-500">Free job posting & direct chat</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span>Simulated Escrow</span>
                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1 rounded">Sandbox</span>
              </div>
              <div className="text-xs text-slate-500">Sandbox Simulation • No Real Currency</div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span>Contract Tracking</span>
                <span className="text-[9px] font-bold bg-indigo-50 text-[#593CFF] px-1 rounded">Preview</span>
              </div>
              <div className="text-xs text-slate-500">Step-by-step milestone tracking</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;
