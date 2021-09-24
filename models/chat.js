const mongoose = require('mongoose');

const Chat = new mongoose.Schema({
    stream_id: { type: String, required: true },
    member_id: { type: String, required: true },
    unique_chatter_count: { type: Number, required: true },
    chatters: { type: [String], required: true }
});

module.exports.mongoose.model("Chat", Chat);