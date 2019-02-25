//
// Setup the websocket using socket.io proxy agent
//
var ws;

function handleInitialConnect() {
    // Send initial HTTP Hello Request
}

function handleWebsocketConnect() {
    ws = io.connect('ws://localhost:8081');

    console.log("Client connect test...");
    
    ws.on('connect', function (msg) {
        $("body").append("<p><b>Connected @ " + Date() + "</b></p>");
    });
    
    ws.on('message', function (msg) {
        console.log('NXT App got message: ' + msg);
        var dt = new Date();
    
        $("body").append("<p><b>... Got message @ " 
            + dt.getHours() + ":" 
            + dt.getMinutes() + ":"
            + dt.getSeconds() 
            + " [" + msg + "]</b></p>");
    });
}

function handleConnect() {
    $("body").append("<p><b>Connecting to ws://localhost:8080...</b></p>");

    handleInitialConnect();   // Send 'Hello' request endpoint 
    handleWebsocketConnect(); // Setup Websocket / tunnel with proxy gateway
}

function handleStop() {
    console.log('NXT app send stop message');
    ws.emit('stop');
}

function handleRestart() {
    console.log('NXT app send restart message');
    ws.emit('restart');
}