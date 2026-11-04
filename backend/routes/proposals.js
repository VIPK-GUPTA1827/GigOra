const express = require('express');
const mongoose = require('mongoose');
const Proposal = require('../models/Proposal');
const Gig = require('../models/Gig');
const User = require('../models/User');
const Escrow = require('../models/Escrow');
const Transaction = require('../models/Transaction');
const { protect, authorize, requireVerifiedEmail } = require('../middleware/auth');
const AppError = require('../utils/AppError');
const withTransaction = require('../utils/withTransaction');
const { debit } = require('../utils/wallet');
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
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Status must be accepted or rejected'
        });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid proposal ID format'
        });
    }

    const isAdmin = req.user.role === 'admin';
    const proposal = await Proposal.findById(req.params.id).populate('gig');
    if (!proposal || !proposal.gig) {
        return res.status(404).json({
            success: false,
            message: 'Proposal not found'
        });
    }

    const gigId = proposal.gig._id;
    const ownerId = proposal.gig.client.toString();
    if (ownerId !== req.user._id.toString() && !isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized'
        });
    }

    if (status === 'rejected') {
        const updated = await Proposal.findOneAndUpdate(
            { _id: proposal._id, status: 'pending' },
            { $set: { status: 'rejected' } },
            { returnDocument: 'after' }
        );
        if (!updated) {
            throw new AppError('Proposal already processed', 409);
        }
        sendNotification(
            req.app,
            proposal.freelancer,
            req.user._id,
            'proposal_rejected',
            'Proposal Rejected',
            `Your proposal for "${proposal.gig.title}" was rejected.`,
            gigId
        );
        return res.json({ success: true, data: updated });
    }

    const out = await withTransaction(async (session) => {
        // 1. Proposal lock: sirf pending wala
        const accepted = await Proposal.findOneAndUpdate(
            { _id: proposal._id, status: 'pending' },
            { $set: { status: 'accepted' } },
            { returnDocument: 'after', session }
        );
        if (!accepted) {
            throw new AppError('Proposal already processed', 409);
        }

        // 2. Gig claim: open -> in-progress (ek hi jeetega)
        const gig = await Gig.findOneAndUpdate(
            { _id: gigId, status: 'open' },
            { $set: {
                status: 'in-progress',
                freelancer: accepted.freelancer,
                budget: accepted.bidAmount,
                duration: accepted.estimatedTime
            } },
            { returnDocument: 'after', session }
        );
        if (!gig) throw new AppError('Gig is no longer open', 409);

        // 3. Client ka paisa (balance check isi query me)
        await debit(gig.client, accepted.bidAmount, session);

        // 4. Escrow + Transaction log
        await Escrow.create([{
            gig: gig._id,
            proposal: accepted._id,
            client: gig.client,
            freelancer: accepted.freelancer,
            amount: accepted.bidAmount,
            status: 'held'
        }], { session });

        await Transaction.create([{
            user: gig.client,
            type: 'hold',
            amount: accepted.bidAmount,
            description: `Payment held in escrow for "${gig.title}"`,
            referenceId: gig._id
        }], { session });

        // 5. Baaki pending proposals reject
        const others = await Proposal.find({
            gig: gig._id,
            _id: { $ne: accepted._id },
            status: 'pending'
        }).session(session);

        await Proposal.updateMany(
            { gig: gig._id, _id: { $ne: accepted._id }, status: 'pending' },
            { $set: { status: 'rejected' } },
            { session }
        );

        // 6. Default milestone agar koi nahi hai
        if (!gig.milestones || gig.milestones.length === 0) {
            gig.milestones = [{
                title: gig.title || 'Project Scope & Deliverables',
                budget: accepted.bidAmount,
                amount: accepted.bidAmount,
                description: accepted.coverLetter,
                status: 'pending',
                checklist: [{ text: 'Deliver agreed scope', isCompleted: false }]
            }];
            await gig.save({ session });
        }

        return { gig, accepted, others };
    });

    // Notifications COMMIT ke baad
    for (const p of out.others) {
        sendNotification(
            req.app,
            p.freelancer,
            req.user._id,
            'proposal_rejected',
            'Proposal Status Update',
            `Another proposal was selected for "${out.gig.title}".`,
            out.gig._id
        );
    }

    sendNotification(
        req.app,
        out.accepted.freelancer,
        req.user._id,
        'proposal_accepted',
        'Proposal Accepted!',
        `Your proposal for "${out.gig.title}" was accepted.`,
        out.gig._id
    );

    res.json({
        success: true,
        message: 'Proposal accepted',
        data: out.accepted
    });
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
