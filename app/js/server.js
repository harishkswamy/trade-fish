var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

const PulseBuilder = require('./pulse/pulse_builder.js');

var COMMENTS_FILE = path.join(__dirname, '/../comments.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, '/../public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const writeError = (res, e) => {
    console.error(e.stack ? e.stack : e.message);
    res.write(e.message);
};

app.get('/api/pulse', function (req, res) {
    const writeResponse = portfolios => {
        res.json(portfolios.map(p => p.state()));
    };

    res.setHeader('Cache-Control', 'no-cache');
    PulseBuilder.get()
        .then(writeResponse)
        .catch(writeError.bind(null, res));
});

app.get('/api/pulse/refresh', function (req, res) {
    const writeResponse = portfolios => {
        res.json(portfolios.map(p => p.state()));
    };

    res.setHeader('Cache-Control', 'no-cache');
    PulseBuilder.refresh()
        .then(writeResponse)
        .catch(writeError.bind(null, res));
});

app.get('/data', function (req, res) {
    res.setHeader('Cache-Control', 'no-cache');
    res.json(JSON.parse(fs.readFileSync(`${__dirname}/../data/${req.param('symbol')}`).toString()));
});

app.listen(app.get('port'), function () {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});
