const express = require('express');
const path = require('path');
const routes = require('./routes');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static("public"));

app.use('', routes);
// app.use(express.static(__dirname + '/public'));
// app.use('/public', express.static('public'));

app.listen(3000, () => {
    console.log('Listening on Port 3000');
});