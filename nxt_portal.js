//
// NXT Web Portal
//
require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');

//
// Protected Route Module
//
const protectedRouter = require('./nxt_auth');

const oidc = new ExpressOIDC({
    issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
    client_id: process.env.OKTA_CLIENT_ID,
    client_secret: process.env.OKTA_CLIENT_SECRET,
    redirect_uri: `${process.env.HOST_URL}/authorization-code/callback`,
    appBaseUrl: `${process.env.HOST_URL}`,
    scope: 'openid profile'
});

var app = express();

app.use(session({
    secret: process.env.APP_SECRET,
    resave: true,
    saveUninitialized: false
}));

app.use(oidc.router);

var server = require('http').Server(app);
var io = require('socket.io')(server);
var client = require('socket.io-client');
var interval;
const intervalTime = 2000; // milliseconds

//
// WebPortal Listen Port
//
server.listen(8080);
console.log("NXT Portal listening on port 8080");

//
// Handle all HTTP routes
//
app.use(express.urlencoded({ extended: true }));

//
// Handle unprotected routes
//
app.get('/dashboard', (req, res) => {
    console.log("NXT Gateway received dashboard request");
    res.writeHead(302,{Location: 'http://grafana.com'});
    res.end();
});

//
// Handle protected routes
//
//app.use('/authorize', oidc.ensureAuthenticated(), authRouter);
app.use(oidc.ensureAuthenticated(), protectedRouter);

// Handle WebSocket Events

io.on('connection', function (client) {
    console.log('NXT Gateway got websocket connection on port 8080');
  
    interval = setInterval(function () {
        client.send('NXT Gateway server message'); 
    }, intervalTime);

    client.on('stop', function (data) {
        console.log("NXT Gateway received stop message");
        clearInterval(interval);
    });
    
    client.on('restart', function (data) {
        console.log("NXT Gateway received restart message");

        interval = setInterval(function () {
            client.send('NXT Gateway server message restarted'); 
        }, intervalTime);
    });

    client.on('disconnect', function (data) {
        console.log("NXT Gateway client disconnected");
        clearInterval(interval);
    });

});