const express = require('express');
const User = require('../models/User');
const Gig = require('../models/Gig');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const escapeRegex = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper to normalize and deduplicate skills
const normalizeSkills = (skillsInput) => {
    if (!skillsInput || !Array.isArray(skillsInput)) return [];
    
    const seen = new Set();
    const result = [];

    for (const item of skillsInput) {
        let name = '';
        let level = 'Intermediate';

        if (typeof item === 'string') {
            name = item.trim();
        } else if (item && typeof item === 'object') {
            name = (item.name || '').trim();
            if (['Beginner', 'Intermediate', 'Expert'].includes(item.level)) {
                level = item.level;
            }
        }

        if (name && !seen.has(name.toLowerCase())) {
            seen.add(name.toLowerCase());
            result.push({ name, level });
        }
    }
    return result;
};

// @desc    Get Freelancer Profile
// @route   GET /api/freelancer/profile
// @access  Private (Freelancers only)
router.get('/profile', protect, authorize('freelancer', 'admin'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Freelancer not found' });
        }

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                headline: user.headline || '',
                bio: user.bio || '',
                skills: user.skills || [],
                experienceLevel: user.experienceLevel || 'Intermediate',
                preferredCategories: user.preferredCategories || [],
                hourlyRate: user.hourlyRate || 0,
                workPreference: user.workPreference || 'remote',
                location: user.location || { city: 'Mumbai', state: 'Maharashtra' },
                portfolio: user.portfolio || [],
                socialLinks: user.socialLinks || {},
                languages: user.languages || [],
                weeklyCapacity: user.weeklyCapacity || '30+ hrs/week',
                isProfileComplete: Boolean(user.isProfileComplete),
                hasSkippedOnboarding: Boolean(user.hasSkippedOnboarding),
                isEmailVerified: Boolean(user.isEmailVerified),
                walletBalance: user.walletBalance || 0
            }
        });
    } catch (error) {
        console.error('Error fetching freelancer profile:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching profile' });
    }
});

// @desc    Update/Save Freelancer Profile (Setup Wizard or Edit Profile)
// @route   PUT /api/freelancer/profile
// @access  Private (Freelancers only)
router.put('/profile', protect, authorize('freelancer', 'admin'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Freelancer not found' });
        }

        const {
            name,
            avatar,
            headline,
            bio,
            skills,
            experienceLevel,
            preferredCategories,
            hourlyRate,
            workPreference,
            location,
            isProfileComplete
        } = req.body;

        // 1. Name & Avatar
        if (name !== undefined && typeof name === 'string') {
            user.name = name.trim();
        }
        if (avatar !== undefined && typeof avatar === 'string') {
            user.avatar = avatar.trim();
        }

        // 2. Headline & Bio
        if (headline !== undefined && typeof headline === 'string') {
            user.headline = headline.trim();
        }
        if (bio !== undefined && typeof bio === 'string') {
            user.bio = bio.trim();
        }

        // 3. Skills Normalization (trim, deduplicate)
        if (skills !== undefined) {
            user.skills = normalizeSkills(skills);
        }

        // 4. Experience Level
        if (experienceLevel && ['Entry', 'Intermediate', 'Expert'].includes(experienceLevel)) {
            user.experienceLevel = experienceLevel;
        }

        // 5. Preferred Categories
        if (preferredCategories !== undefined && Array.isArray(preferredCategories)) {
            const catSet = new Set();
            user.preferredCategories = preferredCategories
                .map(c => String(c).trim())
                .filter(c => {
                    if (!c || catSet.has(c.toLowerCase())) return false;
                    catSet.add(c.toLowerCase());
                    return true;
                });
        }

        // 6. Hourly Rate
        if (hourlyRate !== undefined) {
            const parsedRate = Number(hourlyRate);
            user.hourlyRate = (!isNaN(parsedRate) && parsedRate >= 0) ? parsedRate : 0;
        }

        // 7. Work Preference
        if (workPreference && ['remote', 'onsite', 'hybrid'].includes(workPreference)) {
            user.workPreference = workPreference;
        }

        // 8. Location
        if (location && typeof location === 'object') {
            user.location = {
                city: location.city ? String(location.city).trim() : 'Mumbai',
                state: location.state ? String(location.state).trim() : 'Maharashtra'
            };
        }

        // 9. Social Links & Weekly Capacity (Optional boosters)
        if (req.body.socialLinks && typeof req.body.socialLinks === 'object') {
            user.socialLinks = {
                github: req.body.socialLinks.github ? String(req.body.socialLinks.github).trim() : (user.socialLinks?.github || ''),
                linkedin: req.body.socialLinks.linkedin ? String(req.body.socialLinks.linkedin).trim() : (user.socialLinks?.linkedin || ''),
                website: req.body.socialLinks.website ? String(req.body.socialLinks.website).trim() : (user.socialLinks?.website || ''),
                twitter: req.body.socialLinks.twitter ? String(req.body.socialLinks.twitter).trim() : (user.socialLinks?.twitter || '')
            };
        }

        if (req.body.weeklyCapacity && typeof req.body.weeklyCapacity === 'string') {
            user.weeklyCapacity = req.body.weeklyCapacity.trim();
        }

        if (req.body.languages && Array.isArray(req.body.languages)) {
            user.languages = req.body.languages;
        }

        if (req.body.portfolio && Array.isArray(req.body.portfolio)) {
            user.portfolio = req.body.portfolio;
        }

        if (req.body.hasSkippedOnboarding !== undefined) {
            user.hasSkippedOnboarding = Boolean(req.body.hasSkippedOnboarding);
        }

        // 10. Profile Completion Calculation
        // A profile is complete if it has a valid name, bio (>10 chars), at least 1 skill, and preferred category
        const hasValidSkills = user.skills && user.skills.length > 0;
        const hasValidBio = user.bio && user.bio.trim().length >= 10;
        const hasCategories = user.preferredCategories && user.preferredCategories.length > 0;
        
        user.isProfileComplete = Boolean(
            isProfileComplete !== undefined 
                ? isProfileComplete 
                : (hasValidSkills && hasValidBio && hasCategories)
        );

        await user.save();

        res.json({
            success: true,
            message: 'Freelancer profile updated successfully',
            data: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                headline: user.headline,
                bio: user.bio,
                skills: user.skills,
                experienceLevel: user.experienceLevel,
                preferredCategories: user.preferredCategories,
                hourlyRate: user.hourlyRate,
                workPreference: user.workPreference,
                location: user.location,
                portfolio: user.portfolio,
                socialLinks: user.socialLinks || {},
                languages: user.languages || [],
                weeklyCapacity: user.weeklyCapacity || '30+ hrs/week',
                isProfileComplete: user.isProfileComplete,
                hasSkippedOnboarding: user.hasSkippedOnboarding,
                isEmailVerified: user.isEmailVerified,
                walletBalance: user.walletBalance
            }
        });
    } catch (error) {
        console.error('Error updating freelancer profile:', error);
        res.status(500).json({ success: false, message: 'Server error while saving profile' });
    }
});

// @desc    Get Rule-based Matched Gigs for Freelancer
// @route   GET /api/freelancer/matched-gigs
// @access  Private (Freelancers only)
router.get('/matched-gigs', protect, authorize('freelancer', 'admin'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userSkills = (user.skills || []).map(s => (s.name || '').toLowerCase());
        const userCategories = (user.preferredCategories || []).map(c => c.toLowerCase());
        const hasSkills = userSkills.length > 0;

        // Fetch all open gigs
        const gigs = await Gig.find({ status: 'open' })
            .populate('client', 'name username avatar')
            .sort({ createdAt: -1 });

        if (!hasSkills) {
            return res.json({
                success: true,
                isProfileComplete: false,
                matchedGigs: [],
                realGigs: gigs.filter(g => !g.isDemo && !g.isSample),
                demoGigs: gigs.filter(g => g.isDemo || g.isSample),
                allGigs: gigs,
                message: 'Add skills to your profile to get personalized gig recommendations.'
            });
        }

        // Rule-based matching with explainable reasons
        const scoredGigs = gigs.map(gig => {
            const gigObj = gig.toObject();
            const matchReasons = [];
            let score = 0;

            // 1. Skill Match with strict short-string handling
            const gigSkills = (gig.skillsRequired || []).map(s => String(s).trim().toLowerCase());
            const matchedSkills = userSkills.filter(s => 
                gigSkills.some(gs => {
                    if (gs === s) return true;
                    // For short words (e.g. 'c', 'go', 'ai', 'ui'), require exact match to prevent false positives
                    if (s.length <= 3 || gs.length <= 3) return false;
                    return gs.includes(s) || s.includes(gs);
                })
            );

            if (matchedSkills.length > 0) {
                score += matchedSkills.length * 40;
                matchReasons.push(`Skills match: ${matchedSkills.slice(0, 2).join(', ')}`);
            }

            // 2. Category Match
            if (gig.category && userCategories.includes(gig.category.toLowerCase())) {
                score += 30;
                matchReasons.push(`Category: ${gig.category}`);
            }

            // 3. Location / Remote Preference Match (safe string check)
            const resolvedLocationType = typeof gig.locationType === 'string' 
                ? gig.locationType.toLowerCase() 
                : 'remote';
            const userPref = (user.workPreference || 'remote').toLowerCase();

            if (userPref === 'remote' && resolvedLocationType.includes('remote')) {
                score += 20;
                matchReasons.push('Remote preference match');
            } else if (userPref === 'onsite' && !resolvedLocationType.includes('remote')) {
                score += 20;
                matchReasons.push('Local Mumbai project');
            }

            // Also check if gig title / description explicitly mentions any user skills
            if (matchedSkills.length === 0 && (gig.title || gig.description)) {
                const combinedText = `${gig.title} ${gig.description}`.toLowerCase();
                const textMatched = userSkills.filter(s => {
                    if (!s || s.length <= 2) return false;
                    try {
                        const escaped = escapeRegex(s);
                        const regex = /^\w+$/.test(s) ? new RegExp(`\\b${escaped}\\b`, 'i') : new RegExp(escaped, 'i');
                        return regex.test(combinedText);
                    } catch (e) {
                        return combinedText.includes(s.toLowerCase());
                    }
                });
                if (textMatched.length > 0) {
                    score += textMatched.length * 25;
                    matchReasons.push(`Skills mentioned in project: ${textMatched.slice(0, 2).join(', ')}`);
                    matchedSkills.push(...textMatched);
                }
            }

            gigObj.matchScore = score;
            gigObj.matchReasons = matchReasons;
            gigObj.matchedSkills = matchedSkills;
            return gigObj;
        });

        // Sort all gigs: highest match score first, then newest
        const sortedAllGigs = scoredGigs.sort((a, b) => {
            if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        const matched = sortedAllGigs.filter(g => g.matchReasons && g.matchReasons.length > 0);
        const realGigs = sortedAllGigs.filter(g => !g.isDemo && !g.isSample);
        const demoGigs = sortedAllGigs.filter(g => g.isDemo || g.isSample);

        res.json({
            success: true,
            isProfileComplete: Boolean(user.isProfileComplete),
            matchedGigs: matched,
            realGigs,
            demoGigs,
            allGigs: sortedAllGigs
        });
    } catch (error) {
        console.error('Error fetching matched gigs:', error);
        res.status(500).json({ success: false, message: 'Server error while calculating matched gigs' });
    }
});

module.exports = router;
