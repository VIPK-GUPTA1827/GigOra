const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
    gig: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
        required: true
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverLetter: {
        type: String,
        required: [true, 'Please add a cover letter details for your proposal']
    },
    bidAmount: {
        type: Number,
        required: [true, 'Please add a bid amount']
    },
    estimatedTime: {
        type: String,
        required: [true, 'Please specify the estimated completion time (e.g., 3 days, 1 week)']
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'negotiating'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate proposals by the same freelancer for a single gig
proposalSchema.index({ gig: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('Proposal', proposalSchema);
