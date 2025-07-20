const Leave = require("../model/leave");
const User = require("../model/user");
const Profile = require("../model/profile");
const moment = require("moment");
const { sendSubstituteAssignment } = require("../mail/templates/becameSubstituteTeacher");
const mailSender = require('../mail/sender');

exports.createLeave = async (req, res) => {
    try {
        const { subject, body, category, substituteTeachers } = req.body;
        const startDate = moment(req.body.startDate, "YYYY-MM-DD");
        const endDate = moment(req.body.endDate, "YYYY-MM-DD");

        // Validation checks (unchanged)
        if (!subject || !body || !startDate || !endDate || !category || !substituteTeachers) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (!startDate.isValid() || !endDate.isValid() || startDate.isAfter(endDate)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid leave period." 
            });
        }

        const user = req.user;
        const profile = await User.findById(user.id).populate({
            path: "additionalDetails",
            populate: { path: "leaves" }
        });

        const absentTeacherName = `${profile.firstName} ${profile.lastName}`;
        const additionalDetails = profile.additionalDetails;

        // Calculate leave days (unchanged)
        const totalDaysTaken = additionalDetails.leaves.reduce((total, leave) => {
            const leaveDuration = Math.ceil((leave.endDate - leave.startDate) / (1000 * 60 * 60 * 24)) + 1;
            return total + leaveDuration;
        }, 0);

        const dateDifferenceInDays = endDate.diff(startDate, "days") + 1;
        if (dateDifferenceInDays > 12 - totalDaysTaken) {
            return res.status(400).json({
                success: false,
                message: "Leave duration cannot be more than left leaves",
            });
        }

        // Create leave (unchanged)
        const leave = await Leave.create({
            user: user.id,
            category,
            subject,
            body,
            startDate,
            endDate,
            substituteTeachers,
        });

        await Profile.findByIdAndUpdate(
            additionalDetails._id,
            { $push: { leaves: leave._id } },
            { new: true }
        );

        // Improved email sending
        try {
            const substituteEmails = Object.entries(substituteTeachers)
                .flatMap(([dayKey, substitutes]) => 
                    substitutes.map(substitute => ({
                        email: substitute.email,
                        name: `${substitute.firstName} ${substitute.lastName}`,
                        date: moment(startDate).add(dayKey.replace('Day', ''), 'days').toDate()
                    }))
                );

            await Promise.all(
                substituteEmails.map(({ email, name, date }) => 
                    sendSubstituteAssignment(email, name, absentTeacherName, date)
                )
            );
        } catch (error) {
            console.error("Email error:", error);
            // Continue even if emails fail
        }

        return res.status(200).json({
            message: `Leave created successfully for ${dateDifferenceInDays} days`,
            success: true,
        });

    } catch (err) {
        console.error("Leave creation error:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? err.message : undefined,
            success: false,
        });
    }
};

exports.getAllUserLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ user: req.user.id });
        const totalLeavesTaken = leaves.reduce((total, leave) => {
            const leaveDuration = Math.ceil((leave.endDate - leave.startDate) / (1000 * 60 * 60 * 24)) + 1;
            return total + leaveDuration;
        }, 0);

        return res.status(200).json({
            message: "All leaves fetched successfully",
            data: { leaves, totalLeavesTaken },
            success: true,
        });
    } catch (err) {
        console.error("Get leaves error:", err);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};