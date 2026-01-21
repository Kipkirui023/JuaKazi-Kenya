
const express = require('express');
const router = express.Router();

// Sample users data (workers and employers)
const users = [
    // Workers
    {
        id: 1,
        userType: 'worker',
        name: 'John Kamau',
        phone: '254712345678',
        email: 'john.kamau@example.com',
        location: 'Nairobi',
        skills: ['plumbing', 'pipe fitting', 'repairs'],
        experience: 5,
        experienceDescription: '5 years of plumbing experience in residential and commercial buildings',
        availability: 'available',
        availabilityType: 'full-time',
        rating: 4.7,
        totalReviews: 23,
        profileImage: 'https://example.com/avatars/john.jpg',
        bio: 'Experienced plumber with 5 years of experience. Specialized in pipe fitting and repairs.',
        portfolio: [
            'https://example.com/portfolio/john1.jpg',
            'https://example.com/portfolio/john2.jpg'
        ],
        isVerified: {
            phone: true,
            id: true,
            email: true
        },
        createdAt: '2023-06-15'
    },
    {
        id: 2,
        userType: 'worker',
        name: 'Mary Wanjiku',
        phone: '254723456789',
        email: 'mary.w@example.com',
        location: 'Mombasa',
        skills: ['cleaning', 'housekeeping', 'cooking'],
        experience: 3,
        experienceDescription: '3 years of house cleaning and cooking experience',
        availability: 'available',
        availabilityType: 'part-time',
        rating: 4.5,
        totalReviews: 18,
        profileImage: 'https://example.com/avatars/mary.jpg',
        bio: 'Reliable house cleaner with excellent references. Available for weekly cleaning.',
        portfolio: [],
        isVerified: {
            phone: true,
            id: true,
            email: false
        },
        createdAt: '2023-08-20'
    },
    {
        id: 3,
        userType: 'worker',
        name: 'David Ochieng',
        phone: '254734567890',
        email: 'david.o@example.com',
        location: 'Kisumu',
        skills: ['electrical', 'wiring', 'installation'],
        experience: 7,
        experienceDescription: 'Certified electrician with 7 years of experience',
        availability: 'busy',
        availabilityType: 'full-time',
        rating: 4.9,
        totalReviews: 45,
        profileImage: 'https://example.com/avatars/david.jpg',
        bio: 'Certified electrician specializing in house wiring and electrical installations.',
        portfolio: [
            'https://example.com/portfolio/david1.jpg'
        ],
        isVerified: {
            phone: true,
            id: true,
            email: true
        },
        createdAt: '2023-03-10'
    },
    {
        id: 4,
        userType: 'worker',
        name: 'Peter Maina',
        phone: '254745678901',
        email: 'peter.m@example.com',
        location: 'Nakuru',
        skills: ['motorcycle', 'delivery', 'transport'],
        experience: 4,
        experienceDescription: '4 years of delivery experience',
        availability: 'available',
        availabilityType: 'casual',
        rating: 4.3,
        totalReviews: 12,
        profileImage: 'https://example.com/avatars/peter.jpg',
        bio: 'Boda boda rider with clean driving record. Available for deliveries.',
        portfolio: [],
        isVerified: {
            phone: true,
            id: true,
            email: false
        },
        createdAt: '2023-10-05'
    },

    // Employers
    {
        id: 5,
        userType: 'employer',
        name: 'Jane Muthoni',
        phone: '254756789012',
        email: 'jane.m@example.com',
        location: 'Nairobi',
        companyName: 'Muthoni Enterprises',
        companySize: 'Small',
        industry: 'Property Management',
        rating: 4.8,
        totalReviews: 34,
        profileImage: 'https://example.com/avatars/jane.jpg',
        bio: 'Property manager looking for reliable workers for various projects.',
        isVerified: {
            phone: true,
            id: true,
            email: true
        },
        createdAt: '2023-05-12'
    },
    {
        id: 6,
        userType: 'employer',
        name: 'Robert Kimani',
        phone: '254767890123',
        email: 'robert.k@example.com',
        location: 'Mombasa',
        companyName: 'Kimani Construction',
        companySize: 'Medium',
        industry: 'Construction',
        rating: 4.6,
        totalReviews: 28,
        profileImage: 'https://example.com/avatars/robert.jpg',
        bio: 'Construction company hiring skilled workers for various projects.',
        isVerified: {
            phone: true,
            id: true,
            email: true
        },
        createdAt: '2023-07-18'
    }
];

// Helper function to format user response (remove sensitive data)
function formatUser(user) {
    const formatted = { ...user };
    // Remove sensitive information
    delete formatted.email; // In real app, only show to authorized users
    return formatted;
}

// @route   GET /api/users
// @desc    Get all users with optional filtering
// @access  Public (in real app, would be restricted)
router.get('/', (req, res) => {
    try {
        const { userType, location, skills, minRating, search } = req.query;

        let filteredUsers = [...users];

        // Filter by user type
        if (userType) {
            filteredUsers = filteredUsers.filter(user =>
                user.userType === userType.toLowerCase()
            );
        }

        // Filter by location
        if (location) {
            filteredUsers = filteredUsers.filter(user =>
                user.location.toLowerCase().includes(location.toLowerCase())
            );
        }

        // Filter by skills (for workers)
        if (skills && userType === 'worker') {
            const requiredSkills = skills.split(',').map(s => s.trim().toLowerCase());
            filteredUsers = filteredUsers.filter(user =>
                requiredSkills.every(skill =>
                    user.skills.map(s => s.toLowerCase()).includes(skill)
                )
            );
        }

        // Filter by minimum rating
        if (minRating) {
            filteredUsers = filteredUsers.filter(user =>
                user.rating >= parseFloat(minRating)
            );
        }

        // Search by name
        if (search) {
            const searchLower = search.toLowerCase();
            filteredUsers = filteredUsers.filter(user =>
                user.name.toLowerCase().includes(searchLower)
            );
        }

        // Format users (remove sensitive data)
        const formattedUsers = filteredUsers.map(formatUser);

        res.json({
            success: true,
            count: formattedUsers.length,
            total: users.length,
            filters: req.query,
            users: formattedUsers
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching users',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// @route   GET /api/users/workers
// @desc    Get all workers
// @access  Public
router.get('/workers', (req, res) => {
    try {
        const workers = users.filter(user => user.userType === 'worker');
        const formattedWorkers = workers.map(formatUser);

        res.json({
            success: true,
            count: formattedWorkers.length,
            workers: formattedWorkers
        });

    } catch (error) {
        console.error('Error fetching workers:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching workers'
        });
    }
});

// @route   GET /api/users/employers
// @desc    Get all employers
// @access  Public
router.get('/employers', (req, res) => {
    try {
        const employers = users.filter(user => user.userType === 'employer');
        const formattedEmployers = employers.map(formatUser);

        res.json({
            success: true,
            count: formattedEmployers.length,
            employers: formattedEmployers
        });

    } catch (error) {
        console.error('Error fetching employers:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching employers'
        });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's reviews (in real app, from database)
        const reviews = [
            {
                id: 1,
                reviewerName: 'Jane Muthoni',
                rating: 5,
                comment: 'Excellent work! Very professional and timely.',
                date: '2024-01-15',
                jobTitle: 'Plumbing Repair'
            },
            {
                id: 2,
                reviewerName: 'Robert Kimani',
                rating: 4,
                comment: 'Good quality work, would hire again.',
                date: '2024-01-10',
                jobTitle: 'Electrical Installation'
            }
        ].slice(0, user.totalReviews);

        const formattedUser = formatUser(user);

        res.json({
            success: true,
            user: formattedUser,
            reviews: user.userType === 'worker' ? reviews : [],
            stats: {
                totalJobsCompleted: user.totalReviews * 3, // Demo calculation
                responseRate: '95%',
                averageResponseTime: '2 hours'
            }
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user'
        });
    }
});

// @route   GET /api/users/:id/reviews
// @desc    Get user reviews
// @access  Public
router.get('/:id/reviews', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Sample reviews (in real app, from database)
        const reviews = [
            {
                id: 1,
                reviewerId: 5,
                reviewerName: 'Jane Muthoni',
                reviewerType: 'employer',
                rating: 5,
                comment: 'Excellent work! Completed the plumbing job ahead of schedule.',
                date: '2024-01-15',
                jobTitle: 'Kitchen Plumbing Repair',
                wouldRecommend: true
            },
            {
                id: 2,
                reviewerId: 6,
                reviewerName: 'Robert Kimani',
                reviewerType: 'employer',
                rating: 4,
                comment: 'Good quality electrical work. Minor delay but overall satisfied.',
                date: '2024-01-10',
                jobTitle: 'House Wiring',
                wouldRecommend: true
            },
            {
                id: 3,
                reviewerId: 5,
                reviewerName: 'Jane Muthoni',
                reviewerType: 'employer',
                rating: 5,
                comment: 'Fixed our leaking pipes perfectly. Very professional!',
                date: '2023-12-20',
                jobTitle: 'Pipe Repair',
                wouldRecommend: true
            }
        ].slice(0, user.totalReviews);

        // Calculate average rating from reviews
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : user.rating;

        res.json({
            success: true,
            userId,
            userName: user.name,
            averageRating: avgRating.toFixed(1),
            totalReviews: reviews.length,
            reviews
        });

    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user reviews'
        });
    }
});

// @route   POST /api/users/:id/reviews
// @desc    Add review for user
// @access  Private
router.post('/:id/reviews', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { reviewerId, rating, comment, jobId } = req.body;

        if (!reviewerId || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Valid reviewerId and rating (1-5) are required'
            });
        }

        // In real app, save to database
        const newReview = {
            id: Date.now(),
            reviewerId,
            rating,
            comment: comment || '',
            jobId: jobId || null,
            date: new Date().toISOString().split('T')[0]
        };

        // Update user's rating (in real app, calculate from all reviews)
        user.totalReviews = (user.totalReviews || 0) + 1;

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            review: newReview
        });

    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({
            success: false,
            message: 'Server error adding review'
        });
    }
});

// @route   GET /api/users/skills/popular
// @desc    Get popular skills among workers
// @access  Public
router.get('/skills/popular', (req, res) => {
    try {
        const workers = users.filter(user => user.userType === 'worker');

        // Count skills frequency
        const skillCounts = {};
        workers.forEach(worker => {
            if (worker.skills) {
                worker.skills.forEach(skill => {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                });
            }
        });

        // Convert to array and sort by count
        const popularSkills = Object.entries(skillCounts)
            .map(([skill, count]) => ({ skill, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10 skills

        res.json({
            success: true,
            totalWorkers: workers.length,
            popularSkills
        });

    } catch (error) {
        console.error('Error fetching popular skills:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching popular skills'
        });
    }
});

// @route   PUT /api/users/:id/profile
// @desc    Update user profile
// @access  Private
router.put('/:id/profile', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updates = req.body;

        // In real app, validate and update in database
        // For demo, simulate update
        const updatedUser = {
            ...user,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: formatUser(updatedUser)
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Public
router.get('/stats', (req, res) => {
    try {
        const totalUsers = users.length;
        const workers = users.filter(u => u.userType === 'worker');
        const employers = users.filter(u => u.userType === 'employer');

        // Workers by location
        const workersByLocation = {};
        workers.forEach(worker => {
            workersByLocation[worker.location] = (workersByLocation[worker.location] || 0) + 1;
        });

        // Average rating
        const avgWorkerRating = workers.length > 0
            ? workers.reduce((sum, worker) => sum + worker.rating, 0) / workers.length
            : 0;

        const avgEmployerRating = employers.length > 0
            ? employers.reduce((sum, employer) => sum + employer.rating, 0) / employers.length
            : 0;

        // Verified users
        const verifiedWorkers = workers.filter(w => w.isVerified.phone && w.isVerified.id).length;
        const verifiedEmployers = employers.filter(e => e.isVerified.phone && e.isVerified.id).length;

        res.json({
            success: true,
            stats: {
                totalUsers,
                workers: workers.length,
                employers: employers.length,
                workersByLocation: Object.entries(workersByLocation).map(([location, count]) => ({
                    location,
                    count
                })),
                averageRatings: {
                    workers: avgWorkerRating.toFixed(1),
                    employers: avgEmployerRating.toFixed(1)
                },
                verifiedUsers: {
                    workers: verifiedWorkers,
                    employers: verifiedEmployers,
                    total: verifiedWorkers + verifiedEmployers
                },
                topSkills: ['plumbing', 'cleaning', 'electrical', 'delivery', 'construction']
            }
        });

    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user stats'
        });
    }
});

module.exports = router;
