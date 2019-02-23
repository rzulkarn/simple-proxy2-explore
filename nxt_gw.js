//
// NXT Test Websocket
//
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var client = require('socket.io-client');

server.listen(8080);
console.log("NXT Test Gateway Listening on port 8080");

app.get('/', (req, res) => {
    console.log('NXT Gateway route /ß');
});

io.sockets.on('connection', function (client) {
    console.log('NXT Gateway got websocket connection on port 8080');
  
    client.on('message', function (msg) {
      console.log('NXT Gateway received: ' + msg);
    });
  
    client.send('from NXT Gateway server'); 
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