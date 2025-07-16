const User = require("../model/user");
const Profile = require("../model/profile");
const bcrypt = require("bcrypt");
require("dotenv").config();

exports.signup = async (req, res) => {
    try {
        // 1. Fetch data from request body
        const { firstName, lastName, email, password } = req.body;

        // 2. Validate all required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // 3. Check password complexity
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
        }

        // 4. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // 5. Hash the password
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
        } catch (error) {
            console.error("Error hashing password:", error);
            return res.status(500).json({
                success: false,
                message: "Error while securing password",
            });
        }

        // 6. Create profile details
        const profileDetails = await Profile.create({
            dateOfBirth: null,
            phoneNumber: null,
            gender: null,
            department: null,
            leaves: [],
        });

        // 7. Create user in database
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType: "Staff",
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`,
        });

        // 8. Remove sensitive data before sending response
        user.password = undefined;

        // 9. Return success response
        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            user,
        });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};