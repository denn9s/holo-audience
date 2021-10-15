const Intersection = require('./models/intersection');
const Stream = require('./models/stream');

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

/**
 * 
 * @param {Object} stream - Stream object from MongoDB
 * @param {Array} other_stream_array - array of surrounding Stream objects from MongoDB
 * @returns Array of chart data objects that contain coordinates and member names
 */
async function convertIntersectsToChartData(stream, other_stream_array) {
    let chart_data = []
    for (let other_stream of other_stream_array) {
        let intersect = await Intersection.findOne({first_stream_id: stream.id, second_stream_id: other_stream.id});
        if (intersect === null) {
            intersect = await Intersection.findOne({first_stream_id: other_stream.id, second_stream_id: stream.id});
        }
        const other_stream_date = new Date(other_stream.times.actual_start_time);
        const data = {x: other_stream_date.toString(), y: intersect.common_count, other_member_id: other_stream.member_id, other_stream_id: other_stream.id, other_stream_title: other_stream.title};
        chart_data.push(data);
    }
    return chart_data;
}


exports.getSurroundingStreams = getSurroundingStreams;
exports.convertIntersectsToChartData = convertIntersectsToChartData;