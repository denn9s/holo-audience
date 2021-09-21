const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    youtube_id: { type: String, required: true },
    total_videos: {type: Number },
    group_data: {
        group_name: { type: String, required: true }, 
        generation_name: { type: String, required: true }
    }
});

module.exports = mongoose.model("Member", MemberSchema);