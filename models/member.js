const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    last_added_video_id: { type: String },
    last_added_video_date: { type: Date },
    group_data: {
        group_name: { type: String, required: true },
        generation_name: { type: String, required: true }
    },
    youtube_data: {
        youtube_id: { type: String, required: true },
        uploads_id: { type: String, required: true }
    }
});

module.exports = mongoose.model("Member", MemberSchema);