const fs = require('fs');
const { default: axios } = require('axios');

const BASE_URL = 'https://www.googleapis.com/youtube/v3/videos';
const DEFAULT_PARTS = ['liveStreamingDetails', 'snippet']

/**
 * Gets necessary details of inputted stream (title, thumbnail, times)
 * @param {String} input_id - ID of YouTube stream
 * @returns Object containing details of stream
 */
async function getStreamDetails(input_id) {
    var params = new URLSearchParams();
    for (var part of DEFAULT_PARTS) {
        params.append("part", part);
    }
    params.append("part", 'liveStreamingDetails');
    params.append("id", input_id);
    params.append("key", getAPIKey());
    var request = {
        params: params
    };

    try {
        const res = await axios.get(BASE_URL, request);
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
        return data;
    } catch (err) {
        console.log(err);
    }
}

/**
 * Retrieves API key from local JSON file
 * @returns String of API key
 */
function getAPIKey() {
    let data = fs.readFileSync('client_secret.json');
    let secret = JSON.parse(data)
    const api_key = secret['installed']['api_key'];
    return api_key
}

module.exports.getStreamDetails = getStreamDetails;