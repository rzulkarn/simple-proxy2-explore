//
// NXT Proxy Agent
//
var http = require('http');
var httpProxy = require('http-proxy');
var nxtIdToken;

//
// Setup a proxy to our target host 
//
var proxy = new httpProxy.createProxyServer({});

proxy.on('proxyReq', function (proxyReq, req, res, options) {
  // Insert NXT SRC DEST (example)
  proxyReq.setHeader('x-nxt-src', 'source_destination');
  proxyReq.setHeader('Content-type', 'text/html');
  //proxyReq.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36');
  proxyReq.setHeader('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8');
  console.log('PROXY-REQ event called', JSON.stringify(req.headers, true, 2));
});

proxy.on('proxyRes', function (proxyRes, req, res, options) {
  console.log('PROXY-RES event called', JSON.stringify(proxyRes.headers, true, 2));
  console.log('PROXY-RES statusCode', proxyRes.statusCode, res.statusCode);

  if (typeof proxyRes.headers['x-nxt-token'] === 'undefined') { 
    console.log("PROXY-RES, token undefined"); 
  }
  else { 
    console.log("PROXY-RES, token exists!"); 
    nxtIdToken = proxyRes.headers['x-nxt-token'];
  }
});

var proxyServer = http.createServer(function (req, res) {
    console.log("NXT Proxy handling HTTP request callback, url: " + req.url);
    console.log(JSON.stringify(req.headers, true, 2));
    //console.log(req);
    //console.log(res);
    proxy.web(req, res, { target: "http://localhost:8080/" } );
});

// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
proxyServer.on('upgrade', function (req, socket, head) {
    console.log("NXT Proxy handling HTTP upgrade event callback");
    console.log(JSON.stringify(req.headers, true, 2));
    proxy.ws(req, socket, head, { target: "http://localhost:8080", ws: 'true', xfwd: 'true' } );
});

proxyServer.listen(8081);
console.log("NXT Proxy started listening to port 8081");