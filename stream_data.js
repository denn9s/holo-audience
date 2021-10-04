const fs = require('fs');
const { default: axios } = require('axios');

const STREAM_API_BASE = 'https://www.googleapis.com/youtube/v3/videos';
const STREAM_API_PARTS = ['liveStreamingDetails', 'snippet'];
const MEMBER_API_BASE = 'https://www.googleapis.com/youtube/v3/channels';
const MEMBER_API_PARTS = ['snippet'];

/**
 * Gets member's avatar image link
 * @param {String} member_id - ID of member
 * @returns - String containing URL of avatar image
 */
async function getMemberThumbnail(member_id) {
    var params = new URLSearchParams();
    for (let part of MEMBER_API_PARTS) {
        params.append("part", part);
    }
    params.append("id", member_id);
    params.append("key", getCredentials().api_key);
    var request = {
        params: params
    };
    try {
        const res = await axios.get(MEMBER_API_BASE, request);
        return res.data.items[0].snippet.thumbnails.medium.url;
    } catch (err) {
        console.log(err);
    }
}

/**
 * Gets necessary details of inputted stream (title, thumbnail, times)
 * @param {String} input_id - ID of YouTube stream
 * @returns Object containing details of stream
 */
async function getStreamDetails(input_id) {
    var params = new URLSearchParams();
    for (var part of STREAM_API_PARTS) {
        params.append("part", part);
    }
    params.append("id", input_id);
    params.append("key", getCredentials().api_key);
    var request = {
        params: params
    };

    try {
        const res = await axios.get(STREAM_API_BASE, request);
        var stream_title = res.data.items[0].snippet.title;
        var thumbnail_url = res.data.items[0].snippet.thumbnails.default.url;
        var stream_time_data = res.data.items[0].liveStreamingDetails;
        var data = {"stream_title": stream_title,
                    "thumbnail_url": thumbnail_url,
                    "stream_time_data": {
                        "actual_start_time": stream_time_data.actualStartTime,
                        "actual_end_time": stream_time_data.actualEndTime,
                        "scheduled_start_time": stream_time_data.scheduledStartTime
                    }};
        console.log(data);
        return data;
    } catch (err) {
        console.log(err);
    }
}

/**
 * Retrieves credentials from local JSON file
 * @returns Object of credentials
 */
function getCredentials() {
    let data = fs.readFileSync('credentials.json');
    let secret = JSON.parse(data);
    const api_key = secret['api_key'];
    const mongo_username = secret['mongo_username'];
    const mongo_password = secret['mongo_password'];
    const mongo_database = secret['mongo_database'];
    return ({api_key: api_key, mongo_username: mongo_username, mongo_password: mongo_password, mongo_database: mongo_database});
}

module.exports.getMemberThumbnail = getMemberThumbnail;
module.exports.getStreamDetails = getStreamDetails;
module.exports.getCredentials = getCredentials;