const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'new_gig', 
      'proposal_submitted', 
      'proposal_accepted', 
      'proposal_rejected', 
      'deliverable_submitted',
      'revision_requested',
      'milestone_approved',
      'milestone_completed',
      'contract_started',
      'message_received', 
      'review_added', 
      'payment_received',
      'dispute_filed',
      'dispute_resolved',
      'booking_request',
      'booking_update'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  destinationUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
