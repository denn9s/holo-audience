const mongoose = require('mongoose');

const Stream = require('../models/stream');
const Chat = require('../models/chat');
const Intersection = require('../models/intersection');

const {getCredentials} = require('../stream_data');
const {getSurroundingStreams} = require('./update_helper');

const credentials = getCredentials();
// mongoose.connect('mongodb://localhost:27017/holo', { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connect(`mongodb+srv://${credentials.mongo_username}:${credentials.mongo_password}@${credentials.mongo_database}?retryWrites=true&w=majority`)
    .then(() => {
        console.log("Connection successful!");
    })
    .catch(err => {
        console.log("Error! Connection unsuccessful!");
        console.log(err);
    });

/**
 * Reupdates all intersections (mainly for maintenance and fixing incorrect entries)
 */
async function refreshIntersections() {
    let all_streams = await Stream.find({});
    for (let stream of all_streams) {
        let stream_id = stream.id;
        let stream_member_id = stream.member_id;
        // let other_stream_array = await Stream.find({id: {$ne: stream.id}, member_id: {$ne: stream.member_id}});
        let other_stream_array = await getSurroundingStreams(stream_member_id, stream_id, 7);
        for (let other_stream of other_stream_array) {
            let other_stream_id = other_stream.id;
            let other_stream_member_id = other_stream.member_id;
            let common_chatter_object = await Chat.aggregate([
                {$match: {stream_id: {$in: [stream_id, other_stream_id]}}},
                {$group: {_id: 0, chat1: {$first: "$chatters"}, chat2: {$last: "$chatters"}}},
                {$project: {common_chatters: {$setIntersection: ["$chat1","$chat2"]}, _id: 0}}
            ]);
            let common_chatter_count = common_chatter_object[0].common_chatters.length;
            let possible_intersection = await Intersection.findOneAndUpdate({first_stream_id: stream_id, second_stream_id: other_stream_id}, {common_count: common_chatter_count});
            if (possible_intersection === null) {
                possible_intersection = await Intersection.findOneAndUpdate({first_stream_id: other_stream_id, second_stream_id: stream_id}, {common_count: common_chatter_count});
                if (possible_intersection === null) {
                    possible_intersection = new Intersection({first_stream_id: stream_id, first_stream_member_id: stream_member_id,
                                                            second_stream_id: other_stream_id, second_stream_member_id: other_stream_member_id,
                                                            common_count: common_chatter_count});
                    await possible_intersection.save(function (err, res) {
                        if (err) return console.log(err);    
                    });
                }
            }
            console.log(`${possible_intersection.first_stream_member_id}: ${possible_intersection.first_stream_id} and ${possible_intersection.second_stream_member_id}: ${possible_intersection.second_stream_id}`);
        }
    }
    console.log("Successfully refreshed all intersections.");
}