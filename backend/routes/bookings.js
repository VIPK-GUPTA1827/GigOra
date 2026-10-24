const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect, authorize, requireVerifiedEmail } = require('../middleware/auth');
const { sendNotification } = require('../utils/notifications');

const router = express.Router();

// @desc    Update freelancer's availability slots
// @route   PUT /api/bookings/availability
// @access  Private (Freelancers only with verified email)
router.put('/availability', protect, authorize('freelancer', 'admin'), requireVerifiedEmail, async (req, res) => {
    try {
        if (req.user.role !== 'freelancer' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only freelancers can update availability slots' });
        }

        const { slots } = req.body;

        if (!slots || !Array.isArray(slots)) {
            return res.status(400).json({ success: false, message: 'Please provide an array of availability slots' });
        }

        // Validate slots structure
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:MM

        for (const slot of slots) {
            if (!validDays.includes(slot.dayOfWeek)) {
                return res.status(400).json({ success: false, message: `Invalid day of week: ${slot.dayOfWeek}` });
            }
            if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
                return res.status(400).json({ success: false, message: 'Time slots must be in 24-hour HH:MM format' });
            }
            if (slot.startTime >= slot.endTime) {
                return res.status(400).json({ success: false, message: 'Start time must be before end time' });
            }
        }

        const user = await User.findById(req.user._id);
        user.availabilitySlots = slots;
        await user.save();

        res.status(200).json({ success: true, message: 'Availability slots updated successfully', data: user.availabilitySlots });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Create a new booking reservation slot
// @route   POST /api/bookings
// @access  Private (Clients only with verified email)
router.post('/', protect, authorize('client', 'admin'), requireVerifiedEmail, async (req, res) => {
    try {
        if (req.user.role !== 'client' && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only clients can request bookings' });
        }

        const { freelancerId, date, startTime, endTime, description } = req.body;

        if (!freelancerId || !date || !startTime || !endTime || !description) {
            return res.status(400).json({ success: false, message: 'Please provide all booking details (freelancerId, date, startTime, endTime, description)' });
        }

        if (!mongoose.Types.ObjectId.isValid(freelancerId)) {
            return res.status(400).json({ success: false, message: 'Invalid freelancer ID format' });
        }

        if (freelancerId.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot book a session with yourself' });
        }

        // Validate freelancer exists
        const freelancer = await User.findById(freelancerId);
        if (!freelancer || freelancer.role !== 'freelancer') {
            return res.status(404).json({ success: false, message: 'Freelancer not found' });
        }

        const bookingDate = new Date(date);
        // Reset time to midnight for consistent date comparison
        bookingDate.setUTCHours(0, 0, 0, 0);

        // Check for time slot conflicts
        // Find existing bookings on the same date for this freelancer that are either pending or confirmed
        const existingBookings = await Booking.find({
            freelancer: freelancerId,
            date: bookingDate,
            status: { $in: ['pending', 'confirmed'] }
        });

        // Time overlap check: start1 < end2 && end1 > start2
        const hasConflict = existingBookings.some(b => {
            return startTime < b.endTime && endTime > b.startTime;
        });

        if (hasConflict) {
            return res.status(400).json({ success: false, message: 'This time slot is already booked or requested on this date.' });
        }

        const booking = await Booking.create({
            freelancer: freelancerId,
            client: req.user._id,
            date: bookingDate,
            startTime,
            endTime,
            description
        });

        // Notify Freelancer
        try {
            sendNotification(
                req.app,
                freelancerId,
                req.user._id,
                'booking_request',
                'New Booking Request!',
                `Client ${req.user.username} has requested a slot on ${bookingDate.toLocaleDateString()} at ${startTime}-${endTime}.`,
                booking._id
            );
        } catch (notifErr) {
            console.error('Failed to notify freelancer of booking:', notifErr.message);
        }

        res.status(201).json({ success: true, message: 'Booking requested successfully', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get bookings of the logged-in user
// @route   GET /api/bookings/my-bookings
// @access  Private
router.get('/my-bookings', protect, async (req, res) => {
    try {
        let bookings;

        if (req.user.role === 'freelancer') {
            bookings = await Booking.find({ freelancer: req.user._id })
                .populate('client', 'username email bio')
                .sort({ date: 1, startTime: 1 });
        } else if (req.user.role === 'client') {
            bookings = await Booking.find({ client: req.user._id })
                .populate('freelancer', 'username email bio verificationBadge')
                .sort({ date: 1, startTime: 1 });
        } else {
            // Admin can see all bookings
            bookings = await Booking.find()
                .populate('client', 'username')
                .populate('freelancer', 'username')
                .sort({ date: 1, startTime: 1 });
        }

        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update booking reservation status (Accept/Reject/Cancel/Complete)
// @route   PUT /api/bookings/:id/status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['confirmed', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid status update (confirmed, cancelled, completed)' });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid booking ID format' });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Enforce valid status transition: already completed or cancelled bookings cannot be changed
        if (booking.status === 'completed' || booking.status === 'cancelled') {
            return res.status(400).json({ success: false, message: `Cannot modify a booking that is already ${booking.status}` });
        }

        // Authorization checks
        if (status === 'confirmed' || (status === 'cancelled' && req.user.role === 'freelancer')) {
            // Only the assigned freelancer can accept/reject the booking request
            if (booking.freelancer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Forbidden: Not authorized to accept or decline this booking' });
            }
        }

        if (status === 'completed' || (status === 'cancelled' && req.user.role === 'client')) {
            // Only the hiring client can cancel their request or mark the booking session as complete
            if (booking.client.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Forbidden: Not authorized to cancel or complete this booking' });
            }
        }

        booking.status = status;
        await booking.save();

        // Send real-time notification to the relevant parties
        try {
            const targets = [];
            if (req.user.role === 'admin') {
                targets.push(booking.freelancer, booking.client);
            } else if (req.user.role === 'client') {
                targets.push(booking.freelancer);
            } else {
                targets.push(booking.client);
            }

            for (const targetUser of targets) {
                sendNotification(
                    req.app,
                    targetUser,
                    req.user._id,
                    'booking_update',
                    `Booking Request ${status.toUpperCase()}!`,
                    `Booking on ${new Date(booking.date).toLocaleDateString()} at ${booking.startTime}-${booking.endTime} has been marked as ${status} by ${req.user.username}.`,
                    booking._id
                );
            }
        } catch (notifErr) {
            console.error('Failed to send booking update notification:', notifErr.message);
        }

        res.status(200).json({ success: true, message: `Booking status updated to ${status}`, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
