const mongoose = require('mongoose');
const {getCredentials} = require('./stream_data');
const credentials = getCredentials();

const Member = require('./models/member');
const Stream = require('./models/stream');
const Intersection = require('./models/intersection');

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

/**
 * Route for loading member listing homepage (to show all available members)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
 async function getHomepage(req, res) {
    const member_array = await Member.find({});
    res.render('homepage', { member_array });
}

/**
 * Route for member page (i.e. www.website.com/member_name)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getMember(req, res) {
    const { member_id } = req.params;
    const member = await Member.findOne({id: member_id});
    if (member === null) {
        res.status(404).send('Sorry, page doesn\'t exist!');
        return;
    }
    let stream_id = null;
    const member_name = member.name;
    let all_streams = await Stream.find({member_id: member.id})
    // if stream_id is provided in route
    if (req.params.hasOwnProperty('stream_id')) {
        stream_id = req.params.stream_id;
    }
    res.render('member', { member_id, member_name, all_streams, stream_id });
}

/**
 * Route for member page with stream ID in request (i.e. www.website.com/member_name/stream_id)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getStream(req, res) {
    getMember(req, res);
}

/**
 * Route for unknown webpage (i.e. www.website.com/blahblahblah)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getError(req, res) {
    res.status(404).send('Sorry, page doesn\'t exist!');
}

/**
 * API route for retrieving formatted chart data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getChartData(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const { member_id, stream_id } = req.params;
    let stream = await Stream.findOne({id: stream_id});
    let surround_stream_id_array = await getSurroundingStreams(member_id, stream_id);
    let chart_data = await convertIntersectsToChartData(stream, surround_stream_id_array);
    // creating new data array for each other member to add to datasets
    final_chart_data = [];
    for (let item of chart_data) {
        // checking of label exists
        if (final_chart_data.some(x => x.label === item.other_member_id)) {
            for (let index in final_chart_data) {
                if (final_chart_data[index].label === item.other_member_id) {
                    final_chart_data[index].data.push({x: Date.parse(item.x), y: item.y, stream_id: item.other_stream_id, stream_title: item.other_stream_title});
                    break;
                }
            }
        } else {
            let current_member = await Member.findOne({id: item.other_member_id});
            let input_data = {
                label: item.other_member_id,
                stream_member: current_member.name,
                data: [],
                // showLine: true,
                // borderWidth: 1,
                // borderColor: `rgba(${current_member.color.red}, ${current_member.color.green}, ${current_member.color.blue}, 0.4)`,
                radius: 5,
                backgroundColor: `rgb(${current_member.color.red}, ${current_member.color.green}, ${current_member.color.blue})`
            }
            final_chart_data.push(input_data);
            final_chart_data[final_chart_data.length - 1].data.push({x: Date.parse(item.x), y: item.y, stream_id: item.other_stream_id, stream_title: item.other_stream_title});
        }
    }
    res.json(final_chart_data); 
}

// regular route
exports.getHomepage = getHomepage;
exports.getStream = getStream;
exports.getMember = getMember;
exports.getError = getError;

// api route
exports.getChartData = getChartData;