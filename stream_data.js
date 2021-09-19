const fs = require('fs');
const { default: axios } = require('axios');

const BASE_URL = 'https://www.googleapis.com/youtube/v3/videos';
const DEFAULT_PARTS = ['liveStreamingDetails', 'snippet']

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
        var thumbnail_url = res.data.items[0].snippet.thumbnails.maxres.url;
        var stream_time_data = res.data.items[0].liveStreamingDetails;
        var data = {"stream_title": stream_title,
                    "thumnbnail_url": thumbnail_url,
                    "stream_time_data": stream_time_data};
        return data;
    } catch (err) {
        console.log(err);
    }
}

function getAPIKey() {
    let data = fs.readFileSync('client_secret.json');
    let secret = JSON.parse(data)
    const api_key = secret['installed']['api_key'];
    return api_key
}

module.exports.getStreamDetails = getStreamDetails;