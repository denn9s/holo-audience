const Stream = require('../models/stream');

/**
 * Gets surrounding stream IDs (+/- 7 days)
 * @param {String} member_id - member's ID, in snake-case
 * @param {String} stream_id - YouTube stream ID
 * @returns Array of Stream objects
 */
 async function getSurroundingStreams(member_id, stream_id) {
    const stream = await Stream.findOne({id: stream_id, member_id: member_id});
    if (stream !== null) {
        let floor_date = new Date(stream.times.actual_start_time);
        floor_date = new Date(floor_date.setDate(floor_date.getDate() - 7));
        let ceiling_date = new Date(stream.times.actual_start_time);
        ceiling_date = new Date(ceiling_date.setDate(ceiling_date.getDate() + 7));
        const other_stream_array = await Stream.find({member_id: {$ne: member_id}, 
                                                    'times.actual_start_time': {$gte: floor_date, $lte: ceiling_date}});
        return other_stream_array;
    }
    return [];
}


exports.getSurroundingStreams = getSurroundingStreams;