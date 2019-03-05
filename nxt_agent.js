//
// NXT Proxy Agent
//
const http = require('http');
const httpProxy = require('http-proxy');
const urlParser = require('url');
const WebSocket = require('ws');

//
// Global Variables
//
var nxtIdToken;
var ws;
var isTunnelCreated = false;

//
// Setup 2 proxies: Portal and Gateway
//
var portalProxy = new httpProxy.createProxyServer({});
var ingressGWProxy = new httpProxy.createProxyServer({});

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
    console.log("PROXY-RES, token undefined"); 
  }
  else { 
    console.log("PROXY-RES, token exists!"); 
    nxtIdToken = proxyRes.headers['x-nxt-token'];
  }
});

var proxyServer = http.createServer(function (req, res) {
    console.log("NXT Agent handling HTTP request callback, url: " + req.url);
    console.log(JSON.stringify(req.headers, true, 2));
    //console.log(req);
    //console.log(res);

    // Future Logic:
    // if (!token) getToken()
    // else if (token && !tunnel) createTunnel()
    // else if (token && tunnel) transmitTunnel()
    //
    const url = urlParser.parse(req.url);
    console.log('URL.pathname:', url.pathname);
    if (url.pathname === '/ingressgw') {
      transmitTunnel(req);
      res.end();
    }
    else {
      console.log("Going to localhost 8080");
      portalProxy.web(req, res, { target: "http://localhost:8080/" } );
    }
    console.log("NXT Agent HTTP handle completed for url: " + req.url);
});

function createTunnel() {
  if (isTunnelCreated === true) {
    console.log("NXT Agent, WebSocket tunnel created!");
    return ws;
  }
  console.log("NXT Agent, create WebSocket tunnel!");

  ws = new WebSocket('ws://localhost:8082/');
  ws.binaryType = "arraybuffer";

  ws.on('open', function() {
    console.log('NXT Agent open socket communication to localhost:8082');
  });

  ws.on('message', function(data) {
    console.log('NXT Agent got message from websocket');

  });

  isTunnelCreated = true;

  return ws;
}

function transmitTunnel(req) {
  console.log("NXT Agent, transmit to tunnel!");

  // marshal to ArrayBuffer

  createTunnel().send(req);
}

// Temporary!! 
createTunnel();

proxyServer.listen(8081);
console.log("NXT Agent started listening to port 8081");