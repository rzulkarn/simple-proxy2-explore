//
// NXT WebSocket Gateway Test
//
const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const httpServer = require('http');

// 
// Create Express App
//
const app = express();

//
// Create HTTP Server
//
const server = httpServer.createServer(app);

server.on('upgrade', function (req, socket, head) {
    console.log("NXT WebSocket Gateway, upgrade request received!");
});

//
// Initiatlize the WebSocket Server instance with HTTP server
//
const wss = new WebSocket.Server( { server } );
wss.onmessage = handleMessage;

// Handle WebSocket Events

wss.on('connection', (client) => {
    console.log("NXT WebSocket Gateway, connection event received");
});

function handleMessage(message) {
    console.log('received: %s', JSON.stringify(message, true, 2));
}

server.listen(8082);
console.log("NXT WebSocket Gateway Listening on port 8082");