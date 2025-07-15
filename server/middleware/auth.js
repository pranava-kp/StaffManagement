const jwt = require("jsonwebtoken");
const User = require("../model/user");
require("dotenv").config();

exports.auth = async (req, res, next) => {
    try {
        //fetch the token from the body;
        const token =
            req.body.token ||
            req.cookies.token ||
            req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(400).json({ message: "Token is missing" });
        }
        try {
            const response = jwt.verify(token, process.env.JWT_SECRET);
            console.log(response);
            req.user = response;
        } catch (error) {
            res.status(500).json({
                message: "internal server error",
                error: error,
            });
        }
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating token",
            error: err.message,
        });
    }
};

//isStaff
exports.isStaff = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Staff") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Staff",
            });
        }
        next();
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "User role cannot be verified",
        });
    }
};

//isInstructor
exports.isHead = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Head") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Head",
            });
        }
        next();
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "User role cannot be verified",
        });
    }
};

//isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Admin",
            });
        }
        next();
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "User role cannot be verified",
        });
    }
};
// exports.logout = async (req, res) => {
//   try {
//     // Clear HTTP-only cookie
//     res.clearCookie('token', {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/'
//     });
//     return res.status(200).json({
//       success: true,
//       message: 'Logged out successfully'
//     });
//   } catch (error) {
//     console.error('Logout error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };