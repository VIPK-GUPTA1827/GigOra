const Notification = require('../models/Notification');
const EmailLog = require('../models/EmailLog');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { getTransporter } = require('./mailer');

const sendNotification = async (app, recipientId, senderId, type, title, message, referenceId) => {
  try {
    const recipient = await User.findById(recipientId);
    let destinationUrl = '';

    if (recipient) {
      if (recipient.role === 'client') {
        if (type === 'proposal_submitted') {
          destinationUrl = `/client/dashboard?tab=proposals&gigId=${referenceId}`;
        } else {
          destinationUrl = `/client/dashboard?tab=projects&gigId=${referenceId}`;
        }
      } else {
        if (type === 'proposal_rejected') {
          destinationUrl = `/freelancer/dashboard?tab=proposals`;
        } else {
          destinationUrl = `/freelancer/dashboard?tab=contracts&gigId=${referenceId}`;
        }
      }
    }

    // 1. Save in-app notification in database
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId || null,
      type,
      title,
      message,
      referenceId,
      destinationUrl
    });

    // Populate sender details for the live UI dropdown list
    const populated = await Notification.findById(notification._id).populate('sender', 'username name role avatar');

    // 2. Emit Socket.IO event to the recipient's personal room
    const io = app.get('io');
    if (io) {
      io.to(recipientId.toString()).emit('new_notification', populated);
    }

    // 3. Send Nodemailer transactional email and record in EmailLog
    let emailStatus = 'pending';
    let emailError = '';
    let messageId = '';

    if (recipient && recipient.email) {
      const transporter = await getTransporter();

      if (transporter) {
        try {
          const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
          const actionLink = destinationUrl ? `${clientUrl}${destinationUrl}` : `${clientUrl}/`;

          const mailOptions = {
            from: '"GigOra" <alerts@gigora.dev>',
            to: recipient.email,
            subject: `GigOra Alerts: ${title}`,
            text: `${message}\n\nCheck your GigOra workspace: ${actionLink}`,
            html: `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
                    <h2 style="color: #593CFF; margin-top: 0;">GigOra Updates</h2>
                    <p style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">${title}</p>
                    <p style="font-size: 13px; color: #475569; line-height: 1.6;">${message}</p>
                    <a href="${actionLink}" target="_blank" style="display: inline-block; background: #593CFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px; margin-top: 15px;">Open in GigOra</a>
                   </div>`
          };

          const info = await transporter.sendMail(mailOptions);
          emailStatus = 'sent';
          messageId = info.messageId || '';

          console.log('----------------------------------------------------');
          console.log('✉️ EMAIL ALERT SENT TO:', recipient.email);
          const testUrl = nodemailer.getTestMessageUrl(info);
          if (testUrl) {
            console.log('🔗 ETHEREAL MAILBOX LINK:', testUrl);
          }
          console.log('----------------------------------------------------');
        } catch (mailErr) {
          emailStatus = 'failed';
          emailError = mailErr.message || 'SMTP delivery failed';
          console.error('❌ Email dispatch failed:', mailErr.message);
        }
      } else {
        emailStatus = 'failed';
        emailError = 'SMTP transporter not configured';
      }

      // Log email delivery result to database
      try {
        await EmailLog.create({
          recipient: recipient.email,
          userId: recipient._id,
          subject: `GigOra Alerts: ${title}`,
          type,
          status: emailStatus,
          error: emailError,
          messageId,
          referenceId
        });
      } catch (logErr) {
        console.error('Failed to write EmailLog:', logErr.message);
      }
    }

    return { notification: populated, emailStatus, emailError };
  } catch (error) {
    console.error('Error generating notification:', error.message);
    return null;
  }
};

module.exports = { sendNotification };
