const sender = require("../sender");

module.exports = {
    /**
     * Send account credentials email
     * @param {string} email - Recipient address
     * @param {string} firstName - User's first name
     * @param {string} tempPassword - Generated password
     */
    sendPasswordEmail: async (email, firstName, tempPassword) => {
        const title = "Your Staff Account Credentials";
        const body = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Welcome to Staff Portal</h2>
                <p>Dear ${firstName},</p>
                
                <div style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                </div>
                
                <p style="color: #64748b; font-size: 0.875rem;">
                    Please change your password after first login.
                </p>
            </div>
        `;
        
        return sender(email, title, body);
    },

    /**
     * Send password reset OTP email
     * @param {string} email - Recipient address
     * @param {string} otp - 6-digit OTP code
     */
    sendPasswordResetOTP: async (email, otp) => {
        const title = "Password Reset OTP";
        const body = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Password Reset Request</h2>
                <p>We received a request to reset your password.</p>
                
                <div style="background: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; text-align: center;">
                    <p style="font-size: 1.5rem; letter-spacing: 0.5rem; font-weight: bold;">
                        ${otp}
                    </p>
                    <p style="color: #64748b; font-size: 0.875rem;">
                        This OTP is valid for 10 minutes
                    </p>
                </div>
                
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `;
        
        return sender(email, title, body);
    }
};