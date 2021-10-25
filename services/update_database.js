const mongoose = require('mongoose');
const {PythonShell} = require('python-shell');

const Member = require('../models/member');
const Stream = require('../models/stream');
const Chat = require('../models/chat');
const MemberUpdate = require('../models/update');
const Intersection = require('../models/intersection');

const {getStreamDetails, getCredentials} = require('../stream_data');
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
 * Gets all member IDs in database
 * @param {String} generation_id - generation's ID, blank for all
 * @returns array of member IDs
 */
 async function getAllMembers(generation_id) {
    let member_array;
    if (generation_id === '') { member_array = await Member.find({}); }
    else { member_array = await Member.find({"group_data.generation_name": generation_id}); }
    if (member_array.length > 0) {
        member_id_array = [];
        for (let mem of member_array) {
            member_id_array.push(mem.id);
        }
        return member_id_array;
    }
}

/**
 * Gets current YouTube streams
 * @param {String} member_id - member's ID, in snake-case
 * @returns array of YouTube stream IDs
 */
async function getAllStreams(member_id) {
    let stream_id_list = [];
    let member = await Member.findOne({id: member_id});
    return new Promise (async (resolve, reject) => {
        yt_id = member.youtube_id;
        let pyshell = new PythonShell('get_stream_list.py', {mode: 'text', args: [yt_id]});
        pyshell.on('message', function (id) {
            stream_id_list.push(id);
        });
        pyshell.end(function (err) {
            if (err) reject(err);
            resolve(stream_id_list);
        });
    })
}

/**
 * Compares current YouTube streams to streams stored in database
 * @param {String} member_id - member's ID, in snake-case
 * @returns array of new stream IDs
 */
async function getNewStreams(member_id) {
    // let current_stream_id_list = await getStreamsFromFile(member_id);
    let current_stream_id_list = await getAllStreams(member_id);
    let new_stream_id_list = [];
    for (let stream_id of current_stream_id_list) {
        if ((await Stream.exists({id: stream_id})) === false) {
            new_stream_id_list.push(stream_id);
        }
    }
    return new_stream_id_list;
}

/**
 * Gets stream list from HTML file (for manual updating) - BE CAREFUL WITH THIS
 * @param {String} member_id - member's ID, in snake-case
 * @param {String} file_name - HTML file name of video listing page
 * @returns - array of YouTube video/stream IDs
 */
 async function getStreamsFromFile(member_id, file_name) {
    let stream_id_list = [];
    let member = await Member.findOne({id: member_id});
    return new Promise (async (resolve, reject) => {
        yt_id = member.youtube_id;
        let pyshell = new PythonShell('get_stream_list_manual.py', {mode: 'text', args: [yt_id, file_name]});
        pyshell.on('message', function (id) {
            stream_id_list.push(id);
        });
        pyshell.end(function (err) {
            if (err) reject(err);
            resolve(stream_id_list);
        });
    })
}

/**
 * Gets chat data
 * @param {String} stream_id - YouTube video ID
 * @returns Object that contains necessary data
 */
 async function getChatData(stream_id) {
    const base_url = 'https://www.youtube.com/watch?v='
    const stream_url = base_url + stream_id;
    let options = { mode: 'json', args: [stream_url], pythonOptions: ['-u'] };
    let chat_object = {}
    console.log(`Attempting to get chat for ID: ${stream_id}...`)
    return new Promise (async (resolve, reject) => {
        let pyshell = new PythonShell('get_viewers.py', options);
        pyshell.on('message', function (res) {
            chat_object = res;
        });
        pyshell.end(function (err) {
            if (err) reject(err);
            resolve(chat_object);
        });
    })
}

/**
 * Adds new stream to database and updates member update database
 * @param {String} member_id - member's ID, in snake-case
 * @param {String} stream_id - YouTube video ID
 * @param {Object} stream_details - details of stream (i.e. stream ID, thumbnails)
 */
async function addNewStream(member_id, stream_id, stream_details, chatter_count) {
    const stream = new Stream({id: stream_id, member_id: member_id,
        title: stream_details.stream_title,
        thumbnail_url: stream_details.thumbnail_url,
        unique_viewer_count: chatter_count,
        times: {
            actual_start_time: stream_details.stream_time_data.actual_start_time,
            actual_end_time: stream_details.stream_time_data.actual_end_time,
            scheduled_start_time: stream_details.stream_time_data.scheduled_start_time
        }});
    await stream.save(function (err, res) {
        if (err) return console.log(err);
        console.log(`Added to Stream DB - ID: ${res.id} for Member: ${res.member_id}`);
    });
}

/**
 * Adds chat data to database
 * @param {String} stream_id - YouTube video ID
 * @param {String} member_id - member's ID, in snake-case
 * @returns Boolean indicating success or failure
 */
async function addChatData(stream_id, member_id) {
    let stream_data = await getChatData(stream_id);
    let chatter_count = 0;
    if (stream_data.success === 1) {
        let chat = new Chat({stream_id: stream_id, member_id: member_id, 
            unique_chatter_count: stream_data.unique_chatter_count,
            chatters: stream_data.chatter_list});
        chatter_count = stream_data.unique_chatter_count;
        await chat.save(function (err, res) {
            if (err) return console.log(err);
            console.log(`Added to Chat DB - ID: ${res.stream_id} for Member: ${res.member_id}`);
        })
        return {success: true, chatter_count: chatter_count};
    } else {
        console.log('ERROR: Could not add to Chat database! No chat replay found.');
        return {success: false, chatter_count: chatter_count};
    }
}

/**
 * Adds chat intersections (count) to database
 * @param {String} first_stream_id - YouTube video ID
 * @param {String} second_stream_id - YouTube video ID
 */
async function addIntersection(first_stream_id, first_stream_member, second_stream_id, second_stream_member) {
    let common_chatter_object = await Chat.aggregate([
        {$match: {stream_id: {$in: [first_stream_id, second_stream_id]}}},
        {$group: {_id: 0, chat1: {$first: "$chatters"}, chat2: {$last: "$chatters"}}},
        {$project: {common_chatters: {$setIntersection: ["$chat1","$chat2"]}, _id: 0}}
    ]);
    let common_chatter_count = common_chatter_object[0].common_chatters.length;
    let possible_intersection = await Intersection.findOne({first_stream_id: second_stream_id, second_stream_id: first_stream_id});
    if (possible_intersection === null) {
        possible_intersection = await Intersection.findOne({first_stream_id: first_stream_id, second_stream_id: second_stream_id});
        if (possible_intersection === null) {
            let intersection = new Intersection({first_stream_id: first_stream_id, first_stream_member_id: first_stream_member,
                second_stream_id: second_stream_id, second_stream_member_id: second_stream_member,
                common_count: common_chatter_count});
            await intersection.save(function(err, res) {
                if (err) return console.log(err);
            })
        } else {
            console.log('ERROR: Intersection already exists.');
        }
    } else {
        console.log('ERROR: Intersection already exists.');
    }
}


/**
 * Adds most recent update data to database
 * @param {String} member_id - member's ID, in snake-case
 */
async function addMemberUpdate(member_id) {
    let stream_count = await Stream.countDocuments({member_id: member_id});
    let latest_streams = await Stream.find().sort({"times.actual_start_time": -1}).limit(1);
    let latest_stream = latest_streams[0];
    const update = {total_videos: stream_count,
                    most_recent_video_id: latest_stream.id, 
                    most_recent_video_date: latest_stream.times.actual_start_time};
    const member_update = await MemberUpdate.findOneAndUpdate({member_id: member_id}, update);
    await member_update.save(function (err, res) {
        if (err) return console.log(err);
        console.log(`Added to MemberUpdate DB - ID:${res.most_recent_video_id} for Member: ${res.member_id} on Date: ${res.most_recent_video_date}\n`);      
    });
}

/**
 * Adds new streams and chat to relevant databases for a single member
 * @param {String} member_id - member's ID, in snake-case
 */
async function updateMemberStreamsAndChat(member_id) {
    const new_stream_array = await getNewStreams(member_id);
    for (let stream_id of new_stream_array) {
        const stream_details = await getStreamDetails(stream_id);
        let chat = await addChatData(stream_id, member_id);
        if (chat.success === true) {
            await addNewStream(member_id, stream_id, stream_details, chat.chatter_count);
            // let other_stream_array = await Stream.find({id: {$ne: stream_id}, member_id: {$ne: member_id}});
            let other_stream_array = await getSurroundingStreams(member_id, stream_id, 7);
            for (let stream of other_stream_array) {
                await addIntersection(stream_id, member_id, stream.id, stream.member_id);
            }
        } else {
            console.log("ERROR! Live chat was not available!");
        }
    }
    const latestStream = (await Stream.find({member_id: member_id}).sort({'times.actual_start_time': -1}).limit(1))[0];
    await addMemberUpdate(member_id, latestStream.id, latestStream.times.actual_start_time);
}

/**
 * Updates all databases with all members
 * @param {String} generation_id - generation's ID, blank for all
 */
async function updateAll(generation_id) {
    const member_array = await getAllMembers(generation_id);
    for (let member_id of member_array) {
        await updateMemberStreamsAndChat(member_id);
    }
}

// test("ouro_kronii", "lYpfa4-A13o");