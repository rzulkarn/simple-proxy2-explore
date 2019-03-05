//
// Setup the websocket using socket.io proxy agent
//

function handleConnect() {
    $("body").append("<p><b>Connecting to http://localhost:8081/ingressgw...</b></p>");

    const Http = new XMLHttpRequest();  
    const url='http://localhost:8081/ingressgw';
    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange = (e) => {
        $("body").append("<p><b>Connected @ " + Date() + "</b></p>");
        var dt = new Date();
    
        $("body").append("<p><b>... Got message @ " 
            + dt.getHours() + ":" 
            + dt.getMinutes() + ":"
            + dt.getSeconds() 
            + " [" + Http.responseText + "]</b></p>");
    }
}