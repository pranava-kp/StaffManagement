const mongoose = require("mongoose");
const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    regex: {
        type: String,
        required: true,
    },
    hod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    staffs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
});

module.exports = mongoose.model("Department", departmentSchema);
