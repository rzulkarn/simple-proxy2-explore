var color = require('colors');
var http = require('http');
var httpProxy = require('http-proxy');
var token;

var isAuthorized = false;

//
// Setup a proxy to our target host 
//
var proxy = new httpProxy.createProxyServer({
});

proxy.on('proxyReq', function (proxyReq, req, res, options) {
  // Insert Token
  proxyReq.setHeader('x-nxt-token', 'access token');
  // Insert X-Forwarded-For label
  proxyReq.setHeader('X-Forwarded-For', '10.10.10.1');
  console.log('REQ event called', JSON.stringify(req.headers, true, 2));
});

proxy.on('proxyRes', function (proxyRes, req, res, options) {
  console.log('PROXY-RES event called', JSON.stringify(proxyRes.headers, true, 2));
});

var proxyServer = http.createServer(function (req, res) {
    console.log("NXT Proxy handling HTTP request callback, url: " + req.url);
    console.log(JSON.stringify(req.headers, true, 2));
    //res.writeHead(200, { 'Content-Type': 'text/plain' });
    //res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
    //res.end();
// console.log(req);
    proxy.web(req, res, { target: "http://localhost:8080/" } );
});

// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
proxyServer.on('upgrade', function (req, socket, head) {
    console.log("NXT Proxy handling HTTP upgrade event callback");
    console.log(JSON.stringify(req.headers, true, 2));
    proxy.ws(req, socket, head, { target: "http://localhost:8080", ws: "true", xfwd: "true" } );
});

proxyServer.listen(8081);
console.log("NXT Proxy started listening to port 8081");