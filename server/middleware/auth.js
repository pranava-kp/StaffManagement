const jwt = require("jsonwebtoken");
const User = require("../model/user");
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET is not defined in .env");

// Unified role checker (DRY principle)
const checkRole = (role) => async (req, res, next) => {
  try {
    if (req.user?.accountType !== role) {
      return res.status(403).json({
        success: false,
        message: `Protected route for ${role}s only`
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Role verification failed",
      error: err.message
    });
  }
};

exports.auth = async (req, res, next) => {
  try {
    // Token extraction from multiple sources
    const token = req.cookies.token || 
                 req.header("Authorization")?.replace("Bearer ", "") || 
                 req.body.token;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication token missing" 
      });
    }

    // Token verification
    const decoded = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
    
    // Optional: Verify user still exists in DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User no longer exists" 
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// Role-based middlewares
exports.isStaff = checkRole("Staff");
exports.isHead = checkRole("Head");
exports.isAdmin = checkRole("Admin");

exports.logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Changed from 'lax' for better security
      path: '/'
    });
    
    // Optional: Add token to blacklist here
    
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};