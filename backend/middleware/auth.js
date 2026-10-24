const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 1. Check HTTP-only cookie first
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } 
    // 2. Check Authorization header with Bearer token as fallback
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database (excluding password hash)
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'User no longer exists' });
            }

            return next();
        } catch (error) {
            console.error('Authorization Error:', error.message);
            return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
        }
    }

    return res.status(401).json({ success: false, message: 'Not authorized, please log in' });
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized, please log in' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Forbidden: Access restricted to ${roles.join(' or ')} accounts only. Your role is '${req.user.role}'.` 
            });
        }
        next();
    };
};

// Email verification enforcement middleware
const requireVerifiedEmail = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, please log in' });
    }
    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            success: false,
            requiresVerification: true,
            message: 'Email verification required. Please verify your email address to access this workspace.'
        });
    }
    next();
};

// Optional auth middleware (identifies user if token is provided, doesn't reject if not)
const optionalAuth = async (req, res, next) => {
    let token;
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Token invalid or expired - proceed as unauthenticated guest
        }
    }
    next();
};

module.exports = { protect, authorize, requireVerifiedEmail, optionalAuth };
   
