const mongoose = require("mongoose");
const profileSchema = new mongoose.Schema({
    dateOfBirth:{
        type: Date,
        default: null
    },
    phoneNumber:{
        type: Number,
        trim: true,
    },
    gender:{
        type: String,
    },
    leaves:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Leave",
        }
    ],
})

module.exports = mongoose.model("Profile", profileSchema);