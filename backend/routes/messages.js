const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { messageLimiter } = require('../utils/rateLimiters');

const router = express.Router();

// @desc    Get message history between logged-in user and another user (cursor paginated)
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

    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const filter = {
      $or: [
        { sender: currentUserId, recipient: chatPartnerId },
        { sender: chatPartnerId, recipient: currentUserId }
      ]
    };

    if (req.query.before) {
      const beforeDate = new Date(req.query.before);
      if (!isNaN(beforeDate.getTime())) {
        filter.timestamp = { $lt: beforeDate };
      }
    }

    // Fetch in descending order to get latest first, then return in chronological order
    const messagesDesc = await Message.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit);

    const messages = messagesDesc.reverse();

    res.status(200).json({
      success: true,
      count: messages.length,
      hasMore: messagesDesc.length === limit,
      data: messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get list of contacts the user has conversed with
// @route   GET /api/messages/chats/contacts
// @access  Private
router.get('/chats/contacts', protect, async (req, res) => {
  try {
    const currentId = new mongoose.Types.ObjectId(req.user._id);

    const pipeline = [
      {
        $match: {
          $or: [{ sender: currentId }, { recipient: currentId }]
        }
      },
      { $sort: { timestamp: -1 } },
      {
        $project: {
          partner: {
            $cond: [{ $eq: ['$sender', currentId] }, '$recipient', '$sender']
          },
          text: 1,
          timestamp: 1,
          read: 1,
          sender: 1
        }
      },
      {
        $group: {
          _id: '$partner',
          lastMessage: { $first: '$text' },
          lastMessageTime: { $first: '$timestamp' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$read', false] },
                    { $ne: ['$sender', currentId] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $limit: 50 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'contact'
        }
      },
      { $unwind: '$contact' },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          lastMessageTime: 1,
          unreadCount: 1,
          contact: {
            _id: '$contact._id',
            username: '$contact.username',
            name: '$contact.name',
            role: '$contact.role',
            avatar: '$contact.avatar'
          }
        }
      },
      { $sort: { lastMessageTime: -1 } }
    ];

    const contactsList = await Message.aggregate(pipeline);

    res.status(200).json({ success: true, count: contactsList.length, data: contactsList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Mark all messages from a specific sender to current user as read
// @route   PUT /api/messages/mark-read/:senderId
// @access  Private
router.put('/mark-read/:senderId', protect, messageLimiter, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const senderId = req.params.senderId;

    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ success: false, message: 'Invalid sender ID format' });
    }

    const result = await Message.updateMany(
      { sender: senderId, recipient: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
