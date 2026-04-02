const Leave = require("../model/leave");
const User = require("../model/user");
const Profile = require("../model/profile");
const moment = require("moment");
const { sendSubstituteAssignment } = require("../mail/templates/becameSubstituteTeacher");
const mailSender = require('../mail/sender');
const { becameSubstituteTeacher } = require("../mail/templates/becameSubstituteTeacher");
const { uploadFileToCloudinary } = require("../utils/fileUploader");

const getWorkingDays = (startDate, endDate) => {
    let count = 0;
    let current = moment(startDate).startOf('day');
    const end = moment(endDate).startOf('day');
    
    while (current.isSameOrBefore(end)) {
        if (current.day() !== 0) { // 0 is Sunday
            count++;
        }
        current.add(1, 'days');
    }
    return count;
};

exports.createLeave = async (req, res) => {
    try {
        let { subject, body, category, substituteTeachers } = req.body;
        const startDate = moment(req.body.startDate, "YYYY-MM-DD");
        const endDate = moment(req.body.endDate, "YYYY-MM-DD");

        // 1. Parse substituteTeachers back to JSON if it comes as a string from FormData
        if (typeof substituteTeachers === "string") {
            try {
                substituteTeachers = JSON.parse(substituteTeachers);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid format for substituteTeachers",
                });
            }
        }

        // 2. Validation checks
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

        // --- NEW: OVERLAP CHECK ---
        // Check if the user already has a leave that overlaps with these dates
        const overlappingLeave = await Leave.findOne({
            user: user.id,
            // Exclude leaves that were rejected (or cancelled, if you have that status)
            status: { $nin: ['Rejected'] }, 
            $and: [
                { startDate: { $lte: endDate.toDate() } },
                { endDate: { $gte: startDate.toDate() } }
            ]
        });

        if (overlappingLeave) {
            return res.status(400).json({
                success: false,
                message: "You already have an existing leave application during these dates.",
                overlappingLeaveDates: {
                    start: overlappingLeave.startDate,
                    end: overlappingLeave.endDate,
                    status: overlappingLeave.status
                }
            });
        }
        // --- END OVERLAP CHECK ---

        const profile = await User.findById(user.id).populate({
            path: "additionalDetails",
            populate: { path: "leaves" }
        });

        const absentTeacherName = `${profile.firstName} ${profile.lastName}`;
        const additionalDetails = profile.additionalDetails;

        // 3. --- NEW RULE VALIDATION ENGINE ---
        const requestedDays = getWorkingDays(startDate, endDate);

        // Fetch user's existing leaves for the current year (excluding rejected ones)
        const startOfYear = moment().startOf('year').toDate();
        const endOfYear = moment().endOf('year').toDate();
        
        const existingLeaves = await Leave.find({
            user: user.id,
            status: { $nin: ['Rejected by HOD', 'Rejected by Principal'] },
            startDate: { $gte: startOfYear, $lte: endOfYear }
        });

        // Tally up what they have taken so far
        let casualThisYear = 0;
        let casualThisMonth = 0;
        let restrictedThisYear = 0;

        existingLeaves.forEach(l => {
            const days = getWorkingDays(moment(l.startDate), moment(l.endDate));
            
            if (l.category === 'Casual Leave') {
                casualThisYear += days;
                // Check if the leave falls in the current calendar month
                if (moment(l.startDate).isSame(startDate, 'month')) {
                    casualThisMonth += days;
                }
            }
            if (l.category === 'Restricted Holiday') {
                restrictedThisYear += days;
            }
        });

        // Apply specific rules based on the category requested
        if (category === 'Casual Leave') {
            if (casualThisYear + requestedDays > 12) {
                return res.status(400).json({ success: false, message: `Yearly limit reached. You only have ${12 - casualThisYear} Casual Leaves left this year.` });
            }
            if (casualThisMonth + requestedDays > 3) {
                return res.status(400).json({ success: false, message: `Monthly limit reached. You can only take 3 Casual Leaves per month.` });
            }
        } 
        else if (category === 'Earned Leave') {
            // "profile" is actually the User document in your existing code, so this perfectly reads the new wallet!
            const availableEarned = profile.leaveBalances?.earnedLeave?.balance ?? 10;
            if (requestedDays > availableEarned) {
                return res.status(400).json({ success: false, message: `Insufficient balance. You only have ${availableEarned} Earned Leaves available.` });
            }
        } 
        else if (category === 'Restricted Holiday') {
            if (restrictedThisYear + requestedDays > 2) {
                return res.status(400).json({ success: false, message: `Limit reached. You can only take 2 Restricted Holidays per year.` });
            }
        } 
        else if (category === 'Maternity Leave') {
            if (requestedDays > 180) { 
                return res.status(400).json({ success: false, message: "Maternity Leave cannot exceed 6 months (180 days)." });
            }
            body = `[MATERNITY LEAVE - REQUIRES OFFICER APPROVAL]\n` + body;
        }

        const dateDifferenceInDays = requestedDays; 
        // --- END OF RULE VALIDATION ENGINE ---

        // 4. --- FETCH SUBSTITUTE TEACHER DETAILS FROM DB ---
        // Gather all unique Object IDs from the nested payload
        const uniqueTeacherIds = new Set();
        Object.values(substituteTeachers).forEach(daySchedule => {
            Object.values(daySchedule).forEach(teacherId => {
                uniqueTeacherIds.add(teacherId);
            });
        });

        // Fetch all matching users from the database to get their emails and names
        const substituteUsers = await User.find({
            _id: { $in: Array.from(uniqueTeacherIds) }
        }).select("firstName lastName email department");

        // Create a dictionary mapping: { "objectId": { userDetails } }
        const teacherMap = {};
        substituteUsers.forEach(sub => {
            teacherMap[sub._id.toString()] = sub;
        });

        // 5. --- CLOUDINARY UPLOAD LOGIC ---
        let uploadedDocumentUrl = "";
        
        if (req.files && req.files.supportDocument) {
            const document = req.files.supportDocument;
            try {
                const uploadDetails = await uploadFileToCloudinary(
                    document,
                    process.env.CLOUDINARY_FOLDER
                );
                uploadedDocumentUrl = uploadDetails.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary Upload Error:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading support document to Cloudinary",
                });
            }
        }

        // 6. Create leave record in MongoDB
        const leave = await Leave.create({
            user: user.id,
            category,
            subject,
            body,
            startDate,
            endDate,
            substituteTeachers, // Saves the new {"2026-03-10": {"1": "id"}} mapping directly
            status: "Awaiting HOD Approval", // Kept from editLeave branch
            documentUrl: uploadedDocumentUrl, // Kept from main branch
        });

        await Profile.findByIdAndUpdate(
            additionalDetails._id,
            { $push: { leaves: leave._id } },
            { new: true }
        );

        // 7. --- TARGETED EMAIL SENDING LOGIC ---
        try {
            const emailPromises = [];

            // Iterate over the exact dates (e.g., "2026-03-10")
            for (const [exactDateString, daySchedule] of Object.entries(substituteTeachers)) {
                
                // Iterate over the hours within that date (e.g., "1": "teacherObjectId")
                for (const [hour, teacherId] of Object.entries(daySchedule)) {
                    
                    const teacher = teacherMap[teacherId];
                    if (teacher) {
                        const name = `${teacher.firstName} ${teacher.lastName}`;
                        
                        // Pass 0 for dayToAdd because we are using the exact date string
                        const emailBody = becameSubstituteTeacher(
                            exactDateString, 
                            0, 
                            name, 
                            absentTeacherName,
                            hour
                        );
                        
                        emailPromises.push(
                            mailSender(
                                teacher.email, 
                                `Assignment as Substitute Teacher - Hour ${hour}`, 
                                emailBody
                            )
                        );
                    }
                }
            }

            await Promise.all(emailPromises);
        } catch (error) {
            console.error("Email error:", error);
        }

        return res.status(200).json({
            message: `Leave created successfully for ${dateDifferenceInDays} days`,
            success: true,
            leaveDetails: leave 
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
                const departmentArray = departments.split(','); // Consistent with getAllUsers
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
            const leaveDuration = getWorkingDays(moment(leave.startDate), moment(leave.endDate));
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
        const { leaveId, status, comment } = req.body;
        const user = req.user;

        // 1. Basic validation
        if (!leaveId || !status || !['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Valid leaveId and status (Approved/Rejected) are required",
            });
        }

        // 2. Find the leave
        const leave = await Leave.findById(leaveId).populate('user');
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave not found",
            });
        }

        // 3. Determine status transitions based on Role
        let newStatus = "";

        if (user.accountType === 'HOD') {
            // HOD specific checks
            if (user.department !== leave.user.department) {
                return res.status(403).json({
                    success: false,
                    message: "HOD can only process leaves from their own department",
                });
            }

            if (leave.status !== 'Awaiting HOD Approval') {
                return res.status(400).json({
                    success: false,
                    message: `Leave is not in a state to be approved by HOD (Current status: ${leave.status})`,
                });
            }

            newStatus = (status === 'Approved') ? 'Awaiting Principal Approval' : 'Rejected by HOD';

        } else if (user.accountType === 'Principal') {
            // Principal specific checks
            if (leave.status !== 'Awaiting Principal Approval') {
                return res.status(400).json({
                    success: false,
                    message: `Leave must be approved by HOD first (Current status: ${leave.status})`,
                });
            }

            newStatus = (status === 'Approved') ? 'Approved' : 'Rejected by Principal';

        } else {
            return res.status(403).json({
                success: false,
                message: "Only HOD or Principal can update leave status",
            });
        }

        // 4. Update leave record
        leave.status = newStatus;
        leave.updatedAt = new Date();

        
       
       // --- CLEAN COMMENT LOGIC ---
        const textToSave = req.body.comment || req.body.rejectionReason || "";

        // We map your specific schema statuses to clean action words for the UI popup
        let actionWord = newStatus;
        if (newStatus === 'Awaiting Principal Approval') actionWord = 'Approved';
        if (newStatus === 'Rejected by HOD' || newStatus === 'Rejected by Principal') actionWord = 'Rejected';

        if (!leave.comments) leave.comments = [];
        leave.comments.push({
            role: user.accountType,
            name: `${user.firstName} ${user.lastName}`,
            action: actionWord,
            commentText: textToSave.trim(),
            timestamp: new Date()
        });

        //: Tells the database to ONLY check the fields we changed (status & comments)
        // and ignore missing data from older test records!
        await leave.save({ validateModifiedOnly: true });
        

        // --- NEW: DEDUCT EARNED LEAVE BALANCE DIRECTLY FROM USER ---
        if (newStatus === 'Approved' && leave.category === 'Earned Leave') {
            const requestedDays = getWorkingDays(moment(leave.startDate), moment(leave.endDate));
            
            // Deduct directly from the User model's wallet
            await User.findByIdAndUpdate(leave.user._id, {
                $inc: { 
                    "leaveBalances.earnedLeave.balance": -requestedDays,
                    "leaveBalances.earnedLeave.takenThisYear": requestedDays
                }
            });
        }
        // --- END OF BALANCE DEDUCTION ---

        return res.status(200).json({
            success: true,
            message: `Leave ${newStatus.toLowerCase()} successfully`,
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

exports.editLeave = async (req, res) => {
    try {
        const { leaveId, subject, body, category, startDate, endDate, substituteTeachers } = req.body;
        const userId = req.user.id;

        // 1. Find the leave
        const leave = await Leave.findById(leaveId);
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave not found"
            });
        }

        // 2. Security Check: Does this leave belong to the person trying to edit it?
        if (leave.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only edit your own leave requests."
            });
        }

        // 3. Status Check: Is it still awaiting HOD approval?
        if (leave.status !== 'Awaiting HOD Approval') {
            return res.status(400).json({
                success: false,
                message: `You cannot edit this leave because it is already ${leave.status}.`
            });
        }

        // 4. Update the fields if they were provided in the request
        if (subject) leave.subject = subject;
        if (body) leave.body = body;
        if (category) leave.category = category;
        if (substituteTeachers) leave.substituteTeachers = substituteTeachers;

        // 5. Handle date updates carefully
        if (startDate && endDate) {
            const newStartDate = moment(startDate, "YYYY-MM-DD");
            const newEndDate = moment(endDate, "YYYY-MM-DD");

            if (!newStartDate.isValid() || !newEndDate.isValid() || newStartDate.isAfter(newEndDate)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid leave period provided."
                });
            }
            leave.startDate = newStartDate;
            leave.endDate = newEndDate;
        }

        leave.updatedAt = new Date();

        await leave.save();

        return res.status(200).json({
            success: true,
            message: "Leave updated successfully",
            data: leave,
        });

    } catch (err) {
        console.error("Edit leave error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === "development" ? err.message : undefined,
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
