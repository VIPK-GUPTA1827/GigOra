const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: [true, 'Please add a booking date']
    },
    startTime: {
        type: String,
        required: [true, 'Please add a start time (e.g. 09:00)']
    },
    endTime: {
        type: String,
        required: [true, 'Please add an end time (e.g. 11:00)']
    },
    description: {
        type: String,
        required: [true, 'Please add a description/reason for booking'],
        maxlength: [300, 'Description cannot exceed 300 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
