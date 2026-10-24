import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, MapPin, CheckCircle2, ArrowRight, 
  Sparkles, ExternalLink, Code2, ShieldCheck, GitBranch
} from 'lucide-react';

const TALENTS = [
  {
    id: 'talent-1',
    name: 'Vipin Gupta',
    role: 'Full-Stack Developer (MERN / React)',
    city: 'Mumbai, MH',
    education: 'BSc Computer Science',
    rate: '₹800/hr',
    completedProjects: 5,
    rating: null,
    reviewsCount: 0,
    avatarBg: 'bg-indigo-600 text-white',
    initials: 'VG',
    bio: 'Specialized in production React, Node.js, and MongoDB architectures. Builds responsive UI with clean Tailwind CSS and REST/GraphQL APIs.',
    topSkills: ['React.js', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
    verifiedBadge: 'Showcase Developer'
  },
  {
    id: 'talent-2',
    name: 'Ananya Prabhu',
    role: 'UI/UX & Product Designer',
    city: 'Bengaluru, KA',
    education: 'Design & HCI',
    rate: '₹1,100/hr',
    completedProjects: 22,
    rating: 5.0,
    reviewsCount: 29,
    avatarBg: 'bg-rose-500 text-white',
    initials: 'AP',
    bio: 'Crafts high-converting SaaS interfaces, responsive web apps, and design tokens in Figma. Focuses on frictionless Indian user journeys.',
    topSkills: ['Figma', 'Design Systems', 'Mobile UX', 'Wireframing', 'Prototyping'],
    verifiedBadge: 'Top Rated'
  },
  {
    id: 'talent-3',
    name: 'Arjun Rathi',
    role: 'Python & AI Systems Engineer',
    city: 'Pune, MH',
    education: 'BE Information Tech',
    rate: '₹1,050/hr',
    completedProjects: 19,
    rating: 4.9,
    reviewsCount: 24,
    avatarBg: 'bg-emerald-600 text-white',
    initials: 'AR',
    bio: 'Builds FastAPI backends, LangChain agent pipelines, automated web scrapers, and data ingestion workflows with Docker deployment.',
    topSkills: ['Python', 'FastAPI', 'LangChain', 'Docker', 'Web Scraping'],
    verifiedBadge: 'Featured Builder'
  },
  {
    id: 'talent-4',
    name: 'Sneha Mukherjee',
    role: 'Cross-Platform Mobile Engineer',
    city: 'Delhi NCR',
    education: 'BTech Computer Engineering',
    rate: '₹950/hr',
    completedProjects: 16,
    rating: 4.8,
    reviewsCount: 21,
    avatarBg: 'bg-sky-600 text-white',
    initials: 'SM',
    bio: 'Cross-platform iOS and Android developer using Flutter and Firebase. Deep expertise in smooth state management, push notifications, and Razorpay integration.',
    topSkills: ['Flutter', 'Dart', 'Firebase', 'State Management', 'REST APIs'],
    verifiedBadge: 'Featured Builder'
  }
];

const TalentSpotlight = () => {
  return (
    <section className="py-20 bg-[#FAF9FE] border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200/70 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Featured Indian Tech Talent</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Meet Top Freelance Builders
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl">
              Authentic developers and designers across Indian tech hubs, showcasing code portfolios and milestone tracking.
            </p>
          </div>

          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 transition group self-start md:self-auto"
          >
            <span>Browse All Freelancers</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Talent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TALENTS.map((talent) => (
            <div
              key={talent.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 p-6 flex flex-col justify-between"
            >
              <div>
                {/* Profile Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${talent.avatarBg} font-black text-sm flex items-center justify-center shadow-md shadow-indigo-600/15 shrink-0`}>
                      {talent.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-black text-slate-900">{talent.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{talent.city}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role & Education */}
                <div className="mb-3">
                  <div className="text-xs font-bold text-indigo-600">{talent.role}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{talent.education}</div>
                </div>

                {/* Rating & Rate stats */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-xs">
                  <div className="flex items-center gap-1">
                    {talent.reviewsCount > 0 ? (
                      <>
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-900">{talent.rating}</span>
                        <span className="text-slate-400 text-[11px]">({talent.reviewsCount})</span>
                      </>
                    ) : (
                      <span className="text-slate-500 text-[11px] font-semibold">New Talent • 0 reviews</span>
                    )}
                  </div>
                  <div className="font-black text-slate-900">
                    {talent.rate}
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-3 mb-4">
                  {talent.bio}
                </p>

                {/* Skill Chips */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {talent.topSkills.map((skill, idx) => (
                    <span 
                      key={idx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50/70 text-indigo-700 border border-indigo-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/register?intent=hire"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-indigo-600 text-slate-800 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <span>Invite to Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TalentSpotlight;
