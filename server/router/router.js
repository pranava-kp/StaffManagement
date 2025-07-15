const express = require("express");
const router = express.Router();

// AUTH ENDPOINTS
const { signup } = require("../controller/signup");
const { login } = require("../controller/login");
const { auth, isStaff } = require("../middleware/auth");

// FILE ENDPOINTS
const { imageUpload } = require("../controller/File");
const { getAllFiles } = require("../controller/File");

// LEAVE ENDPOINTS
const { createLeave } = require("../controller/Leave");
const { getAllUserLeaves } = require("../controller/Leave");

// USER ENDPOINTS
const { getAllUsers } = require("../controller/User");
const { logout } = require('../controller/auth');

// AUTH ROUTES
router.post("/signup", signup);
router.post("/login", login);
// router.get("/dashboard", auth, getAllLeaves);
router.post('/logout', logout);

// FILE ROUTES
router.post("/imageUpload", imageUpload);
router.get("/getAllimage", getAllFiles);

// LEAVE ROUTES
router.post("/createLeave", auth, isStaff, createLeave);
router.get("/getAllUserLeaves", auth, isStaff, getAllUserLeaves);

// USER ROUTES
router.get("/getAllUser", auth, getAllUsers);
module.exports = router;
