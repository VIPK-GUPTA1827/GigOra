const express = require('express');
const mongoose = require('mongoose');
const Gig = require('../models/Gig');
const User = require('../models/User');
const Escrow = require('../models/Escrow');
const Proposal = require('../models/Proposal');
const Transaction = require('../models/Transaction');
const { protect, authorize, requireVerifiedEmail, optionalAuth } = require('../middleware/auth');
const { sendNotification } = require('../utils/notifications');
const Review = require('../models/Review');
const { calculateSimilarity } = require('../utils/aiMatcher');

const router = express.Router();

// Safe utility to escape user search terms and skill tags in regular expressions
const escapeRegex = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const rateLimit = require('express-rate-limit');

// Rate limiter for gig creation: prevent project creation spam
const createGigLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: process.env.NODE_ENV === 'test-rate-limit' ? 3 : 30,
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    message: {
        success: false,
        message: 'Too many projects created recently. Please wait a minute before posting again.'
    }
});

// @desc    Create a new gig
// @route   POST /api/gigs
// @access  Private (Clients only with verified email)
router.post('/', createGigLimiter, protect, authorize('client', 'admin'), requireVerifiedEmail, async (req, res) => {
    try {
        // Ensure user is a client (or allow admin to post)
        if (req.user.role !== 'client' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only clients can post gigs' });
        }

        const { 
            title, 
            description, 
            category, 
            budget, 
            coordinates, 
            address, 
            milestones, 
            documents,
            skillsRequired,
            locationType,
            experienceLevel,
            duration,
            deadline,
            status
        } = req.body;

        const isDraft = status === 'draft';

        // Validation for project
        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: 'Please provide a project title' });
        }

        if (!isDraft) {
            if (!description || description.trim().length < 10) {
                return res.status(400).json({ success: false, message: 'Please provide a detailed project description (minimum 10 characters)' });
            }
            if (!category || !category.trim()) {
                return res.status(400).json({ success: false, message: 'Please select a project category' });
            }
            const numBudget = Number(budget);
            if (isNaN(numBudget) || numBudget <= 0) {
                return res.status(400).json({ success: false, message: 'Please specify a valid budget in INR (₹)' });
            }
        }

        // Coordinates handling: if remote or not provided, fallback to Mumbai default
        let resolvedCoords = [72.8777, 19.0760];
        if (coordinates && Array.isArray(coordinates) && coordinates.length === 2 && !isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
            resolvedCoords = [parseFloat(coordinates[0]), parseFloat(coordinates[1])];
        }

        // Skills sanitization
        let normalizedSkills = [];
        if (Array.isArray(skillsRequired)) {
            normalizedSkills = skillsRequired.map(s => String(s).trim()).filter(Boolean);
        } else if (typeof skillsRequired === 'string') {
            normalizedSkills = skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
        }

        const gig = await Gig.create({
            title: title.trim(),
            description: description ? description.trim() : 'Draft project outline',
            category: category ? category.trim() : 'Web Development',
            budget: budget !== undefined && !isNaN(Number(budget)) ? Number(budget) : 0,
            client: req.user._id,
            skillsRequired: normalizedSkills,
            locationType: locationType && ['remote', 'onsite', 'hybrid'].includes(locationType) ? locationType : 'remote',
            experienceLevel: experienceLevel && ['Entry', 'Intermediate', 'Expert'].includes(experienceLevel) ? experienceLevel : 'Intermediate',
            duration: duration || '1-4 weeks',
            deadline: deadline ? new Date(deadline) : null,
            status: isDraft ? 'draft' : 'open',
            location: {
                type: 'Point',
                coordinates: resolvedCoords
            },
            address: address ? address.trim() : (locationType === 'onsite' ? 'Mumbai, Maharashtra' : 'Remote / Online'),
            milestones: milestones || [],
            documents: documents || []
        });

        // Trigger notifications to all freelancers only if published as open
        if (!isDraft) {
            try {
                const freelancers = await User.find({ role: 'freelancer' });
                freelancers.forEach(free => {
                    sendNotification(
                        req.app,
                        free._id,
                        req.user._id,
                        'new_gig',
                        'New Gig Posted!',
                        `A new gig "${title}" has been posted in category "${category}" with a budget of ₹${Number(budget).toLocaleString('en-IN')}.`,
                        gig._id
                    );
                });
            } catch (notifErr) {
                console.error('Failed to dispatch new gig notifications:', notifErr.message);
            }
        }

        res.status(201).json({ 
            success: true, 
            message: isDraft ? 'Project saved as draft successfully' : 'Project published successfully',
            data: gig 
        });
    } catch (error) {
        console.error('Error in POST /api/gigs:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all gigs posted by current client with proposal counts
// @route   GET /api/gigs/client/my-gigs
// @access  Private (Clients only)
router.get('/client/my-gigs', protect, authorize('client', 'admin'), async (req, res) => {
    try {
        const gigs = await Gig.find({ client: req.user._id })
            .populate('freelancer', 'name username avatar email')
            .sort({ createdAt: -1 });

        // Augment each gig with real proposal counts from MongoDB
        const augmentedGigs = await Promise.all(
            gigs.map(async (gig) => {
                const gigObj = gig.toObject();
                const proposalCount = await Proposal.countDocuments({ gig: gig._id });
                const acceptedProposal = await Proposal.findOne({ gig: gig._id, status: 'accepted' })
                    .populate('freelancer', 'name username avatar email headline');
                
                gigObj.proposalCount = proposalCount;
                gigObj.acceptedProposal = acceptedProposal;
                return gigObj;
            })
        );

        res.status(200).json({
            success: true,
            count: augmentedGigs.length,
            data: augmentedGigs
        });
    } catch (error) {
        console.error('Error fetching client gigs:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all active and completed contracts assigned to current freelancer
// @route   GET /api/gigs/freelancer/my-contracts
// @access  Private (Freelancers only)
router.get('/freelancer/my-contracts', protect, async (req, res) => {
    try {
        if (req.user.role !== 'freelancer' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only freelancers can view assigned contracts' });
        }

        const contracts = await Gig.find({
            freelancer: req.user._id,
            status: { $in: ['in-progress', 'completed', 'disputed'] }
        })
        .populate('client', 'name username avatar email')
        .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, count: contracts.length, data: contracts });
    } catch (error) {
        console.error('Error fetching freelancer contracts:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Search for hyperlocal gigs near coordinates
// @route   GET /api/gigs/search
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { lng, lat, maxDistance, category, search, minBudget, maxBudget } = req.query;

        if (!lng || !lat) {
            return res.status(400).json({ success: false, message: 'Please provide longitude (lng) and latitude (lat) query params' });
        }

        const parsedLng = parseFloat(lng);
        const parsedLat = parseFloat(lat);
        if (isNaN(parsedLng) || isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
            return res.status(400).json({ success: false, message: 'Invalid longitude or latitude coordinates' });
        }

        // Default maxDistance to 5000 meters (5 km) if not specified
        const distanceLimit = maxDistance ? parseInt(maxDistance, 10) : 5000;

        // Query setup using MongoDB $near geospatial query
        let query = {
            status: 'open',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parsedLng, parsedLat] // [lng, lat]
                    },
                    $maxDistance: distanceLimit // in meters
                }
            }
        };

        // Optional category filter
        if (category) {
            query.category = category;
        }

        // Search keyword filter
        if (search && search.trim()) {
            const escapedSearch = escapeRegex(search.trim());
            query.$or = [
                { title: { $regex: escapedSearch, $options: 'i' } },
                { description: { $regex: escapedSearch, $options: 'i' } }
            ];
        }

        // Budget filters
        if (minBudget || maxBudget) {
            query.budget = {};
            if (minBudget) query.budget.$gte = parseFloat(minBudget);
            if (maxBudget) query.budget.$lte = parseFloat(maxBudget);
        }

        const gigs = await Gig.find(query).populate('client', 'username email');

        res.status(200).json({ success: true, count: gigs.length, data: gigs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all gigs
// @route   GET /api/gigs
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, status, search, minBudget, maxBudget, skills, isReal, isDemo } = req.query;
        const andConditions = [];

        // Status filter: defaults to 'open', drafts must NEVER leak into public/freelancer browse
        if (status === 'draft') {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }
        if (status && status !== 'all') {
            andConditions.push({ status });
        } else if (status === 'all') {
            andConditions.push({ status: { $ne: 'draft' } });
        } else {
            andConditions.push({ status: 'open' });
        }

        // Real vs Demo filter
        if (isReal === 'true') {
            andConditions.push({ isDemo: { $ne: true }, isSample: { $ne: true } });
        } else if (isDemo === 'true') {
            andConditions.push({ $or: [{ isDemo: true }, { isSample: true }] });
        }

        // Category filter
        if (category && category !== 'All') {
            andConditions.push({ category });
        }

        // Search keyword filter across title and description
        if (search && search.trim()) {
            const sRegex = new RegExp(escapeRegex(search.trim()), 'i');
            andConditions.push({
                $or: [
                    { title: sRegex },
                    { description: sRegex }
                ]
            });
        }

        // Skills filter across skillsRequired array
        if (skills && skills.trim()) {
            const skillTokens = skills.split(',').map(s => s.trim()).filter(Boolean);
            if (skillTokens.length > 0) {
                const skillRegexes = skillTokens.map(s => new RegExp(escapeRegex(s), 'i'));
                andConditions.push({ skillsRequired: { $in: skillRegexes } });
            }
        }

        // Budget filters
        if (minBudget || maxBudget) {
            const budgetFilter = {};
            if (minBudget) budgetFilter.$gte = parseFloat(minBudget);
            if (maxBudget) budgetFilter.$lte = parseFloat(maxBudget);
            andConditions.push({ budget: budgetFilter });
        }

        const filter = andConditions.length > 0 ? { $and: andConditions } : {};

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 0;

        const totalCount = await Gig.countDocuments(filter);

        let query = Gig.find(filter)
            .populate('client', 'username name email avatar')
            .populate('freelancer', 'username name email avatar')
            .sort({ createdAt: -1 });

        if (limit > 0) {
            query = query.skip((page - 1) * limit).limit(limit);
        }

        const gigs = await query;

        res.status(200).json({ 
            success: true, 
            count: gigs.length, 
            totalCount,
            page: limit > 0 ? page : 1,
            totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 1,
            data: gigs 
        });
    } catch (error) {
        console.error('Error in GET /api/gigs:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get single gig by ID
// @route   GET /api/gigs/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid gig ID format' });
        }

        const gig = await Gig.findById(req.params.id)
            .populate('client', 'username email')
            .populate('freelancer', 'username email');

        if (!gig) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        const isOwner = req.user && (
            req.user.role === 'admin' ||
            (gig.client && (gig.client._id ? gig.client._id.toString() : gig.client.toString()) === req.user._id.toString())
        );

        if (gig.status === 'draft' && !isOwner) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        res.status(200).json({ success: true, data: gig });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update a gig
// @route   PUT /api/gigs/:id
// @access  Private (Owner only)
router.put('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid gig ID format' });
        }

        let gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        // Strict ownership check: Only the client who created the gig (or admin) can update it
        if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: You do not own this project' });
        }

        const { 
            title, 
            description, 
            category, 
            budget, 
            coordinates, 
            address, 
            status, 
            milestones,
            skillsRequired,
            locationType,
            experienceLevel,
            duration,
            deadline
        } = req.body;

        // Lifecycle (in_progress, completed, cancelled) only via dedicated endpoints
        const ALLOWED_EDIT_STATUSES = ['draft', 'open'];
        if (status !== undefined && !ALLOWED_EDIT_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status can only be changed to "draft" or "open" from here'
            });
        }

        const wasDraft = gig.status === 'draft';
        const targetStatus = status || gig.status;

        // If publishing a draft or keeping open, ensure core required fields are valid
        if (targetStatus === 'open') {
            const checkTitle = title !== undefined ? title : gig.title;
            const checkDesc = description !== undefined ? description : gig.description;
            const checkBudget = budget !== undefined ? budget : gig.budget;

            if (!checkTitle || !checkTitle.trim()) {
                return res.status(400).json({ success: false, message: 'Project title cannot be empty' });
            }
            if (!checkDesc || checkDesc.trim().length < 10) {
                return res.status(400).json({ success: false, message: 'Description must be at least 10 characters' });
            }
            if (!checkBudget || Number(checkBudget) <= 0) {
                return res.status(400).json({ success: false, message: 'Budget must be greater than 0 INR (₹)' });
            }
        }

        const updateData = {
            title: title !== undefined ? title.trim() : gig.title,
            description: description !== undefined ? description.trim() : gig.description,
            category: category !== undefined ? category.trim() : gig.category,
            budget: budget !== undefined ? Number(budget) : gig.budget,
            status: targetStatus,
            address: address !== undefined ? address.trim() : gig.address,
            milestones: milestones || gig.milestones,
            locationType: locationType && ['remote', 'onsite', 'hybrid'].includes(locationType) ? locationType : gig.locationType,
            experienceLevel: experienceLevel && ['Entry', 'Intermediate', 'Expert'].includes(experienceLevel) ? experienceLevel : gig.experienceLevel,
            duration: duration !== undefined ? duration : gig.duration,
            deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : gig.deadline
        };

        if (skillsRequired !== undefined) {
            if (Array.isArray(skillsRequired)) {
                updateData.skillsRequired = skillsRequired.map(s => String(s).trim()).filter(Boolean);
            } else if (typeof skillsRequired === 'string') {
                updateData.skillsRequired = skillsRequired.split(',').map(s => s.trim()).filter(Boolean);
            }
        }

        // If location coordinates are updated
        if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
            updateData.location = {
                type: 'Point',
                coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
            };
        }

        gig = await Gig.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

        // If transitioning from draft to open, notify freelancers
        if (wasDraft && targetStatus === 'open') {
            try {
                const freelancers = await User.find({ role: 'freelancer' });
                freelancers.forEach(free => {
                    sendNotification(
                        req.app,
                        free._id,
                        req.user._id,
                        'new_gig',
                        'New Gig Published!',
                        `A newly published gig "${gig.title}" is now open for proposals with a budget of ₹${Number(gig.budget).toLocaleString('en-IN')}.`,
                        gig._id
                    );
                });
            } catch (notifErr) {
                console.error('Failed to notify freelancers of published draft:', notifErr.message);
            }
        }

        res.status(200).json({ 
            success: true, 
            message: targetStatus === 'draft' ? 'Draft saved' : (wasDraft && targetStatus === 'open' ? 'Project published!' : 'Project updated successfully'),
            data: gig 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Delete a gig
// @route   DELETE /api/gigs/:id
// @access  Private (Owner only)
router.delete('/:id', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid gig ID format' });
        }

        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        // Strict ownership check
        if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden: You do not own this project' });
        }

        // Prevent deleting active projects with locked escrow, active contracts, or ongoing disputes
        if (gig.status === 'in-progress' || gig.status === 'disputed') {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete a project that is currently ${gig.status}.` 
            });
        }

        // Cascade delete any proposals submitted for this gig
        await Proposal.deleteMany({ gig: req.params.id });

        await Gig.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Gig deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Complete a gig and release remaining escrow funds
// @route   PUT /api/gigs/:id/complete
// @access  Private (Client only)
router.put('/:id/complete', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid gig ID format' });
        }

        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        // Ensure user is the client who posted the gig
        if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to complete this gig' });
        }

        if (gig.status !== 'in-progress') {
            return res.status(400).json({ success: false, message: 'Only in-progress gigs can be completed' });
        }

        // Find Escrow record for this gig
        const escrow = await Escrow.findOne({ gig: gig._id, status: { $ne: 'refunded' } });
        if (!escrow) {
            return res.status(404).json({ success: false, message: 'No active escrow record found for this gig' });
        }

        // Mark gig as completed
        gig.status = 'completed';
        
        // Also mark all pending/submitted milestones as completed
        if (gig.milestones && gig.milestones.length > 0) {
            gig.milestones.forEach(m => {
                if (m.status !== 'completed') {
                    m.status = 'completed';
                }
            });
        }
        await gig.save();

        // Release remaining escrowed amount to freelancer
        const remainingAmount = Math.max(0, (escrow.amount || 0) - (escrow.releasedAmount || 0));
        if (remainingAmount > 0 && gig.freelancer) {
            const freelancer = await User.findById(gig.freelancer);
            if (freelancer) {
                freelancer.walletBalance = (freelancer.walletBalance || 0) + remainingAmount;
                await freelancer.save();

                // Create payout receive Transaction log for freelancer
                await Transaction.create({
                    user: freelancer._id,
                    type: 'release',
                    amount: remainingAmount,
                    description: `Escrow payout received for completed Gig: "${gig.title}"`,
                    referenceId: gig._id
                });
            }

            escrow.releasedAmount = escrow.amount;
        }

        escrow.status = 'released';
        await escrow.save();

        // Notify freelancer
        try {
            sendNotification(
                req.app,
                gig.freelancer,
                req.user._id,
                'proposal_accepted', // reusing notification types
                'Gig Completed!',
                `The client has marked "${gig.title}" as completed and released the final payment of ₹${remainingAmount.toLocaleString('en-IN')}.`,
                gig._id
            );
        } catch (notifErr) {
            console.error('Failed to notify gig completion:', notifErr.message);
        }

        res.status(200).json({ success: true, message: 'Gig completed and remaining escrow funds released', data: gig });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Add a milestone to an in-progress contract / gig
// @route   POST /api/gigs/:id/milestones
// @access  Private (Client owner or admin)
router.post('/:id/milestones', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid gig ID format' });
        }

        const gig = await Gig.findById(req.params.id);
        if (!gig) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to add milestones to this project' });
        }

        if (gig.status === 'completed' || gig.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Cannot add milestones to a completed or cancelled contract' });
        }

        const { title, budget, amount, checklist } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: 'Please provide a milestone title' });
        }

        const parsedBudget = Number(budget !== undefined ? budget : amount);
        if (isNaN(parsedBudget) || parsedBudget < 0) {
            return res.status(400).json({ success: false, message: 'Please provide a valid milestone budget' });
        }

        const newMilestone = {
            title: title.trim(),
            budget: parsedBudget,
            amount: parsedBudget,
            status: 'pending',
            checklist: Array.isArray(checklist) ? checklist : [{ text: 'Complete milestone deliverables', isCompleted: false }],
            deliverableUrl: '',
            deliverableNotes: '',
            revisionNotes: ''
        };

        gig.milestones.push(newMilestone);
        await gig.save();

        res.status(201).json({ 
            success: true, 
            message: 'Milestone added successfully', 
            data: gig 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Reorder milestones in a contract
// @route   PUT /api/gigs/:id/milestones/reorder
// @access  Private (Client owner or admin)
router.put('/:id/milestones/reorder', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid gig ID format' });
        }

        const gig = await Gig.findById(req.params.id);
        if (!gig) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to reorder milestones for this project' });
        }

        if (gig.status === 'completed' || gig.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Cannot modify milestones on a completed or cancelled contract' });
        }

        const { milestoneIds, milestones } = req.body;
        const targetIds = Array.isArray(milestoneIds) 
            ? milestoneIds 
            : (Array.isArray(milestones) ? milestones.map(m => m._id || m.id) : null);

        if (!targetIds || !Array.isArray(targetIds) || targetIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide milestoneIds array to reorder' });
        }

        const currentMap = new Map();
        gig.milestones.forEach(m => currentMap.set(m._id.toString(), m));

        const reordered = [];
        for (const id of targetIds) {
            if (id && currentMap.has(id.toString())) {
                reordered.push(currentMap.get(id.toString()));
                currentMap.delete(id.toString());
            }
        }

        // Append any remaining milestones that were not explicitly listed
        for (const remaining of currentMap.values()) {
            reordered.push(remaining);
        }

        gig.milestones = reordered;
        await gig.save();

        res.status(200).json({ 
            success: true, 
            message: 'Milestones reordered successfully', 
            data: gig 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Submit a milestone for review/approval
// @route   PUT /api/gigs/:id/milestones/:milestoneId/submit
// @access  Private (Assigned freelancer only)
router.put('/:id/milestones/:milestoneId/submit', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(req.params.milestoneId)) {
            return res.status(400).json({ success: false, message: 'Invalid gig ID or milestone ID format' });
        }

        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        if (!gig.freelancer || (gig.freelancer.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
            return res.status(403).json({ success: false, message: 'Not authorized to submit milestones for this gig' });
        }

        if (gig.status !== 'in-progress') {
            return res.status(400).json({ success: false, message: 'Can only submit milestones for in-progress gigs' });
        }

        const milestone = gig.milestones.id(req.params.milestoneId);
        if (!milestone) {
            return res.status(404).json({ success: false, message: 'Milestone not found' });
        }

        if (milestone.status === 'completed') {
            return res.status(400).json({ success: false, message: 'Milestone is already completed and paid' });
        }

        if (milestone.status === 'submitted') {
            return res.status(400).json({ success: false, message: 'Milestone is already submitted for review' });
        }

        const { deliverableUrl, deliverableNotes } = req.body;

        if (!deliverableUrl?.trim() && !deliverableNotes?.trim()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide either a deliverable URL (e.g. GitHub/Figma/Drive) or deliverable notes' 
            });
        }

        // Update status and save deliverables (persisted in DB)
        milestone.status = 'submitted';
        milestone.deliverableUrl = deliverableUrl?.trim() || '';
        milestone.deliverableNotes = deliverableNotes?.trim() || '';
        milestone.submittedAt = new Date();
        await gig.save();

        // Notify Client
        try {
            await sendNotification(
                req.app,
                gig.client,
                req.user._id,
                'deliverable_submitted',
                'Milestone Deliverable Submitted!',
                `Freelancer has submitted deliverable for "${milestone.title}". Click to review deliverables.`,
                gig._id
            );
        } catch (notifErr) {
            console.error('Failed to notify milestone submission:', notifErr.message);
        }

        res.status(200).json({ success: true, message: 'Milestone deliverable submitted successfully', data: gig });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Client requests revisions on a submitted milestone with comments
// @route   PUT /api/gigs/:id/milestones/:milestoneId/revision
// @access  Private (Client owner only)
router.put('/:id/milestones/:milestoneId/revision', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(req.params.milestoneId)) {
            return res.status(400).json({ success: false, message: 'Invalid gig ID or milestone ID format' });
        }

        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        // Only project owner client (or admin) can request revision
        if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to request revisions for this gig' });
        }

        if (gig.status !== 'in-progress') {
            return res.status(400).json({ success: false, message: 'Can only request revisions for in-progress gigs' });
        }

        const milestone = gig.milestones.id(req.params.milestoneId);
        if (!milestone) {
            return res.status(404).json({ success: false, message: 'Milestone not found' });
        }

        if (milestone.status === 'completed') {
            return res.status(400).json({ success: false, message: 'Completed milestones cannot be sent back for revision' });
        }

        if (milestone.status !== 'submitted') {
            return res.status(400).json({ success: false, message: 'Revisions can only be requested on submitted deliverables' });
        }

        const { comment, revisionNotes, feedback: fb } = req.body;
        const feedback = (comment || revisionNotes || fb || '').trim();

        if (!feedback || feedback.length < 5) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide clear revision feedback comment (minimum 5 characters)' 
            });
        }

        // Persist revision status and comment in DB
        milestone.status = 'revision_requested';
        milestone.revisionNotes = feedback;
        await gig.save();

        // Notify Freelancer
        try {
            await sendNotification(
                req.app,
                gig.freelancer,
                req.user._id,
                'revision_requested',
                'Revision Requested on Milestone Deliverable',
                `Client requested revisions on "${milestone.title}": "${feedback}"`,
                gig._id
            );
        } catch (notifErr) {
            console.error('Failed to notify revision request:', notifErr.message);
        }

        res.status(200).json({ 
            success: true, 
            message: 'Revision requested with feedback comments saved', 
            data: gig 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update milestone checklist items state
// @route   PUT /api/gigs/:id/milestones/:milestoneId/checklist
// @access  Private (Assigned freelancer only)
router.put('/:id/milestones/:milestoneId/checklist', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(req.params.milestoneId)) {
            return res.status(400).json({ success: false, message: 'Invalid gig ID or milestone ID format' });
        }

        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        if (!gig.freelancer || (gig.freelancer.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
            return res.status(403).json({ success: false, message: 'Not authorized to update checklist for this gig' });
        }

        if (gig.status !== 'in-progress') {
            return res.status(400).json({ success: false, message: 'Can only update checklist items for in-progress gigs' });
        }

        const milestone = gig.milestones.id(req.params.milestoneId);
        if (!milestone) {
            return res.status(404).json({ success: false, message: 'Milestone not found' });
        }

        const { checklist } = req.body;
        if (!checklist || !Array.isArray(checklist)) {
            return res.status(400).json({ success: false, message: 'Please provide a checklist items array' });
        }

        // Update the checklist
        milestone.checklist = checklist;
        await gig.save();

        res.status(200).json({ success: true, message: 'Checklist updated successfully', data: gig });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Approve a milestone and release its budget from escrow
// @route   PUT /api/gigs/:id/milestones/:milestoneId/approve
// @access  Private (Client owner only)
router.put('/:id/milestones/:milestoneId/approve', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid gig ID format' });
        }

        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        // Ensure user is the client who posted the gig
        if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to manage this gig' });
        }

        if (gig.status !== 'in-progress') {
            return res.status(400).json({ success: false, message: 'Gig must be in-progress' });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.milestoneId)) {
            return res.status(400).json({ success: false, message: 'Invalid milestone ID format' });
        }

        const milestone = gig.milestones.id(req.params.milestoneId);
        if (!milestone) {
            return res.status(404).json({ success: false, message: 'Milestone not found' });
        }

        if (milestone.status === 'completed') {
            return res.status(400).json({ success: false, message: 'Milestone is already completed and released' });
        }

        // Update status to completed
        milestone.status = 'completed';

        // Release funds from escrow to freelancer
        const escrow = await Escrow.findOne({ gig: gig._id, status: { $ne: 'refunded' } });
        let actualReleased = 0;
        if (escrow) {
            const milestoneTargetAmount = milestone.budget || milestone.amount || gig.budget || 0;
            const remainingEscrow = Math.max(0, escrow.amount - escrow.releasedAmount);
            actualReleased = Math.min(milestoneTargetAmount, remainingEscrow);

            if (actualReleased > 0) {
                escrow.releasedAmount += actualReleased;
                
                if (escrow.releasedAmount >= escrow.amount) {
                    escrow.status = 'released';
                } else {
                    escrow.status = 'partially-released';
                }
                await escrow.save();

                // Pay freelancer
                const freelancer = await User.findById(gig.freelancer);
                if (freelancer) {
                    freelancer.walletBalance = (freelancer.walletBalance || 0) + actualReleased;
                    await freelancer.save();

                    // Create Transaction log for freelancer
                    await Transaction.create({
                        user: freelancer._id,
                        type: 'release',
                        amount: actualReleased,
                        description: `Milestone payment received: "${milestone.title}" (Gig: "${gig.title}")`,
                        referenceId: gig._id
                    });
                }
            }
        }

        // Check if all milestones are completed; if so, transition gig to completed automatically
        const allMilestonesDone = gig.milestones && gig.milestones.length > 0 && gig.milestones.every(m => m.status === 'completed');
        if (allMilestonesDone) {
            gig.status = 'completed';
        }
        await gig.save();

        // Notify Freelancer
        try {
            await sendNotification(
                req.app,
                gig.freelancer,
                req.user._id,
                'milestone_approved',
                'Milestone Approved & Paid!',
                `Client has approved milestone "${milestone.title}" and released ₹${(actualReleased || milestone.budget).toLocaleString('en-IN')}.${allMilestonesDone ? ' Entire project is now marked as Completed!' : ''}`,
                gig._id
            );
        } catch (notifErr) {
            console.error('Failed to notify milestone approval:', notifErr.message);
        }

        res.status(200).json({ success: true, message: 'Milestone approved and payout released', data: gig });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get trending skills based on active/open gigs analysis
// @route   GET /api/gigs/analytics/trending-skills
// @access  Public
router.get('/analytics/trending-skills', async (req, res) => {
    try {
        const gigs = await Gig.find({ status: { $in: ['open', 'in-progress', 'completed'] } });
        const popularSkillsList = ['React', 'Node', 'Python', 'Figma', 'UI Design', 'Javascript', 'Flutter', 'Android', 'AWS', 'Docker', 'SQL', 'HTML', 'CSS', 'MongoDB', 'PostgreSQL'];
        const skillCounts = {};
        popularSkillsList.forEach(skill => { skillCounts[skill] = 0; });
        
        gigs.forEach(g => {
            const combinedText = `${g.title} ${g.category} ${g.description}`.toLowerCase();
            popularSkillsList.forEach(skill => {
                if (combinedText.includes(skill.toLowerCase())) {
                    skillCounts[skill]++;
                }
            });
        });
        
        const trendingSkills = Object.keys(skillCounts)
            .map(skill => ({ name: skill, count: skillCounts[skill] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.status(200).json({ success: true, data: trendingSkills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get AI recommended gigs for the logged-in freelancer
// @route   GET /api/gigs/recommendations/me
// @access  Private (Freelancers only)
router.get('/recommendations/me', protect, async (req, res) => {
    try {
        if (req.user.role !== 'freelancer' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only freelancers can get gig recommendations' });
        }

        const user = await User.findById(req.user._id);
        if (!user || !user.skills || user.skills.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const freelancerSkillsText = (user.skills || [])
            .map(s => (typeof s === 'string' ? s : (s?.name || '')))
            .filter(Boolean)
            .join(', ') + ' ' + (user.bio || '');

        // Find all open gigs
        const gigs = await Gig.find({ status: 'open' }).populate('client', 'username');
        if (gigs.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const gigTexts = gigs.map(g => `${g.title} ${g.category} ${g.description}`);

        const scores = await calculateSimilarity(freelancerSkillsText, gigTexts);

        // Map and sort gigs
        const recommendedGigs = gigs.map((gig, index) => {
            const matchPercentage = Math.round((scores[index] || 0) * 100);
            return {
                gig,
                matchPercentage
            };
        })
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        // Only return matches above 15% to keep recommendations relevant
        .filter(item => item.matchPercentage >= 15);

        res.status(200).json({ success: true, count: recommendedGigs.length, data: recommendedGigs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get AI recommended candidates for a client's gig
// @route   GET /api/gigs/:id/recommendations
// @access  Private (Clients only)
router.get('/:id/recommendations', protect, async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);
        if (!gig) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        // Ensure user is the client who posted the gig
        if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to view recommendations for this gig' });
        }

        const freelancers = await User.find({ role: 'freelancer', isSuspended: { $ne: true } });
        if (freelancers.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const gigText = `${gig.title} ${gig.category} ${gig.description}`;
        const freelancerTexts = freelancers.map(f => {
            const skillList = (f.skills || [])
                .map(s => (typeof s === 'string' ? s : (s?.name || '')))
                .filter(Boolean)
                .join(', ');
            return `${skillList} ${f.headline || ''} ${f.bio || ''}`.trim();
        });

        const scores = await calculateSimilarity(gigText, freelancerTexts);

        // Map recommendations with rating and badge score boosters
        const recommendationsPromises = freelancers.map(async (freelancer, index) => {
            const baseScore = scores[index] || 0;

            // Fetch average rating
            const reviews = await Review.find({ reviewee: freelancer._id });
            const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;

            // Boost score: rating multiplier up to +50%, verified badge +10%
            const ratingBoost = 1 + (avgRating / 10);
            const badgeBoost = freelancer.verificationBadge ? 1.1 : 1.0;
            const finalScore = Math.min(1, baseScore * ratingBoost * badgeBoost);

            const matchPercentage = Math.round(finalScore * 100);

            return {
                freelancer: {
                    _id: freelancer._id,
                    username: freelancer.username,
                    email: freelancer.email,
                    bio: freelancer.bio,
                    skills: freelancer.skills,
                    verificationBadge: freelancer.verificationBadge,
                    rating: parseFloat(avgRating.toFixed(1))
                },
                matchPercentage
            };
        });

        const recommendations = await Promise.all(recommendationsPromises);

        // Sort descending, filter relevant ones (match >= 15%)
        const filteredRecommendations = recommendations
            .sort((a, b) => b.matchPercentage - a.matchPercentage)
            .filter(item => item.matchPercentage >= 15);

        res.status(200).json({ success: true, count: filteredRecommendations.length, data: filteredRecommendations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
