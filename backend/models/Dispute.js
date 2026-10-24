const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
    gig: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
        required: true
    },
    escrow: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Escrow',
        required: true
    },
    initiator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    opponent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: [true, 'Please add a reason for the dispute'],
        enum: ['Work Incomplete', 'Poor Quality', 'Payment Refused', 'Communication Issue', 'Other']
    },
    explanation: {
        type: String,
        required: [true, 'Please provide an explanation of the dispute'],
        minlength: [10, 'Explanation must be at least 10 characters'],
        maxlength: [1000, 'Explanation cannot exceed 1000 characters']
    },
    evidenceFile: {
        type: String,
        default: '' // Can store a mock file link or file path
    },
    status: {
        type: String,
        enum: ['open', 'resolved'],
        default: 'open'
    },
    resolution: {
        type: String,
        enum: ['refund_client', 'release_freelancer', 'none'],
        default: 'none'
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Dispute', disputeSchema);
