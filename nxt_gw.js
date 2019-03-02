//
// NXT HTTP + Websocket Server
//
require('dotenv').config();

var express = require('express');
const path = require('path');
var session = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');

const authRouter = require('./nxt_auth');

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
var jwt = require('jsonwebtoken');
var interval;
const intervalTime = 2000; // milliseconds

server.listen(8080);
console.log("NXT Test Gateway Listening on port 8080");

// Handle HTTP routes

app.use(express.urlencoded({ extended: true }));
app.use('/authorize', oidc.ensureAuthenticated(), authRouter);

//
// Simple JWT test route
//
app.get('/jwttest', (req, res) => {
    console.log("NXT Gateway received authorize route, login!");
    const user = { id: 3 };
    const token = jwt.sign({ user }, 'my_secret_key');
    // Verify
    jwt.verify(token, "my_secret_key", function(err, data) {
        if (err) {
            res.sendStatus(403);
        }
        else {
            res.json({
                text: 'you are authorized with JWT!!',
                data: data
            });
        }
    });
});

//
// Middleware for protected route
//
// function ensureToken(req, res, next) {
//     const bearerHeader = req.headers["authorization"];
//     if (typeof bearerHeader !== 'undefined') {
//         const bearer = bearerHeader.split(" ");
//         const bearerToken = bearer[1];
//         req.token = bearerToken;
//         next();
//     }
//     else {
//         res.sendStatus(403);
//     }
// }

app.get('/dashboard', (req, res) => {
    console.log("NXT Gateway received dashboard request");
    res.writeHead(302,{Location: 'http://grafana.com'});
    res.end();
});

app.get('/about', (req, res) => {
    console.log("REQ Header: x-nxt-token value", req.headers['x-nxt-token']);
    console.log("REQ Header: x-forwarded-for value", req.headers['x-forwarded-for']);
    console.log("NXT Gateway sent about.html from " + __dirname);
    res.sendFile(path.join(__dirname + '/public_gw/about.html'));
});

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

// Unit Test code
// console.log("sending ws://localhost:8080");
//
// Setup the socket.io client against our proxy
//
//var ws = client.connect('ws://localhost:8080');
//
//ws.on('message', function (msg) {
//   console.log('NXT Gateway got message: ' + msg);
//   ws.send('from a client');
//});