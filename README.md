## Fictitious
* NXT names

## Installation
* npm install colors concurrently ejs express http-proxy nodemon socket.io socket.io-client cors @okta/oidc-middleware dotenv express-session jsonwebtoken path ws bson extend http-string-parser

## How to run the app, the agent and the connector
* create .env file (ask for the content!)
* npm run dev

## Browser Test
* Configure System Web Proxy (HTTP) to 127.0.0.1:8081
* From browser goto: http://www.undefined.com 
* Browser will print the HTTP response packet

## Unit Test
* localhost:4000
* localhost:4000/welcome

## Node.js Instances
* NXT-App : a test utility app/client
* NXT-Agent : a http and proxy agent that listen on port 8081
* NXT-Portal : a http server that listen on port 8080
* NXT-Connector : a websocket server listen on port 8082