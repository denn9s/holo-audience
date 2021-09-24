const mongoose = require('mongoose');

const MemberUpdateSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    total_videos: {type: Number },
    last_added_video_id: { type: String },
    last_added_video_date: { type: Date },
});

module.exports = mongoose.model("MemberUpdate", MemberUpdateSchema);