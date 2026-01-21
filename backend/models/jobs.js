const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    // Basic Information
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },

    // Job Details
    type: {
        type: String,
        enum: ['full-time', 'part-time', 'casual', 'contract'],
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'construction', 'plumbing', 'electrical', 'cleaning',
            'delivery', 'domestic', 'farming', 'security',
            'driving', 'other'
        ]
    },
    skills: [{
        type: String,
        trim: true
    }],

    // Location
    location: {
        county: {
            type: String,
            required: true
        },
        subCounty: String,
        ward: String,
        exactLocation: String // Optional specific address
    },

    // Compensation
    salary: {
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'KES'
        },
        period: {
            type: String,
            enum: ['hour', 'day', 'week', 'month', 'project'],
            required: true
        },
        isNegotiable: {
            type: Boolean,
            default: false
        }
    },

    // Duration
    startDate: Date,
    endDate: Date,
    isUrgent: {
        type: Boolean,
        default: false
    },

    // Employer Information
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyName: String,
    contactPhone: String,
    contactWhatsApp: String,

    // Application Process
    status: {
        type: String,
        enum: ['open', 'closed', 'filled', 'cancelled'],
        default: 'open'
    },
    applications: [{
        worker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
            default: 'pending'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        coverMessage: String
    }],

    // Statistics
    views: {
        type: Number,
        default: 0
    },
    applicationsCount: {
        type: Number,
        default: 0
    },

    // Metadata
    featured: {
        type: Boolean,
        default: false
    },
    promotedUntil: Date,

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

// Virtual for formatted salary
jobSchema.virtual('formattedSalary').get(function () {
    const amount = this.salary.amount.toLocaleString();
    const period = this.salary.period === 'project' ? '' : `per ${this.salary.period}`;
    return `KSh ${amount} ${period}`.trim();
});

// Update applications count before save
jobSchema.pre('save', function (next) {
    this.applicationsCount = this.applications.length;
    next();
});

// Indexes for efficient querying
jobSchema.index({ location: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ employer: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ salary: -1 });
jobSchema.index({ featured: 1, createdAt: -1 });
jobSchema.index({ isUrgent: 1, createdAt: -1 });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;