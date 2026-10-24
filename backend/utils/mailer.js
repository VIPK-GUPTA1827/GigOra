const nodemailer = require('nodemailer');

let transporterPromise = (async () => {
    // If custom SMTP config is provided in env
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        console.log('Using configured SMTP settings for mail delivery.');
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Fallback: Create a single Ethereal test account and cache it
    try {
        console.log('Generating Ethereal SMTP test account on boot...');
        const testAccount = await nodemailer.createTestAccount();
        console.log(`Ethereal user generated: ${testAccount.user}`);
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    } catch (err) {
        console.error('Failed to initialize Ethereal SMTP transporter:', err.message);
        return null;
    }
})();

const getTransporter = async () => {
    return await transporterPromise;
};

module.exports = { getTransporter };
