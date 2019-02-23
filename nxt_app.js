var express = require('express');
var color = require('colors');
var httpServer = require('http');
var httpsServer = require('https');
var httpProxyServer = require('http-proxy');

try {
    var socket = require('socket.io'),
        socketClient = require('socket.io-client');
}
catch (ex) {
    console.error('Socket.io is required for this example:');
    console.error('npm ' + 'install'.green);
    process.exit(1);
}

// App setup
var app = express();

// setup ejs
app.set('view engine', 'ejs');

// Middleware: static files location
app.use('/', express.static('public'));

var server = app.listen(4000, function(){
    console.log('listening for requests on port 4000,');
});

// Handle Routes
app.get('/', function(req, res) {
    res.render('index');
});

app.post('/login', function(req, res) {
    res.render('nxt_welcome');
});

app.get('/connect', function(req, res) {
    console.log("NXT App connecting to... ws://localhost:8081");

    //
    // Setup the socket.io client against our proxy 
    //
    //var ws = socketClient.connect('ws://localhost:8081');
    //
    //ws.on('message', function (msg) {
    //   console.log('NXT App got message: ' + msg);
    //   ws.send('a message from NXT App');
    //});

    // If success, render the nxt connect page
    res.render('nxt_connect');
});

var io = socket(server);
io.on('connection', (socket) => {
    console.log('made socket connection id:', socket.id);

    // Handle login event
    socket.on('login', function(data){
        console.log(data);
    });
})


