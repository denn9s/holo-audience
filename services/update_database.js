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