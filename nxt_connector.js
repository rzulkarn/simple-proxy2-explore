//
// NXT Connector
//
const path = require('path');
const WebSocket = require('ws');
const httpProxy = require('http-proxy');
const httpServer = require('http');
const httpDestServer = require('http-proxy');
const httpParser = require('http-string-parser');
const common = require('./nxt_common.js');

// 
// Create Dest Proxy 
//
var destProxy = new httpDestServer.createProxyServer({});

//
// Create HTTP Server
//
const server = httpServer.createServer(function(req, res) {
    console.log("NXT Connector, HTTP request received: ", JSON.stringify(req.headers, true, 2));
    let hostname = 'http://' + req.headers['host'];
    console.log("NXT Connector, host: ", hostname);
    destProxy.web(req, res, { target: `${hostname}` } );
});
 
//
// 
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
        let req = handleWSMessage(ws, message);
        sendMessageToDst(ws, req);
    });
    ws.on('close', (reason, description) => {
        console.log("NXT Connector, close event");
    });
});

function handleWSMessage(ws, message) {
    console.log('NXT Connector, message type: ', typeof message);
    console.log(message);

    let index = message.indexOf('\n');
    let nxtHeader = JSON.parse(message.substring(0, index));
    let clientData = message.substring(index + 1);

    let req = httpParser.parseRequest(clientData);

    console.log("NXT Custom Header: " + JSON.stringify(nxtHeader, true, 2));
    console.log("Client Header", req);
    
    ws.send('Message received in NXT Connector');

    return req;
}

function handleResponseCB(res) {
    var str = '';
    console.log("NXT Connector response: ", res.headers);
    //another chunk of data has been recieved, so append it to `str`
    res.on('data', function (chunk) {
        str += chunk;
    });
      
    //the whole response has been recieved, so we just print it out here
    res.on('end', function () {
        console.log(str);
    });
}

function sendMessageToDst(ws, req) {
    let options = {
        host: `${req.headers['host']}`,
        path: `${req.uri}`,
        headers: req.headers
    };
    
    console.log('Options: ', options);
    httpServer.request(options, handleResponseCB).end();
}

server.listen(8082);
console.log("NXT Connector Listening on port 8082");