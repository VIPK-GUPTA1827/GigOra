const express = require('express');
const mongoose = require('mongoose');
const Proposal = require('../models/Proposal');
const Gig = require('../models/Gig');
const User = require('../models/User');
const Escrow = require('../models/Escrow');
const Transaction = require('../models/Transaction');
const { protect, authorize, requireVerifiedEmail } = require('../middleware/auth');
const { sendNotification } = require('../utils/notifications');

const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiter for proposal submission: prevent bot spam
const createProposalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: process.env.NODE_ENV === 'test-rate-limit' ? 3 : 30,
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    message: {
        success: false,
        message: 'Too many proposals submitted recently. Please slow down.'
    }
});

// @desc    Submit a new proposal/bid for a gig
// @route   POST /api/proposals
// @access  Private (Freelancers only with verified email)
router.post('/', createProposalLimiter, protect, authorize('freelancer', 'admin'), requireVerifiedEmail, async (req, res) => {
    try {
        // Only freelancers can submit proposals
        if (req.user.role !== 'freelancer' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only freelancers can submit proposals for gigs' });
        }

        // Enforce completed profile before bidding with explicit missing fields
        const missingFields = [];
        if (!req.user.name || !req.user.name.trim()) missingFields.push('Full Name');
        if (!req.user.skills || req.user.skills.length === 0) missingFields.push('Technical Skills (at least 1)');
        if (!req.user.bio || req.user.bio.trim().length < 10) missingFields.push('Professional Bio (min 10 characters)');
        if (!req.user.preferredCategories || req.user.preferredCategories.length === 0) missingFields.push('Preferred Categories');

        if (missingFields.length > 0) {
            return res.status(403).json({ 
                success: false, 
                message: `Incomplete profile: Please complete the following required fields before submitting proposals: ${missingFields.join(', ')}.`,
                missingFields
            });
        }

        const { gigId, coverLetter, bidAmount, estimatedTime } = req.body;

        if (!mongoose.Types.ObjectId.isValid(gigId)) {
            return res.status(400).json({ success: false, message: 'Invalid gig ID format' });
        }

        // Verify gig exists and is open
        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        // Prevent bidding on own gig / project
        if (gig.client.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot submit a proposal on your own project' });
        }

        if (gig.status !== 'open') {
            return res.status(400).json({ success: false, message: 'This gig is no longer accepting proposals' });
        }

        // Validate bid amount
        const parsedBid = Number(bidAmount);
        if (isNaN(parsedBid) || parsedBid <= 0) {
            return res.status(400).json({ success: false, message: 'Please enter a valid bid amount in INR (₹).' });
        }

        // Realistic sanity ceiling check (cannot exceed 3x client budget or ₹10,00,000)
        if (gig.budget && parsedBid > Math.max(gig.budget * 3, 500000)) {
            return res.status(400).json({ 
                success: false, 
                message: `Bid amount cannot exceed realistic project limits (Budget: ₹${gig.budget.toLocaleString('en-IN')}).` 
            });
        }

        if (!coverLetter || coverLetter.trim().length < 15) {
            return res.status(400).json({ success: false, message: 'Please write a brief pitch/cover letter (at least 15 characters).' });
        }

        if (!estimatedTime || !estimatedTime.trim()) {
            return res.status(400).json({ success: false, message: 'Please specify your estimated timeline for project completion.' });
        }

        // Check if freelancer already submitted a proposal for this gig
        const existingProposal = await Proposal.findOne({ gig: gigId, freelancer: req.user._id });
        if (existingProposal) {
            return res.status(400).json({ success: false, message: 'You have already submitted a proposal for this gig' });
        }

        const proposal = await Proposal.create({
            gig: gigId,
            freelancer: req.user._id,
            coverLetter: coverLetter.trim(),
            bidAmount: parsedBid,
            estimatedTime: estimatedTime.trim()
        });

        // Trigger notifications to the client
        try {
            const senderName = req.user.name || req.user.username || 'A freelancer';
            await sendNotification(
                req.app,
                gig.client,
                req.user._id,
                'proposal_submitted',
                'New Proposal Received!',
                `Freelancer "${senderName}" submitted a proposal for your project "${gig.title}" with a bid of ₹${parsedBid.toLocaleString('en-IN')}.`,
                gig._id
            );
        } catch (notifErr) {
            console.error('Failed to dispatch proposal notification:', notifErr.message);
        }

        res.status(201).json({ success: true, data: proposal });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already submitted a proposal for this gig' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all proposals for a specific gig
// @route   GET /api/proposals/gig/:gigId
// @access  Private (Gig Owner/Client only)
router.get('/gig/:gigId', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.gigId)) {
            return res.status(400).json({ success: false, message: 'Invalid gig ID format' });
        }

        const gig = await Gig.findById(req.params.gigId);

        if (!gig) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        // Ensure logged in user is the owner of the gig
        if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to view proposals for this gig' });
        }

        const proposals = await Proposal.find({ gig: req.params.gigId })
            .populate('freelancer', 'name username avatar email headline bio skills experienceLevel hourlyRate workPreference location portfolio isProfileComplete')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: proposals.length, data: proposals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all proposals across all gigs of the logged-in client
// @route   GET /api/proposals/client/all-proposals
// @access  Private (Clients only)
router.get('/client/all-proposals', protect, authorize('client', 'admin'), async (req, res) => {
    try {
        // Find all gig IDs belonging to this client
        const clientGigs = await Gig.find({ client: req.user._id }).select('_id');
        const gigIds = clientGigs.map(g => g._id);

        const proposals = await Proposal.find({ gig: { $in: gigIds } })
            .populate('gig', 'title category budget status address locationType isDemo isSample')
            .populate('freelancer', 'name username avatar email headline bio skills experienceLevel hourlyRate workPreference location portfolio isProfileComplete')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: proposals.length, data: proposals });
    } catch (error) {
        console.error('Error fetching client proposals:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get logged-in freelancer's proposals
// @route   GET /api/proposals/my-proposals
// @access  Private (Freelancers only)
router.get('/my-proposals', protect, async (req, res) => {
    try {
        if (req.user.role !== 'freelancer' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only freelancers can view their proposals list' });
        }

        const proposals = await Proposal.find({ freelancer: req.user._id })
            .populate('gig', 'title description budget address category status isDemo isSample')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: proposals.length, data: proposals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get single proposal details
// @route   GET /api/proposals/:id
// @access  Private (Proposal Owner, Gig Owner, or Admin only)
router.get('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid proposal ID format' });
        }

        const proposal = await Proposal.findById(req.params.id)
            .populate('gig', 'title client status budget category locationType address isDemo isSample')
            .populate('freelancer', 'name username avatar email headline bio skills experienceLevel hourlyRate workPreference location portfolio');

        if (!proposal) {
            return res.status(404).json({ success: false, message: 'Proposal not found' });
        }

        const isOwnerFreelancer = proposal.freelancer._id.toString() === req.user._id.toString();
        const isOwnerClient = proposal.gig && proposal.gig.client && proposal.gig.client.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwnerFreelancer && !isOwnerClient && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this proposal' });
        }

        res.status(200).json({ success: true, data: proposal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Accept or Reject a proposal
// @route   PUT /api/proposals/:id
// @access  Private (Gig Owner/Client only with verified email)
router.put('/:id', protect, authorize('client', 'admin'), requireVerifiedEmail, async (req, res) => {
    try {
        const { status } = req.body; // should be 'accepted' or 'rejected'

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Status must be accepted or rejected' });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid proposal ID format' });
        }

        const proposal = await Proposal.findById(req.params.id).populate('gig');
        if (!proposal) {
            return res.status(404).json({ success: false, message: 'Proposal not found' });
        }

        const gig = proposal.gig;

        // Ensure the logged-in user is the client who posted the gig
        if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to manage this proposal' });
        }

        // Proposal must be pending to accept or reject
        if (proposal.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: `This proposal is already '${proposal.status}' and cannot be modified again` 
            });
        }

        if (status === 'accepted') {
            if (gig.status !== 'open') {
                return res.status(400).json({ success: false, message: 'Gig is no longer open for active bidding' });
            }

            // Guard against duplicate contracts/escrows
            const existingEscrow = await Escrow.findOne({ gig: gig._id, status: { $in: ['held', 'partially-released', 'released'] } });
            if (existingEscrow) {
                return res.status(400).json({ success: false, message: 'An active contract / escrow already exists for this gig' });
            }

            // Check client's wallet balance
            const client = await User.findById(gig.client);
            if (!client) {
                return res.status(404).json({ success: false, message: 'Client account not found' });
            }

            const freelancerUser = await User.findById(proposal.freelancer);
            if (!freelancerUser) {
                return res.status(404).json({ success: false, message: 'Freelancer account no longer exists' });
            }

            if (client.walletBalance < proposal.bidAmount) {
                return res.status(400).json({ success: false, message: `Insufficient balance (Current: ₹${client.walletBalance}). Please add funds.` });
            }

            // Debit client balance
            client.walletBalance -= proposal.bidAmount;
            await client.save();

            // Create Escrow record holding the funds
            await Escrow.create({
                gig: gig._id,
                proposal: proposal._id,
                client: client._id,
                freelancer: proposal.freelancer,
                amount: proposal.bidAmount,
                status: 'held'
            });

            // Create client Transaction log with type 'hold'
            await Transaction.create({
                user: client._id,
                type: 'hold',
                amount: proposal.bidAmount,
                description: `Payment held in escrow for Gig: "${gig.title}"`,
                referenceId: gig._id
            });

            // 1. Accept this proposal
            proposal.status = 'accepted';
            await proposal.save();

            // 2. Reject all other proposals for this gig and notify their authors
            const otherProposals = await Proposal.find({ gig: gig._id, _id: { $ne: proposal._id }, status: 'pending' });
            await Proposal.updateMany(
                { gig: gig._id, _id: { $ne: proposal._id } },
                { $set: { status: 'rejected' } }
            );

            for (const otherProp of otherProposals) {
                try {
                    await sendNotification(
                        req.app,
                        otherProp.freelancer,
                        req.user._id,
                        'proposal_rejected',
                        'Proposal Status Update',
                        `Another proposal was selected for "${gig.title}". Thank you for your bid!`,
                        gig._id
                    );
                } catch (e) {
                    console.error('Failed to notify competing bidder:', e.message);
                }
            }

            // 3. Assign gig to freelancer and set status to 'in-progress'
            gig.status = 'in-progress';
            gig.freelancer = proposal.freelancer;
            gig.budget = proposal.bidAmount; // Store final contract amount as the agreed budget
            if (proposal.estimatedTime) {
                gig.duration = proposal.estimatedTime; // Agreed timeline
            }
            if (!gig.milestones || gig.milestones.length === 0) {
                if (proposal.milestones && proposal.milestones.length > 0) {
                    gig.milestones = proposal.milestones.map(m => ({
                        title: m.title || 'Contract Milestone',
                        budget: m.amount || m.budget || proposal.bidAmount,
                        amount: m.amount || m.budget || proposal.bidAmount,
                        description: m.description || proposal.coverLetter || 'Agreed project scope',
                        status: 'pending',
                        checklist: [
                            { text: 'Deliver agreed project scope according to proposal', isCompleted: false }
                        ]
                    }));
                } else {
                    gig.milestones = [{
                        title: gig.title || 'Project Scope & Deliverables',
                        budget: proposal.bidAmount,
                        amount: proposal.bidAmount,
                        description: proposal.coverLetter || 'Deliver agreed project scope according to proposal',
                        status: 'pending',
                        checklist: [
                            { text: 'Deliver agreed project scope according to proposal', isCompleted: false }
                        ]
                    }];
                }
            }
            await gig.save();
        } else {
            // Reject proposal
            proposal.status = 'rejected';
            await proposal.save();
        }

        // Trigger notifications to the freelancer
        try {
            await sendNotification(
                req.app,
                proposal.freelancer,
                req.user._id,
                status === 'accepted' ? 'proposal_accepted' : 'proposal_rejected',
                status === 'accepted' ? 'Proposal Accepted!' : 'Proposal Rejected',
                `Your proposal for "${gig.title}" has been ${status} by the client.`,
                gig._id
            );
        } catch (notifErr) {
            console.error('Failed to dispatch proposal status notification:', notifErr.message);
        }

        res.status(200).json({ success: true, message: `Proposal ${status} successfully`, data: proposal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Withdraw/Delete a pending proposal
// @route   DELETE /api/proposals/:id
// @access  Private (Freelancer who submitted the proposal only)
router.delete('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid proposal ID format' });
        }

        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) {
            return res.status(404).json({ success: false, message: 'Proposal not found' });
        }

        // Only the freelancer who submitted or admin can withdraw
        if (proposal.freelancer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to withdraw this proposal' });
        }

        // Can only withdraw if still pending
        if (proposal.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot withdraw a proposal that is already '${proposal.status}'` 
            });
        }

        await Proposal.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Proposal withdrawn successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
