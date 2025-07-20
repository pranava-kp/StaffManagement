const nodemailer = require("nodemailer");
require("dotenv").config();

// Reusable transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT || 587,
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

/**
 * Core email sending function
 * @param {string} email - Recipient address
 * @param {string} title - Email subject
 * @param {string} body - HTML content
 * @returns {Promise} Nodemailer sendMail result
 */
module.exports = async (email, title, body) => {
    if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
        throw new Error("Mail configuration missing in .env");
    }

    try {
        const info = await transporter.sendMail({
            from: `"Staff Management" <${process.env.MAIL_USER}>`,
            to: email,
            subject: title,
            html: body,
            replyTo: process.env.MAIL_REPLY_TO || process.env.MAIL_USER
        });
        console.log(`Email sent to ${email}`);
        return info;
    } catch (error) {
        console.error("Mail delivery failed:", error.message);
        throw new Error("Failed to send email");
    }
};