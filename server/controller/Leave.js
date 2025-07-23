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
        const user = req.user;
        const { departments } = req.query; // Optional filter for Principal
        
        let query = {};

        // For Staff - only show their own leaves
        if (user.accountType === 'Staff' || user.accountType === 'Teacher') {
            query.user = user.id;
        } 
        // For HOD - only show leaves from their department
        else if (user.accountType === 'HOD') {
            const departmentUsers = await User.find({ department: user.department }, '_id');
            const userIds = departmentUsers.map(user => user._id);
            query.user = { $in: userIds };
        } 
        // For Principal - optional department filter
        else if (user.accountType === 'Principal') {
            if (departments) {
                const departmentArray = Array.isArray(departments) ? departments : [departments];
                const departmentUsers = await User.find({ department: { $in: departmentArray } }, '_id');
                const userIds = departmentUsers.map(user => user._id);
                query.user = { $in: userIds };
            }
        }
        // For other account types (admin, etc.) - return empty by default
        else {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false,
            });
        }

        const leaves = await Leave.find(query).populate({
            path: 'user',
            select: 'firstName lastName department email'
        }).sort({ createdAt: -1 }); // Newest leaves first

        const totalLeavesTaken = leaves.reduce((total, leave) => {
            const leaveDuration = Math.ceil((leave.endDate - leave.startDate) / (1000 * 60 * 60 * 24)) + 1;
            return total + leaveDuration;
        }, 0);

        return res.status(200).json({
            message: "Leaves fetched successfully",
            data: { 
                leaves,
                totalLeavesTaken,
                // For HOD, show their department
                // For Principal, show filtered departments if any
                departmentInfo: user.accountType === 'HOD' ? 
                    { department: user.department } : 
                    user.accountType === 'Principal' ? 
                    { departments: departments || 'all' } :
                    null
            },
            success: true,
        });
    } catch (err) {
        console.error("Get leaves error:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? err.message : undefined,
            success: false,
        });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { leaveId, status, rejectionReason } = req.body;
        const user = req.user;

        // Validate input
        if (!leaveId || !status || !['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Valid leaveId and status (Approved/Rejected) are required",
            });
        }

        // Check if user is authorized (HOD or Principal)
        if (user.accountType !== 'HOD' && user.accountType !== 'Principal') {
            return res.status(403).json({
                success: false,
                message: "Only HOD or Principal can update leave status",
            });
        }

        // Find the leave
        const leave = await Leave.findById(leaveId).populate('user');
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave not found",
            });
        }

        // Additional check for HOD - can only approve leaves from their department
        if (user.accountType === 'HOD') {
            const leaveUser = await User.findById(leave.user);
            if (user.department !== leaveUser.department) {
                return res.status(403).json({
                    success: false,
                    message: "HOD can only approve leaves from their own department",
                });
            }
        }

        // Check if leave is already processed
        if (leave.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: `Leave has already been ${leave.status.toLowerCase()}`,
            });
        }

        // Update leave status
        leave.status = status;
        leave.updatedAt = new Date();
        
        // Append status update information to the body
        const processedBy = `${user.accountType} (${user.firstName} ${user.lastName})`;
        const statusUpdate = `\n\n[Status Update: ${status} by ${processedBy} on ${new Date().toLocaleString()}]`;
        
        if (status === 'Rejected' && rejectionReason) {
            leave.body += `${statusUpdate}\nReason: ${rejectionReason}`;
        } else {
            leave.body += statusUpdate;
        }

        await leave.save();

        return res.status(200).json({
            success: true,
            message: `Leave ${status.toLowerCase()} successfully`,
            data: {
                _id: leave._id,
                status: leave.status,
                updatedAt: leave.updatedAt,
                subject: leave.subject,
                user: {
                    _id: leave.user._id,
                    name: `${leave.user.firstName} ${leave.user.lastName}`
                }
            },
        });

    } catch (err) {
        console.error("Leave status update error:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? err.message : undefined,
            success: false,
        });
    }
};

// # Approve a leave
// curl -X POST "http://localhost:2000/api/v1/update-leave-status" \
// -H "Authorization: Bearer PRINCIPAL_OR_HOD_TOKEN" \
// -H "Content-Type: application/json" \
// -d '{
//   "leaveId": "687fe5541b24be76ddbf3061",
//   "status": "Approved"
// }'



// # Reject a leave with reason
// curl -X POST "http://localhost:2000/api/v1/update-leave-status" -H "Authorization: Bearer PRINCIPAL_OR_HOD_TOKEN" -H "Content-Type: application/json" -d '{"leaveId": "687fe5541b24be76ddbf3061", "status": "Rejected", "rejectionReason": "Insufficient substitute coverage"}'
