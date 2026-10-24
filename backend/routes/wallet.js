const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Escrow = require('../models/Escrow');
const { protect, requireVerifiedEmail } = require('../middleware/auth');

const router = express.Router();

// @desc    Deposit funds into user's wallet
// @route   POST /api/wallet/deposit
// @access  Private (Verified users only)
router.post('/deposit', protect, requireVerifiedEmail, async (req, res) => {
    try {
        const { amount } = req.body;

        const depositVal = parseFloat(amount);
        if (isNaN(depositVal) || depositVal <= 0) {
            return res.status(400).json({ success: false, message: 'Please specify a valid positive amount to deposit' });
        }

        if (depositVal > 1000000) {
            return res.status(400).json({ success: false, message: 'Maximum deposit limit per transaction is ₹10,00,000' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Increase wallet balance
        user.walletBalance = (user.walletBalance || 0) + depositVal;
        await user.save();

        // Create transaction log
        await Transaction.create({
            user: user._id,
            type: 'deposit',
            amount: depositVal,
            description: 'Funds deposited successfully via Mock Card'
        });

        res.status(200).json({
            success: true,
            message: `₹${depositVal.toLocaleString('en-IN')} deposited successfully`,
            walletBalance: user.walletBalance
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Attempt withdrawal from wallet (Blocked for Test Balance)
// @route   POST /api/wallet/withdraw
// @access  Private
router.post('/withdraw', protect, async (req, res) => {
    return res.status(400).json({
        success: false,
        isTestBalance: true,
        message: 'Test balances cannot be withdrawn or spent. Real payment gateway integration is under development.'
    });
});

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
// @access  Private
router.get('/transactions', protect, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: transactions.length, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get active escrows for current user
// @route   GET /api/wallet/escrows
// @access  Private
router.get('/escrows', protect, async (req, res) => {
    try {
        // Find escrows where either client or freelancer is current user
        const escrows = await Escrow.find({
            $or: [
                { client: req.user._id },
                { freelancer: req.user._id }
            ]
        })
        .populate('gig', 'title status budget')
        .populate('client', 'username')
        .populate('freelancer', 'username')
        .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: escrows.length, data: escrows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get single escrow by Gig ID
// @route   GET /api/wallet/escrow/:gigId
// @access  Private
router.get('/escrow/:gigId', protect, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.gigId)) {
            return res.status(400).json({ success: false, message: 'Invalid gig ID format' });
        }

        const escrow = await Escrow.findOne({ gig: req.params.gigId })
            .populate('gig', 'title status budget')
            .populate('client', 'username')
            .populate('freelancer', 'username');

        if (!escrow) {
            return res.status(404).json({ success: false, message: 'No escrow record found for this gig' });
        }

        // Authorization: only the client, assigned freelancer, or admin may view escrow financial details
        const isClient = escrow.client && escrow.client._id.toString() === req.user._id.toString();
        const isFreelancer = escrow.freelancer && escrow.freelancer._id.toString() === req.user._id.toString();
        if (!isClient && !isFreelancer && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to view escrow details for this gig' });
        }

        res.status(200).json({ success: true, data: escrow });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
