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
            type: String,
            enum: ["CSE", "ISE", "ME", "ECE"],
            default: null
        },
        token: {
            type: String,
        },
        expiryTime: {
            type: Date,
        },
        phone: String,
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
        },
        employeeId: String
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);