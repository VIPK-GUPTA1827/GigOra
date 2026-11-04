const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Gig = require('../models/Gig');
const Escrow = require('../models/Escrow');
const Transaction = require('../models/Transaction');
const Dispute = require('../models/Dispute');
const { protect, authorize, requireVerifiedEmail } = require('../middleware/auth');
const AppError = require('../utils/AppError');
const withTransaction = require('../utils/withTransaction');
const { credit } = require('../utils/wallet');
const { sendNotification } = require('../utils/notifications');
const { disputeLimiter } = require('../utils/rateLimiters');

const router = express.Router();

// @desc    File a new dispute on a contract gig
// @route   POST /api/disputes
// @access  Private
router.post('/', protect, requireVerifiedEmail, disputeLimiter, async (req, res) => {
    try {
        const { gigId, reason, explanation, evidenceFile } = req.body;

        if (!gigId || !reason || !explanation) {
            return res.status(400).json({ success: false, message: 'Please provide all details (gigId, reason, explanation)' });
        }

        if (!mongoose.Types.ObjectId.isValid(gigId)) {
            return res.status(400).json({ success: false, message: 'Invalid gig ID format' });
        }

        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        // Verify user is either client or freelancer on this gig
        const isClient = gig.client.toString() === req.user._id.toString();
        const isFreelancer = gig.freelancer && gig.freelancer.toString() === req.user._id.toString();

        if (!isClient && !isFreelancer && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to file a dispute on this contract' });
        }

        // Check for active escrow
        const escrow = await Escrow.findOne({ gig: gigId, status: { $in: ['held', 'partially-released'] } });
        if (!escrow) {
            return res.status(400).json({ success: false, message: 'No active locked escrow found for this gig contract' });
        }

        // Check if there is already an open dispute
        const existingDispute = await Dispute.findOne({ gig: gigId, status: 'open' });
        if (existingDispute) {
            return res.status(400).json({ success: false, message: 'A dispute is already open for this gig contract' });
        }

        const opponent = isClient ? gig.freelancer : gig.client;

        const dispute = await Dispute.create({
            gig: gigId,
            escrow: escrow._id,
            initiator: req.user._id,
            opponent,
            reason,
            explanation,
            evidenceFile: evidenceFile || ''
        });

        // Lock gig status to disputed
        gig.status = 'disputed';
        await gig.save();

        // Notify Opponent
        try {
            sendNotification(
                req.app,
                opponent,
                req.user._id,
                'dispute_filed',
                'Contract Disputed!',
                `User ${req.user.username} has filed a dispute on Gig: "${gig.title}". Contract is frozen.`,
                gig._id
            );
        } catch (notifErr) {
            console.error('Failed to notify opponent of dispute:', notifErr.message);
        }

        res.status(201).json({ success: true, message: 'Dispute filed successfully. Contract has been frozen.', data: dispute });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get all disputes
// @route   GET /api/disputes
// @access  Private (Admin only)
router.get('/', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only admins can view disputes list' });
        }

        const disputes = await Dispute.find()
            .populate('gig', 'title status budget')
            .populate('escrow', 'amount releasedAmount')
            .populate('initiator', 'username email role')
            .populate('opponent', 'username email role')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: disputes.length, data: disputes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Resolve dispute with refund or payout release
// @route   PUT /api/disputes/:id/resolve
// @access  Private (Admin only)
router.put('/:id/resolve', protect, authorize('admin'), async (req, res) => {
    const { resolution } = req.body;
    const valid = ['refund_client', 'release_freelancer'];
    if (!valid.includes(resolution)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid resolution'
        });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid dispute ID format'
        });
    }

    const out = await withTransaction(async (session) => {
        // 1. Claim: sirf 'open' dispute (double click safe)
        const dispute = await Dispute.findOneAndUpdate(
            { _id: req.params.id, status: 'open' },
            {
                $set: {
                    status: 'resolved',
                    resolution,
                    resolvedBy: req.user._id,
                    resolvedAt: new Date()
                }
            },
            { returnDocument: 'after', session }
        );
        if (!dispute) {
            throw new AppError('Dispute not found or resolved', 409);
        }

        const escrow = await Escrow.findOne({
            _id: dispute.escrow,
            status: { $in: ['held', 'partially-released'] }
        }).session(session);

        const gig = await Gig.findById(dispute.gig).session(session);
        if (!escrow || !gig) {
            throw new AppError('Escrow or gig missing', 404);
        }

        const remaining = escrow.amount - escrow.releasedAmount;
        if (remaining <= 0) {
            throw new AppError('No remaining funds in escrow', 400);
        }

        if (resolution === 'refund_client') {
            await credit(escrow.client, remaining, session);
            escrow.status = 'refunded';
            gig.status = 'cancelled';
            await Transaction.create([{
                user: escrow.client,
                type: 'refund',
                amount: remaining,
                description: `Dispute refund: "${gig.title}"`,
                referenceId: gig._id
            }], { session });
        } else {
            await credit(escrow.freelancer, remaining, session);
            escrow.releasedAmount = escrow.amount;
            escrow.status = 'released';
            gig.status = 'completed';
            gig.milestones.forEach((m) => { m.status = 'completed'; });
            await Transaction.create([{
                user: escrow.freelancer,
                type: 'release',
                amount: remaining,
                description: `Dispute payout: "${gig.title}"`,
                referenceId: gig._id
            }], { session });
        }

        await escrow.save({ session });
        await gig.save({ session });
        return { dispute, escrow, gig, remaining };
    });

    const msg = `Dispute resolved (${resolution}): ₹${out.remaining.toLocaleString('en-IN')}`;
    for (const u of [out.escrow.client, out.escrow.freelancer]) {
        sendNotification(
            req.app,
            u,
            req.user._id,
            'dispute_resolved',
            'Dispute Resolved by Admin',
            msg,
            out.gig._id
        );
    }

    res.json({ success: true, data: out.dispute });
});

module.exports = router;
