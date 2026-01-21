// Validation middleware for JuaKazi Kenya API

/**
 * Normalize Kenyan phone number
 */
const normalizePhone = (phone) => {
    if (!phone) return null;
    return phone.toString().replace(/\s+/g, '').replace(/\D/g, '');
};

/**
 * Validate user registration data
 */
const validateRegistration = (req, res, next) => {
    const { userType, name, phone, password, location } = req.body;
    const errors = [];

    // Validate user type
    if (!userType || !['worker', 'employer'].includes(userType)) {
        errors.push('User type must be either "worker" or "employer"');
    }

    // Validate name
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    // Validate phone number (Kenyan formats)
    const normalizedPhone = normalizePhone(phone);
    if (
        !normalizedPhone ||
        !/^(2547|2541|07|01)\d{8}$/.test(normalizedPhone)
    ) {
        errors.push(
            'Please enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)'
        );
    }

    // Validate password
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    // Validate location
    if (!location || typeof location !== 'string') {
        errors.push('Location is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

/**
 * Validate user login data
 */
const validateLogin = (req, res, next) => {
    const { phone, password } = req.body;
    const errors = [];

    if (!phone) {
        errors.push('Phone number is required');
    }

    if (!password) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

/**
 * Validate job posting data
 */
const validateJobPosting = (req, res, next) => {
    const { title, description, salary, location } = req.body;
    const errors = [];

    if (!title || title.trim().length < 5) {
        errors.push('Job title must be at least 5 characters long');
    }

    if (!description || description.trim().length < 20) {
        errors.push('Job description must be at least 20 characters long');
    }

    // Salary safety check (prevents crash)
    if (
        !salary ||
        typeof salary !== 'object' ||
        typeof salary.amount !== 'number' ||
        salary.amount <= 0
    ) {
        errors.push('Salary amount must be a number greater than 0');
    }

    if (!location) {
        errors.push('Location is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateJobPosting
};
