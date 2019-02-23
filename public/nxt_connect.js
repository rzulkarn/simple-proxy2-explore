
function cloudConnect(io) {
    console.log("Client connect2...");
    //
    // Setup the socket.io client against our proxy 
    //
    var ws = io.connect('ws://localhost:8081');
    //
    ws.on('message', function (msg) {
       console.log('NXT App got message: ' + msg);
       ws.send('a message from NXT App');
       $("p").append("<p><b>... Connected @ " + Date() + "</b></p>");
    });

}