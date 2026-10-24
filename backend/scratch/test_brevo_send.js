const nodemailer = require('nodemailer');
require('dotenv').config({ path: 'c:/Users/admin/new project/gigora/backend/.env' });

async function testSend() {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    console.log('Sending test email via Brevo...');
    // In Brevo, sender email must be verified. Let's see what Brevo accepts as from address.
    const sender = process.env.SMTP_FROM || process.env.SMTP_USER;
    console.log('Using sender:', sender);

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: 'vipingupta405060@gmail.com',
            subject: 'GigOra - Brevo Verified Sender Live Test!',
            text: 'Brevo verified sender successfully configured! All verification emails will now arrive from GigOra <vipingupta405060@gmail.com>.',
            html: '<div style="font-family:sans-serif;padding:20px;border:1px solid #ddd;border-radius:10px;"><h2>🎉 GigOra Email Delivery Active!</h2><p>Brevo SMTP successfully working!</p></div>'
        });
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
    } catch (err) {
        console.error('❌ Send error:', err.message);
    }
}

testSend();
