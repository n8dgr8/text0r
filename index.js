const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const ngrok = require('ngrok');

const app = express();
app.use(express.json());
app.use(express.static('static'));
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

let tunnelUrl;

server.on('listening', () => {
    console.log(`Listening on port ${server.address().port}`);
    ngrok.connect(server.address().port)
    .then(url => {
        tunnelUrl = url;
        console.log(`Also listening on ${url}`)
    });
});

app.post('/message', (req, res) => {
    wss.clients
    .forEach(client => {
        console.log(`sending ${req.body} to ${client}`);
        client.send(JSON.stringify(req.body));
    });

    res.sendStatus(201);
});

wss.on('connection', ws => {

    //connection is up, let's add a simple simple event
    ws.on('message', message => {

        //log the received message and send it back to the client
        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`);
    });

    //send immediatly a feedback to the incoming connection    
    ws.send('Hi there, I am a WebSocket server');
});

server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${server.address().port}`);
});
