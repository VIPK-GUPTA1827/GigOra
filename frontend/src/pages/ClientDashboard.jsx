import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import { 
  Briefcase, 
  Plus, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowRightLeft, 
  LogOut, 
  MapPin, 
  Check, 
  X, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  ShieldCheck,
  ChevronRight,
  Send,
  FileText,
  Building2,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  UploadCloud,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  Loader2,
  AlertCircle,
  Wallet,
  Pause,
  Play
} from 'lucide-react';

const POPULAR_SKILLS = [
  'React', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS',
  'JavaScript', 'TypeScript', 'Next.js', 'Python', 'FastAPI',
  'Figma', 'UI/UX Design', 'Docker', 'REST API', 'Redux'
];

const CATEGORIES = [
  'Web Development',
  'Mobile App Development',
  'UI/UX Design',
  'Data Science & AI',
  'Backend & APIs',
  'DevOps & Cloud',
  'Content & Writing',
  'Graphic Design'
];

const BASE = import.meta.env.VITE_API_URL || '';

export default function ClientDashboard() {
  const { user, logout, switchRole, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();

  // State
  const [switching, setSwitching] = useState(false);
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'proposals' | 'profile'
  const [projectStatusFilter, setProjectStatusFilter] = useState('all'); // 'all' | 'open' | 'draft' | 'paused' | 'closed'
  const [myGigs, setMyGigs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Company Profile Form State
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    companyName: '',
    companyLogo: '',
    companyWebsite: '',
    companySize: '1-10 employees',
    industry: 'Technology & Digital Services',
    companyDescription: '',
    city: 'Mumbai',
    state: 'Maharashtra'
  });

  // Post & Edit Gig Modal State
  const initialFormState = {
    title: '',
    category: 'Web Development',
    description: '',
    budget: '',
    locationType: 'remote',
    address: 'Remote / Online',
    experienceLevel: 'Intermediate',
    duration: '1-4 weeks',
    deadline: '',
    skillsRequired: ['React', 'Node.js']
  };

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isSubmittingGig, setIsSubmittingGig] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [formData, setFormData] = useState(initialFormState);
  const [editingGigId, setEditingGigId] = useState(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);

  // Selected Gig for Filtered Proposal View
  const [selectedGigFilter, setSelectedGigFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Step 6 Work Tracking: Milestone Revision & Approval States
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [selectedMilestoneForRevision, setSelectedMilestoneForRevision] = useState(null); // { gigId, milestone }
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [revisionError, setRevisionError] = useState('');
  const [milestoneActionLoading, setMilestoneActionLoading] = useState(false);

  // Fetch client gigs & proposals
  const fetchClientData = async () => {
    setLoadingData(true);
    try {
      // 1. Fetch Client's Gigs
      const gigsRes = await fetch(`${BASE}/api/gigs/client/my-gigs`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const gigsData = await gigsRes.json();
      if (gigsData.success) {
        setMyGigs(gigsData.data || []);
      }

      // 2. Fetch All Proposals Received for Client's Gigs
      const propRes = await fetch(`${BASE}/api/proposals/client/all-proposals`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const propData = await propRes.json();
      if (propData.success) {
        setProposals(propData.data || []);
      }
    } catch (err) {
      console.error('Failed to load client data:', err);
      setErrorMsg('Failed to sync latest client listings.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'client') {
      fetchClientData();
      setProfileFormData({
        name: user.name || user.username || '',
        companyName: user.companyName || '',
        companyLogo: user.companyLogo || '',
        companyWebsite: user.companyWebsite || '',
        companySize: user.companySize || '1-10 employees',
        industry: user.industry || 'Technology & Digital Services',
        companyDescription: user.companyDescription || '',
        city: user.location?.city || 'Mumbai',
        state: user.location?.state || 'Maharashtra'
      });
    }
  }, [user?._id, user?.role]);

  // Handle Save Company Profile
  const handleSaveCompanyProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!profileFormData.name.trim()) {
      setErrorMsg('Please enter your contact person / client name.');
      setIsSavingProfile(false);
      return;
    }

    try {
      const payload = {
        name: profileFormData.name.trim(),
        companyName: profileFormData.companyName.trim(),
        companyLogo: profileFormData.companyLogo.trim(),
        companyWebsite: profileFormData.companyWebsite.trim(),
        companySize: profileFormData.companySize,
        industry: profileFormData.industry,
        companyDescription: profileFormData.companyDescription.trim(),
        location: {
          city: profileFormData.city.trim(),
          state: profileFormData.state.trim()
        }
      };

      const res = await fetch(`${BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update company profile');
      }

      updateUser(data.data || { ...user, ...payload });
      setSuccessMsg('Company profile updated successfully! Changes are live on your public profile.');
    } catch (err) {
      setErrorMsg(err.message || 'Error updating profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-sm font-semibold text-stone-700">
        Loading client workspace...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'client') {
    return <Navigate to="/freelancer/dashboard" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSwitchRole = async () => {
    try {
      setSwitching(true);
      setErrorMsg('');
      const updatedUser = await switchRole();
      if (updatedUser?.role === 'freelancer') {
        navigate('/freelancer/dashboard', { replace: true });
      } else {
        navigate('/client/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Failed to switch workspace:', err);
      setErrorMsg(err.message || 'Failed to switch workspace. Please try again.');
    } finally {
      setSwitching(false);
    }
  };

  // Skill Management in Modal
  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!formData.skillsRequired.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, trimmed]
      }));
    }
    setCustomSkillInput('');
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(s => s !== skillToRemove)
    }));
  };

  // Open Create Project Modal
  const handleOpenCreateModal = () => {
    setEditingGigId(null);
    setIsEditingDraft(false);
    setFormData(initialFormState);
    setErrorMsg('');
    setIsPostModalOpen(true);
  };

  // Open Edit Project Modal
  const handleOpenEditModal = (gig) => {
    setEditingGigId(gig._id);
    setIsEditingDraft(gig.status === 'draft');
    setFormData({
      title: gig.title || '',
      category: gig.category || 'Web Development',
      description: gig.description || '',
      budget: gig.budget ? String(gig.budget) : '',
      locationType: gig.locationType || 'remote',
      address: gig.address || 'Remote / Online',
      experienceLevel: gig.experienceLevel || 'Intermediate',
      duration: gig.duration || '1-4 weeks',
      deadline: gig.deadline ? new Date(gig.deadline).toISOString().split('T')[0] : '',
      skillsRequired: gig.skillsRequired && gig.skillsRequired.length > 0 ? gig.skillsRequired : ['React', 'Node.js']
    });
    setErrorMsg('');
    setIsPostModalOpen(true);
  };

  // Handle Project Creation or Edit (Draft or Open)
  const handleSubmitProject = async (targetStatus) => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Please enter a project title.');
      return;
    }

    if (targetStatus === 'open') {
      if (!formData.description.trim() || formData.description.length < 10) {
        setErrorMsg('Please provide a detailed project description (minimum 10 characters).');
        return;
      }
      if (!formData.budget || Number(formData.budget) <= 0) {
        setErrorMsg('Please enter a valid project budget in INR (₹).');
        return;
      }
      if (formData.skillsRequired.length === 0) {
        setErrorMsg('Please add at least 1 required skill.');
        return;
      }
    }

    try {
      setIsSubmittingGig(true);
      const url = editingGigId ? `${BASE}/api/gigs/${editingGigId}` : `${BASE}/api/gigs`;
      const method = editingGigId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title.trim(),
          category: formData.category,
          description: formData.description.trim(),
          budget: formData.budget ? Number(formData.budget) : 0,
          locationType: formData.locationType,
          address: formData.locationType === 'onsite' ? (formData.address || 'Mumbai, Maharashtra') : 'Remote / Online',
          experienceLevel: formData.experienceLevel,
          duration: formData.duration,
          deadline: formData.deadline || null,
          skillsRequired: formData.skillsRequired,
          status: editingGigId && !isEditingDraft ? undefined : targetStatus
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save project');
      }

      const isPublished = targetStatus === 'open';
      const msg = editingGigId
        ? (isPublished ? `Project "${data.data.title}" updated and published!` : `Draft "${data.data.title}" updated successfully!`)
        : (isPublished ? `Project "${data.data.title}" posted successfully! Matching freelancers will now see this listing.` : `Project "${data.data.title}" saved as draft! Only you can see it until published.`);

      setSuccessMsg(msg);
      setIsPostModalOpen(false);
      setEditingGigId(null);
      setFormData(initialFormState);

      await fetchClientData();
    } catch (err) {
      setErrorMsg(err.message || 'Error saving project. Please try again.');
    } finally {
      setIsSubmittingGig(false);
    }
  };

  // Quick Publish a Draft Gig
  const handleQuickPublish = async (gigId) => {
    try {
      setActionLoadingId(gigId);
      const res = await fetch(`${BASE}/api/gigs/${gigId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'open' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to publish draft');
      setSuccessMsg(`Project published successfully! Freelancers can now bid.`);
      await fetchClientData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Set Specific Project Status (open, paused, closed)
  const handleSetStatus = async (gigId, newStatus) => {
    try {
      setActionLoadingId(gigId);
      const res = await fetch(`${BASE}/api/gigs/${gigId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || `Failed to update status to ${newStatus}`);
      
      const statusLabels = {
        open: 'Project is now Open! Freelancers can submit proposals.',
        paused: 'Project paused. Freelancer bidding is temporarily on hold.',
        closed: 'Project closed.'
      };
      setSuccessMsg(statusLabels[newStatus] || `Project marked as ${newStatus}!`);
      await fetchClientData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Close / Reopen Project
  const handleToggleClose = async (gigId, currentStatus) => {
    const nextStatus = currentStatus === 'closed' ? 'open' : 'closed';
    return handleSetStatus(gigId, nextStatus);
  };

  // Delete a Gig
  const handleDeleteGig = async (gigId) => {
    if (!window.confirm('Are you sure you want to delete this project listing?')) return;
    try {
      setActionLoadingId(gigId);
      const res = await fetch(`${BASE}/api/gigs/${gigId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete project');
      setSuccessMsg('Project deleted successfully.');
      await fetchClientData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Proposal Accept / Reject
  const handleProposalAction = async (proposalId, status) => {
    if (status === 'rejected' && !window.confirm('Are you sure you want to decline this candidate proposal?')) return;
    if (status === 'accepted' && !window.confirm('Accept this proposal in Demo Mode? (Simulated Escrow without real banking charge)')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setActionLoadingId(proposalId);
      const res = await fetch(`${BASE}/api/proposals/${proposalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to ${status} proposal`);
      }

      setSuccessMsg(`Proposal ${status === 'accepted' ? 'accepted and initiated in Demo Mode (Simulated Escrow)' : 'declined'}.`);
      await fetchClientData();
    } catch (err) {
      setErrorMsg(err.message || `Error updating proposal.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Step 6 Work Tracking: Milestone Approval (Demo Escrow release)
  const handleApproveMilestone = async (gigId, milestoneId) => {
    if (!window.confirm('Are you sure you want to approve this deliverable? In test/demo mode, escrow funds will be unlocked and credited to the freelancer wallet.')) {
      return;
    }
    setMilestoneActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${BASE}/api/gigs/${gigId}/milestones/${milestoneId}/approve`, {
        method: 'PUT',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to approve milestone deliverable');
      }
      setSuccessMsg('Milestone deliverable approved and payment released (Demo Escrow)!');
      await fetchClientData();
    } catch (err) {
      setErrorMsg(err.message || 'Error approving milestone');
    } finally {
      setMilestoneActionLoading(false);
    }
  };

  // Step 6 Work Tracking: Open Revision Modal
  const handleOpenRevisionModal = (gigId, milestone) => {
    setSelectedMilestoneForRevision({ gigId, milestone });
    setRevisionFeedback('');
    setRevisionError('');
    setRevisionModalOpen(true);
  };

  // Step 6 Work Tracking: Submit Revision Request
  const handleSubmitRevision = async (e) => {
    e.preventDefault();
    if (!selectedMilestoneForRevision) return;
    if (!revisionFeedback || revisionFeedback.trim().length < 5) {
      setRevisionError('Please provide at least 5 characters of feedback explaining what needs revision.');
      return;
    }
    setMilestoneActionLoading(true);
    setRevisionError('');
    try {
      const { gigId, milestone } = selectedMilestoneForRevision;
      const res = await fetch(`${BASE}/api/gigs/${gigId}/milestones/${milestone._id}/revision`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ feedback: revisionFeedback.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to request revision');
      }
      setRevisionModalOpen(false);
      setSuccessMsg('Revision requested successfully. Freelancer has been notified.');
      await fetchClientData();
    } catch (err) {
      setRevisionError(err.message || 'Error requesting revision');
    } finally {
      setMilestoneActionLoading(false);
    }
  };

  // Metrics (Filtered to strictly Real Client Projects)
  const realMyGigs = myGigs.filter(g => !g.isDemo && !g.isSample);
  const realProposals = proposals.filter(p => !p.gig?.isDemo && !p.gig?.isSample);
  const activeGigsCount = realMyGigs.filter(g => g.status === 'open').length;
  const draftGigsCount = realMyGigs.filter(g => g.status === 'draft').length;
  const pausedGigsCount = realMyGigs.filter(g => g.status === 'paused').length;
  const closedGigsCount = realMyGigs.filter(g => g.status === 'closed').length;
  const inProgressCount = realMyGigs.filter(g => g.status === 'in-progress').length;
  const totalProposalsCount = realProposals.length;

  // Filtered Projects for Client View
  const displayedProjects = realMyGigs.filter(g => {
    if (projectStatusFilter === 'all') return true;
    return g.status === projectStatusFilter;
  });

  // Filtered Proposals
  const filteredProposals = selectedGigFilter === 'all'
    ? realProposals
    : realProposals.filter(p => (p.gig?._id || p.gig) === selectedGigFilter);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-1.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#593CFF] to-[#3B82F6] flex items-center justify-center text-white text-sm font-black shadow-sm">
                G
              </span>
              GigOra
            </span>
            <span className="text-xs font-bold bg-indigo-50 text-[#593CFF] px-2.5 py-0.5 rounded-full border border-indigo-200/60 hidden sm:inline-flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              Client Workspace
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleSwitchRole}
              disabled={switching}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#593CFF] hover:text-[#472fe0] bg-[#593CFF]/10 hover:bg-[#593CFF]/15 border border-[#593CFF]/30 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
              title="Switch to Freelancer perspective"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{switching ? 'Switching...' : 'Switch to Freelancer View'}</span>
              <span className="sm:hidden">Freelancer</span>
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <Link
              to="/profile/me"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition"
              title="View Public Profile"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">View Public Profile</span>
            </Link>

            {/* In-App Notifications Bell */}
            <NotificationBell 
              userRole="client" 
              onNavigateToGig={(gigId, notifType, destinationUrl) => {
                if (destinationUrl) {
                  const urlParams = new URLSearchParams(destinationUrl.split('?')[1]);
                  const tab = urlParams.get('tab');
                  if (tab) {
                    setActiveTab(tab);
                    return;
                  }
                }
                if (notifType === 'proposal_submitted') {
                  setActiveTab('proposals');
                } else {
                  setActiveTab('projects');
                }
              }} 
            />

            <div className="text-xs text-slate-600 hidden md:block">
              <strong className="text-slate-900 font-semibold">{user.companyName || user.name || user.username}</strong>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Email Verification Banner */}
        {!user.isEmailVerified && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Email verification pending:</strong> Please verify your email to unlock all escrow contracts and direct messaging.
              </span>
            </div>
            <a 
              href={`/check-email?email=${encodeURIComponent(user.email)}`}
              className="font-bold text-amber-800 underline hover:text-amber-950 shrink-0 inline-flex items-center gap-1"
            >
              Verify Email Now →
            </a>
          </div>
        )}

        {/* Global Notifications */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-700 font-bold ml-2">×</button>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700 font-bold ml-2">×</button>
          </div>
        )}

        {/* Hero Header & Post Action */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#593CFF]" />
              Direct Client Hiring Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user.name || user.username}!
            </h1>
            <p className="text-sm text-slate-500 max-w-xl">
              Post freelance projects with exact skills required, review transparent candidate bids, and collaborate directly with skilled MERN & Python developers.
            </p>
          </div>

          <div className="z-10 shrink-0 flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#593CFF] hover:bg-[#472fe0] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Post a Project</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500">Active Postings</span>
              <Briefcase className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{activeGigsCount}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Open for proposals
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500">Total Bids Received</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalProposalsCount}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">From real developers</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold text-slate-500">In Progress</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{inProgressCount}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">Contracts underway</div>
          </div>

          <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Test Balance</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Sandbox
                </span>
              </div>
              <Wallet className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-950">₹{(user.walletBalance || 0).toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-amber-800/90 font-semibold mt-1">⚠️ Sandbox Demo • No Real Currency</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-slate-200 pt-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('projects')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === 'projects'
                  ? 'border-[#593CFF] text-[#593CFF]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>My Projects ({realMyGigs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('proposals')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === 'proposals'
                  ? 'border-[#593CFF] text-[#593CFF]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Applicant Proposals ({realProposals.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-[#593CFF] text-[#593CFF]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Company Profile</span>
            </button>
          </div>

          {activeTab === 'proposals' && myGigs.length > 0 && (
            <div className="flex items-center gap-2 pb-2">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Filter by Project:</span>
              <select
                value={selectedGigFilter}
                onChange={(e) => setSelectedGigFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-none focus:border-[#593CFF]"
              >
                <option value="all">All Projects ({proposals.length})</option>
                {myGigs.map(g => (
                  <option key={g._id} value={g._id}>
                    {g.title.length > 30 ? g.title.substring(0, 30) + '...' : g.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: My Projects */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {/* Project Status Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: `All Projects (${realMyGigs.length})` },
                  { id: 'open', label: `Open (${activeGigsCount})` },
                  { id: 'draft', label: `Drafts (${draftGigsCount})` },
                  { id: 'paused', label: `Paused (${pausedGigsCount})` },
                  { id: 'closed', label: `Closed (${closedGigsCount})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setProjectStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      projectStatusFilter === tab.id
                        ? 'bg-[#593CFF] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 bg-[#593CFF] hover:bg-[#472fe0] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>New Project</span>
              </button>
            </div>

            {loadingData ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
                Fetching your project listings...
              </div>
            ) : realMyGigs.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#593CFF] flex items-center justify-center mx-auto">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-slate-900">You haven't posted any projects yet</h3>
                  <p className="text-xs text-slate-500">
                    Create your first project listing in under 2 minutes. Specify the skills you need (e.g. React, Node.js) and your project will be listed directly on the open projects feed.
                  </p>
                </div>
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-2 bg-[#593CFF] hover:bg-[#472fe0] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post First Project</span>
                </button>
              </div>
            ) : displayedProjects.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No {projectStatusFilter} projects found</h4>
                <p className="text-xs text-slate-500">Switch filter to 'All' or create a new project listing.</p>
                <button
                  onClick={() => setProjectStatusFilter('all')}
                  className="text-xs font-bold text-[#593CFF] hover:underline pt-1 cursor-pointer"
                >
                  View all projects
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {displayedProjects.map((gig) => {
                  return (
                    <div 
                      key={gig._id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 ${
                              gig.status === 'draft' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                              gig.status === 'open' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              gig.status === 'paused' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                              gig.status === 'closed' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                              gig.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {gig.status === 'draft' && <FileText className="w-3 h-3 text-amber-700" />}
                              {gig.status === 'open' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                              {gig.status === 'paused' && <Pause className="w-3 h-3 fill-amber-700" />}
                              {gig.status === 'closed' && <X className="w-3 h-3 text-slate-500" />}
                              <span>
                                {gig.status === 'draft' && 'Draft (Unpublished)'}
                                {gig.status === 'open' && 'Open (Accepting Proposals)'}
                                {gig.status === 'paused' && 'Paused (Bidding On Hold)'}
                                {gig.status === 'closed' && 'Closed (Bidding Ended)'}
                                {gig.status === 'in-progress' && 'In Progress'}
                                {!['draft', 'open', 'paused', 'closed', 'in-progress'].includes(gig.status) && gig.status}
                              </span>
                            </span>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {gig.category}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {gig.locationType === 'remote' ? 'Remote Worldwide' : (gig.address || 'Mumbai')}
                            </span>
                            {gig.deadline && (
                              <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Deadline: {new Date(gig.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                          <h2 className="text-lg font-bold text-slate-900 hover:text-[#593CFF] transition">
                            {gig.title}
                          </h2>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <div className="text-lg font-black text-slate-900 flex items-center sm:justify-end">
                            ₹{Number(gig.budget).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] text-slate-400">Fixed Budget</div>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                        {gig.description}
                      </p>

                      {/* Required Skills */}
                      {gig.skillsRequired && gig.skillsRequired.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-slate-400 font-medium mr-1">Required:</span>
                          {gig.skillsRequired.map((skill, idx) => (
                            <span 
                              key={idx}
                              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Step 6 Work Tracking: Milestones & Deliverables (In-Progress Contract) */}
                      {(gig.status === 'in-progress' || (gig.milestones && gig.milestones.length > 0)) && (
                        <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200/90 space-y-3.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#593CFF] flex items-center justify-center">
                                <Layers className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-[#030B3D] flex items-center gap-1.5">
                                  <span>Work Tracking & Milestones</span>
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Demo Escrow Funded
                                  </span>
                                </h4>
                                <span className="text-[11px] text-slate-500">
                                  Assigned to: <strong className="text-slate-800">{gig.freelancer?.name || gig.freelancer?.username || 'Freelancer'}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="text-xs text-slate-500 font-medium">
                              Progress: <strong className="text-[#593CFF] font-bold">
                                {(gig.milestones || []).filter(m => m.status === 'completed').length} / {(gig.milestones || []).length} Milestones Completed
                              </strong>
                            </div>
                          </div>

                          {/* Milestones List */}
                          <div className="space-y-2.5">
                            {(gig.milestones || []).map((m, mIdx) => {
                              const isSubmitted = m.status === 'submitted';
                              const isRevision = m.status === 'revision_requested';
                              const isCompleted = m.status === 'completed';
                              const isPending = m.status === 'pending';

                              return (
                                <div 
                                  key={m._id || mIdx}
                                  className={`p-3.5 sm:p-4 rounded-xl border transition ${
                                    isSubmitted 
                                      ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-100' 
                                      : isRevision 
                                        ? 'bg-amber-50/70 border-amber-300' 
                                        : isCompleted 
                                          ? 'bg-emerald-50/50 border-emerald-200' 
                                          : 'bg-white border-slate-200'
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-[#030B3D]">
                                          {m.title || `Milestone #${mIdx + 1}`}
                                        </span>
                                        <span className="text-xs font-black text-slate-700">
                                          ₹{Number(m.amount || gig.budget || 0).toLocaleString('en-IN')}
                                        </span>
                                      </div>
                                      {m.description && (
                                        <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                                      )}
                                    </div>

                                    {/* Milestone Status Pill */}
                                    <div className="shrink-0 flex items-center gap-2">
                                      {isPending && (
                                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                                          <Clock className="w-3 h-3 text-slate-500" />
                                          In Progress by Freelancer
                                        </span>
                                      )}

                                      {isSubmitted && (
                                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1 animate-pulse">
                                          <Sparkles className="w-3 h-3 text-blue-600" />
                                          Deliverable Ready for Review
                                        </span>
                                      )}

                                      {isRevision && (
                                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                          <RotateCcw className="w-3 h-3 text-amber-700" />
                                          Revision Requested
                                        </span>
                                      )}

                                      {isCompleted && (
                                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                          <Check className="w-3 h-3 stroke-[3]" />
                                          Accepted & Paid
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Submitted Deliverables Content */}
                                  {(m.deliverableUrl || m.deliverableNotes) && (
                                    <div className="mt-3 p-3 rounded-lg bg-white border border-slate-200/90 text-xs space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                          Freelancer Deliverable Submission
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
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#593CFF] hover:underline bg-indigo-50/70 border border-indigo-100 px-3 py-1.5 rounded-lg"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5 text-[#593CFF]" />
                                            <span>Open Deliverable URL</span>
                                          </a>
                                        </div>
                                      )}

                                      {m.deliverableNotes && (
                                        <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
                                          {m.deliverableNotes}
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {/* Revision Request Feedback Note (if revision requested) */}
                                  {isRevision && m.revisionNotes && (
                                    <div className="mt-2.5 p-3 rounded-lg bg-amber-100/70 border border-amber-300 text-xs text-amber-950 space-y-1">
                                      <div className="font-bold flex items-center gap-1.5 text-amber-900">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>Your Requested Changes:</span>
                                      </div>
                                      <p className="italic">"{m.revisionNotes}"</p>
                                      <span className="text-[10px] text-amber-800 block">
                                        Freelancer has been notified and is preparing an updated submission.
                                      </span>
                                    </div>
                                  )}

                                  {/* Client Review Actions when Submitted */}
                                  {isSubmitted && (
                                    <div className="mt-3 pt-2.5 border-t border-blue-200/70 flex flex-wrap items-center justify-between gap-2.5">
                                      <span className="text-xs text-slate-600 font-medium">
                                        Review the work above. You can accept the deliverable or request changes with feedback:
                                      </span>

                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          disabled={milestoneActionLoading}
                                          onClick={() => handleOpenRevisionModal(gig._id, m)}
                                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
                                        >
                                          <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                                          <span>Request Revision</span>
                                        </button>

                                        <button
                                          type="button"
                                          disabled={milestoneActionLoading}
                                          onClick={() => handleApproveMilestone(gig._id, m._id)}
                                          className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
                                        >
                                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                                          <span>Accept Deliverable</span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {gig.status === 'draft' ? 'Draft saved ' : 'Posted '} 
                            {new Date(gig.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          {gig.status !== 'draft' && (
                            <span className="flex items-center gap-1 font-semibold text-[#593CFF]">
                              <Users className="w-3.5 h-3.5" />
                              {gig.proposalCount || 0} candidate {gig.proposalCount === 1 ? 'proposal' : 'proposals'}
                            </span>
                          )}
                          {gig.freelancer && (
                            <span className="flex items-center gap-1 text-slate-700">
                              Assigned to: <strong className="font-semibold">{gig.freelancer.name || gig.freelancer.username}</strong>
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {gig.status === 'draft' ? (
                            <>
                              <button
                                onClick={() => handleQuickPublish(gig._id)}
                                disabled={actionLoadingId === gig._id}
                                className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-lg transition cursor-pointer shadow-xs disabled:opacity-50"
                              >
                                <UploadCloud className="w-3.5 h-3.5" />
                                <span>Publish</span>
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(gig)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit Draft</span>
                              </button>
                              <button
                                onClick={() => handleDeleteGig(gig._id)}
                                disabled={actionLoadingId === gig._id}
                                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                                title="Delete Draft"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* If Open: can Pause or Close */}
                              {gig.status === 'open' && (
                                <>
                                  <button
                                    onClick={() => handleSetStatus(gig._id, 'paused')}
                                    disabled={actionLoadingId === gig._id}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
                                    title="Temporarily hold proposals"
                                  >
                                    <Pause className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
                                    <span>Pause</span>
                                  </button>
                                  <button
                                    onClick={() => handleSetStatus(gig._id, 'closed')}
                                    disabled={actionLoadingId === gig._id}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
                                    title="Close bidding for this project"
                                  >
                                    <span>Close</span>
                                  </button>
                                </>
                              )}

                              {/* If Paused: can Resume or Close */}
                              {gig.status === 'paused' && (
                                <>
                                  <button
                                    onClick={() => handleSetStatus(gig._id, 'open')}
                                    disabled={actionLoadingId === gig._id}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
                                    title="Resume accepting proposals"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-emerald-700 text-emerald-700" />
                                    <span>Resume</span>
                                  </button>
                                  <button
                                    onClick={() => handleSetStatus(gig._id, 'closed')}
                                    disabled={actionLoadingId === gig._id}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
                                    title="Close bidding for this project"
                                  >
                                    <span>Close</span>
                                  </button>
                                </>
                              )}

                              {/* If Closed: can Reopen */}
                              {gig.status === 'closed' && (
                                <button
                                  onClick={() => handleSetStatus(gig._id, 'open')}
                                  disabled={actionLoadingId === gig._id}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Reopen</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEditModal(gig)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#593CFF] bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedGigFilter(gig._id);
                                  setActiveTab('proposals');
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#593CFF] hover:text-[#472fe0] bg-[#593CFF]/10 hover:bg-[#593CFF]/15 border border-[#593CFF]/20 px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                <span>Proposals ({gig.proposalCount || 0})</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Candidate Proposals */}
        {activeTab === 'proposals' && (
          <div className="space-y-4">
            {loadingData ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
                Fetching received proposals...
              </div>
            ) : filteredProposals.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No proposals received yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Freelancers with matching skills will submit proposals with their custom quote, pitch, and proof of work. They will appear here.
                </p>
                {selectedGigFilter !== 'all' && (
                  <button
                    onClick={() => setSelectedGigFilter('all')}
                    className="text-xs font-bold text-[#593CFF] underline"
                  >
                    View proposals across all projects
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredProposals.map((prop) => {
                  const freelancer = prop.freelancer || {};
                  const gig = prop.gig || {};
                  const isAccepted = prop.status === 'accepted';
                  const isRejected = prop.status === 'rejected';

                  return (
                    <div 
                      key={prop._id}
                      className={`bg-white rounded-2xl border p-6 transition space-y-4 ${
                        isAccepted 
                          ? 'border-emerald-300 ring-2 ring-emerald-100' 
                          : isRejected 
                            ? 'border-slate-200 opacity-60' 
                            : 'border-slate-200 hover:shadow-md'
                      }`}
                    >
                      {/* Top Proposal Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          {/* Freelancer Avatar */}
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#593CFF] to-blue-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                            {freelancer.name ? freelancer.name.charAt(0).toUpperCase() : (freelancer.username ? freelancer.username.charAt(0).toUpperCase() : 'F')}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-extrabold text-base text-slate-900">
                                {freelancer.name || freelancer.username || 'Applicant'}
                              </h3>
                              {freelancer.experienceLevel && (
                                <span className="text-[10px] font-bold bg-indigo-50 text-[#593CFF] px-2 py-0.5 rounded-md border border-indigo-200/50">
                                  {freelancer.experienceLevel}
                                </span>
                              )}
                              {freelancer.hourlyRate > 0 && (
                                <span className="text-[11px] font-semibold text-slate-500">
                                  • ₹{freelancer.hourlyRate}/hr
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              {freelancer.headline || 'Independent Developer'}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Applied for: <strong className="text-slate-700 font-semibold">{gig.title || 'Project'}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Bid Details */}
                        <div className="text-left sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                          <div className="text-lg font-black text-slate-900">
                            ₹{Number(prop.bidAmount).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Est: {prop.estimatedTime || 'Within deadline'}
                          </div>
                          <div className="mt-1">
                            {isAccepted ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3 stroke-[3]" /> Accepted & Escrowed
                              </span>
                            ) : isRejected ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                Declined
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                Pending Client Review
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Freelancer Skills */}
                      {freelancer.skills && freelancer.skills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-slate-400 font-medium mr-1">Skills:</span>
                          {freelancer.skills.map((s, idx) => (
                            <span 
                              key={idx}
                              className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                            >
                              {s.name || s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Cover Letter */}
                      <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                        <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1 text-slate-500">
                          <FileText className="w-3 h-3" /> Freelancer Pitch & Approach:
                        </div>
                        {prop.coverLetter}
                      </div>

                      {/* Actions */}
                      {!isAccepted && !isRejected && (
                        <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-3">
                          <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Demo Mode: Simulated Escrow milestone tracking (no real payment charged).</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleProposalAction(prop._id, 'rejected')}
                              disabled={actionLoadingId === prop._id}
                              className="text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
                            >
                              Decline
                            </button>

                            <button
                              onClick={() => handleProposalAction(prop._id, 'accepted')}
                              disabled={actionLoadingId === prop._id}
                              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>{actionLoadingId === prop._id ? 'Updating...' : 'Accept Proposal (Demo Mode)'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Company Profile */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form: Left 2 Cols */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#593CFF] flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Company & Brand Profile</h2>
                      <p className="text-xs text-slate-500">Showcase your organization to attract top tech talent in India</p>
                    </div>
                  </div>
                  <Link
                    to="/profile/me"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#593CFF] hover:text-[#472fe0] bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200/60"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Preview</span>
                  </Link>
                </div>

                <form onSubmit={handleSaveCompanyProfile} className="space-y-6">
                  {/* Section 1: Mandatory Fields */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Mandatory Client Details
                      </span>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        Required
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800">
                          Contact Person / Hiring Manager <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={profileFormData.name}
                          onChange={(e) => setProfileFormData(p => ({ ...p, name: e.target.value }))}
                          placeholder="Enter your contact name"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#593CFF] outline-none transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800">
                          Company / Brand Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={profileFormData.companyName}
                          onChange={(e) => setProfileFormData(p => ({ ...p, companyName: e.target.value }))}
                          placeholder="e.g. Acme Tech Studio or Independent Hirer"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#593CFF] outline-none transition"
                        />
                        <p className="text-[10px] text-slate-400">If hiring individually, you can use your name or 'Independent Hirer'</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800">
                          City / HQ Location <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={profileFormData.city}
                          onChange={(e) => setProfileFormData(p => ({ ...p, city: e.target.value }))}
                          placeholder="e.g. Mumbai"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#593CFF] outline-none transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800">
                          State <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={profileFormData.state}
                          onChange={(e) => setProfileFormData(p => ({ ...p, state: e.target.value }))}
                          placeholder="e.g. Maharashtra"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#593CFF] outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Optional (Profile Booster) Fields */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#593CFF]" />
                        Company Details & Trust Boosters
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        Optional (Boosts Trust +80%)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>Official Website</span>
                          <span className="text-[10px] font-normal text-slate-400">Optional</span>
                        </label>
                        <input
                          type="text"
                          value={profileFormData.companyWebsite}
                          onChange={(e) => setProfileFormData(p => ({ ...p, companyWebsite: e.target.value }))}
                          placeholder="https://yourcompany.com"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#593CFF] outline-none transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>Company Logo URL</span>
                          <span className="text-[10px] font-normal text-slate-400">Optional</span>
                        </label>
                        <input
                          type="text"
                          value={profileFormData.companyLogo}
                          onChange={(e) => setProfileFormData(p => ({ ...p, companyLogo: e.target.value }))}
                          placeholder="https://example.com/logo.png"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#593CFF] outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>Industry</span>
                          <span className="text-[10px] font-normal text-slate-400">Optional</span>
                        </label>
                        <select
                          value={profileFormData.industry}
                          onChange={(e) => setProfileFormData(p => ({ ...p, industry: e.target.value }))}
                          className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#593CFF] outline-none"
                        >
                          <option value="Technology & Digital Services">Technology & Digital Services</option>
                          <option value="SaaS & Cloud Platforms">SaaS & Cloud Platforms</option>
                          <option value="E-Commerce & D2C">E-Commerce & D2C</option>
                          <option value="Fintech & Banking">Fintech & Banking</option>
                          <option value="Healthcare & HealthTech">Healthcare & HealthTech</option>
                          <option value="EdTech & Education">EdTech & Education</option>
                          <option value="Marketing & Creative Agency">Marketing & Creative Agency</option>
                          <option value="Media & Entertainment">Media & Entertainment</option>
                          <option value="Real Estate & Construction">Real Estate & Construction</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>Company Size</span>
                          <span className="text-[10px] font-normal text-slate-400">Optional</span>
                        </label>
                        <select
                          value={profileFormData.companySize}
                          onChange={(e) => setProfileFormData(p => ({ ...p, companySize: e.target.value }))}
                          className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#593CFF] outline-none"
                        >
                          <option value="1-10 employees">1-10 employees (Startup)</option>
                          <option value="11-50 employees">11-50 employees (Growing)</option>
                          <option value="51-200 employees">51-200 employees (Mid-size)</option>
                          <option value="201-500 employees">201-500 employees (Established)</option>
                          <option value="500+ employees">500+ employees (Enterprise)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>About Company / Project Mission</span>
                        <span className="text-[10px] font-normal text-slate-400">Optional</span>
                      </label>
                      <textarea
                        rows={3}
                        value={profileFormData.companyDescription}
                        onChange={(e) => setProfileFormData(p => ({ ...p, companyDescription: e.target.value }))}
                        placeholder="Tell developers about your company's mission, products, and culture..."
                        className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 focus:border-[#593CFF] outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="inline-flex items-center gap-2 bg-[#593CFF] hover:bg-[#472fe0] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSavingProfile ? 'Saving Company Profile...' : 'Save Company Profile'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar: Right 1 Col */}
            <div className="space-y-6">
              {/* Profile Card Summary */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#593CFF] to-[#3B82F6] text-white flex items-center justify-center font-black text-lg">
                    {(profileFormData.companyName || profileFormData.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {profileFormData.companyName || 'Your Company Name'}
                    </h3>
                    <p className="text-xs text-slate-500">{profileFormData.industry}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Location</span>
                    <span className="font-bold text-slate-700">{profileFormData.city}, {profileFormData.state}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Team Size</span>
                    <span className="font-bold text-slate-700">{profileFormData.companySize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Escrow Mode</span>
                    <span className="font-bold text-amber-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Demo Sandbox Mode
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/profile/me"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#593CFF] text-xs font-bold transition border border-indigo-200/60"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Public Profile</span>
                  </Link>
                </div>
              </div>

              {/* Trust Badge Card */}
              <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/50 p-6 rounded-3xl border border-indigo-200/50 space-y-3">
                <div className="flex items-center gap-2 text-[#593CFF]">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Client Workspace Advantage</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Completing your company profile helps freelancers understand your requirements faster, leading to higher proposal quality and rapid responses.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Post / Edit Project Modal */}
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#593CFF] flex items-center justify-center">
                    {editingGigId ? <Edit2 className="w-5 h-5 stroke-[2.5]" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {editingGigId ? (isEditingDraft ? 'Edit Project Draft' : 'Edit Project Details') : 'Post a Real Project'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {editingGigId ? 'Update project details, skills, budget, or publish' : 'Provide clear project requirements for rule-based matching'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsPostModalOpen(false);
                    setEditingGigId(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                    <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-700 font-bold ml-2 cursor-pointer">×</button>
                  </div>
                )}

                {/* Project Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Project Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Full-Stack MERN Developer to build Hyperlocal Marketplace"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#593CFF] focus:ring-2 focus:ring-[#593CFF]/10 outline-none transition"
                  />
                </div>

                {/* Category & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#593CFF] outline-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Experience Needed</label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                      className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#593CFF] outline-none"
                    >
                      <option value="Entry">Entry Level (Junior friendly)</option>
                      <option value="Intermediate">Intermediate Developer</option>
                      <option value="Expert">Expert / Specialist</option>
                    </select>
                  </div>
                </div>

                {/* Skills Required Chips */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800">
                    Skills Required <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-xl border border-slate-200 bg-slate-50/50">
                    {formData.skillsRequired.map((skill, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs font-bold bg-[#593CFF] text-white px-2.5 py-1 rounded-lg shadow-xs"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-rose-200 cursor-pointer ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <div className="flex-1 flex items-center min-w-[120px]">
                      <input
                        type="text"
                        value={customSkillInput}
                        onChange={(e) => setCustomSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill(customSkillInput);
                          }
                        }}
                        placeholder="Type skill & press Enter..."
                        className="w-full text-xs bg-transparent outline-none px-1 py-1"
                      />
                    </div>
                  </div>

                  {/* Popular suggestions */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Suggestions:</span>
                    {POPULAR_SKILLS.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="text-[11px] font-semibold bg-white hover:bg-indigo-50 hover:text-[#593CFF] text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md transition cursor-pointer"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget, Duration & Target Deadline */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Total Budget (INR ₹) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        min="500"
                        step="500"
                        required
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                        placeholder="15000"
                        className="w-full text-xs sm:text-sm pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#593CFF] outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Expected Duration</label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#593CFF] outline-none"
                    >
                      <option value="Less than 1 week">Less than 1 week</option>
                      <option value="1-4 weeks">1 to 4 weeks</option>
                      <option value="1-3 months">1 to 3 months</option>
                      <option value="3+ months">3+ months ongoing</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>Target Deadline</span>
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:border-[#593CFF] outline-none"
                    />
                  </div>
                </div>

                {/* Work Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Work Preference</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'remote', label: 'Remote Worldwide' },
                      { id: 'onsite', label: 'Onsite Mumbai' },
                      { id: 'hybrid', label: 'Hybrid' }
                    ].map(mode => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, locationType: mode.id }))}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition cursor-pointer ${
                          formData.locationType === mode.id
                            ? 'bg-[#593CFF] text-white border-[#593CFF]'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Project Description & Deliverables <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the scope, tech stack requirements, expected deliverables, and any architecture specifications..."
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-[#593CFF] outline-none transition"
                  />
                </div>

                {/* Submit Actions */}
                <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPostModalOpen(false);
                      setEditingGigId(null);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2 rounded-xl cursor-pointer order-3 sm:order-1"
                  >
                    Cancel
                  </button>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end order-1 sm:order-2">
                    <button
                      type="button"
                      disabled={isSubmittingGig}
                      onClick={() => handleSubmitProject('draft')}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-700" />
                      <span>{isSubmittingGig ? 'Saving...' : (editingGigId && !isEditingDraft ? 'Save as Draft' : 'Save as Draft')}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmittingGig}
                      onClick={() => handleSubmitProject('open')}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#593CFF] hover:bg-[#472fe0] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingGig ? 'Processing...' : (editingGigId && !isEditingDraft ? 'Save & Update' : 'Publish Project Listing')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6 Work Tracking: Client Request Revision Modal */}
        {revisionModalOpen && selectedMilestoneForRevision && (
          <div className="fixed inset-0 z-50 bg-[#030B3D]/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Step 6 • Work Tracking
                  </span>
                  <h3 className="font-extrabold text-base text-[#030B3D] mt-1">
                    Request Milestone Revision
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRevisionModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-[#030B3D]">
                      {selectedMilestoneForRevision.milestone.title || 'Milestone Deliverable'}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Explain required fixes or adjustments
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-800 block">
                      ₹{Number(selectedMilestoneForRevision.milestone.amount || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Demo Escrow</span>
                  </div>
                </div>

                {revisionError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{revisionError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitRevision} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Revision Instructions & Feedback <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows="4"
                      required
                      placeholder="Be specific about what changes are needed (e.g., 'Please fix the header alignment on mobile view and check the checkout button click event...')"
                      value={revisionFeedback}
                      onChange={(e) => setRevisionFeedback(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#593CFF]"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Minimum 5 characters. The freelancer will receive this feedback to revise and resubmit.
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Demo Escrow Security</span>
                    </div>
                    <p>Demo escrow funds will remain safely locked and will NOT be released until you review and approve the updated deliverable.</p>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRevisionModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={milestoneActionLoading}
                      className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {milestoneActionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Send Revision Request</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
