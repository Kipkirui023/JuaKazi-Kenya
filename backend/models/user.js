const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Basic Information
    userType: {
        type: String,
        enum: ['worker', 'employer', 'admin'],
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[0-9]{10,15}$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        sparse: true
    },

    // Location Information
    location: {
        county: {
            type: String,
            required: true
        },
        subCounty: String,
        ward: String
    },

    // Worker Specific Fields
    skills: [{
        type: String,
        trim: true
    }],
    experience: {
        years: {
            type: Number,
            min: 0,
            default: 0
        },
        description: String
    },
    availability: {
        type: String,
        enum: ['available', 'busy', 'unavailable'],
        default: 'available'
    },
    availabilityType: {
        type: String,
        enum: ['full-time', 'part-time', 'casual'],
        default: 'casual'
    },

    // Employer Specific Fields
    companyName: String,
    companySize: String,
    industry: String,

    // Verification
    isVerified: {
        phone: {
            type: Boolean,
            default: false
        },
        id: {
            type: Boolean,
            default: false
        },
        email: {
            type: Boolean,
            default: false
        }
    },
    verificationCode: String,
    verificationExpires: Date,

    // Ratings and Reviews
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },

    // Profile
    profileImage: String,
    bio: String,
    portfolio: [String], // Array of image URLs

    // Security
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    lastLogin: Date,
    active: {
        type: Boolean,
        default: true
    },

    // Preferences
    notifications: {
        sms: {
            type: Boolean,
            default: true
        },
        whatsapp: {
            type: Boolean,
            default: true
        },
        email: {
            type: Boolean,
            default: false
        }
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive information when converting to JSON
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.verificationCode;
    delete user.verificationExpires;
    return user;
};

// Indexes (already created in database.js, but defined here for reference)
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ location: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ rating: -1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);