const User = require("../model/user");
const Profile = require("../model/profile");
const bcrypt = require("bcrypt");
const { sendPasswordEmail } = require('../mail/templates/credentials');

require("dotenv").config();

// Helper function to generate alphabetic password
function generateAlphaPassword(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

exports.addStaff = async (req, res) => {
    try {
        // 1. Fetch data from request body
        const { firstName, lastName, email, department, accountType } = req.body;
        const requesterRole = req.user.accountType; // From auth middleware

        // 2. Validate all required fields
        if (!firstName || !lastName || !email || !department || !accountType) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // 3. Validate department
        const validDepartments = ["CSE", "ISE", "ME", "ECE"];
        if (!validDepartments.includes(department)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department",
            });
        }

        // 4. Validate account type hierarchy
        const allowedTypes = {
            Principal: ["Admin", "HOD", "Staff"],
            HOD: ["Admin", "Staff"],
            Admin: ["Staff"]
        };

        if (!allowedTypes[requesterRole]?.includes(accountType)) {
            return res.status(403).json({
                success: false,
                message: `You are not authorized to create ${accountType} accounts`
            });
        }

        // 5. Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // 6. Generate alphabetic password
        const tempPassword = generateAlphaPassword(8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // 7. Create profile
        const profileDetails = await Profile.create({
            department,
            leaves: [],
        });

        // 8. Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            department,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`,
        });

        // 9. Send email with credentials
        try {
            await sendPasswordEmail(email, firstName, tempPassword);
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            // Continue with user creation even if email fails
            // You might want to log this failure for admin follow-up
        }

        // 10. Return response
        return res.status(200).json({
            success: true,
            message: `${accountType} user created successfully. Credentials sent to ${email}`,
            user: {
                ...user._doc,
                password: undefined
            },
            // Only show temp password in development for debugging
            tempPassword: process.env.NODE_ENV === "development" ? tempPassword : undefined
        });

    } catch (error) {
        console.error("Add staff error:", error);
        return res.status(500).json({
            success: false,
            message: error.code === 11000
                ? "Email already exists"
                : "Internal server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};