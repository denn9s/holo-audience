const mongoose = require('mongoose');

const Stream = new mongoose.Schema({
    id: { type: String, required: true },
    member: { type: String, required: true},
    title: { type: String, required: true },
    thumnbnail_url: { type: String, required: true },
    times: {
        actual_start_time: { type: Date, required: true }, 
        actual_end_time: { type: Date, required: true },
        scheduled_start_time: {type: Date, required: true}
    }
});

module.exports = mongoose.model("Stream", Stream);