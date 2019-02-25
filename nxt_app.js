//
// NXT Rendering Application
//
var express = require('express');
var color = require('colors');
var httpServer = require('http');
var httpsServer = require('https');

// App setup
var app = express();

// setup ejs
app.set('view engine', 'ejs');

// Middleware: static files location
app.use('/', express.static('public'));

var server = app.listen(4000, function() { 
    console.log('NXT App listening for requests on port 4000,');
});

// Handle Routes

app.get('/', function(req, res) {
    // Let me in page
    res.render('index');
});

app.post('/welcome', function(req, res) {
    // Welcome page
    res.render('nxt_welcome');
});

app.get('/authorize', function(req, res) {
    console.log("NXT App handling /authorize route");

    httpServer.get('http://localhost:8081/authorize', (gw_res) => {
        console.log("NXT App received authorize HTML chunk response");

        handleHTMLResponse(res, gw_res);
    });
});

app.get('/connect', function(req, res) {
    res.render('nxt_connect');
});

app.get('/dashboard', function(req, res) {
    console.log("NXT App handling /dashboard route");

    httpServer.get('http://localhost:8081/dashboard', (gw_res) => {
        console.log("NXT App received dashboard HTML chunk response");

        handleHTMLResponse(res, gw_res);
    });
});

app.get('/about', function(req, res) {
    console.log("NXT App handling /about route");

    httpServer.get('http://localhost:8081/about', (gw_res) => {
        console.log("NXT App received about HTML chunk response");

        handleHTMLResponse(res, gw_res);
    });
});

function handleHTMLResponse(res, gw_res) {
    var data = '';

    gw_res.on('data', (chunk) => {
        data += chunk;
    });

    gw_res.on('end', () => {
        // post the response to the client
        res.writeHead(200);
        res.write(data);
        res.end();
    })
}