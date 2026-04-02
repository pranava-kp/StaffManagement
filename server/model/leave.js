const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: String,
        enum: ["Casual Leave", "Earned Leave", "Maternity Leave", "Restricted Holiday"],
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: [
            "Awaiting HOD Approval",
            "Awaiting Principal Approval",
            "Approved",
            "Rejected by HOD",
            "Rejected by Principal",
            
        ],
        default: "Awaiting HOD Approval",
    },
    startDate:{
        type: Date,
        required: true,
    },
    endDate:{
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    documentUrl: {
        type: String, // Stores the Cloudinary secure_url
        default: "",
    },
    substituteTeachers: {
        type: mongoose.Schema.Types.Mixed, 
        required: true,
    },
    //comments array
    comments: [
        {
            role: { type: String },
            action: { type: String },
            commentText: { type: String },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);
