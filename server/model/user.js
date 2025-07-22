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
            default: "Admin",
        },
        hiringDate: {
            type: Date,
            default: Date.now,
        },
        department: {
            type: String,
            enum: ["CSE", "ISE", "ME", "ECE"],
            default: null
        },
        token: {
            type: String,
            default: null
        },
        expiryTime: {
            type: Date,
            default: null
        },
        phone: {
            type: String,
            default: null
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other","Prefer not to say"],
            default: null
        },
        employeeId: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);