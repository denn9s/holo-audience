const express = require('express');
const path = require('path');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('homepage');
});

app.get('/:member', async (req, res) => {
    const { member } = req.params;
    res.render('member', { member });
});

app.get('*', function(req, res){
    res.status(404).send('Page not found!');
});

app.listen(3000, () => {
    console.log('Listening on Port 3000');
});