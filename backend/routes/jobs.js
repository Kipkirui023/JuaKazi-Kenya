const express = require('express');
const router = express.Router();

/* ===========================
   SAMPLE JOB DATA
=========================== */
const jobs = [
    {
        id: 1,
        title: 'Plumber Needed Urgently',
        description: 'Need experienced plumber to fix leaking pipes in Westlands area. Must have own tools.',
        type: 'casual',
        category: 'plumbing',
        location: 'Nairobi, Westlands',
        salary: { amount: 2500, currency: 'KES', period: 'day' },
        skills: ['plumbing', 'pipe fitting', 'repairs'],
        employer: 'John Mwangi',
        contactPhone: '254712345678',
        posted: '2024-01-20',
        urgent: true,
        views: 45,
        applications: 3
    },
    {
        id: 2,
        title: 'House Cleaning - Weekly',
        description: 'Looking for reliable cleaner for weekly house cleaning in Nyali. Monday to Friday.',
        type: 'part-time',
        category: 'cleaning',
        location: 'Mombasa, Nyali',
        salary: { amount: 1500, currency: 'KES', period: 'day' },
        skills: ['cleaning', 'housekeeping'],
        employer: 'Sarah Achieng',
        contactPhone: '254723456789',
        posted: '2024-01-19',
        urgent: false,
        views: 32,
        applications: 5
    }
    // (rest unchanged)
];

/* ===========================
   HELPER FUNCTIONS
=========================== */
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

/* ===========================
   PUBLIC ROUTES (STATIC FIRST)
=========================== */

// GET /api/jobs/categories
router.get('/categories', (req, res) => {
    const categories = {};

    jobs.forEach(job => {
        categories[job.category] = (categories[job.category] || 0) + 1;
    });

    res.json({
        success: true,
        categories: Object.entries(categories).map(([name, count]) => ({
            name,
            count,
            displayName: name.charAt(0).toUpperCase() + name.slice(1)
        }))
    });
});

// GET /api/jobs/stats
router.get('/stats', (req, res) => {
    const totalJobs = jobs.length;

    res.json({
        success: true,
        stats: {
            totalJobs,
            totalViews: jobs.reduce((s, j) => s + (j.views || 0), 0),
            totalApplications: jobs.reduce((s, j) => s + (j.applications || 0), 0),
            urgentJobs: jobs.filter(j => j.urgent).length
        }
    });
});

// GET /api/jobs/featured
router.get('/featured', (req, res) => {
    const featured = jobs.filter(j => j.urgent).slice(0, 3);

    res.json({
        success: true,
        jobs: featured.map(j => ({
            ...j,
            postedAgo: timeAgo(j.posted),
            formattedSalary: `KSh ${j.salary.amount.toLocaleString()} per ${j.salary.period}`
        }))
    });
});

/* ===========================
   DYNAMIC ROUTES
=========================== */

// GET /api/jobs
router.get('/', (req, res) => {
    res.json({
        success: true,
        count: jobs.length,
        jobs: jobs.map(job => ({
            ...job,
            postedAgo: timeAgo(job.posted),
            formattedSalary: `KSh ${job.salary.amount.toLocaleString()} per ${job.salary.period}`
        }))
    });
});

// GET /api/jobs/:id
router.get('/:id', (req, res) => {
    const job = jobs.find(j => j.id === Number(req.params.id));

    if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job.views = (job.views || 0) + 1;

    res.json({
        success: true,
        job: {
            ...job,
            postedAgo: timeAgo(job.posted),
            formattedSalary: `KSh ${job.salary.amount.toLocaleString()} per ${job.salary.period}`
        }
    });
});

// POST /api/jobs
router.post('/', (req, res) => {
    const { title, description, type, category, location, salary, contactPhone } = req.body;

    if (!title || !description || !type || !category || !location || !salary || !contactPhone) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newJob = {
        id: jobs.length ? Math.max(...jobs.map(j => j.id)) + 1 : 1,
        ...req.body,
        posted: new Date().toISOString().split('T')[0],
        views: 0,
        applications: 0,
        urgent: false
    };

    jobs.push(newJob);

    res.status(201).json({
        success: true,
        message: 'Job posted successfully',
        job: newJob
    });
});

// POST /api/jobs/:id/apply
router.post('/:id/apply', (req, res) => {
    const job = jobs.find(j => j.id === Number(req.params.id));

    if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job.applications = (job.applications || 0) + 1;

    res.json({
        success: true,
        message: 'Application submitted successfully'
    });
});

module.exports = router;
