//
// NXT Connector
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
    console.log("NXT Connector, upgrade request received!");
});

//
// Initiatlize the WebSocket Server instance with HTTP server
//
const wss = new WebSocket.Server( { server } );

// Handle WebSocket Events

wss.on('connection', (ws, req) => {
    console.log("NXT Connector, connection event received, req:", JSON.stringify(req.headers, true, 2));
    ws.on('message', (message) => {
        console.log("NXT Connector, message event received");
        handleMessage(ws, message);
    });
    ws.on('close', (reason, description) => {
        console.log("NXT Connector, close event");
    });
});

function handleMessage(ws, message) {
    console.log('NXT Connector, message type: ', typeof message);
    let currentMessage = message.toString().split(/(?:\r\n|\r|\n)/g);
    for (var line = 0; line < currentMessage.length; line++) {
        // line 0 = Nxt Custom Header
        // line 1 = \r\n
        // line 2 = Client HTTP Header + Client Body
        //
        if (line === 0) {
            var nxtHeader = JSON.parse(currentMessage[line]);
            console.log("NXT Custom Header: " + JSON.stringify(nxtHeader, true, 2));
        }

        console.log(currentMessage[line]);
    }
    ws.send('Message received in NXT Connector');
}

server.listen(8082);
console.log("NXT Connector Listening on port 8082");