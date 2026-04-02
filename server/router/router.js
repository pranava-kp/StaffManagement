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
const { auth, isStaff, isHOD, isPrincipal, allowRoles } = require("../middleware/auth");
const { imageUpload, getAllFiles } = require("../controller/File");
const { createLeave, getAllUserLeaves, updateLeaveStatus, editLeave } = require("../controller/Leave");
const { getAllUsers, getuserdept } = require("../controller/User");
const {
    getMyProfile,
    updateOwnProfile,
    adminUpdateProfile,
    deleteProfile,
    getProfileByEmail,
    getRemainingLeaves
} = require("../controller/Profile");
const { addStaff } = require("../controller/addStaff");

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
router.put("/edit-leave", auth, allowRoles(["Staff", "HOD"]), editLeave);
// Update the leave routes section to:
router.get("/get-all-leaves", auth, allowRoles(["Staff", "HOD", "Principal"]), getAllUserLeaves);
// Change the route to a simple POST endpoint
router.post("/update-leave-status",
    auth,
    allowRoles(["HOD", "Principal"]),
    updateLeaveStatus
);

router.get("/get-remaining-leaves", auth, getRemainingLeaves);

// USER ROUTES
router.get("/profile", auth, getMyProfile);
router.get("/profile-by-email", auth, allowRoles(["Principal", "Admin", "HOD"]), getProfileByEmail);
router.get("/getAllUser", auth, allowRoles(["HOD", "Admin", "Principal"]), getAllUsers);
router.get("/getuserdept", auth, getuserdept);
router.patch("/update-own-profile", auth, updateOwnProfile);
router.patch("/admin-update-profile", auth, allowRoles(["Admin", "Principal"]), adminUpdateProfile);
router.post("/add-user", auth, allowRoles(["Admin", "Principal", "HOD"]), addStaff);
router.delete("/delete-user", auth, allowRoles(["Admin", "Principal", "HOD"]), deleteProfile);

module.exports = router;