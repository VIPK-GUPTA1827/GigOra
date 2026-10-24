const express = require('express');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username name role avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/mark-read
// @access  Private
router.put('/mark-read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Mark a specific notification as read
// @route   PUT /api/notifications/mark-read/:id
// @access  Private
router.put('/mark-read/:id', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID format' });
    }

    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get email delivery logs for logged-in user or admin
// @route   GET /api/notifications/email-logs
// @access  Private
router.get('/email-logs', protect, async (req, res) => {
  try {
    const EmailLog = require('../models/EmailLog');
    const filter = req.user.role === 'admin' 
      ? {} 
      : { $or: [{ userId: req.user._id }, { recipient: req.user.email.toLowerCase() }] };

    if (req.query.recipient) {
      filter.recipient = req.query.recipient.toLowerCase();
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const emailLogs = await EmailLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 50);

    res.status(200).json({ success: true, count: emailLogs.length, data: emailLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Send a test transactional email and log result
// @route   POST /api/notifications/test-email
// @access  Private
router.post('/test-email', protect, async (req, res) => {
  try {
    const EmailLog = require('../models/EmailLog');
    const nodemailer = require('nodemailer');
    const { getTransporter } = require('../utils/mailer');

    const targetEmail = req.body.email || req.user.email;
    const shouldSimulateFailure = req.body.simulateFailure === true;

    if (!targetEmail || !targetEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Invalid recipient email address' });
    }

    if (shouldSimulateFailure) {
      await EmailLog.create({
        recipient: targetEmail.toLowerCase(),
        userId: req.user._id,
        subject: 'GigOra Test Alert (Simulated Failure)',
        type: 'test_alert',
        status: 'failed',
        error: 'Simulated SMTP connection timeout'
      });

      return res.status(502).json({
        success: false,
        message: 'Email delivery failed: Simulated SMTP connection timeout',
        status: 'failed'
      });
    }

    const transporter = await getTransporter();
    if (!transporter) {
      await EmailLog.create({
        recipient: targetEmail.toLowerCase(),
        userId: req.user._id,
        subject: 'GigOra Test Alert',
        type: 'test_alert',
        status: 'failed',
        error: 'SMTP transporter not configured'
      });

      return res.status(503).json({
        success: false,
        message: 'SMTP transporter not available',
        status: 'failed'
      });
    }

    const mailOptions = {
      from: '"GigOra" <alerts@gigora.dev>',
      to: targetEmail,
      subject: 'GigOra Test Notification',
      text: 'This is a test notification from GigOra verifying email delivery status.',
      html: '<p>This is a test notification from GigOra verifying email delivery status.</p>'
    };

    const info = await transporter.sendMail(mailOptions);

    const logEntry = await EmailLog.create({
      recipient: targetEmail.toLowerCase(),
      userId: req.user._id,
      subject: 'GigOra Test Notification',
      type: 'test_alert',
      status: 'sent',
      messageId: info.messageId || ''
    });

    res.status(200).json({
      success: true,
      message: 'Email delivered successfully',
      status: 'sent',
      data: logEntry
    });
  } catch (error) {
    const EmailLog = require('../models/EmailLog');
    try {
      await EmailLog.create({
        recipient: (req.body.email || req.user.email || 'unknown').toLowerCase(),
        userId: req.user._id,
        subject: 'GigOra Test Notification',
        type: 'test_alert',
        status: 'failed',
        error: error.message
      });
    } catch (e) {}

    res.status(502).json({
      success: false,
      message: `Failed to deliver email: ${error.message}`,
      status: 'failed'
    });
  }
});

module.exports = router;
