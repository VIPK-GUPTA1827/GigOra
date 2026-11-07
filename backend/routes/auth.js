const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { sha256, sendAuthTokens, clearAuthCookies } = require('../utils/tokens');
const EmailLog = require('../models/EmailLog');
const { protect, authorize, requireVerifiedEmail, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/auth');
const { getTransporter } = require('../utils/mailer');
const { validatePassword } = require('../utils/passwordValidator');
const { checkEmail } = require('../utils/emailCheck');
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

if (process.env.NODE_ENV !== 'production') {
    router.get('/rate-limit-test', testRateLimiter, (req, res) => {
        res.json({ success: true, message: 'Rate limit check passed' });
    });
}


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
        reviewCount: user.reviewCount || 0,
        createdAt: user.createdAt
    };
};

// Real email providers only: signup rejects made-up domains like gemail.com
const ALLOWED_EMAIL_DOMAINS = [
    'gmail.com',
    'googlemail.com',
    'outlook.com',
    'hotmail.com',
    'hotmail.co.in',
    'live.com',
    'live.in',
    'msn.com',
    'yahoo.com',
    'yahoo.in',
    'ymail.com',
    'rocketmail.com',
    'rediffmail.com',
    'proton.me',
    'protonmail.com',
    'pm.me',
    'icloud.com',
    'me.com',
    'mac.com',
    'aol.com',
    'zoho.com',
    'zohomail.in',
    'yandex.com',
    'yandex.ru',
    'gmx.com',
    'gmx.net',
    'mail.com',
    'tutanota.com',
    'tuta.io',
    'fastmail.com',
    'qq.com',
    '163.com'
];

// Common typo domains mapped to the real provider
const EMAIL_TYPO_DOMAINS = {
    'gemail.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gnail.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gmail.con': 'gmail.com',
    'outlok.com': 'outlook.com',
    'outlook.co': 'outlook.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'yahooo.com': 'yahoo.com',
    'protonmail.co': 'protonmail.com',
    'protomail.com': 'protonmail.com',
    'proton.com': 'proton.me',
    'icloud.co': 'icloud.com',
    'rediff.com': 'rediffmail.com',
    'redifmail.com': 'rediffmail.com'
};

// Validates that the email uses a real, known provider. Returns an error payload or null.
const validateEmailProvider = (email) => {
    const domain = String(email).toLowerCase().trim().split('@')[1];
    if (!domain) {
        return { message: 'Please provide a valid email address' };
    }
    const typoOf = EMAIL_TYPO_DOMAINS[domain];
    if (typoOf) {
        return {
            message: `"${domain}" is not a real email provider. Did you mean "${String(email).split('@')[0]}@${typoOf}"?`,
            suggestion: `${String(email).split('@')[0]}@${typoOf}`
        };
    }
    if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
        return {
            message: `Sign-up is currently limited to real email providers (Gmail, Outlook, Proton, Yahoo, Rediffmail, iCloud and others). "${domain}" is not accepted.`
        };
    }
    return null;
};

// ---------- Email verification helpers ----------
const fail = (res, status, message, extra = {}) =>
    res.status(status).json({ success: false, message, ...extra });

const VERIFY_COOLDOWN_MS = 60 * 1000; // resend ke beech 60 second

const hashToken = (raw) =>
    crypto.createHash('sha256').update(raw).digest('hex');

// raw token mail me jaata hai, hashed token DB me
const createVerificationToken = () => {
    const raw = crypto.randomBytes(32).toString('hex');
    const day = 24 * 60 * 60 * 1000;
    return {
        raw,
        hashed: hashToken(raw),
        expires: Date.now() + day
    };
};

const sendVerificationEmail = async (user, raw, subject) => {
    subject = subject || 'Verify your email - GigOra';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const link = `${clientUrl}/verify-email/${raw}`;
    let status = 'sent', error = '', messageId = '';
    let previewUrl = null;

    try {
        const transporter = await getTransporter();
        if (!transporter) throw new Error('Mail service offline');

        const info = await transporter.sendMail({
            from: typeof getSenderEmail === 'function' ? getSenderEmail() : '"GigOra" <alerts@gigora.dev>',
            to: user.email,
            subject,
            text: `Verify your email: ${link}`,
            html: `<div style="font-family: sans-serif; max-width: 560px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #593CFF; margin-top: 0;">Verify your GigOra Account</h2>
                    <p>Click below to verify your email address:</p>
                    <p style="margin: 20px 0;"><a href="${link}" style="background: #593CFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email</a></p>
                    <p style="color: #64748b; font-size: 13px;">This link expires in 24 hours.</p>
                   </div>`
        });

        messageId = info.messageId || '';
        if (process.env.NODE_ENV !== 'production') {
            console.log('DEV verify link:', link);
            previewUrl = nodemailer.getTestMessageUrl(info);
        }
    } catch (err) {
        status = 'failed';
        error = err.message;
    }

    try {
        await EmailLog.create({
            recipient: user.email,
            userId: user._id,
            subject,
            type: 'verification',
            status,
            error,
            messageId
        });
    } catch (e) {
        console.warn('EmailLog creation error:', e.message);
    }

    return { sent: status === 'sent', previewUrl };
};

// @desc    Register a new user (Unified Signup: Client or Freelancer)
// @route   POST /api/auth/register (or /signup)
// @access  Public
router.post('/register', authLimiter, validate({ body: registerSchema }), async (req, res) => {
    try {
        const { name, username, email, password, role } = req.body;

        // Validation
        if (!email || !password) {
            return fail(res, 400, 'Email and password are required');
        }

        // Email format, typo, and disposable check
        const emailCheck = checkEmail(email);
        if (!emailCheck.ok) {
            return fail(res, 400, emailCheck.message, { suggestion: emailCheck.suggestion });
        }

        const pwdValidation = validatePassword(password);
        if (!pwdValidation.valid) {
            return fail(res, 400, pwdValidation.message);
        }

        const assignedRole = role === 'client' ? 'client' : 'freelancer';
        const displayName = name || username || emailCheck.email.split('@')[0];
        let displayUsername = (username || displayName.toLowerCase().replace(/[^a-z0-9_]/g, '_')).trim();

        // Check if user email already exists
        const userExists = await User.findOne({ email: emailCheck.email });
        if (userExists) {
            return fail(res, 400, 'An account already exists with this email address');
        }

        // Check if username already exists
        const usernameExists = await User.findOne({ username: displayUsername });
        if (usernameExists) {
            if (username) {
                return fail(res, 400, `Username "${username}" is already taken. Please choose another username.`);
            } else {
                displayUsername = `${displayUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
            }
        }

        const verification = createVerificationToken();
        const autoVerify = process.env.AUTO_VERIFY_EMAIL === 'true' && process.env.NODE_ENV !== 'production';

        const user = await User.create({
            name: displayName,
            username: displayUsername,
            email: emailCheck.email,
            password,
            role: assignedRole,
            isEmailVerified: autoVerify,
            emailVerificationToken: verification.hashed,
            emailVerificationExpire: verification.expires,
            emailVerificationSentAt: new Date()
        });

        const tokens = await sendAuthTokens(req, res, user);

        // Verification mail background me (response nahi rukta)
        if (!user.isEmailVerified) {
            sendVerificationEmail(user, verification.raw).catch((e) => console.warn('Mail:', e.message));
        }

        return res.status(201).json({
            success: true,
            message: user.isEmailVerified
                ? 'Registration successful!'
                : 'Registered! Please check your email.',
            requiresVerification: !user.isEmailVerified,
            ...tokens,
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
router.post('/login', authLimiter, validate({ body: loginSchema }), async (req, res) => {
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

        // Block login if email is not yet verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                requiresVerification: true,
                email: user.email,
                message: 'Please verify your email before logging in. Check your inbox.'
            });
        }

        // Generate token and attach secure HTTP-only cookie
        const tokens = await sendAuthTokens(req, res, user);

        return res.json({
            success: true,
            message: 'Login successful!',
            ...tokens,
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

        if (!payload || !payload.email || !payload.email_verified) {
            return res.status(401).json({
                success: false,
                message: 'Google email is not verified'
            });
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
                if (!user.isEmailVerified && user.authProvider === 'local') {
                    user.password = undefined; // prevent pre-registration takeover
                }
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
        const tokens = await sendAuthTokens(req, res, user);

        return res.json({
            success: true,
            message: 'Google login successful!',
            ...tokens,
            user: formatUserResponse(user)
        });
    } catch (error) {
        console.error('Google OAuth error:', error.message);
        res.status(500).json({ success: false, message: 'Server error during Google authentication' });
    }
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', async (req, res) => {
    const raw = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!raw || typeof raw !== 'string') {
        return res.status(401).json({
            success: false,
            message: 'No refresh token'
        });
    }

    // Rotation: purana token ek hi baar chalega
    const stored = await RefreshToken.findOneAndDelete({
        tokenHash: sha256(raw),
        expiresAt: { $gt: new Date() }
    });

    if (!stored) {
        clearAuthCookies(res);
        return res.status(401).json({
            success: false,
            message: 'Session expired, please log in'
        });
    }

    const user = await User.findById(stored.user);
    if (!user || user.isSuspended) {
        clearAuthCookies(res);
        return res.status(401).json({
            success: false,
            message: 'Not allowed'
        });
    }

    const tokens = await sendAuthTokens(req, res, user);
    res.json({ success: true, ...tokens });
});

// @desc    Logout user & clear cookies
// @route   POST /api/auth/logout
// @access  Public
router.post('/logout', async (req, res) => {
    const raw = req.cookies?.refreshToken || req.body?.refreshToken;
    if (raw && typeof raw === 'string') {
        await RefreshToken.deleteOne({ tokenHash: sha256(raw) });
    }
    clearAuthCookies(res);
    res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private
router.post('/logout-all', protect, async (req, res) => {
    await RefreshToken.deleteMany({ user: req.user._id });
    await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
    clearAuthCookies(res);
    res.json({ success: true, message: 'Logged out everywhere' });
});

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            emailVerificationToken: hashToken(req.params.token)
        });

        if (!user) {
            return fail(res, 400, 'Invalid link. Request a new one.');
        }

        // Double click / link dobara khola: error nahi dena
        if (user.isEmailVerified) {
            return res.json({
                success: true,
                alreadyVerified: true,
                message: 'Your email is already verified.'
            });
        }

        if (!user.emailVerificationExpire || user.emailVerificationExpire < Date.now()) {
            return fail(res, 400, 'Link expired. Request a new one.', { expired: true });
        }

        user.isEmailVerified = true;
        await user.save();

        const tokens = await sendAuthTokens(req, res, user);

        res.json({
            success: true,
            message: 'Email verified successfully!',
            ...tokens,
            user: formatUserResponse(user)
        });
    } catch (error) {
        console.error('Email verification error:', error.message);
        fail(res, 500, 'Server error');
    }
});

// @desc    Resend email verification link
// @route   POST /api/auth/resend-verification
// @access  Public (IP limiter + per-user 60 sec cooldown)
router.post('/resend-verification', authLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || typeof email !== 'string') {
            return fail(res, 400, 'Please provide your email address');
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        const generic = {
            success: true,
            message: 'If the account exists, we sent a link.'
        };

        if (!user) return res.json(generic);

        if (user.isEmailVerified) {
            return fail(res, 400, 'Email already verified. Please log in.');
        }

        // Cooldown: 60 second ke andar dobara mail nahi
        const sentAt = user.emailVerificationSentAt ? user.emailVerificationSentAt.getTime() : 0;
        const wait = VERIFY_COOLDOWN_MS - (Date.now() - sentAt);
        if (wait > 0) {
            const retryAfter = Math.ceil(wait / 1000);
            res.set('Retry-After', String(retryAfter));
            return fail(res, 429, `Please wait ${retryAfter} seconds.`, { retryAfter });
        }

        const v = createVerificationToken();
        user.emailVerificationToken = v.hashed;
        user.emailVerificationExpire = v.expires;
        user.emailVerificationSentAt = new Date();
        await user.save();

        const result = await sendVerificationEmail(user, v.raw, 'New verification link - GigOra');
        if (!result.sent) {
            return fail(res, 503, 'Could not send email. Try again soon.');
        }

        const out = { ...generic };
        if (result.previewUrl) out.previewUrl = result.previewUrl;
        res.json(out);
    } catch (error) {
        console.error('Resend verification error:', error.message);
        fail(res, 500, 'Server error');
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
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();
        await RefreshToken.deleteMany({ user: user._id });

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
            user: formatUserResponse(req.user)
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
            await User.updateOne({ _id: user._id }, { $inc: { profileViews: 1 } });
            user.profileViews = (user.profileViews || 0) + 1;
        }

        const userObj = user.toObject();

        // Check if the requester is the owner of the profile or admin
        const isOwner = req.user && (req.user._id.toString() === user._id.toString() || req.user.role === 'admin');

        // Security check: Never expose sensitive private email, wallet, or internal verification/reset tokens to public viewers
        if (!isOwner) {
            delete userObj.tokenVersion;
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
