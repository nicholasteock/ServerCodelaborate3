var express     = require('express'),
	app         = express(),
	router      = express.Router(),
	bodyParser  = require('body-parser'),
	async 		= require('async'),
	http 		= require('http').Server(app),
	io 			= require('socket.io')(http),
	compiler 	= require('compiler');

// Configure app to use bodyParser()
// Allows us to get the data from a POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Set port
var port = process.env.PORT || 8080;

// Access control allowed origin
// var allowedOrigin = 'http://192.168.1.29:8000';
// var allowedOrigin = 'http://nicholasteock.github.io';

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    // res.setHeader('Access-Control-Allow-Origin', 'http://192.168.1.29:8000');
    res.setHeader('Access-Control-Allow-Origin', 'http://nicholasteock.github.io/web/codelaborate');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Routes for API

// Using this to test if server is running
router.get('/', function(req, res) {
	res.json({ message: "HELLO FROM THE API!" });
});

/*****************************************************************************
*	COMPILE CODE
******************************************************************************/

router.post('/compile', function(req, res) {
	function reply(response) {
		res.status(200).send(response)
	};
	compiler.compile(req.body, reply);
});

/*****************************************************************************
*	RUN CODE
******************************************************************************/

io.of('/run').on('connection', function (socket) {
	var dirName = '';
	console.log('Someone connected...');
	socket.on('execute', function(data) {
		// console.log('Execute data : ', data);
		dirName = data.dirName;
		compiler.execute(data, socket);
	});
	socket.on('disconnect', function () {
		if(dirName !== '') {
			compiler.cleanup(dirName);
		}
		console.log('Disconnected');
	});
});

/*****************************************************************************/

app.use('/', router);

// Start server
http.listen(port);
console.log('Server listening on port ' + port);
