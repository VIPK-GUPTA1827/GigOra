import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, Clock, CheckCircle2, ArrowRight, 
  Sparkles, Code2, Palette, Cpu, Smartphone, Video, FileText,
  ExternalLink, ShieldCheck
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const GIGS = [
  {
    id: 'gig-1',
    category: 'web',
    title: 'Full-Stack Next.js 14 SaaS Application with Auth & Database',
    seller: {
      name: 'Aarav Sharma',
      role: 'Full-Stack Developer',
      location: 'Mumbai, MH',
      initials: 'AS',
      avatarBg: 'bg-indigo-100 text-indigo-700',
      badge: 'Showcase Dev',
      rating: 4.9,
      reviewsCount: 42
    },
    thumbnailType: 'code',
    previewBadge: 'Next.js 14 + Tailwind',
    price: '₹5,499',
    deliveryTime: '3 Days',
    revisions: '2 Revisions',
    tags: ['Next.js', 'Tailwind', 'MongoDB', 'Auth']
  },
  {
    id: 'gig-2',
    category: 'design',
    title: 'Modern Figma UI/UX Design System & Interactive Prototypes',
    seller: {
      name: 'Tanvi Deshmukh',
      role: 'Product Designer',
      location: 'Pune, MH',
      initials: 'TD',
      avatarBg: 'bg-rose-100 text-rose-700',
      badge: 'Top Rated',
      rating: 5.0,
      reviewsCount: 31
    },
    thumbnailType: 'design',
    previewBadge: 'Figma Auto-Layout',
    price: '₹3,200',
    deliveryTime: '48 Hours',
    revisions: '3 Revisions',
    tags: ['Figma', 'Mobile UI', 'Design System', 'Wireframes']
  },
  {
    id: 'gig-3',
    category: 'ai',
    title: 'Python FastAPI Backend with RAG Pipeline & Web Scraping',
    seller: {
      name: 'Rohan Mehta',
      role: 'Backend & AI Engineer',
      location: 'Bengaluru, KA',
      initials: 'RM',
      avatarBg: 'bg-emerald-100 text-emerald-700',
      badge: 'Showcase Dev',
      rating: 4.9,
      reviewsCount: 28
    },
    thumbnailType: 'ai',
    previewBadge: 'FastAPI + LangChain',
    price: '₹4,200',
    deliveryTime: '2 Days',
    revisions: '2 Revisions',
    tags: ['FastAPI', 'Python', 'Docker', 'Automation']
  },
  {
    id: 'gig-4',
    category: 'mobile',
    title: 'Cross-Platform Mobile App for iOS & Android in Flutter',
    seller: {
      name: 'Karthik Iyer',
      role: 'Flutter Developer',
      location: 'Hyderabad, TS',
      initials: 'KI',
      avatarBg: 'bg-sky-100 text-sky-700',
      badge: 'Showcase Dev',
      rating: 4.8,
      reviewsCount: 19
    },
    thumbnailType: 'mobile',
    previewBadge: 'Flutter 3.x + Firebase',
    price: '₹6,800',
    deliveryTime: '5 Days',
    revisions: '3 Revisions',
    tags: ['Flutter', 'Firebase', 'State Management', 'Android/iOS']
  },
  {
    id: 'gig-5',
    category: 'video',
    title: 'High-Retention Short-Form Reels & YouTube Post-Production',
    seller: {
      name: 'Sameer Khan',
      role: 'Motion & Video Editor',
      location: 'Delhi NCR',
      initials: 'SK',
      avatarBg: 'bg-purple-100 text-purple-700',
      badge: 'Fast Delivery',
      rating: 4.9,
      reviewsCount: 53
    },
    thumbnailType: 'video',
    previewBadge: '4K Export + Captions',
    price: '₹1,800',
    deliveryTime: '24 Hours',
    revisions: 'Unlimited',
    tags: ['Premiere Pro', 'Motion Graphics', 'Subtitles', 'Reels']
  },
  {
    id: 'gig-6',
    category: 'content',
    title: 'Technical Documentation, OpenAPI Specs & Developer Articles',
    seller: {
      name: 'Neha Patel',
      role: 'Technical Writer',
      location: 'Ahmedabad, GJ',
      initials: 'NP',
      avatarBg: 'bg-amber-100 text-amber-700',
      badge: 'Pro Tier',
      rating: 4.9,
      reviewsCount: 17
    },
    thumbnailType: 'docs',
    previewBadge: 'Markdown + Diagrams',
    price: '₹2,100',
    deliveryTime: '2 Days',
    revisions: '2 Revisions',
    tags: ['API Docs', 'Markdown', 'Technical SEO', 'Postman']
  }
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Gigs' },
  { id: 'web', label: 'Web & Full-Stack' },
  { id: 'ai', label: 'Python & AI' },
  { id: 'design', label: 'UI/UX Design' },
  { id: 'mobile', label: 'Mobile Apps' },
  { id: 'video', label: 'Video & Motion' }
];

const FeaturedGigs = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('all');

  const filteredGigs = activeTab === 'all' 
    ? GIGS 
    : GIGS.filter(g => g.category === activeTab);

  const renderThumbnailArt = (type) => {
    switch (type) {
      case 'code':
        return (
          <div className="h-36 bg-gradient-to-br from-indigo-50 to-slate-100 p-4 font-mono text-[11px] text-slate-600 flex flex-col justify-between select-none relative overflow-hidden border-b border-slate-200/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="ml-2 text-[10px] text-slate-400 font-sans font-semibold">app/page.tsx</span>
              </div>
              <Code2 className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="space-y-1 text-slate-700 bg-white/70 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200/60 shadow-2xs">
              <div><span className="text-purple-600 font-bold">export default</span> <span className="text-blue-600 font-bold">async function</span> App() &#123;</div>
              <div className="pl-3 text-slate-500">// Milestone contract scope tracking</div>
              <div className="pl-3 text-emerald-600 font-semibold">return &lt;Dashboard user=&#123;talent&#125; /&gt;;</div>
              <div>&#125;</div>
            </div>
          </div>
        );
      case 'design':
        return (
          <div className="h-36 bg-gradient-to-br from-rose-50/80 via-white to-purple-50/60 p-4 select-none relative overflow-hidden border-b border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Figma Tokens</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">Mobile-First</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-14 rounded-lg bg-white border border-slate-200 shadow-2xs p-2 flex flex-col justify-between">
                <div className="w-6 h-1.5 rounded-full bg-indigo-500"></div>
                <div className="w-10 h-1.5 rounded-full bg-slate-200"></div>
                <div className="w-8 h-1 rounded-full bg-slate-100"></div>
              </div>
              <div className="h-14 rounded-lg bg-indigo-600 shadow-xs p-2 flex flex-col justify-between text-white">
                <div className="w-8 h-1.5 rounded-full bg-white/80"></div>
                <div className="w-10 h-1.5 rounded-full bg-white/40"></div>
                <div className="text-[9px] font-bold self-end text-indigo-200">CTA</div>
              </div>
              <div className="h-14 rounded-lg bg-white border border-slate-200 shadow-2xs p-2 flex flex-col justify-between">
                <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300"></div>
                <div className="w-8 h-1.5 rounded-full bg-slate-200"></div>
                <div className="w-6 h-1 rounded-full bg-slate-100"></div>
              </div>
            </div>
          </div>
        );
      case 'ai':
        return (
          <div className="h-36 bg-gradient-to-br from-emerald-50/80 via-white to-slate-100 p-4 font-mono text-[11px] text-slate-600 flex flex-col justify-between select-none relative overflow-hidden border-b border-slate-200/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">FastAPI Pipeline</span>
              </div>
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">200 OK</span>
            </div>
            <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200/70 shadow-2xs space-y-1">
              <div className="text-indigo-600 font-bold">@app.post("/v1/agent/query")</div>
              <div className="text-slate-500 text-[10px]">response_time: <span className="text-emerald-600 font-bold">42ms</span> • vector_nodes: 12</div>
              <div className="text-slate-700 text-[10px] truncate">&#123; "status": "stream_ready", "cost": "₹0.02" &#125;</div>
            </div>
          </div>
        );
      case 'mobile':
        return (
          <div className="h-36 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 select-none relative overflow-hidden border-b border-slate-200/70 flex items-center justify-between">
            <div className="space-y-1 max-w-[160px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" /> Flutter 3.x
              </span>
              <div className="text-xs font-black text-slate-800">iOS & Android Build</div>
              <div className="text-[10px] text-slate-500 font-medium">Native performance with 60 FPS animations</div>
            </div>
            <div className="w-16 h-28 bg-white rounded-xl border-2 border-slate-800 shadow-md p-1.5 flex flex-col justify-between shrink-0">
              <div className="w-4 h-0.5 bg-slate-800 rounded-full mx-auto"></div>
              <div className="space-y-1">
                <div className="w-full h-4 rounded bg-sky-500"></div>
                <div className="w-3/4 h-2 rounded bg-slate-200"></div>
                <div className="w-1/2 h-2 rounded bg-slate-100"></div>
              </div>
              <div className="w-full h-3 rounded bg-indigo-50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
              </div>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="h-36 bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 select-none relative overflow-hidden border-b border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-600" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Premiere + After Effects</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">4K 60fps</span>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 w-3/4"></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>00:15 / 00:60</span>
                <span className="text-purple-600 font-bold">Dynamic Captions & Sound FX</span>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-36 bg-gradient-to-br from-amber-50 via-white to-slate-100 p-4 select-none relative overflow-hidden border-b border-slate-200/70 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tech Docs</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">OpenAPI Spec</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs space-y-1">
              <div className="w-20 h-2 bg-amber-500 rounded"></div>
              <div className="w-32 h-1.5 bg-slate-200 rounded"></div>
              <div className="w-24 h-1.5 bg-slate-100 rounded"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <section id="gigs-catalog" className="py-20 bg-[#FAF9FE] border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200/70 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Project Catalog</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Featured Ready Gigs
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl">
              Fixed deliverables, upfront pricing in INR, and structured milestone tracking.
            </p>
          </div>

          <Link
            to="/marketplace?type=gigs"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 transition group self-start md:self-auto"
          >
            <span>Explore All 100+ Gigs</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Gigs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredGigs.map((gig) => (
            <div
              key={gig.id}
              className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Artwork Thumbnail */}
                {renderThumbnailArt(gig.thumbnailType)}

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Seller Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${gig.seller.avatarBg} font-black text-xs flex items-center justify-center shadow-2xs shrink-0`}>
                        {gig.seller.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{gig.seller.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {gig.seller.location} • {gig.seller.role}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/80 text-amber-800 text-xs font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{gig.seller.rating}</span>
                      <span className="text-slate-400 font-normal text-[10px]">({gig.seller.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Gig Title */}
                  <h3 className="text-sm sm:text-base font-black text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
                    {gig.title}
                  </h3>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {gig.tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Delivery & Revisions Badge */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{gig.deliveryTime} delivery</span>
                    </div>
                    <span>•</span>
                    <div>{gig.revisions}</div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Price & CTA */}
              <div className="p-5 sm:p-6 pt-0 flex items-center justify-between border-t border-slate-100 mt-2 bg-slate-50/40">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Starting At</span>
                  <span className="text-lg font-black text-slate-900">{gig.price}</span>
                </div>

                <Link
                  to="/register?intent=hire"
                  className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200/80 hover:border-indigo-600 active:scale-95 cursor-pointer shadow-2xs"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Trust Note */}
        <div className="mt-12 p-4 rounded-2xl bg-white border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-800">100% Escrow Guarantee:</span>
            <span>Your payment is locked in Indian Escrow until you inspect and approve the completed project.</span>
          </div>
          <Link to="/register?intent=hire" className="text-indigo-600 font-bold hover:underline shrink-0 flex items-center gap-1">
            <span>How Escrow Works</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default FeaturedGigs;
