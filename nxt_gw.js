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
// Handle Default Route
//
app.get('/', (req, res) => {
    if (req.userContext) {
        console.log(req.userContext);
        res.send(`
          Hello ${req.userContext.userinfo.name}!
          <form method="POST" action="/logout">
            <button type="submit">Logout</button>
          </form>
        `);
      } else {
        res.send('Please <a href="/login">login</a>');
      }
    console.log('NXT GW default route, statusCode: ', res.statusCode);
});
  
app.get('/logout', (req, res) => {
    console.log('NXT GW logout route');

    if (req.userContext) {
      const idToken = req.userContext.tokens.id_token
      const to = encodeURI(process.env.HOST_URL)
      const params = `id_token_hint=${idToken}&post_logout_redirect_uri=${to}`
      req.logout()
      res.redirect(`${process.env.OKTA_ORG_URL}/oauth2/default/v1/logout?${params}`)

      console.log('NXT GW logout route1');

    } else {
      res.redirect('/')

      console.log('NXT GW logout route2');

    }
});

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

app.get('/dashboard', (req, res) => {
    console.log("NXT Gateway received dashboard request");
    res.writeHead(302,{Location: 'http://grafana.com'});
    res.end();
});

app.get('/about', (req, res) => {
    console.log("REQ Header: x-nxt-token value", req.headers['x-nxt-token']);
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