import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import { 
  Briefcase, 
  LogOut, 
  ArrowRightLeft, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Wallet, 
  Send, 
  ExternalLink, 
  Plus, 
  Search, 
  ShieldCheck, 
  X, 
  Loader2,
  FolderGit2,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  RotateCcw,
  Tag,
  Calendar,
  Clock,
  Check,
  MessageSquare
} from 'lucide-react';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const CURRENT_YEAR = new Date().getFullYear();

export default function FreelancerDashboard() {
  const { user, logout, switchRole, loading, updateUser } = useAuth();
  const navigate = useNavigate();

  const [switching, setSwitching] = useState(false);
  const [activeTab, setActiveTab] = useState('proposals'); // 'proposals' | 'contracts'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('all'); // 'all' | 'under-10k' | '10k-30k' | '30k-plus'
  const [gigScopeFilter, setGigScopeFilter] = useState('real'); // 'real' | 'demo' | 'closed' | 'all'
  const [currentPage, setCurrentPage] = useState(1);

  // Data states
  const [gigs, setGigs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Modal states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedGigForBid, setSelectedGigForBid] = useState(null);
  const [incompleteProfileModal, setIncompleteProfileModal] = useState({ isOpen: false, missingFields: [] });

  // Deliverable Submission Modal State (Step 6 Work Tracking)
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);
  const [selectedContractMilestone, setSelectedContractMilestone] = useState(null); // { gigId, milestone }
  const [deliverableForm, setDeliverableForm] = useState({ deliverableUrl: '', deliverableNotes: '' });
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);
  const [deliverableError, setDeliverableError] = useState('');

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    avatar: '',
    bio: '',
    skills: '',
    hourlyRate: ''
  });
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    link: '',
    githubUrl: '',
    tags: ''
  });
  const [proposalForm, setProposalForm] = useState({
    bidAmount: '',
    estimatedTime: '',
    coverLetter: ''
  });
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Helper to re-fetch contracts after milestone submission
  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/gigs/freelancer/my-contracts', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setContracts(data.data || []);
      }
    } catch (err) {
      console.error('Error refreshing contracts:', err);
    }
  };

  // Reusable comprehensive dashboard data fetcher
  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      // Fetch rule-matched gigs from backend
      let loadedGigs = [];
      try {
        const matchedRes = await fetch('/api/freelancer/matched-gigs', { credentials: 'include' });
        const matchedData = await matchedRes.json();
        if (matchedData.success) {
          loadedGigs = matchedData.allGigs || matchedData.matchedGigs || [];
        }
      } catch (mErr) {
        console.warn('Matched gigs fallback to standard gigs feed:', mErr);
      }

      if (loadedGigs.length === 0) {
        const gigsRes = await fetch('/api/gigs?status=open');
        const gigsData = await gigsRes.json();
        if (gigsData.success) {
          loadedGigs = gigsData.data || [];
        }
      }

      // Also merge closed gigs so freelancers can inspect past/archive projects under Closed Projects tab
      try {
        const allRes = await fetch('/api/gigs?status=all');
        const allData = await allRes.json();
        if (allData.success && Array.isArray(allData.data)) {
          const openIds = new Set(loadedGigs.map(g => String(g._id)));
          const closedGigsList = allData.data.filter(g => g.status === 'closed' && !openIds.has(String(g._id)));
          loadedGigs = [...loadedGigs, ...closedGigsList];
        }
      } catch (cErr) {
        console.warn('Failed to load archive gigs:', cErr);
      }

      setGigs(loadedGigs);

      // Fetch My Proposals
      const propRes = await fetch('/api/proposals/my-proposals', { credentials: 'include' });
      const propData = await propRes.json();
      if (propData.success) {
        setProposals(propData.data || []);
      }

      // Fetch My Active & Completed Contracts (Step 6 Work Tracking)
      try {
        const bookRes = await fetch('/api/gigs/freelancer/my-contracts', { credentials: 'include' });
        const bookData = await bookRes.json();
        if (bookData.success) {
          setContracts(bookData.data || []);
        }
      } catch (cErr) {
        console.error('Error fetching contracts:', cErr);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Initial form values from user
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
        skills: Array.isArray(user.skills) 
          ? user.skills.map(s => (typeof s === 'string' ? s : s?.name)).filter(Boolean).join(', ') 
          : '',
        hourlyRate: user.hourlyRate || ''
      });
    }
  }, [user]);

  // Fetch initial dashboard data on mount or user switch
  useEffect(() => {
    if (!user || user.role !== 'freelancer') return;
    fetchDashboardData();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-sm font-semibold text-slate-700">
        <Loader2 className="w-6 h-6 animate-spin text-[#593CFF] mb-2" />
        <span>Loading Freelancer Studio...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'freelancer') {
    return <Navigate to="/client/dashboard" replace />;
  }

  // Time-based dynamic greeting
  const greeting = getGreeting();
  const currentYear = CURRENT_YEAR;

  // Profile completion criteria (100% strictly matched with checklist)
  const hasName = Boolean(user.name && user.name.trim());
  const hasEmailVerified = Boolean(user.isEmailVerified);
  const hasBio = Boolean(user.bio && user.bio.trim().length > 10);
  const hasSkills = Boolean(user.skills && user.skills.length > 0);
  const hasPortfolio = Boolean(user.portfolio && user.portfolio.length > 0);

  const profilePercent = [hasName, hasEmailVerified, hasBio, hasSkills, hasPortfolio]
    .filter(Boolean).length * 20;

  // Switch role handler
  const handleSwitchRole = async () => {
    try {
      setSwitching(true);
      const updatedUser = await switchRole();
      if (updatedUser?.role === 'client') {
        navigate('/client/dashboard', { replace: true });
      } else {
        navigate('/freelancer/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Failed to switch workspace:', err);
    } finally {
      setSwitching(false);
    }
  };

  // Sign out handler
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    setActionError('');
    setActionSuccess('');

    try {
      const skillsArray = profileForm.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: profileForm.name.trim(),
          avatar: profileForm.avatar ? profileForm.avatar.trim() : undefined,
          bio: profileForm.bio.trim(),
          skills: skillsArray,
          hourlyRate: profileForm.hourlyRate ? Number(profileForm.hourlyRate) : undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile');
      }

      updateUser(data.data || { ...user, ...data.user });
      setActionSuccess('Profile updated successfully!');
      // Re-fetch matched gigs immediately so updated skills trigger fresh recommendations
      await fetchDashboardData();
      setTimeout(() => {
        setIsEditProfileOpen(false);
        setActionSuccess('');
      }, 1000);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Add Portfolio Item
  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    setActionError('');
    setActionSuccess('');

    try {
      const tagsArray = portfolioForm.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/auth/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: portfolioForm.title.trim(),
          description: portfolioForm.description.trim(),
          link: portfolioForm.link.trim(),
          githubUrl: portfolioForm.githubUrl.trim(),
          tags: tagsArray
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to add portfolio item');
      }

      if (data.data) {
        updateUser(data.data);
      }
      setActionSuccess('Portfolio item added!');
      setPortfolioForm({ title: '', description: '', link: '', githubUrl: '', tags: '' });
      setTimeout(() => {
        setIsAddPortfolioOpen(false);
        setActionSuccess('');
      }, 1000);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Handle Submit Proposal
  const handleOpenProposalModal = (gig) => {
    // Strictly block bidding on demo/sample projects
    if (gig.isDemo || gig.isSample) {
      alert('Submitting proposals on Demo / Sample projects is disabled. These listings are for preview and practice only.');
      return;
    }
    if (gig.status !== 'open') {
      alert('This project is closed and no longer accepting proposals.');
      return;
    }

    // Check required profile fields before allowing proposal submission
    const missing = [];
    if (!user.name || !user.name.trim()) missing.push('Full Name');
    if (!user.skills || user.skills.length === 0) missing.push('Technical Skills (at least 1)');
    if (!user.bio || user.bio.trim().length < 10) missing.push('Professional Bio (min 10 characters)');
    if (!user.preferredCategories || user.preferredCategories.length === 0) missing.push('Preferred Categories');

    if (missing.length > 0) {
      setIncompleteProfileModal({
        isOpen: true,
        missingFields: missing
      });
      return;
    }

    setSelectedGigForBid(gig);
    setProposalForm({
      bidAmount: gig.budget ? String(gig.budget) : '',
      estimatedTime: '3-5 days',
      coverLetter: ''
    });
    setActionError('');
    setActionSuccess('');
    setIsProposalModalOpen(true);
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    setActionError('');
    setActionSuccess('');

    const bid = Number(proposalForm.bidAmount);
    if (isNaN(bid) || bid <= 0) {
      setActionError('Please enter a valid bid amount in INR (₹).');
      setSubmittingAction(false);
      return;
    }

    if (selectedGigForBid?.budget && bid > selectedGigForBid.budget * 3) {
      setActionError(`Bid amount cannot exceed ₹${(selectedGigForBid.budget * 3).toLocaleString('en-IN')} (3x project budget).`);
      setSubmittingAction(false);
      return;
    }

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          gigId: selectedGigForBid._id,
          bidAmount: bid,
          estimatedTime: proposalForm.estimatedTime.trim(),
          coverLetter: proposalForm.coverLetter.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit proposal');
      }

      setProposals(prev => [data.data, ...prev]);
      setActionSuccess('Proposal sent to client successfully!');
      setTimeout(() => {
        setIsProposalModalOpen(false);
        setActionSuccess('');
        setSelectedGigForBid(null);
      }, 1200);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleWithdrawProposal = async (proposalId) => {
    if (!window.confirm('Are you sure you want to withdraw this proposal?')) return;
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to withdraw proposal');
      }
      setProposals(prev => prev.filter(p => p._id !== proposalId));
    } catch (err) {
      alert(err.message || 'Failed to withdraw proposal');
    }
  };

  // Step 6 Work Tracking: Milestone Deliverable Submission
  const handleOpenDeliverableModal = (gigId, milestone) => {
    setSelectedContractMilestone({ gigId, milestone });
    setDeliverableForm({
      deliverableUrl: milestone.deliverableUrl || '',
      deliverableNotes: milestone.deliverableNotes || ''
    });
    setDeliverableError('');
    setIsDeliverableModalOpen(true);
  };

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (!selectedContractMilestone) return;
    if (!deliverableForm.deliverableUrl?.trim() && !deliverableForm.deliverableNotes?.trim()) {
      setDeliverableError('Please provide a deliverable link (e.g. GitHub, Figma, Drive) or summary notes.');
      return;
    }
    setSubmittingDeliverable(true);
    setDeliverableError('');
    try {
      const { gigId, milestone } = selectedContractMilestone;
      const res = await fetch(`/api/gigs/${gigId}/milestones/${milestone._id}/submit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          deliverableUrl: deliverableForm.deliverableUrl.trim(),
          deliverableNotes: deliverableForm.deliverableNotes.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit deliverable');
      }
      setIsDeliverableModalOpen(false);
      await fetchContracts();
    } catch (err) {
      setDeliverableError(err.message || 'Error submitting deliverable');
    } finally {
      setSubmittingDeliverable(false);
    }
  };

  // Strictly separate real open client projects from demo listings and closed gigs (drafts never leak)
  const realGigs = gigs.filter(gig => !gig.isDemo && !gig.isSample && gig.status === 'open');
  const demoGigs = gigs.filter(gig => (gig.isDemo || gig.isSample) && gig.status === 'open');
  const closedGigs = gigs.filter(gig => gig.status === 'closed');
  const realProposals = proposals.filter(prop => !prop.gig?.isDemo && !prop.gig?.isSample);

  // Normalize logged-in freelancer's skills for high-fidelity matching
  const userSkillNames = (user?.skills || []).map(s => {
    if (typeof s === 'string') return s.toLowerCase().trim();
    return (s?.name || '').toLowerCase().trim();
  }).filter(Boolean);

  // Filter Categories and Presets
  const categories = ['All', 'Web Development', 'Design', 'Writing', 'Marketing', 'AI & Data'];
  const popularSkills = ['React', 'Node.js', 'Python', 'Figma', 'UI/UX', 'MongoDB', 'JavaScript'];

  // Handle Reset Filters
  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSkillFilter('');
    setBudgetFilter('all');
    setGigScopeFilter('real');
    setCurrentPage(1);
  };

  const isAnyFilterActive = 
    selectedCategory !== 'All' || 
    Boolean(searchQuery.trim()) || 
    Boolean(skillFilter.trim()) || 
    budgetFilter !== 'all' || 
    gigScopeFilter !== 'real';

  // Filtered Gigs
  const filteredGigs = gigs.filter(gig => {
    // Under NO circumstance should drafts ever be visible to freelancers
    if (gig.status === 'draft') return false;

    const isDemoGig = Boolean(gig.isDemo || gig.isSample);
    if (gigScopeFilter === 'real' && (isDemoGig || gig.status !== 'open')) return false;
    if (gigScopeFilter === 'demo' && (!isDemoGig || gig.status !== 'open')) return false;
    if (gigScopeFilter === 'closed' && gig.status !== 'closed') return false;
    if (gigScopeFilter === 'all' && gig.status !== 'open') return false;

    // 1. Category filter
    const matchesCategory = selectedCategory === 'All' || gig.category === selectedCategory;

    // 2. Search query matches title or description
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (gig.title && gig.title.toLowerCase().includes(q)) || 
      (gig.description && gig.description.toLowerCase().includes(q));

    // 3. Skill filter
    const sTerm = skillFilter.toLowerCase().trim();
    const gigSkills = (gig.skillsRequired || []).map(s => String(s).toLowerCase().trim());
    const matchesSkill = !sTerm || 
      gigSkills.some(s => s.includes(sTerm)) ||
      (gig.title && gig.title.toLowerCase().includes(sTerm)) ||
      (gig.description && gig.description.toLowerCase().includes(sTerm));

    // 4. Budget filter
    const b = Number(gig.budget || 0);
    let matchesBudget = true;
    if (budgetFilter === 'under-10k') matchesBudget = b > 0 && b < 10000;
    else if (budgetFilter === '10k-30k') matchesBudget = b >= 10000 && b <= 30000;
    else if (budgetFilter === '30k-plus') matchesBudget = b > 30000;

    return matchesCategory && matchesSearch && matchesSkill && matchesBudget;
  });

  // Client-side pagination logic
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(filteredGigs.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGigs = filteredGigs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col relative selection:bg-[#593CFF] selection:text-white">
      
      {/* Ambient Gradient Glows */}
      <div className="absolute top-0 right-1/4 w-[32rem] h-[32rem] bg-[#593CFF]/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 -left-32 w-96 h-96 bg-[#8E51FF]/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Glass-Effect Top Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Workspace Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-[#030B3D] text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                G
              </div>
              <span className="font-extrabold text-lg text-[#030B3D] tracking-tight">GigOra</span>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-[#593CFF]/10 text-[#593CFF] px-3 py-1 rounded-full border border-[#593CFF]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#593CFF] animate-pulse" />
              Freelancer Studio
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Wallet Quick Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-700" title="Simulated Sandbox testing balance (Not real funds)">
              <Wallet className="w-3.5 h-3.5 text-[#593CFF]" />
              <span>₹{(user.walletBalance || 0).toLocaleString('en-IN')}</span>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded">Demo</span>
            </div>

            {/* View Public Profile */}
            <Link
              to="/profile/me"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100/90 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              title="View your public profile as seen by clients"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">View Public Profile</span>
            </Link>

            {/* Switch to Client View */}
            <button
              onClick={handleSwitchRole}
              disabled={switching}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#593CFF] hover:text-[#472fe0] bg-[#593CFF]/8 hover:bg-[#593CFF]/15 border border-[#593CFF]/25 px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{switching ? 'Switching...' : 'Switch to Client View'}</span>
              <span className="sm:hidden">Client View</span>
            </button>

            {/* In-App Notifications Bell */}
            <NotificationBell 
              userRole="freelancer" 
              onNavigateToGig={(gigId, notifType, destinationUrl) => {
                if (destinationUrl) {
                  const urlParams = new URLSearchParams(destinationUrl.split('?')[1]);
                  const tab = urlParams.get('tab');
                  if (tab) {
                    setActiveTab(tab);
                    return;
                  }
                }
                if (notifType === 'proposal_rejected') {
                  setActiveTab('proposals');
                } else {
                  setActiveTab('contracts');
                  const contractEl = document.getElementById('active-contracts-section');
                  if (contractEl) contractEl.scrollIntoView({ behavior: 'smooth' });
                }
              }} 
            />

            {/* User Avatar & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#593CFF] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  (user.name || user.username || 'U').charAt(0)
                )}
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Email Verification Strip (If Unverified) */}
      {!user.isEmailVerified && (
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 text-xs font-medium text-amber-900 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Your email is not verified yet. Verify your email to activate full proposal submission and escrow payouts.</span>
            </div>
            <Link 
              to={`/check-email?email=${encodeURIComponent(user.email || '')}`}
              className="font-bold underline text-amber-800 hover:text-amber-950 shrink-0"
            >
              Verify Now →
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8 relative z-10">
        
        {/* 2. Welcome Hero Card with Circular Profile Completion Ring */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_10px_35px_-10px_rgba(15,23,42,0.06)] p-6 sm:p-8 relative overflow-hidden">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Greeting & Headline */}
            <div className="space-y-2 max-w-xl">
              {user.isEmailVerified ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Email Verified Freelancer</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-xs font-bold text-amber-700">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Verification Pending (Verify Email)</span>
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#030B3D] tracking-tight">
                {greeting}, {user.name || user.username}! 👋
              </h1>

              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {user.bio ? user.bio : "Welcome to your Freelancer Studio. Explore open client requirements, manage bids, and deliver high-impact work with zero commission."}
              </p>

              {/* Skills Tags */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, idx) => {
                    const skillName = typeof skill === 'string' ? skill : (skill?.name || '');
                    return (
                      <span key={idx} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                        {skillName}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-400 italic">No skills listed yet. Add skills in profile to match client gigs.</span>
                )}
              </div>
            </div>

            {/* Profile Completion Ring Widget with Transparent Breakdown */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/90 shrink-0">
              
              {/* Circular SVG Ring */}
              <div className="relative w-18 h-18 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Circle */}
                  <path
                    className="text-[#593CFF] transition-all duration-700 ease-out"
                    strokeDasharray={`${profilePercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-black text-[#030B3D]">{profilePercent}%</span>
                </div>
              </div>

              {/* Profile Checklist & Actions */}
              <div className="space-y-1.5 min-w-[190px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#030B3D]">
                    {profilePercent === 100 ? 'All-Star Profile' : 'Profile Strength'}
                  </span>
                  <span className="text-[10px] font-bold text-[#593CFF] bg-[#593CFF]/10 px-2 py-0.5 rounded-full">
                    {profilePercent}%
                  </span>
                </div>

                {/* 5-Item Transparent Breakdown */}
                <div className="text-[11px] text-slate-500 space-y-0.5 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    {hasName ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> : <div className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" />}
                    <span className={hasName ? 'text-slate-700 font-medium' : 'text-slate-400'}>Name (+20%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasEmailVerified ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> : <div className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" />}
                    <span className={hasEmailVerified ? 'text-slate-700 font-medium' : 'text-slate-400'}>Email Verified (+20%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasBio ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> : <div className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" />}
                    <span className={hasBio ? 'text-slate-700 font-medium' : 'text-slate-400'}>Bio (+20%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasSkills ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> : <div className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" />}
                    <span className={hasSkills ? 'text-slate-700 font-medium' : 'text-slate-400'}>Skills (+20%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasPortfolio ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> : <div className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" />}
                    <span className={hasPortfolio ? 'text-slate-700 font-medium' : 'text-slate-400'}>Portfolio Work (+20%)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Link
                    to="/freelancer/setup"
                    className="text-xs font-bold text-[#593CFF] hover:text-[#472fe0] inline-flex items-center gap-0.5 hover:underline cursor-pointer"
                  >
                    <span>{profilePercent === 100 ? 'Edit Profile' : 'Complete Profile'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>

                  <span className="text-slate-300">•</span>

                  <Link
                    to="/profile/me"
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 hover:underline cursor-pointer"
                    title="View public profile"
                  >
                    <span>Public View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* 3. Quick Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: Proposals */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Proposals Sent</span>
              <Send className="w-4 h-4 text-[#593CFF]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#030B3D]">{realProposals.length}</div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              {realProposals.length === 0 ? 'No bids on client projects yet' : `${realProposals.filter(p => p.status === 'accepted').length} accepted by clients`}
            </div>
          </div>

          {/* Card 2: Active Contracts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Work</span>
              <Layers className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#030B3D]">{contracts.length}</div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              {contracts.length === 0 ? 'No running projects' : `${contracts.length} milestone contracts running`}
            </div>
          </div>

          {/* Card 3: Completed Gigs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Gigs</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#030B3D]">
              {contracts.filter(c => c.status === 'completed').length}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {contracts.filter(c => c.status === 'completed').length === 0 ? 'Completed gigs will appear here' : `${contracts.filter(c => c.status === 'completed').length} delivered projects`}
            </div>
          </div>

          {/* Card 4: Test Wallet Balance */}
          <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-200/80 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Test Balance</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Sandbox
                </span>
              </div>
              <Wallet className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-950">
              ₹{(user.walletBalance || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-amber-800/90 mt-1 font-semibold flex items-center gap-1">
              <span>⚠️ Sandbox Demo • No Real Currency</span>
            </div>
          </div>

        </section>

        {/* Incomplete Profile Prompt Banner */}
        {(!user.skills || user.skills.length === 0) && (
          <div className="p-5 rounded-3xl bg-indigo-50/80 border border-indigo-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#593CFF] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#030B3D]">
                  Add your skills to view personalized project recommendations matching your expertise.
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Complete your skills, hourly rate, and work preferences in the wizard to unlock rule-matched client contracts.
                </p>
              </div>
            </div>
            <Link
              to="/freelancer/setup"
              className="px-4 py-2.5 rounded-xl bg-[#593CFF] hover:bg-[#472fe0] text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Launch Setup Wizard</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 4. Main Work Area: "Recommended For You" */}
        <section className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-[#030B3D] tracking-tight">
                  {user.skills && user.skills.length > 0 
                    ? (gigScopeFilter === 'demo' ? 'Sample Practice Projects' : 'Projects Matched to Your Skills')
                    : (gigScopeFilter === 'demo' ? 'Sample Listings — Practice ke liye' : 'Open Client Projects')}
                </h2>
                {user.skills && user.skills.length > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Rule Matched
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {gigScopeFilter === 'demo' ? 'Demo / Sample' : 'All Open Gigs'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {user.skills && user.skills.length > 0 
                  ? 'Personalized project recommendations based on your tech skills and category preferences.'
                  : (gigScopeFilter === 'demo' 
                      ? 'Curated sample client requirements for bidding practice. Add skills above to unlock real matching.'
                      : 'Browsing all open projects. Add your skills in profile to activate tailored recommendations.')}
              </p>
            </div>

            {/* Live Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Title / Description Search */}
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search title/description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                />
              </div>

              {/* Skills Filter Input */}
              <div className="relative w-full sm:w-48">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by skill..."
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                />
              </div>

              {/* Budget Range Selector */}
              <div className="relative">
                <select
                  value={budgetFilter}
                  onChange={(e) => setBudgetFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#593CFF] cursor-pointer"
                >
                  <option value="all">All Budgets (₹)</option>
                  <option value="under-10k">Under ₹10,000</option>
                  <option value="10k-30k">₹10,000 - ₹30,000</option>
                  <option value="30k-plus">Above ₹30,000</option>
                </select>
              </div>

              {/* Reset Filters Button */}
              {isAnyFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  title="Reset all search and filters"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Skill Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              <span>Quick Skills:</span>
            </span>
            {popularSkills.map((sk) => {
              const isSelected = skillFilter.toLowerCase() === sk.toLowerCase();
              return (
                <button
                  key={sk}
                  onClick={() => setSkillFilter(isSelected ? '' : sk)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#593CFF] text-white shadow-xs font-bold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {sk}
                </button>
              );
            })}
          </div>

          {/* Project Type / Scope Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => { setGigScopeFilter('real'); setCurrentPage(1); }}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  gigScopeFilter === 'real'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50/50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Real Client Projects</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${gigScopeFilter === 'real' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                  {realGigs.length}
                </span>
              </button>

              <button
                onClick={() => { setGigScopeFilter('demo'); setCurrentPage(1); }}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  gigScopeFilter === 'demo'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50/50'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Demo / Sample Listings</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${gigScopeFilter === 'demo' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-900'}`}>
                  {demoGigs.length}
                </span>
              </button>

              <button
                onClick={() => { setGigScopeFilter('closed'); setCurrentPage(1); }}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  gigScopeFilter === 'closed'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>Closed Projects</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${gigScopeFilter === 'closed' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {closedGigs.length}
                </span>
              </button>

              <button
                onClick={() => { setGigScopeFilter('all'); setCurrentPage(1); }}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  gigScopeFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50'
                }`}
              >
                <span>All Open Projects</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${gigScopeFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {realGigs.length + demoGigs.length}
                </span>
              </button>
            </div>

            {/* Results counter indicator */}
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-2 flex-wrap">
              {user?.skills && user.skills.length > 0 ? (
                <>
                  Showing <span className="font-bold text-slate-900">{filteredGigs.length}</span> matching projects
                </>
              ) : (
                <>
                  Showing <span className="font-bold text-slate-900">{filteredGigs.length}</span> available projects
                  <span className="text-[11px] text-[#593CFF] font-medium bg-[#593CFF]/8 px-2 py-0.5 rounded-full">
                    • Add profile skills for tailored matches
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#593CFF] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gigs List / Empty State / Skeletons */}
          {loadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-slate-200 rounded-md w-24"></div>
                    <div className="h-3 bg-slate-100 rounded w-16"></div>
                  </div>
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3.5 bg-slate-100 rounded w-full"></div>
                    <div className="h-3.5 bg-slate-100 rounded w-5/6"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-slate-100 rounded w-14"></div>
                    <div className="h-5 bg-slate-100 rounded w-16"></div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="h-6 bg-slate-200 rounded w-20"></div>
                    <div className="h-8 bg-slate-200 rounded-xl w-28"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredGigs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedGigs.map((gig) => {
                // Compute skill matches against user's skills
                const gigSkills = (gig.skillsRequired || []).map(s => String(s).trim());
                const matchedSkillList = gigSkills.filter(gs => {
                  const gsLow = gs.toLowerCase();
                  return userSkillNames.some(us => {
                    if (us === gsLow) return true;
                    if (us.length <= 3 || gsLow.length <= 3) return false;
                    return gsLow.includes(us) || us.includes(gsLow);
                  });
                });

                // Combine with backend matchedSkills if available (case-insensitive deduplication)
                const seenSkills = new Set();
                const combinedMatched = [
                  ...matchedSkillList,
                  ...(gig.matchedSkills || [])
                ].filter(s => {
                  const sLow = String(s).toLowerCase().trim();
                  if (!sLow || seenSkills.has(sLow)) return false;
                  seenSkills.add(sLow);
                  return true;
                });

                const hasApplied = proposals.some(p => {
                  const pGigId = typeof p.gig === 'object' ? p.gig?._id : p.gig;
                  return String(pGigId) === String(gig._id);
                });

                return (
                  <div 
                    key={gig._id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {gig.category || 'General'}
                          </span>
                          {gig.isDemo || gig.isSample ? (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span>Demo / Sample</span>
                            </span>
                          ) : gig.status === 'closed' ? (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-slate-500" />
                              <span>Closed Project</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Client Project</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">
                          {gig.isDemo || gig.isSample 
                            ? 'Demo Preview' 
                            : (gig.createdAt ? `Posted ${new Date(gig.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Live Gig')}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-[#030B3D] group-hover:text-[#593CFF] transition-colors line-clamp-1">
                        {gig.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {gig.description}
                      </p>

                      {/* Explicit Skill Match Banner (Reason) */}
                      {combinedMatched.length > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>🎯 Skill Match: {combinedMatched.join(', ')}</span>
                        </div>
                      )}

                      {/* Required Skills Chips (highlighting matched ones) */}
                      {gigSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {gigSkills.map((sk, sIdx) => {
                            const isMatch = combinedMatched.some(m => m.toLowerCase() === sk.toLowerCase());
                            return (
                              <span 
                                key={sIdx} 
                                className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                                  isMatch 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 font-medium'
                                }`}
                              >
                                {isMatch ? `✓ ${sk}` : sk}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Deadline indicator if present */}
                      {gig.deadline && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 w-fit">
                          <Calendar className="w-3 h-3 text-amber-600" />
                          <span>Due: {new Date(gig.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      )}

                      {/* Additional Rule Match Reasons (Category / Work preference) */}
                      {gig.matchReasons && gig.matchReasons.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {gig.matchReasons
                            .filter(r => !r.toLowerCase().includes('skills match')) // avoid duplicate skill match banner
                            .map((reason, rIdx) => (
                              <span key={rIdx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                                ✓ {reason}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Budget</span>
                      <span className="text-base font-black text-emerald-600">
                        ₹{(gig.budget || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {gig.isDemo || gig.isSample ? (
                      <div 
                        className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed select-none"
                        title="Proposal submissions are disabled on Demo / Sample listings"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Demo (Bidding Disabled)</span>
                      </div>
                    ) : gig.status === 'closed' ? (
                      <div 
                        className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-500 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed select-none"
                        title="This project is closed and no longer accepting proposals"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Project Closed</span>
                      </div>
                    ) : hasApplied ? (
                      <div 
                        className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5 select-none"
                        title="You have already submitted a proposal for this project"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600 shrink-0" />
                        <span>Applied</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenProposalModal(gig)}
                        className="px-3.5 py-2 rounded-xl bg-[#593CFF] hover:bg-[#472fe0] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Proposal</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
              <span className="text-xs font-semibold text-slate-500">
                Showing <span className="font-bold text-slate-900">{startIndex + 1}</span> to{' '}
                <span className="font-bold text-slate-900">{Math.min(startIndex + ITEMS_PER_PAGE, filteredGigs.length)}</span> of{' '}
                <span className="font-bold text-slate-900">{filteredGigs.length}</span> projects
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  disabled={safeCurrentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => {
                        setCurrentPage(pg);
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        safeCurrentPage === pg
                          ? 'bg-[#593CFF] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  disabled={safeCurrentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
          </>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#593CFF] flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#030B3D]">No gigs currently in this category</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Check back shortly! New client projects are posted regularly across Mumbai and India.
              </p>
            </div>
          )}

        </section>

        {/* 5. Lower Sections: Proposals & Contracts Tabs + Portfolio Showcase */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: My Proposals & Active Projects Tabs */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setActiveTab('proposals')}
                className={`text-sm font-bold pb-1 cursor-pointer transition-colors relative ${
                  activeTab === 'proposals' ? 'text-[#030B3D]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span>My Proposals ({realProposals.length})</span>
                {activeTab === 'proposals' && (
                  <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-[#593CFF] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('contracts')}
                className={`text-sm font-bold pb-1 ml-4 cursor-pointer transition-colors relative ${
                  activeTab === 'contracts' ? 'text-[#030B3D]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span>Active Contracts ({contracts.length})</span>
                {activeTab === 'contracts' && (
                  <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-[#593CFF] rounded-full" />
                )}
              </button>
            </div>

            {/* Tab 1: Proposals List */}
            {activeTab === 'proposals' && (
              proposals.length > 0 ? (
                <div className="space-y-3">
                  {proposals.map((prop) => (
                    <div 
                      key={prop._id}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            prop.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                            prop.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {prop.status}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">Est. {prop.estimatedTime || 'N/A'}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-[#030B3D]">
                          {prop.gig?.title || 'Hyperlocal Gig Contract'}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {prop.coverLetter || 'Proposal submitted for review.'}
                        </p>
                      </div>

                      <div className="text-right sm:shrink-0 flex sm:flex-col items-end justify-between sm:justify-center gap-1.5">
                        <div>
                          <span className="text-sm font-black text-slate-900 block">
                            ₹{(prop.bidAmount || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Your bid</span>
                        </div>
                        {prop.status === 'pending' && (
                          <button
                            onClick={() => handleWithdrawProposal(prop._id)}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer transition"
                            title="Withdraw your pending bid"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center">
                  <p className="text-xs text-slate-500 font-medium">
                    You haven't sent any proposals yet. Check the recommended gigs above to place your first bid.
                  </p>
                </div>
              )
            )}

            {/* Tab 2: Contracts List (Step 6 Work Tracking) */}
            {activeTab === 'contracts' && (
              contracts.length > 0 ? (
                <div className="space-y-4">
                  {contracts.map((contract) => {
                    const isInProgress = contract.status === 'in-progress';
                    const isCompleted = contract.status === 'completed';
                    const milestones = contract.milestones || [];

                    return (
                      <div 
                        key={contract._id}
                        className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 transition hover:shadow-xs"
                      >
                        {/* Contract Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                                isInProgress 
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                  : isCompleted 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isInProgress ? 'bg-blue-600 animate-pulse' : isCompleted ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                                {contract.status === 'in-progress' ? 'Active Contract' : contract.status}
                              </span>

                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#593CFF] border border-indigo-100 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-[#593CFF]" />
                                Demo Escrow Funded
                              </span>
                            </div>

                            <h4 className="font-extrabold text-base text-[#030B3D]">
                              {contract.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                              <span>Client: <strong className="text-slate-800">{contract.client?.name || contract.client?.username || 'Client'}</strong></span>
                              <span>•</span>
                              <span>Category: <strong className="text-slate-700">{contract.category}</strong></span>
                              {contract.deadline && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    Deadline: {new Date(contract.deadline).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="text-left sm:text-right shrink-0">
                            <span className="text-lg font-black text-[#030B3D] block">
                              ₹{Number(contract.budget || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Agreed Contract Value</span>
                          </div>
                        </div>

                        {/* Agreed Scope / Description */}
                        {contract.description && (
                          <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 text-xs text-slate-600 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Agreed Scope</span>
                            <p className="line-clamp-2">{contract.description}</p>
                          </div>
                        )}

                        {/* Milestones & Deliverables List */}
                        <div className="space-y-3 pt-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-[#593CFF]" />
                              <span>Work Tracking & Milestones ({milestones.length})</span>
                            </h5>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {milestones.filter(m => m.status === 'completed').length} of {milestones.length} completed
                            </span>
                          </div>

                          {milestones.length === 0 ? (
                            <div className="bg-slate-50 rounded-2xl p-4 text-center text-xs text-slate-500">
                              No specific milestones configured for this contract.
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {milestones.map((m, idx) => {
                                const mPending = m.status === 'pending';
                                const mSubmitted = m.status === 'submitted';
                                const mRevision = m.status === 'revision_requested';
                                const mCompleted = m.status === 'completed';

                                return (
                                  <div 
                                    key={m._id || idx}
                                    className={`p-4 rounded-2xl border transition ${
                                      mRevision 
                                        ? 'bg-amber-50/60 border-amber-200' 
                                        : mSubmitted 
                                          ? 'bg-blue-50/50 border-blue-200' 
                                          : mCompleted 
                                            ? 'bg-emerald-50/40 border-emerald-200' 
                                            : 'bg-white border-slate-200'
                                    }`}
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-[#030B3D]">
                                            {m.title || `Milestone #${idx + 1}`}
                                          </span>
                                          <span className="text-xs font-black text-slate-700">
                                            ₹{Number(m.amount || 0).toLocaleString('en-IN')}
                                          </span>
                                        </div>
                                        {m.description && (
                                          <p className="text-xs text-slate-500">{m.description}</p>
                                        )}
                                      </div>

                                      {/* Status Pill & Action Button */}
                                      <div className="flex items-center gap-2 shrink-0">
                                        {mPending && (
                                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                            In Progress
                                          </span>
                                        )}
                                        {mSubmitted && (
                                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Under Review
                                          </span>
                                        )}
                                        {mRevision && (
                                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3 text-amber-700" />
                                            Revision Requested
                                          </span>
                                        )}
                                        {mCompleted && (
                                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                            <Check className="w-3 h-3 stroke-[3]" />
                                            Approved & Released
                                          </span>
                                        )}

                                        {/* Deliverable Action Buttons */}
                                        {mPending && (
                                          <button
                                            onClick={() => handleOpenDeliverableModal(contract._id, m)}
                                            className="text-xs font-bold text-white bg-[#593CFF] hover:bg-[#472fe0] px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
                                          >
                                            <Send className="w-3 h-3" />
                                            <span>Submit Work</span>
                                          </button>
                                        )}

                                        {mRevision && (
                                          <button
                                            onClick={() => handleOpenDeliverableModal(contract._id, m)}
                                            className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
                                          >
                                            <RotateCcw className="w-3 h-3" />
                                            <span>Resubmit Work</span>
                                          </button>
                                        )}

                                        {mSubmitted && (
                                          <button
                                            onClick={() => handleOpenDeliverableModal(contract._id, m)}
                                            className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
                                          >
                                            <span>Update Work</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Client Revision Feedback Banner */}
                                    {mRevision && m.revisionNotes && (
                                      <div className="mt-3 p-3 rounded-xl bg-amber-100/70 border border-amber-300 text-xs text-amber-950 space-y-1">
                                        <div className="font-bold flex items-center gap-1.5 text-amber-900">
                                          <MessageSquare className="w-3.5 h-3.5" />
                                          <span>Client's Revision Feedback:</span>
                                        </div>
                                        <p className="italic">"{m.revisionNotes}"</p>
                                        <span className="text-[10px] text-amber-800 block pt-0.5">
                                          Please update your deliverable URL or notes and click "Resubmit Work" above.
                                        </span>
                                      </div>
                                    )}

                                    {/* Submitted Deliverable Details */}
                                    {(m.deliverableUrl || m.deliverableNotes) && (
                                      <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Submitted Deliverable
                                          </span>
                                          {m.submittedAt && (
                                            <span className="text-[10px] text-slate-400">
                                              Submitted {new Date(m.submittedAt).toLocaleDateString()}
                                            </span>
                                          )}
                                        </div>

                                        {m.deliverableUrl && (
                                          <div className="flex items-center gap-2">
                                            <a 
                                              href={m.deliverableUrl.startsWith('http') ? m.deliverableUrl : `https://${m.deliverableUrl}`}
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-xs font-bold text-[#593CFF] hover:underline"
                                            >
                                              <ExternalLink className="w-3.5 h-3.5" />
                                              <span>{m.deliverableUrl}</span>
                                            </a>
                                          </div>
                                        )}

                                        {m.deliverableNotes && (
                                          <p className="text-slate-600 font-medium">
                                            {m.deliverableNotes}
                                          </p>
                                        )}
                                      </div>
                                    )}

                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#593CFF] flex items-center justify-center mx-auto mb-2">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-[#030B3D]">No Active Contracts</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                    When a client accepts your proposal and initiates a contract, milestone deliverables and work tracking will appear here.
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-amber-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      Sandbox Mode: Contracts use simulated milestone escrow (no real banking charges).
                    </span>
                  </div>
                </div>
              )
            )}

          </div>

          {/* Right 1 Col: Portfolio & Showcase Work */}
          <div className="space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-extrabold text-[#030B3D]">
                Showcase Portfolio
              </h3>
              <button
                onClick={() => setIsAddPortfolioOpen(true)}
                className="text-xs font-bold text-[#593CFF] hover:text-[#472fe0] inline-flex items-center gap-1 cursor-pointer hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Work</span>
              </button>
            </div>

            {user.portfolio && user.portfolio.length > 0 ? (
              <div className="space-y-3">
                {user.portfolio.map((item, idx) => {
                  const projectUrl = item.projectUrl || item.link || item.githubUrl;
                  return (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs text-[#030B3D]">{item.title}</h4>
                        {projectUrl && (
                          <a 
                            href={projectUrl.startsWith('http') ? projectUrl : `https://${projectUrl}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-slate-400 hover:text-[#593CFF] transition inline-flex items-center gap-1 text-[11px] font-bold"
                            title="Open repository or demo"
                          >
                            <span>Repo / Demo</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 text-center space-y-3">
                <FolderGit2 className="w-8 h-8 text-slate-300 mx-auto" />
                <div>
                  <h4 className="text-xs font-extrabold text-[#030B3D]">No projects added yet</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Showcase GitHub repos or live project URLs to win client trust.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddPortfolioOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  + Add First Project
                </button>
              </div>
            )}

          </div>

        </section>

      </main>

      {/* --- MODAL 1: Edit Profile (Bio & Skills) --- */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-extrabold text-[#030B3D]">Edit Freelancer Profile</h3>
              <button 
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                {actionSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              
              {/* Avatar Selection & Preview */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">Profile Photo / Avatar</label>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-[#593CFF] overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                    {profileForm.avatar ? (
                      <img src={profileForm.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-sm text-[#593CFF]">{(profileForm.name || 'U').charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[11px] text-slate-500 font-medium">Pick a quick avatar or paste your image URL below:</p>
                    <div className="flex items-center gap-1.5">
                      {[
                        { label: '🤖 Dev Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=GigOraDev' },
                        { label: '👩‍💻 Tech Aria', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria' },
                        { label: '👨‍💻 Felix Code', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
                        { label: '⚡ Cyber Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CodeNinja' }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setProfileForm(p => ({ ...p, avatar: preset.url }))}
                          className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                            profileForm.avatar === preset.url
                              ? 'bg-[#593CFF] text-white border-[#593CFF]'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <input
                  type="url"
                  placeholder="Or enter custom image URL: https://..."
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm(p => ({ ...p, avatar: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name (+20%)</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Headline & Bio (+20%)</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Full-Stack Developer specializing in MERN, FastAPI and hyper-responsive UI."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Skills (+20% - comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="React.js, Node.js, MongoDB, Tailwind CSS, Python"
                  value={profileForm.skills}
                  onChange={(e) => setProfileForm(p => ({ ...p, skills: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Hourly Rate (₹ / hr)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={profileForm.hourlyRate}
                  onChange={(e) => setProfileForm(p => ({ ...p, hourlyRate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                />
              </div>

              {/* Portfolio Project Bridge Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800">Portfolio Work (+20%)</span>
                    {hasPortfolio ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-md">Completed</span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-700 rounded-md">Pending</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {user.portfolio?.length ? `${user.portfolio.length} project(s) showcased on your profile` : 'Add your GitHub repo or live project to reach 100%'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditProfileOpen(false);
                    setIsAddPortfolioOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#593CFF] text-[#593CFF] font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0"
                >
                  + Add Project
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 rounded-xl bg-[#593CFF] hover:bg-[#472fe0] text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Add Portfolio Project --- */}
      {isAddPortfolioOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-extrabold text-[#030B3D]">Add Portfolio Project</h3>
              <button 
                onClick={() => setIsAddPortfolioOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                {actionSuccess}
              </div>
            )}

            <form onSubmit={handleAddPortfolio} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyperlocal Delivery App"
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="What was built, key features, and your contribution."
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Live URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://myproject.com"
                  value={portfolioForm.link}
                  onChange={(e) => setPortfolioForm(p => ({ ...p, link: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">GitHub Repository (optional)</label>
                <input
                  type="url"
                  placeholder="https://github.com/myname/repo"
                  value={portfolioForm.githubUrl}
                  onChange={(e) => setPortfolioForm(p => ({ ...p, githubUrl: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Socket.io"
                  value={portfolioForm.tags}
                  onChange={(e) => setPortfolioForm(p => ({ ...p, tags: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPortfolioOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 rounded-xl bg-[#593CFF] hover:bg-[#472fe0] text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Add Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Submit Proposal to Client Gig --- */}
      {isProposalModalOpen && selectedGigForBid && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#030B3D]">Submit Proposal</h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-1">{selectedGigForBid.title}</p>
              </div>
              <button 
                onClick={() => setIsProposalModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                {actionSuccess}
              </div>
            )}

            {!user.isEmailVerified && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Email Verification Required to Bid</span>
                  <span>You can review details and draft your pitch, but submitting requires a verified email address.</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitProposal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Your Bid (₹)</label>
                  <input
                    type="number"
                    min="100"
                    max={selectedGigForBid?.budget ? selectedGigForBid.budget * 3 : 500000}
                    required
                    value={proposalForm.bidAmount}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setProposalForm(p => ({ ...p, bidAmount: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Est. Timeline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 days"
                    value={proposalForm.estimatedTime}
                    onChange={(e) => setProposalForm(p => ({ ...p, estimatedTime: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Cover Letter & Pitch
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Explain why you are the best fit for this gig and your proposed approach."
                  value={proposalForm.coverLetter}
                  onChange={(e) => setProposalForm(p => ({ ...p, coverLetter: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Demo Escrow Simulation</span>
                </div>
                <p className="text-amber-800/90">Sandbox testing mode — No real banking transactions or payment deductions apply.</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProposalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 rounded-xl bg-[#593CFF] hover:bg-[#472fe0] text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Proposal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Milestone Deliverable Submission Modal (Step 6 Work Tracking) */}
      {isDeliverableModalOpen && selectedContractMilestone && (
        <div className="fixed inset-0 z-50 bg-[#030B3D]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#593CFF] bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  Step 6 • Work Tracking
                </span>
                <h3 className="font-extrabold text-base text-[#030B3D] mt-1">
                  Submit Milestone Deliverable
                </h3>
              </div>
              <button
                onClick={() => setIsDeliverableModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Milestone Info Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-[#030B3D]">
                    {selectedContractMilestone.milestone.title || 'Project Scope & Deliverables'}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Target milestone for client verification
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-[#593CFF] block">
                    ₹{Number(selectedContractMilestone.milestone.amount || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Demo Escrow</span>
                </div>
              </div>

              {deliverableError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{deliverableError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitDeliverable} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Deliverable URL (GitHub / Figma / Drive / Live App)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/... or https://figma.com/..."
                    value={deliverableForm.deliverableUrl}
                    onChange={(e) => setDeliverableForm(prev => ({ ...prev, deliverableUrl: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Add link to your codebase, deployed app, design file, or assets.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Submission Notes & Work Summary
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Describe the tasks completed, test results, instructions for the client to run or inspect your work..."
                    value={deliverableForm.deliverableNotes}
                    onChange={(e) => setDeliverableForm(prev => ({ ...prev, deliverableNotes: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-[#030B3D] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#593CFF]" />
                    <span>Demo Escrow Protection</span>
                  </div>
                  <p>Client will review your submitted deliverable. They can either accept and release demo escrow funds, or request revisions with specific comments.</p>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDeliverableModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingDeliverable}
                    className="px-5 py-2 rounded-xl bg-[#593CFF] hover:bg-[#472fe0] text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submittingDeliverable && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Submit Deliverable</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Incomplete Profile Warning --- */}
      {incompleteProfileModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <button 
                onClick={() => setIncompleteProfileModal({ isOpen: false, missingFields: [] })}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-black text-[#030B3D]">
                Complete Your Profile Before Bidding
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Clients need to review your verified skills and bio before accepting proposals. Please complete the following required fields:
              </p>
            </div>

            <div className="space-y-2 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">
                Required Profile Fields:
              </span>
              <ul className="space-y-1.5 text-xs text-amber-900">
                {incompleteProfileModal.missingFields.map((field, idx) => (
                  <li key={idx} className="flex items-center gap-2 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                    <span>{field}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIncompleteProfileModal({ isOpen: false, missingFields: [] })}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIncompleteProfileModal({ isOpen: false, missingFields: [] });
                  navigate('/freelancer/setup');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#593CFF] hover:bg-[#472fe0] text-white font-bold text-xs shadow-md shadow-[#593CFF]/20 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Complete Profile Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-200/60 mt-12 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">GigOra Freelancer Studio</span>
            <span>•</span>
            <span>Zero Platform Commission</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/terms" className="hover:text-slate-600 transition">Terms</Link>
            <Link to="/privacy" className="hover:text-slate-600 transition">Privacy</Link>
            <span>© {currentYear} GigOra</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
