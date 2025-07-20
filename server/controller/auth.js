const User = require('../model/user');
const OTP = require('../model/otpModel');
const mailSender = require('../mail/sender');
const { sendPasswordResetOTP } = require('../mail/templates/credentials'); 
const bcrypt = require('bcrypt');
const BlacklistedToken = require('../model/BlacklistedToken');

exports.logout = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Add token to blacklist
        const blacklistedToken = new BlacklistedToken({ token });
        await blacklistedToken.save();

        // Clear the cookie
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
        console.log('Generate OTP request received:', req.body);
        
        const { email } = req.body;
        if (!email) {
            console.log('Email missing in request');
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // 1. Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(404).json({
                success: false,
                message: 'If this email exists, an OTP will be sent'
            });
        }

        // 2. Generate and save OTP (10 minute expiry)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10*60*1000); // 10 minutes
        
        await OTP.findOneAndUpdate(
            { email },
            { otp, expiresAt, createdAt: new Date() },
            { upsert: true, new: true }
        );

        console.log('OTP generated for:', email);
        
        // 3. Send email using the imported function (remove the redundant require)
        await sendPasswordResetOTP(email, otp);
        
        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            // For development/testing only:
            ...(process.env.NODE_ENV === 'development' && { debugOtp: otp })
        });

    } catch (error) {
        console.error('Generate OTP error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process OTP request'
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