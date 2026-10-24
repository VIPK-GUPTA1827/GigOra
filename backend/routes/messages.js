const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get message history between logged-in user and another user
// @route   GET /api/messages/:userId
// @access  Private
router.get('/:userId', protect, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const chatPartnerId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(chatPartnerId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    if (currentUserId.toString() === chatPartnerId.toString()) {
      return res.status(200).json({ success: true, data: [] });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: chatPartnerId },
        { sender: chatPartnerId, recipient: currentUserId }
      ]
    })
    .sort('timestamp');

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get list of contacts the user has conversed with
// @route   GET /api/messages/chats/contacts
// @access  Private
router.get('/chats/contacts', protect, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find messages sent or received by current user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }]
    })
    .sort('-timestamp')
    .populate('sender', 'username role')
    .populate('recipient', 'username role');

    // Group by chat partner to get list of unique active chats
    const contactMap = {};
    messages.forEach((msg) => {
      if (!msg.sender || !msg.recipient) return;
      const partner = msg.sender._id.toString() === currentUserId.toString() ? msg.recipient : msg.sender;
      if (!partner || !partner._id) return;
      const partnerId = partner._id.toString();

      if (!contactMap[partnerId]) {
        contactMap[partnerId] = {
          contact: partner,
          lastMessage: msg.text,
          lastMessageTime: msg.timestamp,
          unreadCount: 0
        };
      }

      // If message is unread and sent by the partner to current user, increment unread count
      if (!msg.read && msg.sender._id.toString() === partnerId) {
        contactMap[partnerId].unreadCount += 1;
      }
    });

    const contactsList = Object.values(contactMap);

    res.status(200).json({ success: true, data: contactsList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Mark all messages from a specific sender to current user as read
// @route   PUT /api/messages/mark-read/:senderId
// @access  Private
router.put('/mark-read/:senderId', protect, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const senderId = req.params.senderId;

    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ success: false, message: 'Invalid sender ID format' });
    }

    await Message.updateMany(
      { sender: senderId, recipient: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
