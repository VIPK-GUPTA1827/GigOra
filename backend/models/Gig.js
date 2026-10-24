const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a gig title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a gig description']
    },
    category: {
        type: String,
        required: [true, 'Please select a category for the gig'],
        trim: true
    },
    budget: {
        type: Number,
        required: [true, 'Please add a budget for the gig']
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    skillsRequired: [
        {
            type: String,
            trim: true
        }
    ],
    locationType: {
        type: String,
        enum: ['remote', 'onsite', 'hybrid'],
        default: 'remote'
    },
    experienceLevel: {
        type: String,
        enum: ['Entry', 'Intermediate', 'Advanced', 'Expert', 'entry', 'intermediate', 'advanced', 'expert'],
        default: 'Intermediate'
    },
    duration: {
        type: String,
        default: '1-4 weeks'
    },
    deadline: {
        type: Date
    },
    status: {
        type: String,
        enum: ['draft', 'open', 'paused', 'closed', 'in-progress', 'disputed', 'completed', 'cancelled'],
        default: 'open'
    },
    isDemo: {
        type: Boolean,
        default: false
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [72.8777, 19.0760] // Default Mumbai coordinates
        }
    },
    address: {
        type: String,
        default: 'Remote / Online'
    },
    milestones: [
        {
            title: { type: String, required: true },
            budget: { type: Number, default: 0 },
            amount: { type: Number, default: 0 },
            description: { type: String, default: '' },
            dueDate: { type: Date },
            status: { 
                type: String, 
                enum: ['pending', 'in-progress', 'submitted', 'revision_requested', 'revision-requested', 'approved', 'completed'], 
                default: 'pending' 
            },
            checklist: [
                {
                    text: { type: String, required: true },
                    isCompleted: { type: Boolean, default: false }
                }
            ],
            deliverableUrl: { type: String, default: '' },
            deliverableNotes: { type: String, default: '' },
            revisionNotes: { type: String, default: '' },
            submittedAt: { type: Date }
        }
    ],
    documents: [
        {
            type: String // URL or path to attached documents
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index the location field for 2dsphere queries (location proximity routing)
gigSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Gig', gigSchema);
