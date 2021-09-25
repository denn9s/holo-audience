const mongoose = require('mongoose');
const {PythonShell} = require('python-shell');

const Member = require('../models/member');
const Stream = require('../models/stream');
const Chat = require('../models/chat');
const MemberUpdate = require('../models/update');

const {getStreamDetails} = require('../stream_data');

mongoose.connect('mongodb://localhost:27017/holo', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connection successful!");
    })
    .catch(err => {
        console.log("Error! Connection unsuccessful!");
        console.log(err);
    });

/**
 * Gets all member IDs in database
 * @returns array of member IDs
 */
 async function getAllMembers() {
    const member_array = await Member.find();
    member_id_array = [];
    for (let mem of member_array) {
        member_id_array.push(mem.id);
    }
    return member_id_array;
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
 * Gets chat data
 * @param {String} stream_id - YouTube video ID
 * @returns Object that contains necessary data
 */
 async function getChatData(stream_id) {
    const base_url = 'https://www.youtube.com/watch?v='
    const stream_url = base_url + stream_id;
    let options = { mode: 'json', args: [stream_url], pythonOptions: ['-u'] };
    let chat_object = {}
    return new Promise (async (resolve, reject) => {
        let pyshell = new PythonShell('get_viewers.py', options);
        pyshell.on('message', function (id) {
            chat_object = id;
        });
        pyshell.end(function (err) {
            if (err) reject(err);
            resolve(chat_object);
        });
    })
}

/**
 * Adds new YouTube streams to database
 * @param {String} member_id - member's ID, in snake-case
 */
async function addNewStreams(member_id) {
    const new_stream_array = await getNewStreams(member_id);
    for (let stream_id of new_stream_array) {
        const stream_details = await getStreamDetails(stream_id);
        const stream = new Stream({id: stream_id, member_id: member_id,
                                title: stream_details.stream_title,
                                thumbnail_url: stream_details.thumbnail_url,
                                times: {
                                    actual_start_time: stream_details.stream_time_data.actual_start_time,
                                    actual_end_time: stream_details.stream_time_data.actual_end_time,
                                    scheduled_start_time: stream_details.stream_time_data.scheduled_start_time
                                }});
        await stream.save(function (err, res) {
            if (err) return console.log(err);
            console.log(`Added to Stream DB - ID: ${res.id} for Member: ${member_id}!`);
            addMemberUpdate(member_id, stream_id, stream_details.stream_time_data.actual_start_time);
        });
    }
}

/**
 * Adds chat data to database
 * @param {String} stream_id - YouTube video ID
 * @param {String} member_id - member's ID, in snake-case 
 */
async function addChatData(stream_id, member_id) {
    let stream_data = await getChatData(stream_id);
    console.log(stream_data);
    if (stream_data.success === 1) {
        let chat = new Chat({stream_id: stream_id, member_id: member_id, 
            unique_chatter_count: stream_data.unique_chatter_count,
            chatters: stream_data.chatter_list});
        await chat.save(function (err, res) {
            if (err) return console.log(err);
            console.log(`Added to Chat DB - Stream ID: ${stream_id} for Member: ${member_id}!`);
        })
    } else {
        console.log('Error!');
    }
}

/**
 * Adds most recent update data to database
 * @param {String} member_id - member's ID, in snake-case 
 * @param {String} stream_id - YouTube video ID
 * @param {String} stream_date - actual start date/time
 */
async function addMemberUpdate(member_id, stream_id, stream_date) {
    var stream_count = await Stream.countDocuments({member_id: member_id});
    const update = {total_videos: stream_count,
                    last_added_video_id: stream_id, 
                    last_added_video_date: stream_date};
    const member_update = await MemberUpdate.findOneAndUpdate({member_id: member_id}, update);
    await member_update.save(function (err, res) {
        if (err) return console.log(err);
        console.log(`Added to MemberUpdate DB - ID:${stream_id} for Member: ${member_id} on Date: ${stream_date}!`);
    });
}