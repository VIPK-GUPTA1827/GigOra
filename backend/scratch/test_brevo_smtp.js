const nodemailer = require('nodemailer');
require('dotenv').config({ path: 'c:/Users/admin/new project/gigora/backend/.env' });

async function testBrevo() {
    console.log('Testing Brevo SMTP configuration...');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.SMTP_USER);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // 587 uses STARTTLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        console.log('Verifying SMTP connection credentials...');
        await transporter.verify();
        console.log('✅ Brevo SMTP Authentication PASSED!');
    } catch (err) {
        console.error('❌ Brevo SMTP verification failed:', err.message);
    }
}

testBrevo();
