const express = require('express');
const router = express.Router();
const Job = require('../models/jobs');

const {
    getJobs,
    getFeaturedJobs,
    getJobById,
    createJob,
    applyForJob,
    getCategories,
    getJobStats
} = require('../controllers/jobControllers');

const { auth, authorize } = require('../middleware/auth');
const { validateJobPosting } = require('../middleware/validation');

// Public routes
router.get('/', getJobs);
router.get('/featured', getFeaturedJobs);
router.get('/categories', getCategories);
router.get('/stats', getJobStats);
router.get('/:id', getJobById);

// Protected routes
router.post(
    '/',
    auth,
    authorize('employer'),
    validateJobPosting,
    createJob
);

router.post(
    '/:id/apply',
    auth,
    authorize('worker'),
    applyForJob
);

module.exports = router;
