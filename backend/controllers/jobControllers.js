
const Job = require('../models/jobs');
const User = require('../models/user');
const Application = require('../models/application');

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
    try {
        const filters = req.query;

        const jobs = await Job.findByFilters(filters);

        res.json({
            success: true,
            count: jobs.length,
            filters,
            jobs
        });

    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching jobs',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get featured jobs
// @route   GET /api/jobs/featured
// @access  Public
exports.getFeaturedJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ featured: true })
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        console.error('Get featured jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured jobs'
        });
    }
};


// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('employer', 'name phone rating profileImage totalReviews');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Increment views
        job.views += 1;
        await job.save();

        // Get similar jobs
        const similarJobs = await Job.find({
            _id: { $ne: job._id },
            category: job.category,
            status: 'open'
        })
            .limit(3)
            .select('title location salary type skills postedAgo');

        res.json({
            success: true,
            job,
            similarJobs
        });

    } catch (error) {
        console.error('Get job error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching job'
        });
    }
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Employers only)
// @desc    Create a new job
// @route   POST /api/jobs
// @access  Public (temporarily for testing)
exports.createJob = async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            category,
            location,
            salary,
            skills,
            contactPhone,
            contactWhatsApp,
            isUrgent,
            employerName
        } = req.body;

        // Basic validation
        if (!title || !description || !category) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, and category are required'
            });
        }

        // Demo employer (for testing without auth)
        let employerId;
        let employerNameToUse = employerName || 'Demo Employer';

        try {
            const User = require('../models/User');

            let employer = await User.findOne({ phone: '254700000000' });

            if (!employer) {
                employer = await User.create({
                    userType: 'employer',
                    name: 'Demo Employer',
                    phone: '254700000000',
                    password: 'demo123',
                    isVerified: { phone: true },
                    location: { county: 'Nairobi' }
                });
            }

            employerId = employer._id;
            employerNameToUse = employer.name;

        } catch (err) {
            // fallback ObjectId (only for development)
            employerId = '65d4f8a9b4c1e8f9c8a7b6c5';
            console.warn('⚠️ Using fallback employer ID');
        }

        const job = new Job({
            title,
            description,
            type,
            category,
            location: {
                county: location?.county || location || 'Nairobi',
                exactLocation: location?.town || location?.exactLocation || ''
            },
            salary: {
                amount: salary?.amount || salary || 0,
                period: salary?.period || 'day',
                currency: 'KES',
                isNegotiable: salary?.isNegotiable || false
            },
            skills: Array.isArray(skills)
                ? skills
                : skills
                    ? skills.split(',').map(s => s.trim())
                    : [],
            employer: employerId,
            employerName: employerNameToUse,
            employerPhone: contactPhone || '254700000000',
            employerWhatsApp: contactWhatsApp || '',
            isUrgent: Boolean(isUrgent),
            status: 'open',
            featured: false
        });

        await job.save();

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            data: job
        });

    } catch (error) {
        console.error('Create job error:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error creating job'
        });
    }
};


// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Workers only)
exports.applyForJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const { coverMessage } = req.body;
        const workerId = req.user.id;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if job is open
        if (job.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'This job is no longer accepting applications'
            });
        }

        // Check if worker has already applied
        const existingApplication = await Application.findOne({
            job: jobId,
            worker: workerId
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this job'
            });
        }

        // Create application
        const application = new Application({
            job: jobId,
            worker: workerId,
            coverMessage: coverMessage || '',
            status: 'pending'
        });

        await application.save();

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully!',
            application: {
                id: application._id,
                jobId: job._id,
                jobTitle: job.title,
                appliedAt: application.appliedAt,
                status: application.status
            }
        });

    } catch (error) {
        console.error('Apply for job error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error applying for job'
        });
    }
};

// @desc    Get job categories
// @route   GET /api/jobs/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await Job.aggregate([
            { $match: { status: 'open' } },
            {
                $group: {
                    _id: '\$category',
                    count: { $sum: 1 },
                    avgSalary: { $avg: '\$salary.amount' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const formattedCategories = categories.map(cat => ({
            name: cat._id,
            displayName: cat._id.charAt(0).toUpperCase() + cat._id.slice(1),
            count: cat.count,
            avgSalary: Math.round(cat.avgSalary || 0)
        }));

        res.json({
            success: true,
            categories: formattedCategories
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching categories'
        });
    }
};

// @desc    Get job statistics
// @route   GET /api/jobs/stats
// @access  Public
exports.getJobStats = async (req, res) => {
    try {
        const stats = await Job.aggregate([
            { $match: { status: 'open' } },
            {
                $group: {
                    _id: null,
                    totalJobs: { $sum: 1 },
                    totalViews: { $sum: '\$views' },
                    avgSalary: { $avg: '\$salary.amount' },
                    urgentJobs: { $sum: { $cond: [{ $eq: ['\$isUrgent', true] }, 1, 0] } }
                }
            }
        ]);

        const jobsByType = await Job.aggregate([
            { $match: { status: 'open' } },
            {
                $group: {
                    _id: '\$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        const jobsByCategory = await Job.aggregate([
            { $match: { status: 'open' } },
            {
                $group: {
                    _id: '\$category',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            success: true,
            stats: {
                ...stats[0],
                jobsByType: jobsByType.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                topCategories: jobsByCategory
            }
        });

    }
    catch (error) {
        console.error('Get job stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching job statistics'
        });
    }
};
