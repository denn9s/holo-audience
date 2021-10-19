const mongoose = require('mongoose');

const Stream = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    member_id: { type: String, required: true},
    title: { type: String, required: true },
    thumbnail_url: { type: String, required: true },
    unique_viewer_count: { type: Number, required: true },
    times: {
        actual_start_time: { type: Date, required: true }, 
        actual_end_time: { type: Date, required: true },
        scheduled_start_time: {type: Date, required: true}
    }
});

module.exports = mongoose.model("Stream", Stream);