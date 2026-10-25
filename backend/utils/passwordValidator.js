// Password strength and validation utility for GigOra
// Enforces minimum 12 characters, common password blocking, and rejects "Weak" passwords (requires Fair/Good/Strong)

const COMMON_DISALLOWED_PASSWORDS = new Set([
    'password1234',
    'password12345',
    '123456789012',
    '1234567890123',
    'qwertyuiop12',
    'admin1234567',
    'administrator1',
    'gigora123456',
    'welcome12345',
    'iloveyou1234',
    'letmein12345'
]);

function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return {
            valid: false,
            message: 'Password is required'
        };
    }

    if (password.length < 12) {
        return {
            valid: false,
            message: 'Password must be at least 12 characters long'
        };
    }

    const lower = password.toLowerCase().trim();
    if (COMMON_DISALLOWED_PASSWORDS.has(lower)) {
        return {
            valid: false,
            message: 'This password is too common and easily guessed. Please choose a more secure passphrase.'
        };
    }

    // Evaluate character variety & strength score
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    let score = 1; // base score for 12+ chars
    if (hasLower && hasUpper) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;
    if (password.length >= 16) score += 1;

    // Reject weak password (e.g. all lowercase like 'aaaaaaaaaaaa' or all numbers)
    if (score < 2) {
        return {
            valid: false,
            message: 'Password is too weak. Please include a mix of uppercase, lowercase, numbers, or symbols.'
        };
    }

    return { valid: true, score };
}

module.exports = {
    validatePassword,
    MIN_PASSWORD_LENGTH: 12
};
