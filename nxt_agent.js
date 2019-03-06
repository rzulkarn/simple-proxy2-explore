//
// NXT Proxy Agent
//
const http = require('http');
const httpProxy = require('http-proxy');
const urlParser = require('url');
const WebSocket = require('ws');
const BSON = require('bson');
const extend = require('extend');

//
// Global Variables
//
var nxtIdToken;
var ws;
var isTunnelCreated = false;
var globalRes;

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
    //const serializedReq = BSON.serialize(req);
    if (url.pathname === '/ingressgw') {
      console.log(req);
      var reqHeaders = req.headers;
      var optionHeaders = { 'x-nxt-src': 'source_host',
                            'x-nxt-dst': 'dst_host' };

      extend(reqHeaders, optionHeaders);
      //console.log(JSON.stringify(reqHeaders, 2));

      transmitTunnel(JSON.stringify(reqHeaders));

      globalRes = res;
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
  console.log("NXT Agent create WebSocket tunnel!");

  try {
    ws = new WebSocket('ws://localhost:8082/');
  } 
  catch (error) {
    console.log("NXT Agent error cought!");

    if (error instanceof SystemError) {
      if (error.errno == ECONNREFUSED) {
        console.log("NXT Agent ECONNREFUSED cought, try again in 2 sec");
        setTimeout(() => {
            ws = new WebSocket('ws://localhost:8082/');
        }, 2000);
      }
    }
  }
  //ws.binaryType = "arraybuffer";

  ws.on('open', function() {
    console.log('NXT Agent open socket communication to localhost:8082');
  });

  ws.on('message', function(data) {
    console.log('NXT Agent got message from websocket: ' + data);
    setTimeout(() => {
      console.log("NXT Agent, sent HTTP response end!");
      globalRes.writeHead(200);
      globalRes.end("HTTP Response End");
    },5000);
  });

  ws.on('close', function() {
    console.log('NXT Agent, close event received');
    isTunnelCreated = false;
    ws = null;
    //
    // Create WebSocket Tunnel again!
    //
    setTimeout(() => {
      createTunnel();
    },2000);
  })

  ws.on('error', function(error) {
    console.log('NXT Agent, error event received');
  })

  isTunnelCreated = true;
  return ws;
}

function transmitTunnel(req) {
  console.log("NXT Agent, transmit to tunnel!");
  ws.send(req);
  // console.log(Object.keys(req));
}

// Temporary!! 
createTunnel();

proxyServer.listen(8081);
console.log("NXT Agent started listening to port 8081");