const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        additionalDetails: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
        },
        accountType: {
            type: String,
            enum: ["Admin", "Staff", "HOD", "Principal"],
            default: "Staff",
        },
        hiringDate: {
            type: Date,
            default: Date.now,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        },
        token: {
            type: String,
        },
        expiryTime: {
            type: Date,
        },
        phone: {
            type: String,
        },
        employeeId: {
            type: String,
            default: null,  // Explicitly set default to null
            // required: true,  // Commented out as per your original
            // unique: true,     // Commented out as per your original
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);