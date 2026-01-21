
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
        default: 'pending'
    },
    coverMessage: String,
    appliedAt: {
        type: Date,
        default: Date.now
    },
    employerResponse: {
        message: String,
        respondedAt: Date
    }
}, {
    timestamps: true
});

// Ensure one application per job per worker
applicationSchema.index({ job: 1, worker: 1 }, { unique: true });

// Update job applications count when application is created
applicationSchema.post('save', async function () {
    const Job = mongoose.model('Job');
    await Job.findByIdAndUpdate(this.job, {
        $inc: { applicationsCount: 1 }
    });
});

// Update job applications count when application is removed
applicationSchema.post('remove', async function () {
    const Job = mongoose.model('Job');
    await Job.findByIdAndUpdate(this.job, {
        $inc: { applicationsCount: -1 }
    });
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;