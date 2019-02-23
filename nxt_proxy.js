var color = require('colors');
var http = require('http');
var httpProxy = require('http-proxy');

//
// Setup a proxy to our target host 
//
var proxy = new httpProxy.createProxyServer({
  target: {
    host: 'localhost',
    port: 8080
  }
});

var proxyServer = http.createServer(function (req, res) {
    console.log("NXT Proxy handling HTTP request callback");
    console.log(JSON.stringify(req.headers, true, 2));
    //res.writeHead(200, { 'Content-Type': 'text/plain' });
    //res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
    //res.end();
    proxy.web(req, res);
});

// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
proxyServer.on('upgrade', function (req, socket, head) {
    console.log("NXT Proxy handling HTTP upgrade event callback");
    setTimeout(function () {
       proxy.ws(req, socket, head);
    }, 1000);
});

proxyServer.listen(8081);
console.log("NXT Proxy started listening to port 8081");