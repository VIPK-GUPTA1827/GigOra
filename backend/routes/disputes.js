const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Gig = require('../models/Gig');
const Escrow = require('../models/Escrow');
const Transaction = require('../models/Transaction');
const Dispute = require('../models/Dispute');
const { protect } = require('../middleware/auth');
const { sendNotification } = require('../utils/notifications');

const router = express.Router();

// @desc    File a new dispute on a contract gig
// @route   POST /api/disputes
// @access  Private
router.post('/', protect, async (req, res) => {
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
router.put('/:id/resolve', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only admins can resolve disputes' });
        }

        const { resolution } = req.body; // 'refund_client' | 'release_freelancer'

        if (!resolution || !['refund_client', 'release_freelancer'].includes(resolution)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid resolution decision (refund_client or release_freelancer)' });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid dispute ID format' });
        }

        const dispute = await Dispute.findById(req.params.id);
        if (!dispute) {
            return res.status(404).json({ success: false, message: 'Dispute case not found' });
        }

        if (dispute.status === 'resolved') {
            return res.status(400).json({ success: false, message: 'This dispute is already resolved' });
        }

        const gig = await Gig.findById(dispute.gig);
        const escrow = await Escrow.findById(dispute.escrow);
        
        if (!gig || !escrow) {
            return res.status(404).json({ success: false, message: 'Associated gig or escrow records missing' });
        }

        const remainingAmount = escrow.amount - escrow.releasedAmount;
        if (remainingAmount <= 0) {
            return res.status(400).json({ success: false, message: 'No remaining funds in escrow to resolve' });
        }

        const clientUser = await User.findById(escrow.client);
        const freelancerUser = await User.findById(escrow.freelancer);

        if (!clientUser || !freelancerUser) {
            return res.status(404).json({ success: false, message: 'Client or freelancer account associated with escrow was not found' });
        }

        if (resolution === 'refund_client') {
            // Refund remaining locked funds to client's wallet
            clientUser.walletBalance = (clientUser.walletBalance || 0) + remainingAmount;
            await clientUser.save();

            escrow.status = 'refunded';
            await escrow.save();

            // Log refund transaction
            await Transaction.create({
                user: clientUser._id,
                type: 'refund',
                amount: remainingAmount,
                description: `Refund from resolved dispute on Gig: "${gig.title}"`,
                referenceId: gig._id
            });

            // Cancel the gig contract state
            gig.status = 'cancelled';
            await gig.save();

        } else if (resolution === 'release_freelancer') {
            // Release remaining funds to freelancer's wallet
            freelancerUser.walletBalance = (freelancerUser.walletBalance || 0) + remainingAmount;
            await freelancerUser.save();

            escrow.releasedAmount = escrow.amount;
            escrow.status = 'released';
            await escrow.save();

            // Log payout transaction for freelancer
            await Transaction.create({
                user: freelancerUser._id,
                type: 'release',
                amount: remainingAmount,
                description: `Payment released from resolved dispute on Gig: "${gig.title}"`,
                referenceId: gig._id
            });

            // Mark gig complete
            gig.status = 'completed';
            
            // Mark all milestones as completed
            gig.milestones.forEach(m => {
                m.status = 'completed';
            });
            await gig.save();
        }

        // Update dispute details
        dispute.status = 'resolved';
        dispute.resolution = resolution;
        dispute.resolvedBy = req.user._id;
        dispute.resolvedAt = Date.now();
        await dispute.save();

        // Notify both parties
        try {
            const outcomeMsg = resolution === 'refund_client' 
                ? `Dispute resolved. Outcome: Remaining ₹${remainingAmount.toLocaleString('en-IN')} refunded to Client.`
                : `Dispute resolved. Outcome: Remaining ₹${remainingAmount.toLocaleString('en-IN')} paid to Freelancer.`;

            // Notify Client
            sendNotification(
                req.app,
                escrow.client,
                req.user._id,
                'dispute_resolved',
                'Dispute Resolved by Admin',
                outcomeMsg,
                gig._id
            );

            // Notify Freelancer
            sendNotification(
                req.app,
                escrow.freelancer,
                req.user._id,
                'dispute_resolved',
                'Dispute Resolved by Admin',
                outcomeMsg,
                gig._id
            );
        } catch (notifErr) {
            console.error('Failed to send dispute resolution notifications:', notifErr.message);
        }

        res.status(200).json({ success: true, message: `Dispute resolved with decision: ${resolution}`, data: dispute });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
