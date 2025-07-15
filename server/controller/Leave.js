const Leave = require("../model/leave");
const User = require("../model/user");
const Profile = require("../model/profile");
const moment = require("moment");
const { becameSubstituteTeacher } = require("../mail/templates/becameSubstituteTeacher");
const mailSender = require("../utils/mailSender");

exports.createLeave = async (req, res) => {
    try {
        const { subject, body, category, substituteTeachers } = req.body;
        const startDate = moment(req.body.startDate, "YYYY-MM-DD");
        const endDate = moment(req.body.endDate, "YYYY-MM-DD");
        // console.log(subject, body, category, startDate, endDate, substituteTeachers)
        if (
            !subject ||
            !body ||
            !startDate ||
            !endDate ||
            !category ||
            !substituteTeachers
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Checking if dates are valid and if End date is before Start date
        if (
            !startDate.isValid() ||
            !endDate.isValid() ||
            startDate.isAfter(endDate)
        ) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid leave period." });
        }
        const user = req.user;
        // console.log(user);

        // Checking if Leave count are available at the backend
        const profile = await User.findById(user.id).populate({
            path: "additionalDetails",
            populate: {
                path: "leaves",
            },
        });
        const absentTeacherName = `${profile.firstName} ${profile.lastName}`
        const additionalDetails = profile.additionalDetails;
        console.log("additionalDetails: ", additionalDetails);

        //Calculating the no. of leaves user already taken
        const totalDaysTaken = additionalDetails.leaves.reduce(
            (total, leave) => {
                const leaveDuration =
                    Math.ceil(
                        (leave.endDate - leave.startDate) /
                            (1000 * 60 * 60 * 24)
                    ) + 1;
                return total + leaveDuration;
            },
            0
        );

        // Printing Suff
        console.log("total leaves user already took: ", totalDaysTaken);
        console.log("startDate: ", startDate);
        console.log("endDate: ", endDate);
        const dateDifferenceInDays = endDate.diff(startDate, "days") + 1;
        console.log(
            "dateDifferenceInDays for current leave duration user is asking for: ",
            dateDifferenceInDays
        );

        // Returning if days difference is low
        if (dateDifferenceInDays > 12 - totalDaysTaken) {
            return res.status(400).json({
                success: false,
                message: "Leave duration cannot be more than left leaves",
            });
        }

        // After checking all the conditions, create the leave
        const leave = await Leave.create({
            user: user.id,
            category,
            subject,
            body,
            startDate,
            endDate,
            substituteTeachers,
        });

        // Push the leave to the user's profile
        await Profile.findByIdAndUpdate(
            additionalDetails._id,
            {
                $push: {
                    leaves: leave._id,
                },
            },
            { new: true }
        );

        // Send email to substitute teachers
        try {
            const extractEmails = (data) => {
                const emails = [];

                // Get the keys of the data object
                const days = Object.keys(data);
                console.log("Days error wala:", days)
                days.forEach((dayKey, dayIndex) => {
                    // Use dayIndex + 1 to convert Day1 to 1, Day2 to 2, and so on
                    const dayNumber = dayIndex + 1;
                    data[dayKey].forEach((person) => {
                        emails.push({
                            dayToAdd: dayNumber - 1,
                            name: `${person.firstName} ${person.lastName}`,
                            email: person.email,
                        });
                    });
                });

                return emails;
            };
            const emails = extractEmails(substituteTeachers);
            console.log(emails);
            // Output:
            // [
            //   { day: 0, name: Tanishq, email: '1rn21cs170.tanishqrinjay@rnsit.ac.in' },
            //   { day: 1, name: Rohit, email: 'sharmarohit@gmail.com' }
            // ]

            // Function to loop over the mail array and call sendMessageToBackend
            const processMails = async (emails) => {
                for (const { dayToAdd, name, email } of emails) {
                    await mailSender(
                            email,
                            "Substitute Assignment",
                            becameSubstituteTeacher(
                                startDate,
                                dayToAdd,
                                name,
                                `${absentTeacherName}`
                            )
                        );
                    console.log(`Message sent for day ${dayToAdd} to ${email}`);
                }
            };

            // Call the processMails function with the mail array
            processMails(emails)
        } catch (error) {
            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.error("Error occurred while sending email:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            });
        }

        return res.status(200).json({
            message: `Leave created successfully for ${dateDifferenceInDays} days`,
            success: true,
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            error: err.message,
            success: false,
        });
    }
};

exports.getAllUserLeaves = async (req, res) => {
    try {
        const user = req.user;
        console.log("User id: ", user.id);
        const leaves = await Leave.find({ user: user.id });
        const totalLeavesTaken = leaves.reduce((total, leave) => {
            const leaveDuration =
                Math.ceil(
                    (leave.endDate - leave.startDate) / (1000 * 60 * 60 * 24)
                ) + 1;
            return total + leaveDuration;
        }, 0);
        return res.status(200).json({
            message: "All leaves fetched successfully",
            data: {
                leaves,
                totalLeavesTaken,
            },
            success: true,
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};
