import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Code, 
  Layers, 
  Briefcase, 
  Clock, 
  MapPin, 
  Globe, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  X, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const CATEGORIES = [
  'Web Development',
  'Design',
  'AI & Data',
  'Mobile Development',
  'Writing',
  'Marketing'
];

const POPULAR_SKILLS = [
  'React', 'Node.js', 'Tailwind CSS', 'MongoDB', 'Python', 
  'FastAPI', 'Figma', 'Next.js', 'TypeScript', 'Express',
  'UI/UX Design', 'SQL', 'Docker', 'Machine Learning'
];

const BASE = import.meta.env.VITE_API_URL || '';

const FreelancerSetupWizard = () => {
  const { user, loading, updateUser } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    bio: '',
    skills: [],
    preferredCategories: [],
    experienceLevel: 'Intermediate',
    hourlyRate: 500,
    workPreference: 'remote',
    weeklyCapacity: '30+ hrs/week',
    city: 'Mumbai',
    state: 'Maharashtra',
    github: '',
    linkedin: '',
    website: '',
    portfolioTitle: '',
    portfolioDesc: '',
    portfolioUrl: ''
  });

  const [customSkillInput, setCustomSkillInput] = useState('');

  // Populate initial values from current user
  useEffect(() => {
    if (user) {
      const existingSkills = Array.isArray(user.skills)
        ? user.skills.map(s => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
        : [];

      setFormData(prev => ({
        ...prev,
        name: user.name || user.username || '',
        headline: user.headline || '',
        bio: user.bio || '',
        skills: existingSkills,
        preferredCategories: user.preferredCategories?.length ? user.preferredCategories : ['Web Development'],
        experienceLevel: user.experienceLevel || 'Intermediate',
        hourlyRate: user.hourlyRate || 500,
        workPreference: user.workPreference || 'remote',
        weeklyCapacity: user.weeklyCapacity || '30+ hrs/week',
        city: user.location?.city || 'Mumbai',
        state: user.location?.state || 'Maharashtra',
        github: user.socialLinks?.github || '',
        linkedin: user.socialLinks?.linkedin || '',
        website: user.socialLinks?.website || ''
      }));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-sm font-semibold text-slate-700">
        <Loader2 className="w-6 h-6 animate-spin text-[#593CFF] mb-2" />
        <span>Loading setup wizard...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Handle skill adding
  const handleAddSkill = (skillName) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (formData.skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) return;
    setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setCustomSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  // Toggle Category
  const handleToggleCategory = (category) => {
    setFormData(prev => {
      const exists = prev.preferredCategories.includes(category);
      if (exists) {
        return {
          ...prev,
          preferredCategories: prev.preferredCategories.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          preferredCategories: [...prev.preferredCategories, category]
        };
      }
    });
  };

  // Validation per step
  const validateStep = (step) => {
    setErrorMsg('');
    if (step === 1) {
      if (formData.preferredCategories.length === 0) {
        setErrorMsg('Please select at least 1 primary category of work.');
        return false;
      }
      if (formData.skills.length === 0) {
        setErrorMsg('Please add at least 1 core technical skill to enable gig matching.');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.headline.trim()) {
        setErrorMsg('Please enter a professional headline (e.g. Full-Stack React Developer).');
        return false;
      }
      if (!formData.bio.trim() || formData.bio.trim().length < 15) {
        setErrorMsg('Please write a brief bio of at least 15 characters.');
        return false;
      }
    }
    if (step === 3) {
      if (!formData.hourlyRate || Number(formData.hourlyRate) <= 0) {
        setErrorMsg('Please set a valid positive hourly rate (₹/hr).');
        return false;
      }
      if (!formData.city.trim()) {
        setErrorMsg('Please provide your location city (e.g. Mumbai).');
        return false;
      }
    }
    return true;
  };

  // Step advancement
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Final submit or save and finish later
  const handleSaveProfile = async (isSkippingPortfolio = false, isExit = false) => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Prepare profile payload
      const payload = {
        name: formData.name.trim(),
        headline: formData.headline.trim(),
        bio: formData.bio.trim(),
        skills: formData.skills,
        preferredCategories: formData.preferredCategories,
        experienceLevel: formData.experienceLevel,
        hourlyRate: Number(formData.hourlyRate),
        workPreference: formData.workPreference,
        location: {
          city: formData.city.trim(),
          state: formData.state.trim()
        },
        socialLinks: {
          github: formData.github.trim(),
          linkedin: formData.linkedin.trim(),
          website: formData.website.trim()
        },
        weeklyCapacity: formData.weeklyCapacity,
        hasSkippedOnboarding: isExit ? true : Boolean(user?.hasSkippedOnboarding),
        isProfileComplete: formData.skills.length > 0 && formData.bio.trim().length >= 10
      };

      const res = await fetch(`${BASE}/api/freelancer/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save freelancer profile');
      }

      // 2. If portfolio data provided, submit portfolio
      if (!isSkippingPortfolio && formData.portfolioTitle.trim()) {
        try {
          await fetch(`${BASE}/api/auth/portfolio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              title: formData.portfolioTitle.trim(),
              description: formData.portfolioDesc.trim(),
              projectUrl: formData.portfolioUrl.trim()
            })
          });
        } catch (portErr) {
          console.warn('Portfolio addition warning:', portErr);
        }
      }

      // 3. Update auth state and navigate to dashboard
      updateUser(data.data || { ...user, ...payload, isProfileComplete: payload.isProfileComplete });
      navigate('/freelancer/dashboard', { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while saving your profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col relative selection:bg-[#593CFF] selection:text-white">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-[#030B3D] text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
              G
            </div>
            <span className="font-extrabold text-lg text-[#030B3D] tracking-tight">GigOra</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500">
              Step <span className="text-[#593CFF]">{currentStep}</span> of 4
            </span>
            <button
              onClick={() => handleSaveProfile(true, true)}
              disabled={submitting}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              Save & Exit to Dashboard
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div 
            className="bg-[#593CFF] h-1 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </header>

      {/* Main Wizard Content Area */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        
        {/* Wizard Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_15px_40px_-15px_rgba(15,23,42,0.07)] p-6 sm:p-10 relative overflow-hidden">
          
          {/* Global Alert Notification */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Skills & Categories */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#593CFF]/10 text-[#593CFF] text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Personalize Your Feed</span>
                </div>
                <h2 className="text-2xl font-black text-[#030B3D] tracking-tight">
                  What services & skills do you offer?
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  GigOra uses your skills and categories to filter out irrelevant gigs and show you high-match client contracts.
                </p>
              </div>

              {/* Preferred Categories Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Primary Categories (Select 1 or more) *
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(category => {
                    const isSelected = formData.preferredCategories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleToggleCategory(category)}
                        className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#593CFF] text-white shadow-xs scale-[1.02]'
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{category}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skills Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Core Technical Skills *
                </label>
                
                {/* Input for custom skill */}
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Type a skill (e.g. Next.js, Redux, Python)..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(customSkillInput);
                      }
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(customSkillInput)}
                    className="px-4 py-2.5 rounded-xl bg-[#030B3D] text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Popular Skill Suggestions */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-semibold text-slate-400">Popular suggestions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SKILLS.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleAddSkill(skill)}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-[#593CFF] border border-slate-200 transition cursor-pointer"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Skills Chips */}
                {formData.skills.length > 0 ? (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Your Selected Skills ({formData.skills.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.skills.map(skill => (
                        <span 
                          key={skill}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-white border border-[#593CFF]/30 text-[#593CFF] shadow-2xs"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl font-medium">
                    Please add at least 1 skill above to unlock your personalized gig matches.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Experience & Bio */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#593CFF]/10 text-[#593CFF] text-xs font-bold mb-2">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Profile Pitch</span>
                </div>
                <h2 className="text-2xl font-black text-[#030B3D] tracking-tight">
                  Tell clients about your expertise
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  A crisp headline and concise bio help clients trust your background when reviewing bids.
                </p>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Professional Headline *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full-Stack MERN Developer | Hyperlocal Web Specialist"
                  value={formData.headline}
                  onChange={(e) => setFormData(p => ({ ...p, headline: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                />
              </div>

              {/* Experience Level Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Experience Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { level: 'Entry', title: 'Entry Level', desc: '0 - 1 years experience' },
                    { level: 'Intermediate', title: 'Intermediate', desc: '1 - 3 years experience' },
                    { level: 'Expert', title: 'Expert Level', desc: '3+ years experience' }
                  ].map(item => (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, experienceLevel: item.level }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        formData.experienceLevel === item.level
                          ? 'border-[#593CFF] bg-[#593CFF]/5 ring-2 ring-[#593CFF]/20'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-bold text-xs text-[#030B3D] block">{item.title}</span>
                      <span className="text-[11px] text-slate-500 font-medium">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Short Bio */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Short Bio & Overview *
                  </label>
                  <span className="text-[11px] text-slate-400">{formData.bio.length} characters</span>
                </div>
                <textarea
                  rows="4"
                  placeholder="Write 2-3 sentences about your tech stack, your problem solving approach, and why clients enjoy working with you."
                  value={formData.bio}
                  onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                />
              </div>

              {/* Optional Social & Code Links */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#593CFF]" />
                    Social Links & Code Repositories
                  </label>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Optional (Boosts Trust +70%)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">GitHub Profile</label>
                    <input
                      type="text"
                      placeholder="github.com/yourhandle"
                      value={formData.github}
                      onChange={(e) => setFormData(p => ({ ...p, github: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">LinkedIn Profile</label>
                    <input
                      type="text"
                      placeholder="linkedin.com/in/yourhandle"
                      value={formData.linkedin}
                      onChange={(e) => setFormData(p => ({ ...p, linkedin: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Portfolio or Personal Website</label>
                  <input
                    type="text"
                    placeholder="https://yourportfolio.dev"
                    value={formData.website}
                    onChange={(e) => setFormData(p => ({ ...p, website: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Rates & Work Preference */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#593CFF]/10 text-[#593CFF] text-xs font-bold mb-2">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Work Preferences</span>
                </div>
                <h2 className="text-2xl font-black text-[#030B3D] tracking-tight">
                  Rates & Location Expectations
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Specify your hourly rate baseline and whether you prefer local Mumbai contracts or remote delivery.
                </p>
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Hourly Rate Baseline (₹ / hr) *
                </label>
                <div className="relative max-w-xs mb-2">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(p => ({ ...p, hourlyRate: e.target.value }))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-[#030B3D] focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Quick presets:</span>
                  {[300, 500, 800, 1200, 2000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, hourlyRate: val }))}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Delivery Preference *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'remote', label: 'Remote First', icon: Globe, desc: 'Deliver work digitally' },
                    { id: 'onsite', label: 'On-site Local', icon: MapPin, desc: 'In-person client presence' },
                    { id: 'hybrid', label: 'Hybrid', icon: Briefcase, desc: 'Remote + occasional meetings' }
                  ].map(pref => {
                    const Icon = pref.icon;
                    return (
                      <button
                        key={pref.id}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, workPreference: pref.id }))}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          formData.workPreference === pref.id
                            ? 'border-[#593CFF] bg-[#593CFF]/5 ring-2 ring-[#593CFF]/20'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-[#593CFF]" />
                          <span className="font-bold text-xs text-[#030B3D]">{pref.label}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">{pref.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    State / Region *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                  />
                </div>
              </div>

              {/* Weekly Availability */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Weekly Availability</span>
                  <span className="text-[10px] font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Optional</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['10-20 hrs/week', '20-30 hrs/week', '30+ hrs/week'].map(cap => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, weeklyCapacity: cap }))}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                        formData.weeklyCapacity === cap
                          ? 'border-[#593CFF] bg-[#593CFF] text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Portfolio Projects (Optional) */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Optional Finishing Touch</span>
                </div>
                <h2 className="text-2xl font-black text-[#030B3D] tracking-tight">
                  Add a Proof of Work (Portfolio)
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Adding a past project gives your profile an immediate +20% score boost and builds immediate client trust. You can also skip this and add it later.
                </p>
              </div>

              <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Project Title (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MERN E-Commerce Dashboard"
                    value={formData.portfolioTitle}
                    onChange={(e) => setFormData(p => ({ ...p, portfolioTitle: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Briefly describe what you built and the tools used."
                    value={formData.portfolioDesc}
                    onChange={(e) => setFormData(p => ({ ...p, portfolioDesc: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Live Demo or GitHub Repo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/myusername/my-project"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData(p => ({ ...p, portfolioUrl: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stepper Bottom Controls */}
          <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              {currentStep === 4 ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSaveProfile(true)}
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition cursor-pointer"
                  >
                    Skip & Complete
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveProfile(false)}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#593CFF] hover:bg-[#472fe0] text-white font-bold text-xs shadow-xs active:scale-95 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save & Go to Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-[#593CFF] hover:bg-[#472fe0] text-white font-bold text-xs shadow-xs active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>

      </main>

    </div>
  );
};

export default FreelancerSetupWizard;
