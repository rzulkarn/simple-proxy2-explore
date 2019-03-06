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

// Handle WebSocket Events

wss.on('connection', (ws, req) => {
    console.log("NXT WebSocket Gateway, connection event received, req:", JSON.stringify(req.headers, true, 2));
    ws.on('message', (message) => {
        console.log("NXT WebSocket Gateway, message event received");
        handleMessage(ws, message);
    });
    ws.on('close', (reason, description) => {
        console.log("NXT WebSocket Gateway, close event");
    });
});

function handleMessage(ws, message) {
    console.log('NXT Websocket Gateway received: %s', message);
    ws.send('Message received in NXT Websocket Gateway');
}

server.listen(8082);
console.log("NXT WebSocket Gateway Listening on port 8082");