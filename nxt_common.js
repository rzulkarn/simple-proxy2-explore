//
// NXT Common Code between Agent and Connector
//
const urlParser = require('url');
const WebSocket = require('ws');
const extend = require('extend');

module.exports = {

  getNxtHeader: function (data) {
    let index = data.indexOf('\n');
    let nxtHeader = JSON.parse(data.substring(0, index));
    return nxtHeader;
  },

  getNxtClientData: function (data) {
    let index = data.indexOf('\n');
    let clientData = data.substring(index + 1);
    return clientData;
  },
  
  createNxtHeader: function (headers) {
    const { host, origin } = headers;
    let optionHeaders = { 'x-nxt-src': `${origin}`,
                          'x-nxt-dst': `${host}` };
    return optionHeaders;
  },

  createNxtWsReqPayload: function (headers, method, url, bodyArray) {
    // 
    // NXT custom header
    // x-nxt-src: '<val>'
    // x-nxt-dst: '<val>'
    // <empty line>
    // <client Body>
    //
    let lines = [];

    // Nxt custom header
    let optionHeaders = this.createNxtHeader(headers);

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

  createNxtWsResPayload: function (headers, statusCode, statusMessage, bodyArray) {
    // 
    // NXT custom header
    // x-nxt-src: '<val>'
    // x-nxt-dst: '<val>'
    // <empty line>
    // <client Body>
    //
    let lines = [];

    // Nxt custom header
    let optionHeaders = this.createNxtHeader(headers);

    lines.push(Buffer.from(JSON.stringify(optionHeaders)));
    lines.push(Buffer.from('\r\n'));

    // client header
    lines.push(Buffer.from('HTTP/1.1' + ' ' + `${statusCode}` + ' ' + `${statusMessage}` + '\r\n'));
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
      lines.push(Buffer.from(Buffer.concat(bodyArray)));
    }
    return Buffer.concat(lines).toString();
  },

  sendNxtResponse : function (res, data) {
    console.log("NXT Common sent HTTP response end!");
    res.end(data);
  },

  sendNxtHello : function (socket) {
    var hello = { access_token: 'nxt-access-token' };
    this.sendToNxtTunnel(socket, JSON.stringify(hello));
  },

  sendToNxtTunnel : function (socket, req) {
    console.log("NXT Common nxtTunnelSend()");
    socket.send(req);
  },

  createWebSocket : function (uri) {
    return new WebSocket(uri);
  },
  
};