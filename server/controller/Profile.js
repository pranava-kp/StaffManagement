const Department = require("../model/department");
const Leave = require("../model/leave");
const Profile = require("../model/profile");
const User = require("../model/user");
const File = require("../model/file");
const { uploadFileToCloudinary } = require("../utils/fileUploader");

//Updating Profile info
exports.updateProfile = async (req, res) => {
    try {
        //Fetch data
        const {
            firstName,
            lastName,
            gender,
            dateOfBirth = "",
            about = "",
            phoneNumber,
        } = req.body;

        //Fetch User Id (coming from middleware, where we decoded JWT token)
        const id = req.user.id;

        //Validate data
        if (!gender || !phoneNumber || !id || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: "Please fill necessary fields",
            });
        }

        //Retrieving Profile details by retrieving User details first
        const userDetails = await User.findById(id);
        userDetails.firstName = firstName;
        userDetails.lastName = lastName;
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //
        //TODO: check code below if it works
        //Retrieving profile id from user details using populate
        //const profileDetails = await User.findById(id).populate("additionalDetails");
        //

        //Updating profile details
        //1. First Method
        // const updatedProfile = await Profile.findByIdAndUpdate(profileId, {
        //     gender,
        //     dateOfBirth,
        //     about,
        //     phoneNumber
        // })
        //2. Second Method
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.phoneNumber = phoneNumber;
        profileDetails.gender = gender;
        await userDetails.save();
        await profileDetails.save();
        const updatedUserDetails = await User.findById(id)
            .populate("additionalDetails")
            .exec();
        updatedUserDetails.password = null;

        //Success response
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            updatedUserDetails,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to create Profile, internal error",
            error: err.message,
        });
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

        //Removing profile from Department
        await Department.findOneAndUpdate(
            { $pull: { staffs: id } },
            { new: true }
        );

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
        const user = await User.findById(req.user._id)
            .populate('department', 'name')
            .populate('additionalDetails')
            .select('-password -token');
        
        res.status(200).json({
            success: true,
            profileData: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.additionalDetails?.phoneNumber,
                employeeId: user.employeeId,
                department: user.department?.name,
                accountType: user.accountType,
                hiringDate: user.hiringDate
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
            error: error.message
        });
    }
};