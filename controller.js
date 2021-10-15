const mongoose = require('mongoose');
const {getCredentials} = require('./stream_data');
const credentials = getCredentials();

const Member = require('./models/member');
const Stream = require('./models/stream');
const Intersection = require('./models/intersection');

const {getSurroundingStreams, convertIntersectsToChartData} = require('./controller_helper');

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