const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Gig = require('../models/Gig');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendNotification } = require('../utils/notifications');

const router = express.Router();

// @desc    Submit a review for a completed gig
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { gig: gigId, reviewee, rating, comment } = req.body;

    if (!gigId || !reviewee || rating === undefined || !comment) {
      return res.status(400).json({ success: false, message: 'All fields are required (gig, reviewee, rating, comment)' });
    }

    if (!mongoose.Types.ObjectId.isValid(gigId) || !mongoose.Types.ObjectId.isValid(reviewee)) {
      return res.status(400).json({ success: false, message: 'Invalid gig ID or reviewee ID format' });
    }

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5 stars' });
    }

    const trimmedComment = String(comment).trim();
    if (!trimmedComment) {
      return res.status(400).json({ success: false, message: 'Review comment cannot be empty' });
    }

    // Verify gig exists and is completed
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    if (gig.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Reviews can only be submitted for completed gigs' });
    }

    // Verify reviewer and reviewee are the client and freelancer of the gig
    const isClientReviewing = gig.client.toString() === req.user._id.toString() && gig.freelancer && gig.freelancer.toString() === reviewee;
    const isFreelancerReviewing = gig.freelancer && gig.freelancer.toString() === req.user._id.toString() && gig.client.toString() === reviewee;

    if (!isClientReviewing && !isFreelancerReviewing) {
      return res.status(403).json({ success: false, message: 'You are not authorized to submit this review' });
    }

    // Verify duplicate review
    const existingReview = await Review.findOne({
      gig: gigId,
      reviewer: req.user._id
    });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this gig' });
    }

    const review = await Review.create({
      gig: gigId,
      reviewer: req.user._id,
      reviewee,
      rating: parsedRating,
      comment: trimmedComment
    });

    // Recalculate average rating and reviewCount for reviewee
    const allReviews = await Review.find({ reviewee });
    const totalCount = allReviews.length;
    const avgRating = totalCount > 0 
      ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1))
      : 0;
    await User.findByIdAndUpdate(reviewee, { rating: avgRating, reviewCount: totalCount });

    // Trigger notifications to the reviewee
    try {
        sendNotification(
            req.app,
            reviewee,
            req.user._id,
            'review_added',
            'New Review Received!',
            `User "${req.user.username}" left a ${parsedRating}-star review for you: "${trimmedComment.slice(0, 50)}".`,
            review._id
        );
    } catch (notifErr) {
        console.error('Failed to dispatch review notification:', notifErr.message);
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get reviews and rating stats for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'username role')
      .populate('gig', 'title')
      .sort('-createdAt');

    const totalReviews = reviews.length;
    let averageRating = 0;
    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, item) => acc + item.rating, 0);
      averageRating = parseFloat((sum / totalReviews).toFixed(1));
    }

    res.status(200).json({
      success: true,
      data: {
        reviews,
        totalReviews,
        averageRating
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Check if logged-in user has submitted a review for a gig
// @route   GET /api/reviews/gig/:gigId/mine
// @access  Private
router.get('/gig/:gigId/mine', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.gigId)) {
      return res.status(400).json({ success: false, message: 'Invalid gig ID format' });
    }

    const review = await Review.findOne({
      gig: req.params.gigId,
      reviewer: req.user._id
    });
    res.status(200).json({ success: true, reviewed: !!review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
