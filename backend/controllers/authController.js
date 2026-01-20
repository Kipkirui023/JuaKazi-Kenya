const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendSMS } = require('../services/smsService');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || 'juakazi_secret_key',
        { expiresIn: '30d' }
    );
};

// Generate verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { phone, email, userType, name, location, skills, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ phone });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this phone number'
            });
        }

        // Check if email exists (if provided)
        if (email) {
            const emailUser = await User.findOne({ email });
            if (emailUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this email'
                });
            }
        }

        // Create verification code
        const verificationCode = generateVerificationCode();
        const verificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Create new user
        user = new User({
            userType,
            name,
            phone,
            email,
            location: {
                county: location
            },
            skills: skills || [],
            password,
            verificationCode,
            verificationExpires
        });

        await user.save();

        // Send verification SMS
        if (process.env.NODE_ENV === 'production') {
            await sendSMS(
                phone,
                `Your JuaKazi verification code is: ${verificationCode}. Valid for 10 minutes.`
            );
        } else {
            console.log(`Verification code for ${phone}: ${verificationCode}`);
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please verify your phone number.',
            token,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                userType: user.userType,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Find user by phone
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.active) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                userType: user.userType,
                location: user.location,
                skills: user.skills,
                rating: user.rating,
                profileImage: user.profileImage,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};

// @desc    Verify phone number with OTP
// @route   POST /api/auth/verify-phone
// @access  Private
exports.verifyPhone = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already verified
        if (user.isVerified.phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is already verified'
            });
        }

        // Check if code matches and is not expired
        if (user.verificationCode !== code) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        if (user.verificationExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired'
            });
        }

        // Update verification status
        user.isVerified.phone = true;
        user.verificationCode = undefined;
        user.verificationExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Phone number verified successfully'
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during verification',
            error: error.message
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -verificationCode -verificationExpires');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const updates = req.body;
        const userId = req.user.id;

        // Remove restricted fields
        delete updates.password;
        delete updates.phone;
        delete updates.isVerified;
        delete updates.verificationCode;
        delete updates.verificationExpires;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates, updatedAt: Date.now() },
            { new: true, runValidators: true }
        ).select('-password -verificationCode -verificationExpires');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update',
            error: error.message
        });
    }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { phone } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with this phone number'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = Date.now() + 3600000; // 1 hour

        // In production, you would save this to the database
        // For now, we'll just send a demo code
        const resetCode = generateVerificationCode();

        // Send reset SMS
        if (process.env.NODE_ENV === 'production') {
            await sendSMS(
                phone,
                `Your JuaKazi password reset code is: ${resetCode}. Valid for 1 hour.`
            );
        } else {
            console.log(`Reset code for ${phone}: ${resetCode}`);
        }

        res.json({
            success: true,
            message: 'Password reset code sent to your phone'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { phone, code, newPassword } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // In a real implementation, you would verify the reset token
        // For now, we'll just update the password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-verification
// @access  Private
exports.resendVerification = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isVerified.phone) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is already verified'
            });
        }

        // Generate new verification code
        const verificationCode = generateVerificationCode();
        const verificationExpires = Date.now() + 10 * 60 * 1000;

        user.verificationCode = verificationCode;
        user.verificationExpires = verificationExpires;
        await user.save();

        // Send verification SMS
        if (process.env.NODE_ENV === 'production') {
            await sendSMS(
                user.phone,
                `Your JuaKazi verification code is: ${verificationCode}. Valid for 10 minutes.`
            );
        } else {
            console.log(`New verification code for ${user.phone}: ${verificationCode}`);
        }

        res.json({
            success: true,
            message: 'Verification code resent successfully'
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};