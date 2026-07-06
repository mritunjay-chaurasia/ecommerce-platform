const nodemailer = require('nodemailer');
const { getMailFromAddress, getMailTransporter } = require('../config/mail.config');

const sendEmail = async ({ to, subject, html, text }) => {
    const transport = await getMailTransporter();

    if (!transport) {
        console.error(`[mail] Cannot send "${subject}" → ${to}: SMTP is not configured`);
        return false;
    }

    const info = await transport.sendMail({
        from: getMailFromAddress(),
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    if (previewUrl) {
        console.log(`[mail] Sent "${subject}" → ${to}`);
        console.log(`[mail] Preview: ${previewUrl}`);
    } else {
        console.log(`[mail] Sent "${subject}" → ${to}`);
    }

    return true;
};

const sendEmailSafe = ({ to, subject, html, text }) => {
    sendEmail({ to, subject, html, text }).catch((error) => {
        console.error(`[mail] Failed to send "${subject}" to ${to}:`, error.message);
    });
};

module.exports = {
    sendEmail,
    sendEmailSafe,
};
