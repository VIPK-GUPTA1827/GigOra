import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Code2, Cpu, Palette, Video, Smartphone, 
  MapPin, ArrowUpRight, Sparkles 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
  {
    id: 'web-dev',
    title: 'Full-Stack & Web Apps',
    description: 'Custom React, Next.js, Node.js, and API backend architectures.',
    icon: Code2,
    startingPrice: '₹2,500',
    skillTag: 'MERN • Next.js',
    badge: 'High Demand'
  },
  {
    id: 'ai-python',
    title: 'AI & Python Automation',
    description: 'LLM agents, web scraping, FastAPI backends, and data workflows.',
    icon: Cpu,
    startingPrice: '₹4,000',
    skillTag: 'FastAPI • LangChain',
    badge: 'Trending'
  },
  {
    id: 'ui-ux',
    title: 'UI/UX & Product Design',
    description: 'Figma prototypes, mobile-first design systems, and UX audits.',
    icon: Palette,
    startingPrice: '₹3,000',
    skillTag: 'Figma • Mobile UI',
    badge: 'Popular'
  },
  {
    id: 'video-motion',
    title: 'Video Editing & Motion',
    description: 'High-retention social reels, YouTube edits, and product promos.',
    icon: Video,
    startingPrice: '₹1,500',
    skillTag: 'Reels • Premiere',
    badge: 'Fast Delivery'
  },
  {
    id: 'mobile-apps',
    title: 'Mobile App Development',
    description: 'Cross-platform iOS and Android apps built with Flutter & React Native.',
    icon: Smartphone,
    startingPrice: '₹5,000',
    skillTag: 'Flutter • React Native',
    badge: 'Pro Tier'
  },
  {
    id: 'hyperlocal',
    title: 'Hyperlocal Tech Support',
    description: 'On-demand tech troubleshooting and setup across Mumbai, Bengaluru & Delhi.',
    icon: MapPin,
    startingPrice: '₹2,000',
    skillTag: 'Mumbai • Bengaluru',
    badge: 'On-Site / Remote'
  }
];

const Categories = () => {
  const { theme } = useTheme();

  return (
    <section id="categories" className="py-20 bg-white border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${theme.badge} text-xs font-bold mb-3`}>
              <Sparkles className={`w-3.5 h-3.5 ${theme.textAccent}`} />
              <span>Explore Marketplace</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Popular Services in India
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl">
              Discover specialists across modern tech stacks with transparent pricing and milestone tracking.
            </p>
          </div>

          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition group self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/marketplace?category=${cat.id}`}
                className="group relative bg-[#F8FAFC] hover:bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-indigo-500 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-xs">
                      <Icon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 transition">
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-600 font-semibold block text-[11px]">Starting from</span>
                    <span className="text-sm font-black text-slate-900">{cat.startingPrice}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 font-semibold group-hover:text-indigo-600 transition">
                    <span>{cat.skillTag}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Categories;
