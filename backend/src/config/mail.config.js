const nodemailer = require('nodemailer');

let transporterPromise = null;

const isMailConfigured = () => Boolean(process.env.SMTP_HOST?.trim());

const isDevelopment = () => process.env.NODE_ENV !== 'production';

const createSmtpTransporter = () => nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        }
        : undefined,
});

const createEtherealTransporter = async () => {
    const testAccount = await nodemailer.createTestAccount();

    console.log('[mail] Development: using Ethereal test SMTP (set SMTP_HOST in .env for real inbox delivery)');
    console.log(`[mail] Ethereal inbox: ${testAccount.user}`);

    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

const createTransporter = async () => {
    if (isMailConfigured()) {
        return createSmtpTransporter();
    }

    if (isDevelopment()) {
        return createEtherealTransporter();
    }

    return null;
};

const getMailTransporter = () => {
    if (!transporterPromise) {
        transporterPromise = createTransporter();
    }

    return transporterPromise;
};

const getMailFromAddress = () => {
    if (process.env.SMTP_FROM?.trim()) {
        return process.env.SMTP_FROM.trim();
    }

    if (process.env.SMTP_USER?.trim()) {
        return process.env.SMTP_USER.trim();
    }

    return 'noreply@localhost';
};

module.exports = {
    isMailConfigured,
    isDevelopment,
    getMailTransporter,
    getMailFromAddress,
};
