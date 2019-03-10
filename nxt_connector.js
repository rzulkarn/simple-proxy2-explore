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

const NXT_EGRESS_MESH = 'ws://egress.mesh.nextensio.net';

// 
// Create Dest Proxy 
//
var destProxy = new httpDestServer.createProxyServer({});
var wsAgt;
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
    wsAgt = ws;
    wsAgt.on('message', (message) => {
        console.log("NXT Connector, message event received");
        let req = handleWSMessage(wsAgt, message);
        sendMessageToDst(wsAgt, req);
    });
    wsAgt.on('close', (reason, description) => {
        console.log("NXT Connector, close event");
    });
});

function handleWSMessage(ws, message) {
    console.log('NXT Connector, message type: ', typeof message);
    //console.log(message);

    let nxtHeader = common.getNxtHeader(message);
    let clientData = common.getNxtClientData(message);

    let req = httpParser.parseRequest(clientData);

    //console.log("NXT Custom Header: " + JSON.stringify(nxtHeader, true, 2));
    //console.log("Client Header", req);
    
    //ws.send('Message received in NXT Connector');

    return req;
}

function handleResponseCB(res) {
    var bodyArray = [];
    console.log('NXT Connector response CB');
    //another chunk of data has been recieved, so append it to `str`
    res.on('data', function (chunk) {
        bodyArray.push(chunk);
    });
      
    //the whole response has been recieved, so we just print it out here
    res.on('end', function () {
        console.log('NXT Connector response CB header');
        console.log(res.headers);

        //console.log(Buffer.concat(bodyArray).toString());
        let { headers } = res;
        let nxtBuff = common.createNxtWsResPayload(headers, 
                                                    res.statusCode, 
                                                    res.statusMessage, bodyArray);
        console.log('NXT Connector sending response buffer (nxtBuff) to Agent');
        //console.log(nxtBuff);

        // Send it back to the Agent
        wsAgt.send(nxtBuff);
    });
}

function sendMessageToDst(ws, req) {
    let options = {
        host: `${req.headers['host']}`,
        path: `${req.uri}`,
        headers: req.headers
    };
    
    console.log('NXT Connector, sending to destination', options);
    httpServer.request(options, handleResponseCB).end();
}


server.listen(8082);
console.log("NXT Connector Listening on port 8082");