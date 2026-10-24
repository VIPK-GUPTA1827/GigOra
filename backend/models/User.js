const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    username: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        minlength: [12, 'Password must be at least 12 characters']
    },
    googleId: {
        type: String,
        default: null
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        required: [true, 'Please select a role'],
        enum: ['client', 'freelancer', 'admin'],
        default: 'freelancer'
    },
    rating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    walletBalance: {
        type: Number,
        default: function() {
            return this.role === 'client' ? 5000 : 0;
        }
    },
    headline: {
        type: String,
        default: '',
        trim: true
    },
    bio: {
        type: String,
        default: '',
        trim: true
    },
    hourlyRate: {
        type: Number,
        default: 0
    },
    experienceLevel: {
        type: String,
        enum: ['Entry', 'Intermediate', 'Advanced', 'Expert', 'entry', 'intermediate', 'advanced', 'expert'],
        default: 'Intermediate'
    },
    preferredCategories: [
        {
            type: String,
            trim: true
        }
    ],
    workPreference: {
        type: String,
        enum: ['remote', 'onsite', 'hybrid'],
        default: 'remote'
    },
    location: {
        city: { type: String, default: 'Mumbai', trim: true },
        state: { type: String, default: 'Maharashtra', trim: true }
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    hasSkippedOnboarding: {
        type: Boolean,
        default: false
    },
    skills: [
        {
            name: { type: String, required: true },
            level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'beginner', 'intermediate', 'advanced', 'expert'], default: 'Intermediate' }
        }
    ],
    experience: [
        {
            title: { type: String, required: true },
            company: { type: String, required: true },
            duration: { type: String, required: true },
            description: { type: String, default: '' }
        }
    ],
    certifications: [
        {
            name: { type: String, required: true },
            organization: { type: String, required: true },
            year: { type: String, required: true }
        }
    ],
    // Freelancer Professional Links & Bandwidth
    socialLinks: {
        github: { type: String, default: '', trim: true },
        linkedin: { type: String, default: '', trim: true },
        website: { type: String, default: '', trim: true },
        twitter: { type: String, default: '', trim: true }
    },
    languages: [
        {
            name: { type: String, required: true },
            proficiency: { type: String, default: 'Fluent' }
        }
    ],
    weeklyCapacity: {
        type: String,
        default: '30+ hrs/week'
    },
    // Client Company & Hiring Details
    companyName: {
        type: String,
        default: '',
        trim: true
    },
    companyLogo: {
        type: String,
        default: '',
        trim: true
    },
    companyWebsite: {
        type: String,
        default: '',
        trim: true
    },
    companySize: {
        type: String,
        default: '1-10',
        trim: true
    },
    companyDescription: {
        type: String,
        default: '',
        trim: true
    },
    industry: {
        type: String,
        default: 'Software & Technology',
        trim: true
    },
    availability: {
        type: String,
        default: 'Flexible'
    },
    availabilitySlots: [
        {
            dayOfWeek: { type: String, required: true },
            startTime: { type: String, required: true },
            endTime: { type: String, required: true }
        }
    ],
    verificationBadge: {
        type: Boolean,
        default: false
    },
    profileViews: {
        type: Number,
        default: 0
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    portfolio: [
        {
            title: { type: String, required: true },
            description: { type: String },
            projectUrl: { type: String },
            link: { type: String },
            githubUrl: { type: String },
            tags: [{ type: String }],
            imageUrl: { type: String },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to encrypt password using bcryptjs
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!enteredPassword || !this.password) {
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
