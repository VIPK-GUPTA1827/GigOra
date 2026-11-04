// utils/emailCheck.js
// Signup pe email check: format + typo + disposable domain

const TYPO_DOMAINS = {
  'gemail.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'iclod.com': 'icloud.com'
};

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'yopmail.com',
  'trashmail.com',
  'sharklasers.com',
  'throwawaymail.com'
]);

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function checkEmail(rawEmail) {
  const bad = { ok: false, message: 'Invalid email address' };
  if (typeof rawEmail !== 'string') return bad;
  const email = rawEmail.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_FORMAT.test(email)) return bad;

  const [localPart, domain] = email.split('@');

  if (TYPO_DOMAINS[domain]) {
    const suggestion = `${localPart}@${TYPO_DOMAINS[domain]}`;
    return {
      ok: false,
      message: `Did you mean ${suggestion}?`,
      suggestion
    };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      ok: false,
      message: 'Temporary emails are not allowed'
    };
  }

  return { ok: true, email };
}

module.exports = { checkEmail, TYPO_DOMAINS, DISPOSABLE_DOMAINS };
