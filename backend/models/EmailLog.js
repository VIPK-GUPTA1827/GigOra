const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subject: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'notification'
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    required: true
  },
  error: {
    type: String,
    default: ''
  },
  messageId: {
    type: String,
    default: ''
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index recipient and type for high-performance lookup
EmailLogSchema.index({ recipient: 1, createdAt: -1 });
EmailLogSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('EmailLog', EmailLogSchema);
