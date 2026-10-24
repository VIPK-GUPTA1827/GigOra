const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const EmailLog = require('../models/EmailLog');
const { protect, authorize, requireVerifiedEmail, optionalAuth } = require('../middleware/auth');
const { getTransporter } = require('../utils/mailer');
const { validatePassword } = require('../utils/passwordValidator');
const { OAuth2Client } = require('google-auth-library');
const rateLimit = require('express-rate-limit');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

// Rate limiter for auth endpoints: login & password reset
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'test-rate-limit' ? 3 : 20,
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.'
    }
});

// Dedicated rate-limit verification route tester
const testRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    message: {
        success: false,
        message: 'Rate limit exceeded: Too many requests. Please wait before retrying.'
    }
});

router.get('/rate-limit-test', testRateLimiter, (req, res) => {
    res.json({ success: true, message: 'Rate limit check passed' });
});


// Helper function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Token valid for 30 days
    });
};

// Cookie options for secure session management
const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
});

// Sender email helper compatible with Brevo / custom SMTP
const getSenderEmail = () => {
    if (process.env.SMTP_FROM) {
        return process.env.SMTP_FROM;
    }
    if (process.env.SMTP_USER) {
        return `"GigOra" <${process.env.SMTP_USER}>`;
    }
    return '"GigOra" <no-reply@gigora.dev>';
};

// Safe, standardized user object formatter across all auth responses
const formatUserResponse = (user) => {
    if (!user) return null;
    return {
        _id: user._id,
        name: user.name || user.username || '',
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'freelancer',
        avatar: user.avatar || '',
        headline: user.headline || '',
        bio: user.bio || '',
        skills: user.skills || [],
        hourlyRate: user.hourlyRate || 0,
        experienceLevel: user.experienceLevel || 'Intermediate',
        preferredCategories: user.preferredCategories || [],
        workPreference: user.workPreference || 'remote',
        location: user.location || { city: 'Mumbai', state: 'Maharashtra' },
        portfolio: user.portfolio || [],
        socialLinks: user.socialLinks || { github: '', linkedin: '', website: '', twitter: '' },
        languages: user.languages || [],
        weeklyCapacity: user.weeklyCapacity || '30+ hrs/week',
        experience: user.experience || [],
        certifications: user.certifications || [],
        companyName: user.companyName || '',
        companyLogo: user.companyLogo || '',
        companyWebsite: user.companyWebsite || '',
        companySize: user.companySize || '1-10',
        companyDescription: user.companyDescription || '',
        industry: user.industry || 'Software & Technology',
        isProfileComplete: Boolean(user.isProfileComplete),
        hasSkippedOnboarding: Boolean(user.hasSkippedOnboarding),
        isEmailVerified: Boolean(user.isEmailVerified),
        verificationBadge: Boolean(user.verificationBadge),
        walletBalance: user.walletBalance || 0,
        rating: user.rating || 0,
        reviewCount: user.reviewCount || 0
    };
};

// @desc    Register a new user (Unified Signup: Client or Freelancer)
// @route   POST /api/auth/register (or /signup)
// @access  Public
router.post('/register', authLimiter, async (req, res) => {
    try {
        const { name, username, email, password, role } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const pwdValidation = validatePassword(password);
        if (!pwdValidation.valid) {
            return res.status(400).json({ success: false, message: pwdValidation.message });
        }

        const assignedRole = role === 'client' ? 'client' : 'freelancer';
        const displayName = name || username || email.split('@')[0];
        let displayUsername = (username || displayName.toLowerCase().replace(/[^a-z0-9_]/g, '_')).trim();

        // Check if user email already exists
        const userExists = await User.findOne({ email: email.toLowerCase().trim() });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'An account already exists with this email address' });
        }

        // Check if username already exists
        const usernameExists = await User.findOne({ username: displayUsername });
        if (usernameExists) {
            if (username) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Username "${username}" is already taken. Please choose another username.` 
                });
            } else {
                displayUsername = `${displayUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
            }
        }

        // Generate raw verification token, hash for DB, and 24h expiry
        const rawVerificationToken = crypto.randomBytes(32).toString('hex');
        const hashedVerificationToken = crypto
            .createHash('sha256')
            .update(rawVerificationToken)
            .digest('hex');
        const verificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Create user in unverified state
        const user = await User.create({
            name: displayName,
            username: displayUsername,
            email: email.toLowerCase().trim(),
            password,
            role: assignedRole,
            isEmailVerified: false,
            emailVerificationToken: hashedVerificationToken,
            emailVerificationExpire: verificationExpire
        });

        // Generate token and attach secure HTTP-only cookie
        const token = generateToken(user._id);
        res.cookie('token', token, getCookieOptions());

        // Send verification email via Nodemailer
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const verifyUrl = `${clientUrl}/verify-email/${rawVerificationToken}`;
        let etherealUrl = null;

        try {
            const transporter = await getTransporter();
            if (transporter) {
                const info = await transporter.sendMail({
                    from: getSenderEmail(),
                    to: user.email,
                    subject: 'Verify your email address - GigOra',
                    text: `Welcome to GigOra! Please verify your email by opening: ${verifyUrl}`,
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #FAF8F5;">
                            <div style="display: flex; align-items: center; margin-bottom: 24px;">
                                <div style="background-color: #030B3D; color: white; width: 36px; height: 36px; border-radius: 8px; font-weight: 900; font-size: 18px; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 36px;">G</div>
                                <span style="margin-left: 10px; font-size: 20px; font-weight: 800; color: #030B3D;">GigOra</span>
                            </div>
                            <h2 style="color: #030B3D; margin-top: 0; font-size: 22px;">Confirm your email address</h2>
                            <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hi ${displayName}, thanks for signing up for GigOra. Please verify your email to activate your account and start collaborating:</p>
                            <div style="margin: 28px 0;">
                                <a href="${verifyUrl}" style="background-color: #593CFF; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Verify Email Address</a>
                            </div>
                            <p style="color: #64748B; font-size: 12px; line-height: 1.5;">This link will expire in 24 hours.<br />Or copy and paste this link in your browser: <a href="${verifyUrl}" style="color: #593CFF;">${verifyUrl}</a></p>
                        </div>
                    `
                });

                etherealUrl = nodemailer.getTestMessageUrl(info);
                await EmailLog.create({
                    recipient: user.email.toLowerCase(),
                    userId: user._id,
                    subject: 'Verify your email address - GigOra',
                    type: 'verification',
                    status: 'sent',
                    messageId: info.messageId || ''
                });

                console.log('----------------------------------------------------');
                console.log('✉️ VERIFICATION EMAIL SENT TO:', user.email);
                if (etherealUrl) {
                    console.log('🔗 ETHEREAL INBOX PREVIEW:', etherealUrl);
                }
                console.log('----------------------------------------------------');
            }
        } catch (mailErr) {
            console.error('Mail dispatch error:', mailErr.message);
            try {
                await EmailLog.create({
                    recipient: user.email.toLowerCase(),
                    userId: user._id,
                    subject: 'Verify your email address - GigOra',
                    type: 'verification',
                    status: 'failed',
                    error: mailErr.message
                });
            } catch (e) {}
        }

        return res.status(201).json({
            success: true,
            message: 'Registration successful! Verification email sent.',
            token,
            etherealUrl,
            user: formatUserResponse(user)
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'Field';
            return res.status(400).json({ 
                success: false, 
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already in use. Please use a different value.` 
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

// Alias for /register
router.post('/signup', async (req, res, next) => {
    req.url = '/register';
    router.handle(req, res, next);
});

// @desc    Authenticate user & get token (Unified Login)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide both email and password' });
        }

        // Find user by lowercase email
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (user.isSuspended) {
            return res.status(403).json({ success: false, message: 'Your account has been suspended by the administrator.' });
        }

        if (!user.password) {
            return res.status(401).json({ 
                success: false, 
                message: 'This account was created with Google Sign-In. Please sign in with Google.' 
            });
        }

        // Check password match
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Generate token and attach secure HTTP-only cookie
        const token = generateToken(user._id);
        res.cookie('token', token, getCookieOptions());

        return res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: formatUserResponse(user)
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Authenticate with Google OAuth ID token (Login or Register)
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
    try {
        const { credential, role, isSignup } = req.body;

        if (!credential) {
            return res.status(400).json({ success: false, message: 'Google credential token is required' });
        }

        // Verify ID Token with Google
        let ticket;
        try {
            ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });
        } catch (verifyError) {
            console.error('Google token verification failed:', verifyError.message);
            return res.status(401).json({ success: false, message: 'Invalid or expired Google credential token' });
        }

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ success: false, message: 'Could not retrieve email from Google account' });
        }

        const email = payload.email.toLowerCase().trim();
        const googleId = payload.sub;
        const name = payload.name || email.split('@')[0];
        const avatar = payload.picture || '';

        // Check if user already exists by email or googleId
        let user = await User.findOne({ 
            $or: [{ email }, { googleId }] 
        });

        if (user) {
            // Existing user: Link googleId & verify email if not yet linked
            let updated = false;

            // If user explicitly registered with a selected role from the Signup page, update their role
            if (isSignup && role && (role === 'client' || role === 'freelancer') && user.role !== role) {
                user.role = role;
                updated = true;
            }

            if (!user.googleId) {
                user.googleId = googleId;
                updated = true;
            }
            if (!user.isEmailVerified) {
                user.isEmailVerified = true;
                updated = true;
            }
            if (!user.avatar && avatar) {
                user.avatar = avatar;
                updated = true;
            }
            if (updated) {
                await user.save();
            }
        } else {
            // New user: Create account
            const assignedRole = role === 'client' ? 'client' : 'freelancer';
            const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_');
            const displayUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

            user = await User.create({
                name,
                username: displayUsername,
                email,
                googleId,
                authProvider: 'google',
                avatar,
                role: assignedRole,
                isEmailVerified: true
            });
        }

        // Generate token and attach secure HTTP-only cookie
        const token = generateToken(user._id);
        res.cookie('token', token, getCookieOptions());

        return res.json({
            success: true,
            message: 'Google login successful!',
            token,
            user: formatUserResponse(user)
        });
    } catch (error) {
        console.error('Google OAuth error:', error.message);
        res.status(500).json({ success: false, message: 'Server error during Google authentication' });
    }
});

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
    try {
        const rawToken = req.params.token;
        const hashedToken = crypto
            .createHash('sha256')
            .update(rawToken)
            .digest('hex');

        // Find user by hashed token and verify expiry is still valid
        const user = await User.findOne({ 
            emailVerificationToken: hashedToken,
            emailVerificationExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired verification link. Please request a new one.' 
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        // Issue fresh session cookie on successful verification
        const token = generateToken(user._id);
        res.cookie('token', token, getCookieOptions());

        res.status(200).json({ 
            success: true, 
            message: 'Email verified successfully! Your account is now active.',
            token,
            user: formatUserResponse(user)
        });
    } catch (error) {
        console.error('Email verification error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Resend email verification link
// @route   POST /api/auth/resend-verification
// @access  Public
router.post('/resend-verification', authLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide your email address' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists for this email, a verification link has been sent.'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'This email is already verified. You can sign in directly.' });
        }

        // Generate new raw token, hash, and 24h expiry
        const rawVerificationToken = crypto.randomBytes(32).toString('hex');
        const hashedVerificationToken = crypto
            .createHash('sha256')
            .update(rawVerificationToken)
            .digest('hex');
        const verificationExpire = Date.now() + 24 * 60 * 60 * 1000;

        user.emailVerificationToken = hashedVerificationToken;
        user.emailVerificationExpire = verificationExpire;
        await user.save();

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const verifyUrl = `${clientUrl}/verify-email/${rawVerificationToken}`;
        let etherealUrl = null;

        const transporter = await getTransporter();
        if (!transporter) {
            await EmailLog.create({
                recipient: user.email.toLowerCase(),
                userId: user._id,
                subject: 'New Verification Link - GigOra',
                type: 'verification',
                status: 'failed',
                error: 'Email delivery service is currently offline'
            });
            return res.status(503).json({
                success: false,
                message: 'Email delivery service is currently offline. Please try again later.'
            });
        }

        try {
            const info = await transporter.sendMail({
                from: getSenderEmail(),
                to: user.email,
                subject: 'New Verification Link - GigOra',
                text: `Please verify your email address: ${verifyUrl}`,
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #FAF8F5;">
                        <h2 style="color: #030B3D; margin-top: 0;">New verification link requested</h2>
                        <p style="color: #475569; font-size: 14px;">Click the button below to verify your email address:</p>
                        <div style="margin: 24px 0;">
                            <a href="${verifyUrl}" style="background-color: #593CFF; color: white; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Verify Email Address</a>
                        </div>
                        <p style="color: #64748B; font-size: 12px;">This link will expire in 24 hours.</p>
                    </div>
                `
            });
            etherealUrl = nodemailer.getTestMessageUrl(info);

            await EmailLog.create({
                recipient: user.email.toLowerCase(),
                userId: user._id,
                subject: 'New Verification Link - GigOra',
                type: 'verification',
                status: 'sent',
                messageId: info.messageId || ''
            });

            console.log('----------------------------------------------------');
            console.log('✉️ RESENT VERIFICATION EMAIL TO:', user.email);
            if (etherealUrl) console.log('🔗 ETHEREAL INBOX PREVIEW:', etherealUrl);
            console.log('----------------------------------------------------');

            return res.json({
                success: true,
                message: 'If an account exists for this email, a verification link has been sent.',
                etherealUrl
            });
        } catch (sendErr) {
            await EmailLog.create({
                recipient: user.email.toLowerCase(),
                userId: user._id,
                subject: 'New Verification Link - GigOra',
                type: 'verification',
                status: 'failed',
                error: sendErr.message
            });
            return res.status(502).json({
                success: false,
                message: `Failed to deliver verification email: ${sendErr.message}`
            });
        }
    } catch (error) {
        console.error('Resend verification error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', authLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide an email address' 
            });
        }

        const genericMessage = 'If an account exists with this email address, a password reset link has been sent. Please check your inbox.';
        const isSmtpConfigured = Boolean(
            process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
        );
        const developmentMailMode = process.env.NODE_ENV !== 'production'
            ? { mailMode: isSmtpConfigured ? 'smtp' : 'ethereal' }
            : {};

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        
        // Security: Return same generic 200 response whether email exists or not to prevent user enumeration
        if (!user) {
            return res.status(200).json({ 
                success: true, 
                message: genericMessage,
                ...developmentMailMode
            });
        }

        // Generate raw 32-byte crypto token and store SHA-256 hash in DB
        const rawResetToken = crypto.randomBytes(32).toString('hex');
        const hashedResetToken = crypto
            .createHash('sha256')
            .update(rawResetToken)
            .digest('hex');

        // Link valid for 30 minutes
        const resetExpire = Date.now() + 30 * 60 * 1000;

        user.resetPasswordToken = hashedResetToken;
        user.resetPasswordExpire = resetExpire;
        await user.save({ validateBeforeSave: false });

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const resetUrl = `${clientUrl}/reset-password/${rawResetToken}`;
        let etherealUrl = null;

        const transporter = await getTransporter();
        if (transporter) {
            const info = await transporter.sendMail({
                from: getSenderEmail(),
                to: user.email,
                subject: 'Reset your password - GigOra',
                text: `You requested a password reset for your GigOra account. Click the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 30 minutes. If you did not request this, you can safely ignore this email.`,
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #FAF8F5;">
                        <div style="display: flex; align-items: center; margin-bottom: 24px;">
                            <div style="background-color: #030B3D; color: white; width: 36px; height: 36px; border-radius: 8px; font-weight: 900; font-size: 18px; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 36px;">G</div>
                            <span style="margin-left: 10px; font-size: 20px; font-weight: 800; color: #030B3D;">GigOra</span>
                        </div>
                        <h2 style="color: #030B3D; margin-top: 0; font-size: 22px;">Reset your password</h2>
                        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hi ${user.name || user.username}, we received a request to reset your password. Click the button below to choose a new password:</p>
                        <div style="margin: 28px 0;">
                            <a href="${resetUrl}" style="background-color: #593CFF; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Reset Password</a>
                        </div>
                        <p style="color: #64748B; font-size: 12px; line-height: 1.5;">This link will expire in <strong>30 minutes</strong>.<br />If you did not request a password reset, you can safely ignore this message.<br /><br />Or copy and paste this link in your browser: <a href="${resetUrl}" style="color: #593CFF;">${resetUrl}</a></p>
                    </div>
                `
            });
            etherealUrl = nodemailer.getTestMessageUrl(info);
            console.log('----------------------------------------------------');
            console.log('🔑 PASSWORD RESET EMAIL SENT TO:', user.email);
            if (etherealUrl) console.log('🔗 ETHEREAL INBOX PREVIEW:', etherealUrl);
            console.log('----------------------------------------------------');
        }

        res.status(200).json({
            success: true,
            message: genericMessage,
            etherealUrl: process.env.NODE_ENV !== 'production' ? etherealUrl : undefined,
            ...developmentMailMode
        });
    } catch (error) {
        console.error('Forgot password error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Reset password using valid one-time token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
router.put('/reset-password/:token', authLimiter, async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;

        if (!password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a new password' 
            });
        }

        const pwdValidation = validatePassword(password);
        if (!pwdValidation.valid) {
            return res.status(400).json({ 
                success: false, 
                message: pwdValidation.message 
            });
        }

        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Passwords do not match' 
            });
        }

        const rawToken = req.params.token;
        const hashedToken = crypto
            .createHash('sha256')
            .update(rawToken)
            .digest('hex');

        // Look for user with matching unexpired reset token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired password reset link. Please request a new one.'
            });
        }

        // Set new password (pre-save hook will hash it with bcrypt)
        user.password = password;
        // Invalidate token immediately (one-time use)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully! You can now log in with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private (Protected)
router.get('/me', protect, async (req, res) => {
    try {
        // req.user is populated by protect middleware
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get client workspace data (Client-only with verified email)
// @route   GET /api/auth/client-workspace
// @access  Private (Client only & verified email)
router.get('/client-workspace', protect, authorize('client'), requireVerifiedEmail, async (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Client Workspace',
        clientData: {
            userId: req.user._id,
            role: req.user.role,
            name: req.user.name
        }
    });
});

// @desc    Get freelancer workspace data (Freelancer-only with verified email)
// @route   GET /api/auth/freelancer-workspace
// @access  Private (Freelancer only & verified email)
router.get('/freelancer-workspace', protect, authorize('freelancer'), requireVerifiedEmail, async (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Freelancer Workspace',
        freelancerData: {
            userId: req.user._id,
            role: req.user.role,
            name: req.user.name
        }
    });
});

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private (Protected)
router.put('/profile', protect, async (req, res) => {
    try {
        const { 
            name, 
            headline, 
            bio, 
            skills, 
            hourlyRate, 
            experience, 
            certifications, 
            availability, 
            avatar,
            socialLinks,
            languages,
            weeklyCapacity,
            workPreference,
            location,
            companyName,
            companyLogo,
            companyWebsite,
            companySize,
            companyDescription,
            industry
        } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Freelancer & General Fields
        if (name !== undefined && typeof name === 'string') user.name = name.trim();
        if (avatar !== undefined && typeof avatar === 'string') user.avatar = avatar.trim();
        if (headline !== undefined && typeof headline === 'string') user.headline = headline.trim();
        if (bio !== undefined && typeof bio === 'string') user.bio = bio.trim();
        if (skills !== undefined && Array.isArray(skills)) {
            user.skills = skills.map(s => {
                if (typeof s === 'string') return { name: s.trim(), level: 'Intermediate' };
                if (s && s.name) return { name: String(s.name).trim(), level: s.level || 'Intermediate' };
                return null;
            }).filter(Boolean);
        }
        if (hourlyRate !== undefined) {
            const parsed = Number(hourlyRate);
            user.hourlyRate = !isNaN(parsed) && parsed >= 0 ? parsed : user.hourlyRate;
        }
        if (socialLinks !== undefined && typeof socialLinks === 'object') {
            user.socialLinks = {
                github: (socialLinks.github || '').trim(),
                linkedin: (socialLinks.linkedin || '').trim(),
                website: (socialLinks.website || '').trim(),
                twitter: (socialLinks.twitter || '').trim()
            };
        }
        if (languages !== undefined && Array.isArray(languages)) {
            user.languages = languages.filter(l => l && l.name);
        }
        if (weeklyCapacity !== undefined && typeof weeklyCapacity === 'string') {
            user.weeklyCapacity = weeklyCapacity.trim();
        }
        if (experience !== undefined && Array.isArray(experience)) user.experience = experience;
        if (certifications !== undefined && Array.isArray(certifications)) user.certifications = certifications;
        if (availability !== undefined) user.availability = availability;
        if (workPreference && ['remote', 'onsite', 'hybrid'].includes(workPreference)) {
            user.workPreference = workPreference;
        }
        if (location && typeof location === 'object') {
            user.location = {
                city: location.city ? String(location.city).trim() : (user.location?.city || 'Mumbai'),
                state: location.state ? String(location.state).trim() : (user.location?.state || 'Maharashtra')
            };
        }

        // Client Company Fields
        if (companyName !== undefined && typeof companyName === 'string') user.companyName = companyName.trim();
        if (companyLogo !== undefined && typeof companyLogo === 'string') user.companyLogo = companyLogo.trim();
        if (companyWebsite !== undefined && typeof companyWebsite === 'string') user.companyWebsite = companyWebsite.trim();
        if (companySize !== undefined && typeof companySize === 'string') user.companySize = companySize.trim();
        if (companyDescription !== undefined && typeof companyDescription === 'string') user.companyDescription = companyDescription.trim();
        if (industry !== undefined && typeof industry === 'string') user.industry = industry.trim();

        if (req.body.hasSkippedOnboarding !== undefined) {
            user.hasSkippedOnboarding = Boolean(req.body.hasSkippedOnboarding);
        }

        // Recalculate profile completeness based on role
        if (user.role === 'client') {
            const hasCompany = Boolean(user.companyName && user.companyName.trim());
            user.isProfileComplete = Boolean(hasCompany || (user.name && user.name.trim()));
        } else {
            const hasValidSkills = user.skills && user.skills.length > 0;
            const hasValidBio = user.bio && user.bio.trim().length >= 10;
            user.isProfileComplete = Boolean(hasValidSkills && hasValidBio);
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: formatUserResponse(user),
            user: formatUserResponse(user)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Add a portfolio item (Freelancer only)
// @route   POST /api/auth/portfolio
// @access  Private (Freelancer only)
router.post('/portfolio', protect, authorize('freelancer'), async (req, res) => {
    try {
        const { title, description, projectUrl, imageUrl, link, githubUrl } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: 'Please provide a project title' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.portfolio.push({
            title: title.trim(),
            description: (description || '').trim(),
            projectUrl: (projectUrl || link || githubUrl || '').trim(),
            imageUrl: (imageUrl || '').trim()
        });

        await user.save();
        res.status(201).json({ success: true, message: 'Portfolio item added successfully', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Delete a portfolio item (Freelancer only)
// @route   DELETE /api/auth/portfolio/:itemId
// @access  Private (Freelancer only)
router.delete('/portfolio/:itemId', protect, authorize('freelancer'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.portfolio = user.portfolio.filter(item => item._id.toString() !== req.params.itemId);
        await user.save();

        res.status(200).json({ success: true, message: 'Portfolio item deleted successfully', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/user/:id', optionalAuth, async (req, res) => {
    try {
        const Gig = require('../models/Gig');
        const Proposal = require('../models/Proposal');
        const Review = require('../models/Review');

        let user = null;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            user = await User.findById(req.params.id).select('-password');
        }
        if (!user) {
            user = await User.findOne({ username: req.params.id }).select('-password');
        }
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (user.role === 'freelancer') {
            user.profileViews = (user.profileViews || 0) + 1;
            await user.save();
        }

        const userObj = user.toObject();

        // Check if the requester is the owner of the profile or admin
        const isOwner = req.user && (req.user._id.toString() === user._id.toString() || req.user.role === 'admin');

        // Security check: Never expose sensitive private email, wallet, or internal verification/reset tokens to public viewers
        if (!isOwner) {
            delete userObj.email;
            delete userObj.walletBalance;
            delete userObj.emailVerificationToken;
            delete userObj.emailVerificationExpire;
            delete userObj.resetPasswordToken;
            delete userObj.resetPasswordExpire;
            delete userObj.googleId;
            delete userObj.twoFactorSecret;
            delete userObj.bankAccount;
            delete userObj.payoutMethods;
        }

        // Augment with role-specific stats
        if (user.role === 'client') {
            userObj.clientStats = {
                totalJobsPosted: await Gig.countDocuments({ client: user._id }),
                activeGigs: await Gig.countDocuments({ client: user._id, status: { $in: ['open', 'in-progress'] } }),
                completedGigs: await Gig.countDocuments({ client: user._id, status: 'completed' })
            };
        } else {
            const reviews = await Review.find({ reviewee: user._id }).populate('reviewer', 'name username avatar');
            const avgRating = reviews.length > 0 
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : 0;

            userObj.freelancerStats = {
                completedGigs: await Gig.countDocuments({ freelancer: user._id, status: 'completed' }),
                totalProposals: await Proposal.countDocuments({ freelancer: user._id }),
                reviews,
                rating: Number(avgRating),
                reviewCount: reviews.length
            };
            userObj.reviews = reviews;
            userObj.rating = Number(avgRating);
            userObj.reviewCount = reviews.length;
        }

        res.json({ success: true, data: userObj });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Switch active workspace role (client <-> freelancer)
// @route   POST /api/auth/switch-role
// @access  Private
router.post('/switch-role', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Admin accounts cannot switch roles' });
        }

        const newRole = user.role === 'client' ? 'freelancer' : 'client';
        user.role = newRole;

        // Recalculate profile completeness based on newly active workspace role
        if (newRole === 'client') {
            const hasCompany = Boolean(user.companyName && user.companyName.trim());
            user.isProfileComplete = Boolean(hasCompany || (user.name && user.name.trim()));
        } else {
            const hasValidSkills = user.skills && user.skills.length > 0;
            const hasValidBio = user.bio && user.bio.trim().length >= 10;
            user.isProfileComplete = Boolean(hasValidSkills && hasValidBio);
        }

        await user.save();

        res.json({
            success: true,
            message: `Switched to ${newRole} workspace!`,
            user: formatUserResponse(user)
        });
    } catch (error) {
        console.error('Switch role error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
