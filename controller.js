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

async function getSurroundingStreamIDs(member_id, stream_id) {
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

async function convertStreamsForChart(stream, other_stream_array) {
    let chart_data = []
    for (let other_stream of other_stream_array) {
        let intersect = await Intersection.findOne({first_stream_id: stream.id, second_stream_id: other_stream.id});
        if (intersect === null) {
            intersect = await Intersection.findOne({first_stream_id: other_stream.id, second_stream_id: stream.id});
        }
        const other_stream_date = new Date(other_stream.times.actual_start_time);
        const data = {x: other_stream_date.toString(), y: intersect.common_count};
        chart_data.push(data);
    }
    return chart_data;
}


async function getHomepage(req, res) {
    res.render('homepage');
}

async function getMember(req, res) {
    const { member_id } = req.params;
    const member = await Member.findOne({id: member_id});
    const member_name = member.name;
    let all_streams = await Stream.find({member_id: member.id})
    const chart_data = [];
    // const all_streams = [];
    if (member !== null) {
        res.render('member', { member_id, member_name, chart_data, all_streams });
    } else {
        res.status(404).send('Sorry, page doesn\'t exist!');
    }
}

async function getError(req, res) {
    res.status(404).send('Sorry, page doesn\'t exist!');
}

async function getSurroundingChartData(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const { member_id, stream_id } = req.params;
    let stream = await Stream.findOne({id: stream_id});
    let surround_stream_id_array = await getSurroundingStreamIDs(member_id, stream_id);
    let chart_data = await convertStreamsForChart(stream, surround_stream_id_array);
    res.json(chart_data); 
}

exports.getSurroundingChartData = getSurroundingChartData;
exports.getHomepage = getHomepage;
exports.getMember = getMember;
exports.getError = getError;