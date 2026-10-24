const express = require('express');
const User = require('../models/User');
const Gig = require('../models/Gig');
const Escrow = require('../models/Escrow');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get freelancer analytics metrics
// @route   GET /api/analytics/freelancer
// @access  Private (Freelancer only)
router.get('/freelancer', protect, async (req, res) => {
    try {
        if (req.user.role !== 'freelancer' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only freelancers can access analytics' });
        }

        const freelancerId = req.user._id;

        // 1. Get profile views from current user details
        const me = await User.findById(freelancerId);
        const profileViews = me?.profileViews || 0;

        // 2. Calculate lifetime earnings from Transaction releases
        const payouts = await Transaction.find({
            user: freelancerId,
            type: 'release'
        });
        const lifetimeEarnings = payouts.reduce((sum, t) => sum + t.amount, 0);

        // 3. Calculate active locked escrows volume
        const activeEscrows = await Escrow.find({
            freelancer: freelancerId,
            status: { $in: ['held', 'partially-released'] }
        });
        const activeEscrowVolume = activeEscrows.reduce((sum, e) => sum + (e.amount - e.releasedAmount), 0);

        // 4. Calculate gig completion rate
        const totalGigs = await Gig.countDocuments({ freelancer: freelancerId });
        const completedGigs = await Gig.countDocuments({ freelancer: freelancerId, status: 'completed' });
        const gigSuccessRate = totalGigs > 0 ? Math.round((completedGigs / totalGigs) * 100) : 100;

        // 5. Calculate monthly breakdown for the current year
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        
        const yearPayouts = await Transaction.find({
            user: freelancerId,
            type: 'release',
            createdAt: { $gte: startOfYear }
        });

        // Initialize 12 months array [Jan, Feb, ... Dec] with 0
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyEarningsData = months.map(m => ({ month: m, amount: 0 }));

        yearPayouts.forEach(t => {
            const date = new Date(t.createdAt);
            const monthIdx = date.getMonth(); // 0 to 11
            if (monthIdx >= 0 && monthIdx < 12) {
                monthlyEarningsData[monthIdx].amount += t.amount;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                profileViews,
                lifetimeEarnings,
                activeEscrowVolume,
                gigSuccessRate,
                totalGigs,
                completedGigs,
                monthlyEarnings: monthlyEarningsData
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
