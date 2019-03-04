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

app.get('/welcome', function(req, res) {
    // Welcome page
    res.render('nxt_welcome');
});

app.get('/connect', function(req, res) {
    res.render('nxt_connect');
});

// app.get('/dashboard', function(req, res) {
//     console.log("NXT App handling /dashboard route");

//     httpServer.get('http://localhost:8081/dashboard', (gw_res) => {
//         console.log("NXT App received dashboard HTML redirect response");

//         if (gw_res.statusCode === 302) {
//             console.log("NXT App redirect request to ", gw_res.headers['location']);
//             res.redirect(gw_res.headers['location']);
//         }
//         else {
//             res.writeHead(200);
//             res.end();
//         }
//     });
// });

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