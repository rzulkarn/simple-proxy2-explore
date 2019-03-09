//
// NXT Proxy Agent
//
const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const urlParser = require('url');
const WebSocket = require('ws');
const extend = require('extend');
const common = require('./nxt_common.js');

//
// Global Variables
//
var nxtAccessToken;
var isTunnelCreated = false;
var globalRes;
var agtWs;

//
// Setup 2 proxies: Portal and Ingress Gateway
//
var portalProxy = new httpProxy.createProxyServer({});
var connectorProxy = new httpProxy.createProxyServer({});

portalProxy.on('proxyReq', function (proxyReq, req, res, options) {
  // Insert NXT SRC DEST (example)
  proxyReq.setHeader('x-nxt-src', 'source_destination');
  proxyReq.setHeader('Content-type', 'text/html');
  proxyReq.setHeader('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8');
  console.log('Portal PROXY-REQ event called', JSON.stringify(req.headers, true, 2));
});

portalProxy.on('proxyRes', function (proxyRes, req, res, options) {
  console.log('Portal PROXY-RES event called', JSON.stringify(proxyRes.headers, true, 2));
  console.log('Portal PROXY-RES statusCode', proxyRes.statusCode, res.statusCode);

  if (typeof proxyRes.headers['x-nxt-token'] === 'undefined') { 
    console.log('PROXY-RES, token undefined'); 
  }
  else { 
    console.log('PROXY-RES, token exists!'); 
    nxtAccessToken = proxyRes.headers['x-nxt-token'];
  }
});

var proxyServer = http.createServer(function (req, res) {
    console.log('NXT Agent handling HTTP request callback, url: ' + req.url);
    //console.log(JSON.stringify(req.headers, true, 2));

    const { headers, method, url } = req;
    let body = [];
    req.on('error', (err) => {
      console.error(err.stack);
    });
    req.on('data', (chunk) => {
      body.push(chunk);
    });
    req.on('end', () => {
      console.log('NXT Agent end event received');
      // Future Logic:
      // if (!token) getToken()
      // else if (token && !tunnel) createTunnel()
      // else if (token && tunnel) transmitTunnel()
      //
      if (nxtAccessToken === undefined) {
        //
        // Create a custom NXT header
        let nxtBuff = common.createNxtWsReqPayload(headers, method, url, body);
        //
        // Save the respond object
        globalRes = res;
        //
        // send the nxt headers
        console.log('NXT Agent sent nxtBuff');
        console.log(nxtBuff);

        common.sendToNxtTunnel(agtWs, nxtBuff);
        //console.log("NXT Agent connectorProxy.web(), url: ", req.url);
        //connectorProxy.web(req, res, { target: 'ws://localhost:8082/', ws: true } );
      }
      else {
        console.log('NXT Agent, going to localhost 8080 (Portal)');
        portalProxy.web(req, res, { target: 'http://localhost:8080/' });
      }
    });

    // Future Logic:
    // if (!token) getToken()
    // else if (token && !tunnel) createTunnel()
    // else if (token && tunnel) transmitTunnel()
    //

    console.log('NXT Agent HTTP handle completed for url: ' + req.url);
});

proxyServer.on('upgrade', function(req, socket, head) {
  console.log("NXT Agent, upgrade event received");
  connectorProxy.ws(req, socket, head);
});

function createNxtTunnel() {
  if (isTunnelCreated === true) {
    console.log('NXT Agent ws tunnel created!');
    return agtWs;
  }
  console.log('NXT Agent create agtWs tunnel!');

  try {
    agtWs = common.createWebSocket('ws://localhost:8082/');
  } 
  catch (error) {
    console.log('NXT Agent error in create ws!');
    setTimeout(() => {
        agtWs = common.createWebSocket('ws://localhost:8082/');
    }, 2000);
  }

  agtWs.on('open', function() {
    console.log('NXT Agent open ws communication to localhost:8082');
    //sendNxtHello();
  });
  
  agtWs.on('upgrade', function(res) {
    console.log('NXT Agent upgrade event received', JSON.stringify(res.headers, true, 2));
  });

  agtWs.on('message', function(data) {
    console.log('NXT Agent got message from connector');
    //console.log(data);

    let index = data.indexOf('\n');
    let nxtHeader = common.getNxtHeader(data);
    let clientData = common.getNxtClientData(data);

    common.sendNxtResponse(globalRes, clientData);
  });

  agtWs.on('close', function() {
    console.log('NXT Agent, close event received');
    isTunnelCreated = false;
    agtWs = null;
    //
    // Create WebSocket Tunnel again!
    //
    setTimeout(() => {
      createNxtTunnel();
    },2000);
  })

  agtWs.on('error', function(err) {
    console.error(err.stack);
  })

  isTunnelCreated = true;
  return agtWs;
}

// Temporary!! 
createNxtTunnel();

proxyServer.listen(8081);
console.log('NXT Agent started listening to port 8081');