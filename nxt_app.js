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
    res.render('index');
});

app.post('/login', function(req, res) {
    res.render('nxt_welcome');
});

app.get('/connect', function(req, res) {
    res.render('nxt_connect');
});

app.get('/dashboard', function(req, res) {

});


