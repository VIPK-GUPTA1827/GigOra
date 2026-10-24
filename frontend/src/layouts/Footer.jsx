import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Heart } from 'lucide-react';
import Logo from '../components/Logo';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Col 1: Brand Info */}
          <div className="col-span-2 space-y-4">
            <Logo size="md" showTagline={false} />
            <p className="text-slate-500 text-xs max-w-sm leading-relaxed">
              India’s dedicated marketplace connecting high-growth businesses with skilled developers, designers, and creative experts.
            </p>
            <div className="flex items-center gap-2 text-slate-600 text-[11px] font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Milestone Tracking • Secure Freelancer Contracts</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h5 className="text-slate-900 font-bold mb-3 text-xs uppercase tracking-wider">Categories</h5>
            <ul className="space-y-2 text-slate-500">
              <li><Link to="/marketplace?category=web-dev" className="hover:text-blue-600 transition">Web & Apps</Link></li>
              <li><Link to="/marketplace?category=ai-python" className="hover:text-blue-600 transition">AI & Automation</Link></li>
              <li><Link to="/marketplace?category=ui-ux" className="hover:text-blue-600 transition">UI/UX Design</Link></li>
              <li><Link to="/marketplace?category=video-motion" className="hover:text-blue-600 transition">Video Editing</Link></li>
              <li><Link to="/marketplace?category=mobile-apps" className="hover:text-blue-600 transition">Mobile Development</Link></li>
            </ul>
          </div>

          {/* Col 3: For Clients */}
          <div>
            <h5 className="text-slate-900 font-bold mb-3 text-xs uppercase tracking-wider">For Clients</h5>
            <ul className="space-y-2 text-slate-500">
              <li><a href="#how-it-works" className="hover:text-blue-600 transition">How to Hire</a></li>
              <li><Link to="/marketplace" className="hover:text-blue-600 transition">Browse Developer Profiles</Link></li>
              <li><span className="hover:text-blue-600 transition cursor-pointer">Milestone Escrow Policy</span></li>
              <li><span className="hover:text-blue-600 transition cursor-pointer">Dispute Resolution</span></li>
            </ul>
          </div>

          {/* Col 4: For Freelancers */}
          <div>
            <h5 className="text-slate-900 font-bold mb-3 text-xs uppercase tracking-wider">For Talent</h5>
            <ul className="space-y-2 text-slate-500">
              <li><Link to="/register" className="hover:text-blue-600 transition">Become a Freelancer</Link></li>
              <li><span className="hover:text-blue-600 transition cursor-pointer">Freelancer Community</span></li>
              <li><span className="hover:text-blue-600 transition cursor-pointer">Payout Guidelines</span></li>
              <li><span className="hover:text-blue-600 transition cursor-pointer">Direct UPI Settlement</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 mt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} GigOra IN. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>in Mumbai, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
