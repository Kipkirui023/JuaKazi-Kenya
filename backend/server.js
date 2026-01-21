
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const jobRoutes = require('./routes/jobs');
const userRoutes = require('./routes/users');

// Use routes
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'OK',
        message: 'JuaKazi API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime().toFixed(2) + ' seconds'
    });
});

// Welcome endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🎉 Welcome to JuaKazi Kenya API!',
        description: 'Informal Job Search Platform for Kenya',
        endpoints: {
            health: 'GET /health',
            jobs: {
                all: 'GET /api/jobs',
                featured: 'GET /api/jobs/featured',
                single: 'GET /api/jobs/:id',
                categories: 'GET /api/jobs/categories',
                stats: 'GET /api/jobs/stats'
            },
            users: {
                all: 'GET /api/users',
                workers: 'GET /api/users/workers',
                employers: 'GET /api/users/employers',
                single: 'GET /api/users/:id',
                reviews: 'GET /api/users/:id/reviews',
                popularSkills: 'GET /api/users/skills/popular',
                stats: 'GET /api/users/stats'
            },
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login'
            }
        },
        examples: {
            filterJobs: '/api/jobs?location=nairobi&category=plumbing',
            searchWorkers: '/api/users/workers?skills=plumbing&location=nairobi',
            getJobStats: '/api/jobs/stats',
            getUserStats: '/api/users/stats'
        }
    });
});

// Auth endpoints (simplified for demo)
app.post('/api/auth/register', (req, res) => {
    const { name, phone, userType, location, password } = req.body;

    if (!name || !phone || !userType || !location || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required: name, phone, userType, location, password'
        });
    }

    if (!['worker', 'employer'].includes(userType)) {
        return res.status(400).json({
            success: false,
            message: 'userType must be "worker" or "employer"'
        });
    }

    res.json({
        success: true,
        message: 'Registration successful!',
        token: 'jwt_demo_token_' + Date.now(),
        user: {
            id: Date.now(),
            name,
            phone,
            userType,
            location,
            isVerified: false,
            createdAt: new Date().toISOString()
        }
    });
});

app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({
            success: false,
            message: 'Phone and password are required'
        });
    }

    res.json({
        success: true,
        message: 'Login successful!',
        token: 'jwt_demo_token_' + Date.now(),
        user: {
            id: 12345,
            name: 'Demo User',
            phone,
            userType: 'worker',
            location: 'Nairobi',
            rating: 4.5
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
        method: req.method,
        availableRoutes: ['/', '/health', '/api/jobs', '/api/users', '/api/auth/register', '/api/auth/login']
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════╗
║               JuaKazi Kenya Server                   ║
║          Informal Job Search Platform                ║
╚══════════════════════════════════════════════════════╝

🚀 Server started successfully!
⚡ Port: ${PORT}
🌐 Environment: ${ENV}
📅 Time: ${new Date().toLocaleString()}

📊 Core Endpoints:
   🌐 Home:        http://localhost:${PORT}/
   ❤️ Health:      http://localhost:${PORT}/health

💼 Jobs API:
   All jobs:       http://localhost:${PORT}/api/jobs
   Featured:       http://localhost:${PORT}/api/jobs/featured
   Categories:     http://localhost:${PORT}/api/jobs/categories
   Statistics:     http://localhost:${PORT}/api/jobs/stats

👤 Users API:
   All users:      http://localhost:${PORT}/api/users
   Workers:        http://localhost:${PORT}/api/users/workers
   Employers:      http://localhost:${PORT}/api/users/employers
   User stats:     http://localhost:${PORT}/api/users/stats

🔐 Auth:
   Register:       POST http://localhost:${PORT}/api/auth/register
   Login:          POST http://localhost:${PORT}/api/auth/login
`);
});

module.exports = app;