const mongoose = require('mongoose');

const Intersection = new mongoose.Schema({
    first_stream_id: { type: String, required: true, unique: false },
    first_stream_member_id: { type: String, required: true},
    second_stream_id: { type: String, required: true, unique: false },
    second_stream_member_id: { type: String, required: true},
    common_count: { type: Number, required: true }
});

Intersection.index({ first_stream_id: 1, second_stream_id: 1 }, { unique: true });

module.exports = mongoose.model("Intersection", Intersection);