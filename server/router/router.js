const express = require("express");
const router = express.Router();

// Import controllers
const { signup } = require("../controller/signup");
const { login } = require("../controller/login");
const { 
    logout,
    generateOTP,
    verifyOTP,
    resetPasswordWithOTP,
    changePassword
} = require("../controller/auth");
const { auth, isStaff, allowRoles } = require("../middleware/auth");
const { imageUpload, getAllFiles } = require("../controller/File");
const { createLeave, getAllUserLeaves } = require("../controller/Leave");
const { getAllUsers } = require("../controller/User");
// const { getMyProfile } = require("../controller/Profile");
// const { updateOwnProfile, adminUpdateProfile } = require("../controller/Profile");
const { addStaff } = require("../controller/addStaff");
const { 
    getMyProfile, 
    updateOwnProfile, 
    adminUpdateProfile,
    deleteProfile  // Add this line
} = require("../controller/Profile");


// AUTH ROUTES
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// OTP ROUTES
router.post("/generate-otp", generateOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password-with-otp', resetPasswordWithOTP);
router.post('/change-password', changePassword);

// FILE ROUTES
router.post("/imageUpload", imageUpload);
router.get("/getAllimage", getAllFiles);

// LEAVE ROUTES
router.post("/createLeave", auth, allowRoles(["Staff", "HOD"]), createLeave);
router.get("/getAllUserLeaves", auth, isStaff, getAllUserLeaves);

// USER ROUTES
router.get("/profile", auth, getMyProfile);
router.get("/getAllUser", auth, allowRoles(["HOD", "Admin", "Principal"]), getAllUsers);
router.patch("/update-own-profile", auth, updateOwnProfile);
router.patch("/admin-update-profile", auth, allowRoles(["Admin", "Principal"]), adminUpdateProfile);
router.post("/add-user", auth, allowRoles(["Admin", "Principal", "HOD"]), addStaff);
router.delete("/delete-user", auth, allowRoles(["Admin", "Principal", "HOD"]), deleteProfile);

    // For Principal

module.exports = router;