const User = require("../model/user");


exports.getAllUsers = async (req, res)=>{
    try {
        const users = await User.find();
        const usersDataWithoutPassword = users.map(user => {
            const userObject = user.toObject();
            const { password, ...rest } = userObject;
            return rest;
          });
          console.log("modified user details: ", usersDataWithoutPassword)
        return res.status(200).json({
            message:"All users data fetched successfully",
            data:{
                users: users
            },
            success: true,
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error,
            success: false,
        });
    }
}