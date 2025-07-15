const User = require("../model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
exports.login = async (req, res) => {
    try {
        //fetch the data from the req body;
        const { email, password } = req.body;
        //check user already exist in the database or not
        const response = await User.findOne({ email: email });

        if (!response) {
            return res.status(400).json({ message: "User does not exist" });
        }
        const playload = {
            email: response.email,
            id: response._id,
            accountType: response.accountType,
        };
        if (await bcrypt.compare(password, response.password)) {
            const token = jwt.sign(playload, process.env.JWT_SECRET, {
                expiresIn: "7d",
            });
            console.log(token);
            const olderUser = response.toObject();
            olderUser.token = token;
            olderUser.password = undefined;
            console.log(olderUser);
            const option = {
                expiresIn: new Date(Date.now() + 3 * 60 * 60 * 1000),
                httpsOnly: true,
            };

            return res.cookie("token", token, option).status(200).json({
                message: "login successfully",
                success: true,
                token: token,
                user: olderUser,
            });
        } else {
            return res.status(404).json({ message: "password is not match" });
        }
    } catch (error) {
        return res
            .status(500)
            .json({ message: "internal server error", error: error });
    }
};
