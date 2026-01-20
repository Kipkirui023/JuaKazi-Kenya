const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegistration, authController.register);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validateLogin, authController.login);

// @route   POST /api/auth/verify-phone
// @desc    Verify phone number with OTP
// @access  Private
router.post('/verify-phone', authController.verifyPhone);

// @route   POST /api/auth/resend-verification
// @desc    Resend verification code
// @access  Private
router.post('/resend-verification', authController.resendVerification);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', authController.forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', authController.resetPassword);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authController.getCurrentUser);

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', authController.updateProfile);

module.exports = router;