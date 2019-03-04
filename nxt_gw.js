//
// NXT WebSocket Gateway Test
//
const express = require('express');
const path = require('path');

const gwApp = express();

const server = require('http').Server(gwApp);
const io = require('socket.io')(server);
var interval;
const intervalTime = 2000; // milliseconds

server.listen(8082);
console.log("NXT WebSocket Gateway Listening on port 8082");

// Handle WebSocket Events

io.on('connection', function (client) {
    console.log('NXT Gateway received websocket connection on port 8082');
  
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