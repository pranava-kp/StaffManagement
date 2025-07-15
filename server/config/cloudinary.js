const cloudinary = require('cloudinary').v2;
require("dotenv").config();
const name=process.env.cloudname;
const key=process.env.clouAPI;
const secret=process.env.api_secret;
exports.cloudinaryConfig = () => {

    try{
        cloudinary.config({
            cloud_name: name,
            api_key: key,
            api_secret: secret,
        });
    }
    catch(err){
        console.log(err);
    }
}