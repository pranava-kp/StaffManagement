// const Department = require("../model/department");
const Leave = require("../model/leave");
const Profile = require("../model/profile");
const User = require("../model/user");
const File = require("../model/file");
const { uploadFileToCloudinary } = require("../utils/fileUploader");

//Updating Profile info
const jwt = require("jsonwebtoken");
exports.updateOwnProfile = async (req, res) => {
  try {
    // Get user from authenticated cookie
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Validate all required fields are present
    const { employeeId, phone, gender } = req.body;
    if (employeeId === undefined || phone === undefined || gender === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields (employeeId, phone, gender) must be provided"
      });
    }

    // Check if any fields already have values
    const existingValues = [];
    if (user.employeeId !== null && user.employeeId !== undefined) existingValues.push("employeeId");
    if (user.phone !== null && user.phone !== undefined) existingValues.push("phone");
    if (user.gender !== null && user.gender !== undefined) existingValues.push("gender");

    if (existingValues.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot modify already set fields: ${existingValues.join(", ")}`,
        fields: existingValues
      });
    }

    // Update all fields
    user.employeeId = employeeId;
    user.phone = phone;
    user.gender = gender;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        email: user.email,
        updatedFields: {
          employeeId: user.employeeId,
          phone: user.phone,
          gender: user.gender
        }
      }
    });

  } catch (err) {
    console.error("Profile update failed:", err);
    return res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: err.message
    });
  }
};

exports.adminUpdateProfile = async (req, res) => {
  try {
    console.log("🛑 Received req.body:", req.body);
    const requester = req.user;
    const { id, ...updateData } = req.body;

    // Check if requester is authorized (Principal or Admin)
    if (!["Principal", "Admin"].includes(requester.accountType)) {
      return res.status(403).json({ 
        success: false, 
        message: "Only principals or admins can perform this operation." 
      });
    }

    // Validate required fields
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Target user ID required" 
      });
    }

    // Check if trying to update password (not allowed)
    if (updateData.password) {
      return res.status(400).json({ 
        success: false, 
        message: "Password cannot be updated through this endpoint" 
      });
    }

    // Get the list of valid fields from the user schema
    const validFields = Object.keys(User.schema.paths);
    const invalidFields = Object.keys(updateData).filter(
      field => !validFields.includes(field) && field !== 'accountType'
    );

    // Reject if there are any invalid fields
    if (invalidFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid fields provided: ${invalidFields.join(', ')}` 
      });
    }

    // Find the target user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Target user not found with the provided ID" 
      });
    }

    // Handle account type changes with permission checks
    if (updateData.accountType) {
      if (requester.accountType === "Principal") {
        // Principal can set any account type
        user.accountType = updateData.accountType;
      } else if (requester.accountType === "Admin") {
        // Admin can only set to Admin or Staff
        if (!["Admin", "Staff"].includes(updateData.accountType)) {
          return res.status(403).json({ 
            success: false, 
            message: "Admins can only change account type to Admin or Staff" 
          });
        }
        user.accountType = updateData.accountType;
      }
      delete updateData.accountType; // Remove from updateData to avoid duplicate update
    }

    // Check if email is being updated to an existing email
    if (updateData.email) {
      const emailExists = await User.findOne({ 
        email: updateData.email,
        _id: { $ne: user._id } // Exclude current user from check
      });
      
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another user"
        });
      }
    }

    // Update all allowed fields including email
    for (const [key, value] of Object.entries(updateData)) {
      if (validFields.includes(key)) {
        user[key] = value;
      }
    }

    await user.save();
    
    return res.status(200).json({ 
      success: true, 
      message: "User updated successfully", 
      data: user 
    });
  } catch (err) {
    console.error("Admin update failed:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to update user", 
      error: err.message 
    });
  }
};

exports.deleteProfile = async (req, res) => {
    try {
        const { email } = req.body; // Get email from request body
        const requester = req.user; // The user making the request

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Find the user by email
        const userToDelete = await User.findOne({ email });
        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Authorization check
        if (requester.accountType === "Principal") {
            // Principal can delete anyone - no additional checks needed
        } 
        else if (requester.accountType === "Admin" || requester.accountType === "HOD") {
            // For Admin/HOD, department must match
            if (requester.department !== userToDelete.department) {
                return res.status(403).json({
                    success: false,
                    message: "You can only delete users from your own department",
                });
            }
        }

        // Delete profile image from Cloudinary if exists
        const file = await File.findOne({ user: userToDelete._id });
        if (file) {
            try {
                await cloudinary.uploader.destroy(file.publicId);
                await File.findByIdAndDelete(file._id);
            } catch (error) {
                console.error("Error deleting profile image:", error);
            }
        }

        // Delete profile (additionalDetails)
        if (userToDelete.additionalDetails) {
            await Profile.findByIdAndDelete(userToDelete.additionalDetails);
        }

        // Delete all leaves of the user
        await Leave.deleteMany({ user: userToDelete._id });

        // Finally delete the user
        await User.findByIdAndDelete(userToDelete._id);

        return res.status(200).json({
            success: true,
            message: "User and associated data deleted successfully",
        });
    } catch (err) {
        console.error("Error in deleteProfile:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to delete user profile",
            error: err.message,
        });
    }
};

//Get all User Details
exports.getAllUserDetails = async (req, res) => {
    try {
        //Get user Id
        const id = req.user.id;
        //validation to get user details
        const userDetails = await User.findById(id)
            .populate("additionalDetails")
            .exec();

        //Success response
        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            userDetails,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to fetch all User details, Internal error",
            error: err.message,
        });
    }
};

//Update DP
exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;
        const image = await uploadFileToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        );
        //Creating new File schema
        const file = new File({
            publicId: image.public_id,
            url: image.secure_url,
            user: userId,
        });
        await file.save();

        //Updating User Profile with new image
        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        )
            .populate("additionalDetails")
            .exec();
        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in image upload",
            error: error.message,
        });
    }
};
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -token");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      profileData: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        employeeId: user.employeeId,
        gender: user.gender,
        department: user.department,
        accountType: user.accountType,
        hiringDate: user.hiringDate,
      },
    });
  } catch (error) {
    console.error("Get profile failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

exports.getProfileByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email query parameter is required",
      });
    }

    // Directly use the email as received (no decoding needed)
    const exactEmail = email.trim();
    
    // Debug log to verify what's being searched
    console.log("Searching for email:", exactEmail);

    const user = await User.findOne({
      email: exactEmail  // Exact match without any transformation
    }).select("-password -token");

    if (!user) {
      // Additional debug to check what emails exist
      const allUsers = await User.find({});
      console.log("Existing emails:", allUsers.map(u => u.email));
      
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      profileData: {
        id: user._id, // Added this line to include the MongoDB _id field
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        employeeId: user.employeeId,
        gender: user.gender,
        department: user.department,
        accountType: user.accountType,
        hiringDate: user.hiringDate,
      },
    });
  } catch (error) {
    console.error("Get profile by email failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};