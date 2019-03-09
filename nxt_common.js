//
// NXT Common Code between Agent and Connector
//
const urlParser = require('url');
const WebSocket = require('ws');
const extend = require('extend');

module.exports = {

  createNxtWsPayload: function (headers, method, url, bodyArray) {
    // 
    // NXT custom header
    // x-nxt-src: '<val>'
    // x-nxt-dst: '<val>'
    // <empty line>
    // <client Body>
    //
    let lines = [];

    // Nxt custom header
    const { host, origin } = headers;
    let optionHeaders = { 'x-nxt-src': `${origin}`,
                          'x-nxt-dst': `${host}` };
    lines.push(Buffer.from(JSON.stringify(optionHeaders)));
    lines.push(Buffer.from('\r\n'));

    // client header
    lines.push(Buffer.from(`${method}` + ' ' + `${url}` + ' ' + 'HTTP/1.1' + '\r\n'));
    Object.keys(headers).forEach(function(key) {
      let val = headers[key];
      lines.push(Buffer.from(`${key}` + ':' + ' ' + `${val}` + '\r\n'));
    });

    // client body
    if (bodyArray === undefined || Array.length == 0) {
      // empty body!
    } 
    else {
      lines.push(Buffer.from('\r\n'));
      lines.push(Buffer.from(bodyArray));
    }
    return Buffer.concat(lines).toString();
  },

  createNxtHttpResponse : function (res, data) {
    console.log("NXT Common sent HTTP response end!");
    res.writeHead(200);
    res.end("HTTP Response End");
  },

  sendNxtHello : function (socket) {
    var hello = { access_token: 'nxt-access-token' };
    nxtTunnelSend(socket, JSON.stringify(hello));
  },

  createWebSocket : function (uri) {
    return new WebSocket(uri);
  },

  sendToNxtTunnel : function (socket, req) {
    console.log("NXT Common nxtTunnelSend()");
    socket.send(req);
  },

};