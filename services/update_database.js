const mongoose = require('mongoose');
const {PythonShell} = require('python-shell');

const Member = require('../models/member');

// const get_stream_info = require('../stream_data');

mongoose.connect('mongodb://localhost:27017/holo', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connection successful!");
    })
    .catch(err => {
        console.log("Error! Connection unsuccessful!")
        console.log(err)
    });

async function get_all_streams(member_id) {
    let member = await Member.findOne({id: member_id});
    yt_id = member.youtube_id;
    let python_shell_options = {args: [yt_id], pythonOptions: ['-u']};
    PythonShell.run('get_stream_list.py', python_shell_options, function (err, res) {
        if (err) throw err;
        const stream_id_array = res;
    });
}

async function get_all_members() {
    const member_array = await Member.find();
    member_id_array = [];
    for (let mem of member_array) {
        member_id_array.push(mem.id);
    }
    return member_id_array;
}

function update_stream_databse(member_id, stream_id_array) {

}