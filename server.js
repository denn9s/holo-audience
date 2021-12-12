const express = require('express');
const path = require('path');
const routes = require('./routes');
const cors = require('cors');

const app = express();

app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static("public"));

app.use('', routes);

app.listen(3000, '0.0.0.0', () => {
    console.log('Listening on Port 3000');
});