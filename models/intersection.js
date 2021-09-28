const mongoose = require('mongoose');

const Intersection = new mongoose.Schema({
    first_stream_id: { type: String, required: true },
    first_stream_member_id: { type: String, required: true},
    second_stream_id: { type: String, required: true },
    second_stream_member_id: { type: String, required: true},
    common_count: { type: Number, required: true }
});

module.exports = mongoose.model("Intersection", Intersection);