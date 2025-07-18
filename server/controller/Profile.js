const Department = require("../model/department");
const Leave = require("../model/leave");
const Profile = require("../model/profile");
const User = require("../model/user");
const File = require("../model/file");
const { uploadFileToCloudinary } = require("../utils/fileUploader");

//Updating Profile info
const jwt = require("jsonwebtoken");
exports.updateOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (req.user.accountType !== "Staff") {
      return res.status(403).json({ success: false, message: "Only staff can access this route." });
    }

    const { employeeId, phone, gender } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (employeeId) user.employeeId = employeeId;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;

    await user.save();
    return res.status(200).json({ success: true, message: "Profile updated", data: user });
  } catch (err) {
    console.error("Staff profile update failed:", err);
    return res.status(500).json({ success: false, message: "Error updating profile", error: err.message });
  }
};

exports.adminUpdateProfile = async (req, res) => {
  try {
    const requester = req.user;

    if (requester.accountType !== "Principal") {
      return res.status(403).json({ success: false, message: "Only principals can perform this operation." });
    }

    const { id, department, employeeId, phone, gender } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: "Target user ID required" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "Target user not found" });

    if (department) user.department = department;
    if (employeeId) user.employeeId = employeeId;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;

    await user.save();
    return res.status(200).json({ success: true, message: "User updated successfully", data: user });
  } catch (err) {
    console.error("Admin update failed:", err);
    return res.status(500).json({ success: false, message: "Failed to update user", error: err.message });
  }
};



//Delete Account
exports.deleteProfile = async (req, res) => {
    try {
        //Fetch data
        const id = req.user.id;
        //Validate Id
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: "Invalid User Id",
            });
        }

        //DELETE USER PROFILE

        //Removing profile image from cloudinary and delete that file schema from database
        let imageId = null;
        let imagePublicId = null;
        File.findOne({ user: id }, (error, file) => {
            if (error) {
                console.error(error);
            } else if (file) {
                imageId = file._id;
                imagePublicId = file.publicId;
                console.log("ImageId:", imageId);
                console.log("ImagePublicId", imagePublicId);
            } else {
                console.log("Object not found");
            }
        });
        cloudinary.uploader.destroy(imageId, (error, result) => {
            if (error) {
                console.error("Error in delete profile pic: ", error);
            } else {
                console.log("Result after deleting file: ", result);
                console.log("File deleted successfully");
            }
        });
        await File.findByIdAndDelete(imageId); //Deleting file schema

        //First we're deleting User's profile additional Details
        await Profile.findByIdAndDelete(userDetails.additionalDetails);

        //Removing all leaves of the user
        await Leave.deleteMany({ user: id });

        //Now we're deleting all details of the User
        await User.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to delete User profile, Internal error",
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