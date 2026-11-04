const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Escrow = require('../models/Escrow');
const { protect, requireVerifiedEmail } = require('../middleware/auth');
const withTransaction = require('../utils/withTransaction');
const { credit } = require('../utils/wallet');

const router = express.Router();

// @desc    Deposit funds into user's wallet
// @route   POST /api/wallet/deposit
// @access  Private (Verified users only)
router.post('/deposit', protect, requireVerifiedEmail, async (req, res) => {
    // Mock money: in production only if flag is explicitly enabled
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_MOCK_DEPOSIT !== 'true') {
        return res.status(403).json({
            success: false,
            message: 'Deposits not available yet'
        });
    }

    const amount = Number(req.body.amount);
    if (!Number.isInteger(amount) || amount <= 0 || amount > 1000000) {
        return res.status(400).json({
            success: false,
            message: 'Invalid amount'
        });
    }

    const user = await withTransaction(async (session) => {
        const u = await credit(req.user._id, amount, session);
        await Transaction.create([{
            user: u._id,
            type: 'deposit',
            amount,
            description: 'Mock deposit (test money)'
        }], { session });
        return u;
    });

    res.json({
        success: true,
        message: `₹${amount.toLocaleString('en-IN')} deposited`,
        walletBalance: user.walletBalance
    });
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
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: transactions.length, data: transactions });
});

// @desc    Get active escrows for current user
// @route   GET /api/wallet/escrows
// @access  Private
router.get('/escrows', protect, async (req, res) => {
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

    res.json({ success: true, count: escrows.length, data: escrows });
});

// @desc    Get single escrow by Gig ID
// @route   GET /api/wallet/escrow/:gigId
// @access  Private
router.get('/escrow/:gigId', protect, async (req, res) => {
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

    const isClient = escrow.client && escrow.client._id.toString() === req.user._id.toString();
    const isFreelancer = escrow.freelancer && escrow.freelancer._id.toString() === req.user._id.toString();
    if (!isClient && !isFreelancer && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to view escrow details for this gig' });
    }

    res.json({ success: true, data: escrow });
});

module.exports = router;
