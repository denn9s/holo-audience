const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    youtube_id: { type: String, required: true, unique: true },
    color: {
        red: { type: Number },
        green: { type: Number },
        blue: { type: Number }
    },
    group_data: {
        group_name: { type: String, required: true }, 
        generation_name: { type: String, required: true }
    }
});

module.exports = mongoose.model("Member", MemberSchema);