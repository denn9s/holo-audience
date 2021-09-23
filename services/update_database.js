const mongoose = require('mongoose');
const {PythonShell} = require('python-shell');

const Member = require('../models/member');
const Stream = require('../models/stream');

mongoose.connect('mongodb://localhost:27017/holo', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connection successful!");
    })
    .catch(err => {
        console.log("Error! Connection unsuccessful!");
        console.log(err);
    });

async function get_all_streams(member_id) {
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

async function get_all_members() {
    const member_array = await Member.find();
    member_id_array = [];
    for (let mem of member_array) {
        member_id_array.push(mem.id);
    }
    return member_id_array;
}

async function get_new_streams(member_id) {
    let current_stream_id_list = await get_all_streams(member_id);
    let new_stream_id_list = [];
    for (let stream_id of current_stream_id_list) {
        if ((await Stream.exists({id: stream_id})) === false) {
            new_stream_id_list.push(stream_id);
        }
    }
    return new_stream_id_list;
}