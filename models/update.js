const mongoose = require('mongoose');

const MemberUpdateSchema = new mongoose.Schema({
    member_id: { type: String, required: true, unique: true },
    total_videos: {type: Number },
    most_recent_video_id: { type: String },
    most_recent_video_date: { type: Date },
});

module.exports = mongoose.model("MemberUpdate", MemberUpdateSchema);