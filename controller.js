const mongoose = require('mongoose');
const {getCredentials} = require('./stream_data');
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

const Member = require('./models/member');

async function getHomepage(req, res) {
    res.render('homepage');
}

async function getMember(req, res) {
    const { member } = req.params;
    const mem = await Member.findOne({id: member});
    if (mem !== null) {
        res.render('member', { member });
    } else {
        res.status(404).send('Sorry, page doesn\'t exist!');
    }
}

async function getError(req, res) {
    res.status(404).send('Sorry, page doesn\'t exist!');
}

exports.getHomepage = getHomepage;
exports.getMember = getMember;
exports.getError = getError;