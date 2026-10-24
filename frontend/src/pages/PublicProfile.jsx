import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Briefcase,
  Clock,
  Globe,
  Star,
  CheckCircle2,
  ShieldCheck,
  Share2,
  ExternalLink,
  Layers,
  Calendar,
  Building2,
  Users,
  Award,
  Edit3,
  ArrowLeft,
  Mail,
  Sparkles,
  Check,
  AlertCircle,
  FileText
} from 'lucide-react';

// Crisp SVG Icons for Social / Code Links
const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const TwitterIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function PublicProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = (!id || id === 'me' || (currentUser && currentUser._id === id));

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        let endpoint = '';
        if (!id || id === 'me') {
          endpoint = '/api/auth/me';
        } else {
          endpoint = `/api/auth/user/${id}`;
        }

        const res = await fetch(endpoint, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Profile not found');
        }

        // Handle both shapes (data.user or data.data)
        const userObj = data.data || data.user;
        setProfileData(userObj);
      } catch (err) {
        console.error('Profile fetch failed:', err);
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-600">
        <div className="w-10 h-10 border-4 border-[#593CFF] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold">Loading profile details...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Profile Not Available</h2>
          <p className="text-sm text-slate-500 mb-6">{error || "The requested profile could not be found or is private."}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Go Back
            </button>
            <Link
              to="/"
              className="px-4 py-2 text-xs font-bold text-white bg-[#593CFF] hover:bg-[#472fe0] rounded-xl transition shadow-xs"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFreelancer = profileData.role === 'freelancer';
  const displayName = profileData.name || profileData.username || 'GigOra User';
  const locationCity = profileData.location?.city || 'Mumbai';
  const locationState = profileData.location?.state || 'India';
  const skillsList = Array.isArray(profileData.skills)
    ? profileData.skills.map(s => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to="/" className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-1.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#593CFF] to-[#3B82F6] flex items-center justify-center text-white text-sm font-black shadow-sm">
                G
              </span>
              GigOra
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition cursor-pointer"
              title="Share profile link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>

            {isOwnProfile && (
              <Link
                to={isFreelancer ? '/freelancer/setup' : '/client/dashboard'}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#593CFF] hover:bg-[#472fe0] px-3.5 py-2 rounded-xl transition shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Profile Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        
        {/* Profile Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Decorative Cover Gradient */}
          <div className="h-32 sm:h-44 bg-gradient-to-r from-[#593CFF] via-[#4F46E5] to-[#2563EB] relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          {/* Profile Header Details */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
              {/* Avatar + Main Info */}
              <div className="flex items-end gap-4 sm:gap-6">
                <div className="relative">
                  {profileData.avatar ? (
                    <img
                      src={profileData.avatar}
                      alt={displayName}
                      loading="lazy"
                      width="128"
                      height="128"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-md bg-white"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-[#593CFF] to-[#3B82F6] text-white flex items-center justify-center text-3xl sm:text-4xl font-black border-4 border-white shadow-md">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {profileData.isEmailVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-xs" title="Verified GigOra Member">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {isFreelancer ? displayName : (profileData.companyName || displayName)}
                    </h1>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#593CFF] border border-indigo-200/60 uppercase tracking-wider">
                      {profileData.role}
                    </span>
                  </div>

                  {isFreelancer ? (
                    <p className="text-sm sm:text-base font-semibold text-slate-700">
                      {profileData.headline || 'Independent Specialist on GigOra'}
                    </p>
                  ) : (
                    <p className="text-sm sm:text-base font-semibold text-slate-700">
                      {profileData.industry ? `${profileData.industry} • ` : ''}Client & Project Hirer
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {locationCity}, {locationState}
                    </span>

                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Member since {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Recently'}
                    </span>

                    {isFreelancer && (
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        {profileData.weeklyCapacity || '30+ hrs/week'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Freelancer Rate / Client Hiring Quick Action */}
              <div className="sm:text-right space-y-2 shrink-0">
                {isFreelancer ? (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Hourly Rate</div>
                    <div className="text-2xl sm:text-3xl font-black text-[#030B3D]">
                      ₹{(profileData.hourlyRate || 500).toLocaleString('en-IN')}
                      <span className="text-xs font-bold text-slate-400"> / hr</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Client Status</div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-[#593CFF] text-xs font-bold border border-indigo-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#593CFF]" />
                      Verified Hirer (Demo Sandbox)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social & Code Links Bar */}
            {(profileData.socialLinks || profileData.companyWebsite) && (
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3 flex-wrap">
                {profileData.socialLinks?.github && (
                  <a
                    href={profileData.socialLinks.github.startsWith('http') ? profileData.socialLinks.github : `https://${profileData.socialLinks.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition"
                  >
                    <GithubIcon className="w-4 h-4 text-slate-800" />
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}

                {profileData.socialLinks?.linkedin && (
                  <a
                    href={profileData.socialLinks.linkedin.startsWith('http') ? profileData.socialLinks.linkedin : `https://${profileData.socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A66C2] hover:text-[#004182] bg-blue-50/60 hover:bg-blue-100/60 border border-blue-200 px-3 py-1.5 rounded-xl transition"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3 text-blue-400" />
                  </a>
                )}

                {(profileData.socialLinks?.website || profileData.companyWebsite) && (
                  <a
                    href={(profileData.socialLinks?.website || profileData.companyWebsite).startsWith('http') 
                      ? (profileData.socialLinks?.website || profileData.companyWebsite) 
                      : `https://${profileData.socialLinks?.website || profileData.companyWebsite}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#593CFF] hover:text-[#472fe0] bg-indigo-50/60 hover:bg-indigo-100/60 border border-indigo-200 px-3 py-1.5 rounded-xl transition"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{isFreelancer ? 'Portfolio Website' : 'Company Website'}</span>
                    <ExternalLink className="w-3 h-3 text-indigo-400" />
                  </a>
                )}

                {profileData.socialLinks?.twitter && (
                  <a
                    href={profileData.socialLinks.twitter.startsWith('http') ? profileData.socialLinks.twitter : `https://${profileData.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition"
                  >
                    <TwitterIcon className="w-4 h-4 text-slate-800" />
                    <span>Twitter</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FREELANCER SPECIFIC CONTENT */}
        {isFreelancer ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Bio, Portfolio, Reviews */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* About / Bio */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#593CFF]" />
                  About Me
                </h2>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {profileData.bio ? (
                    profileData.bio
                  ) : (
                    <p className="text-slate-400 italic">No detailed bio provided yet.</p>
                  )}
                </div>
              </div>

              {/* Portfolio Projects Section */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#593CFF]" />
                    Portfolio & Featured Work ({profileData.portfolio?.length || 0})
                  </h2>
                  {isOwnProfile && (
                    <Link
                      to="/freelancer/setup"
                      className="text-xs font-bold text-[#593CFF] hover:underline flex items-center gap-1"
                    >
                      + Add Work
                    </Link>
                  )}
                </div>

                {profileData.portfolio && profileData.portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profileData.portfolio.map((item, idx) => (
                      <div
                        key={item._id || idx}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#593CFF]/50 transition flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1.5">
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-3">
                            {item.description || 'No description provided.'}
                          </p>
                        </div>

                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag, tIdx) => (
                              <span key={tIdx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {(() => {
                          const projectLink = item.projectUrl || item.link || item.githubUrl;
                          if (!projectLink) return null;
                          return (
                            <a
                              href={projectLink.startsWith('http') ? projectLink : `https://${projectLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#593CFF] hover:text-[#472fe0] mt-auto"
                            >
                              <span>View Repository / Live App</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <p className="text-xs text-slate-500 font-medium">No portfolio projects showcased yet.</p>
                    {isOwnProfile && (
                      <Link
                        to="/freelancer/setup"
                        className="text-xs font-bold text-[#593CFF] hover:underline inline-block"
                      >
                        Add your top projects to boost hiring chances →
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Reviews & Ratings */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Client Reviews & Feedback ({profileData.reviewCount || 0})
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      Planned Feature
                    </span>
                  </h2>
                  {profileData.reviewCount > 0 ? (
                    <div className="flex items-center gap-1 text-sm font-black text-slate-900">
                      <span>{Number(profileData.rating || 0).toFixed(1)}</span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                      No ratings yet
                    </span>
                  )}
                </div>

                {profileData.reviews && profileData.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {profileData.reviews.map((rev, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{rev.reviewerName || 'Client'}</span>
                          <div className="flex items-center text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < (rev.rating || 5) ? 'fill-amber-500' : 'text-slate-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    No client reviews yet. (Planned Feature: Public client reviews and feedback ratings will be enabled in upcoming production release after live contract completion).
                  </div>
                )}
              </div>

            </div>

            {/* Right 1 Col: Skills, Languages, Work Stats */}
            <div className="space-y-6">
              
              {/* Skills Widget */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider text-slate-500">
                  Core Skills ({skillsList.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skillsList.length > 0 ? (
                    skillsList.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-bold bg-[#593CFF]/10 text-[#593CFF] border border-[#593CFF]/20 px-3 py-1.5 rounded-xl"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No skills listed yet</span>
                  )}
                </div>
              </div>

              {/* Languages Widget */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider text-slate-500">
                  Languages
                </h2>
                <div className="space-y-2">
                  {profileData.languages && profileData.languages.length > 0 ? (
                    profileData.languages.map((lang, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{lang.name}</span>
                        <span className="text-slate-500 font-medium">{lang.proficiency || 'Fluent'}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">English</span>
                        <span className="text-slate-500 font-medium">Professional</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">Hindi</span>
                        <span className="text-slate-500 font-medium">Native</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* GigOra Verified Stats Widget */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider text-slate-500">
                  GigOra Activity
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Completed Gigs</span>
                    <strong className="text-slate-900 font-black">{profileData.completedGigs || 0}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Proposals Submitted</span>
                    <strong className="text-slate-900 font-black">{profileData.totalProposals || 0}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Identity & Email</span>
                    <strong className="text-emerald-700 font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Demo Escrow Protected</span>
                    <strong className="text-[#593CFF] font-black flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Test Mode
                    </strong>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* CLIENT SPECIFIC CONTENT */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Company Description, Industry, Company Stats */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* About Company */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#593CFF]" />
                  About Our Company
                </h2>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {profileData.companyDescription ? (
                    profileData.companyDescription
                  ) : (
                    <p className="text-slate-400 italic">No company description provided yet.</p>
                  )}
                </div>
              </div>

              {/* Company Profile Details */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#593CFF]" />
                  Organization Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider">Company Name</span>
                    <p className="text-sm font-bold text-slate-900">
                      {profileData.companyName ? profileData.companyName : 'Independent Client (No company specified)'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider">Industry</span>
                    <p className="text-sm font-bold text-slate-900">{profileData.industry || 'Technology & Digital Services'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider">Team Size</span>
                    <p className="text-sm font-bold text-slate-900">{profileData.companySize || '1-10 employees'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider">Primary Location</span>
                    <p className="text-sm font-bold text-slate-900">{locationCity}, {locationState}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 1 Col: Hiring Statistics & Verification */}
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider text-slate-500">
                  Hiring Track Record
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Total Jobs Posted</span>
                    <strong className="text-slate-900 font-black">{profileData.totalJobsPosted || 0}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Active Gigs Running</span>
                    <strong className="text-slate-900 font-black">{profileData.activeGigs || 0}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Completed Projects</span>
                    <strong className="text-slate-900 font-black">{profileData.completedGigs || 0}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Escrow Mode</span>
                    <strong className="text-[#593CFF] font-black flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#593CFF]" /> Simulated Sandbox Escrow
                    </strong>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {isOwnProfile && (
                <div className="bg-gradient-to-br from-[#593CFF]/10 to-indigo-100/50 p-6 rounded-3xl border border-[#593CFF]/20 space-y-3">
                  <h3 className="text-sm font-black text-slate-900">Manage Client Workspace</h3>
                  <p className="text-xs text-slate-600">
                    Post new projects, manage proposals, and hire top freelancers in India.
                  </p>
                  <Link
                    to="/client/dashboard"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#593CFF] hover:bg-[#472fe0] text-white text-xs font-bold transition shadow-xs"
                  >
                    Go to Client Dashboard →
                  </Link>
                </div>
              )}

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
