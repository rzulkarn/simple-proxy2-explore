//
// NXT Portal + Websocket Server
//
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var client = require('socket.io-client');
var interval;

server.listen(8080);
console.log("NXT Test Gateway Listening on port 8080");

app.get('/', (req, res) => {
    console.log('NXT Gateway route /');
});

io.on('connection', function (client) {
    console.log('NXT Gateway got websocket connection on port 8080');
  
    interval = setInterval(function () {
        client.send('NXT Gateway server message'); 
    }, 3000);

    client.on('stop', function (data) {
        console.log("NXT Gateway received stop message");
        clearInterval(interval);
    });
    
    client.on('restart', function (data) {
        console.log("NXT Gateway received restart message");

        interval = setInterval(function () {
            client.send('NXT Gateway server message restarted'); 
        }, 3000);
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