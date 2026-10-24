const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Gig = require('../models/Gig');
const Escrow = require('../models/Escrow');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Middleware to restrict access only to admins
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }
};

// @desc    Get dashboard statistics for Admin
// @route   GET /api/admin/stats
// @access  Private (Admin Only)
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        // User counts
        const totalUsers = await User.countDocuments({});
        const clientsCount = await User.countDocuments({ role: 'client' });
        const freelancersCount = await User.countDocuments({ role: 'freelancer' });

        // Gig counts
        const totalGigs = await Gig.countDocuments({});
        const openGigs = await Gig.countDocuments({ status: 'open' });
        const inProgressGigs = await Gig.countDocuments({ status: 'in-progress' });
        const completedGigs = await Gig.countDocuments({ status: 'completed' });
        const cancelledGigs = await Gig.countDocuments({ status: 'cancelled' });

        // Escrows calculation
        const escrows = await Escrow.find({});
        
        // Total Escrow Held (Sum of amount - releasedAmount for active escrows)
        const escrowHeld = escrows
            .filter(e => ['held', 'partially-released'].includes(e.status))
            .reduce((sum, e) => sum + (e.amount - e.releasedAmount), 0);

        // Platform Revenue (5% of all released escrow funds)
        const totalReleased = escrows.reduce((sum, e) => sum + (e.releasedAmount || 0), 0);
        const platformRevenue = parseFloat((totalReleased * 0.05).toFixed(2));

        // Job Success Rate = Completed Gigs / (Completed + Cancelled)
        const totalFinalized = completedGigs + cancelledGigs;
        const jobSuccessRate = totalFinalized > 0 
            ? Math.round((completedGigs / totalFinalized) * 100) 
            : 100;

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    clients: clientsCount,
                    freelancers: freelancersCount
                },
                gigs: {
                    total: totalGigs,
                    open: openGigs,
                    inProgress: inProgressGigs,
                    completed: completedGigs,
                    cancelled: cancelledGigs
                },
                payments: {
                    escrowHeld,
                    platformRevenue,
                    totalReleased
                },
                jobSuccessRate
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get list of all users
// @route   GET /api/admin/users
// @access  Private (Admin Only)
router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Toggle Verification Badge of a user
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin Only)
router.put('/users/:id/verify', protect, adminOnly, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }

        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.verificationBadge = !user.verificationBadge;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User verification badge set to ${user.verificationBadge}`,
            data: { _id: user._id, verificationBadge: user.verificationBadge }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Toggle user suspension status
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin Only)
router.put('/users/:id/suspend', protect, adminOnly, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }

        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Admins cannot suspend themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Admins cannot suspend their own account' });
        }

        user.isSuspended = !user.isSuspended;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User account suspension set to ${user.isSuspended}`,
            data: { _id: user._id, isSuspended: user.isSuspended }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all gigs in system
// @route   GET /api/admin/gigs
// @access  Private (Admin Only)
router.get('/gigs', protect, adminOnly, async (req, res) => {
    try {
        const gigs = await Gig.find({})
            .populate('client', 'username email')
            .populate('freelancer', 'username email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: gigs.length, data: gigs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all escrows and transaction ledger for payment auditing
// @route   GET /api/admin/payments
// @access  Private (Admin Only)
router.get('/payments', protect, adminOnly, async (req, res) => {
    try {
        const escrows = await Escrow.find({})
            .populate('gig', 'title status budget')
            .populate('client', 'username')
            .populate('freelancer', 'username')
            .sort({ createdAt: -1 });

        const transactions = await Transaction.find({})
            .populate('user', 'username email role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                escrows,
                transactions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
