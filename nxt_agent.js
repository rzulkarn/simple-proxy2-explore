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

    const { headers, method, url } = req;
    let body = [];
    req.on('error', (err) => {
      console.error(err.stack);
    });
    req.on('data', (chunk) => {
      body.push(chunk);
    });
    req.on('end', () => {
      // Future Logic:
      // if (!token) getToken()
      // else if (token && !tunnel) createTunnel()
      // else if (token && tunnel) transmitTunnel()
      //
      let bodyBuff = Buffer.concat(body);
      if (url === '/ingressgw') {
        //
        // Create a custom NXT header
        let nxtBuff = createNxtHttpRequest(headers, method, url, bodyBuff);
        //
        // Save the respond object
        globalRes = res;
        //
        // send the nxt headers
        transmitTunnel(nxtBuff);
      }
      else {
        console.log("NXT Agent, going to localhost 8080 (Portal)");
        portalProxy.web(req, res, { target: "http://localhost:8080/" } );
      }
    });

    // Future Logic:
    // if (!token) getToken()
    // else if (token && !tunnel) createTunnel()
    // else if (token && tunnel) transmitTunnel()
    //

    console.log("NXT Agent HTTP handle completed for url: " + req.url);
});

function createNxtHttpRequest(headers, method, url, buff) {
  // 
  // Create NXT Custom header
  // <method> /<url> HTTP/1.1
  // <normal req.headers>
  // <empty line>
  // <body>
  //
  let lines = [];

  lines.push(Buffer.from(`${method}` + ' ' + `${url}` + ' ' + 'HTTP/1.1' + '\r\n'));

  let optionHeaders = { 'x-nxt-src': 'source_host',
                        'x-nxt-dst': 'dst_host' };
  extend(headers, optionHeaders);
  Object.keys(headers).forEach(function(key) {
     let val = headers[key];
     lines.push(Buffer.from(`${key}` + ':' + ' ' + `${val}` + '\r\n'));
  });

  lines.push(Buffer.from('\r\n'));
  //lines.push(Buffer.from(JSON.stringify(headers)));

  return Buffer.concat(lines).toString();
}

function createNxtHttpResponse(res, data) {
   console.log("NXT Agent, sent HTTP response end!");
   //globalRes.writeHead(200);
   res.end("HTTP Response End");
}

function sendNxtHello() {
  var hello = { access_token: 'nxt-access-token' };
  transmitTunnel(JSON.stringify(hello));
}

function createWebSocket() {
  return new WebSocket('ws://localhost:8082/');
}

function createTunnel() {
  if (isTunnelCreated === true) {
    console.log("NXT Agent, WebSocket tunnel created!");
    return ws;
  }
  console.log("NXT Agent create WebSocket tunnel!");

  try {
    ws = createWebSocket();
  } 
  catch (error) {
    console.log("NXT Agent error cought!");

    if (error instanceof SystemError) {
      if (error.errno == ECONNREFUSED) {
        console.log("NXT Agent ECONNREFUSED cought, try again in 2 sec");
        setTimeout(() => {
            ws = createWebSocket();
        }, 2000);
      }
    }
  }

  ws.on('open', function() {
    console.log('NXT Agent open socket communication to localhost:8082');
    //sendNxtHello();
  });
  
  ws.on('upgrade', function(res) {
    console.log('NXT Agent upgrade event received', JSON.stringify(res.headers, true, 2));
  })

  ws.on('message', function(data) {
    console.log('NXT Agent got message from websocket');

    
    setTimeout(() => {
      createNxtHttpResponse(globalRes, data);
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

  ws.on('error', function(err) {
    console.error(err.stack);
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