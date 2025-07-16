const User = require('../model/user');
const OTP = require('../model/otpModel');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');
// const BlacklistedToken = require('../model/BlacklistedToken');

exports.logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.generateOTP = async (req, res) => {
    try {
        console.log('Generate OTP request received:', req.body); // Log incoming request
        
        const { email } = req.body;
        if (!email) {
            console.log('Email missing in request');
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        console.log('Searching for user:', email);
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Generated OTP:', otp);

        const otpRecord = new OTP({ email, otp });
        await otpRecord.save();
        console.log('OTP saved to database');

        const emailSubject = 'Password Reset OTP';
        const emailBody = `Your OTP is: ${otp}`;

        console.log('Attempting to send email to:', email);
        await mailSender(email, emailSubject, emailBody);
        console.log('Email sent successfully');

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully'
        });
    } catch (error) {
        console.error('Generate OTP error:', error);
        return res.status(500).json({
            success: false,
            message: error.message // Return actual error message
        });
    }
};

// 1. Verify OTP (standalone)
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const otpRecord = await OTP.findOne({ email, otp });
        
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Delete the OTP record after successful verification
        await OTP.deleteOne({ _id: otpRecord._id });

        return res.status(200).json({
            success: true,
            message: 'OTP verified',
            verified: true  // Additional flag for frontend
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// 2. Reset Password with OTP
exports.resetPasswordWithOTP = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Password validation
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters'
            });
        }

        // Update password (OTP already verified in previous step)
        const user = await User.findOne({ email });
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        await OTP.deleteMany({ email });

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// 3. Change Password (with current password)
exports.changePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        // Password validation
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }

        // Verify current password
        const user = await User.findOne({ email });
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};