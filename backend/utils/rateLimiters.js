const rateLimit = require('express-rate-limit');

const userKeyGenerator = (req) => {
  return req.user && req.user._id ? req.user._id.toString() : (req.ip || 'anonymous');
};

const makeLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { keyGeneratorIpFallback: false },
    keyGenerator: userKeyGenerator,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: message || 'Too many requests. Please slow down and try again later.'
      });
    }
  });
};

const reviewLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many reviews submitted. Please wait a few minutes before submitting another review.'
});

const disputeLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many dispute requests. Please wait before raising another dispute.'
});

const uploadLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Upload limit reached. Please wait a few minutes before uploading more files.'
});

const walletLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many wallet transactions requested. Please wait before trying again.'
});

const messageLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'You are sending messages too quickly. Please slow down.'
});

module.exports = {
  reviewLimiter,
  disputeLimiter,
  uploadLimiter,
  walletLimiter,
  messageLimiter
};
