const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
    try {
        // Validate required environment variables
        if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
            throw new Error("Missing email configuration in environment variables");
        }

        // Create transporter with enhanced options
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT || 587,
            secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false // For self-signed certificates (if needed)
            }
        });

        // Send mail with enhanced options
        const info = await transporter.sendMail({
            from: `"Leave Manager || RNSIT" <${process.env.MAIL_USER}>`,
            to: email,
            subject: title,
            html: body,
            replyTo: process.env.MAIL_REPLY_TO || process.env.MAIL_USER
        });

        console.log('Email sent successfully to:', email);
        return info;
    } catch (err) {
        console.error("Error in sending mail:", err.message);
        throw err; // Re-throw the error to handle it in the calling function
    }
};

module.exports = mailSender;