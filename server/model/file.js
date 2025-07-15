const mongoose = require("mongoose");
const fileSchema = new mongoose.Schema({
    publicId:{
        type: String,
        default: null
    },
    url: {
        type: String,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
});
module.exports = mongoose.model("File", fileSchema);
