const User = require("../model/user");


exports.getAllUsers = async (req, res) => {
    try {
        // Check if the requester is authorized (Admin, HOD, or Principal)
        if (!['Admin', 'HOD', 'Principal'].includes(req.user.accountType)) {
            return res.status(403).json({
                message: "Access denied. Only Admin, HOD, or Principal can access this resource",
                success: false,
            });
        }

        // Extract filter parameters from query
        const { accountTypes, departments } = req.query;

        // Prepare the base filter object
        let filter = {};

        // If Principal is requesting and no filters are provided, return all users
        if (req.user.accountType === 'Principal' && !accountTypes && !departments) {
            // No filters needed - will return all users
        }
        // For Admin or HOD, filter by their department if no department filter is provided
        else if (['Admin', 'HOD'].includes(req.user.accountType) && !departments) {
            filter.department = req.user.department;
        }

        // Apply account type filters if provided
        if (accountTypes) {
            const typesArray = accountTypes.split(',');
            filter.accountType = { $in: typesArray };
        }

        // Apply department filters if provided
        if (departments) {
            const deptArray = departments.split(',');
            filter.department = { $in: deptArray };
        }

        // Fetch users with applied filters
        const users = await User.find(filter).select('-password -additionalDetails -__v');

        // Transform users to remove any remaining sensitive fields and convert to plain objects
        const sanitizedUsers = users.map(user => {
            const userObj = user.toObject();
            delete userObj._id; // Remove ObjectId
            return userObj;
        });

        return res.status(200).json({
            message: "Users data fetched successfully",
            data: {
                users: sanitizedUsers
            },
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message, // Send only error message to avoid exposing sensitive info
            success: false,
        });
    }
};

exports.getuserdept = async (req, res) => {
    try {
        // Fetch names and departments of all Staff and HODs except the requesting user
        const users = await User.find({
            accountType: { $in: ["Staff", "HOD"] }, // Updated to include both types
            _id: { $ne: req.user.id } // Exclude the current user
        })
            .select("firstName lastName department _id");

        return res.status(200).json({
            message: "Staff and HOD department data fetched successfully",
            data: {
                users: users
            },
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            success: false,
        });
    }
};