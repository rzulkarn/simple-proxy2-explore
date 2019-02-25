//
// NXT HTTP + Websocket Server
//
const path = require('path');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var client = require('socket.io-client');
var interval;
const intervalTime = 2000; // milliseconds

server.listen(8080);
console.log("NXT Test Gateway Listening on port 8080");

// Handle HTTP requests

app.get('/authorize', (req, res) => {
    console.log("NXT Gateway received authorize");
    res.sendFile(path.join(__dirname + '/public_gw/authorize.html'));
});

app.get('/dashboard', (req, res) => {
    console.log("NXT Gateway received dashboard request");
    res.writeHead(302,{Location: 'http://grafana.com'});
    res.end();
});

app.get('/about', (req, res) => {
    console.log("NXT Gateway sent about.html from " + __dirname);
    res.sendFile(path.join(__dirname + '/public_gw/about.html'));
});

// Handle WebSocket Events

io.on('connection', function (client) {
    console.log('NXT Gateway got websocket connection on port 8080');
  
    interval = setInterval(function () {
        client.send('NXT Gateway server message'); 
    }, intervalTime);

    client.on('stop', function (data) {
        console.log("NXT Gateway received stop message");
        clearInterval(interval);
    });
    
    client.on('restart', function (data) {
        console.log("NXT Gateway received restart message");

        interval = setInterval(function () {
            client.send('NXT Gateway server message restarted'); 
        }, intervalTime);
    });

    client.on('disconnect', function (data) {
        console.log("NXT Gateway client disconnected");
        clearInterval(interval);
    });

});

// Unit Test code
// console.log("sending ws://localhost:8080");
//
// Setup the socket.io client against our proxy
//
//var ws = client.connect('ws://localhost:8080');
//
//ws.on('message', function (msg) {
//   console.log('NXT Gateway got message: ' + msg);
//   ws.send('from a client');
//});