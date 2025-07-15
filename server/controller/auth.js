const User = require('../model/user');
// const BlacklistedToken = require('../model/BlacklistedToken'); // Create this model if using token blacklist

exports.logout = async (req, res) => {
    try {
        // Clear HTTP-only cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });

        // Optional: Add token to blacklist
        // const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        // await BlacklistedToken.create({ token, expiresAt: new Date(req.user.exp * 1000) });

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