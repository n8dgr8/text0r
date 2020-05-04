require('dotenv').config()

const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const uuid = require('uuid');


const ngrok = require('ngrok');
const xml2js = require('xml2js');
const axios = require('axios');
const { urlencoded } = require('body-parser');

const app = express();
app.use(express.json());
app.use(express.static('static'));
app.use(urlencoded({ extended: false }));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let tunnelUrl;

server.on('listening', () => {
    console.log(`Listening on port ${server.address().port}`);

    if (process.env.NGROK_ENABLED) {
        ngrok.connect(server.address().port,
        {
            auth: `${uuid.v4()}:${uuid.v4()}`
        })
        .then(url => {
            tunnelUrl = url;
            console.log(`Also listening on ${url}`);
            setSmsUrl(tunnelUrl);
        });
    } else {
        console.warn('-> ngrok is not enabled!  You will NOT be able to send or receive SMS!');
    }
});

app.post('/message', (req, res) => {
    wss.clients
    .forEach(client => {
        client.send(
            JSON.stringify(
                {
                    'eventType': 'Incoming Message',
                    'body': req.body.Body,
                    'from': req.body.From,
                    'dateTime': Date.now(),
                }
            )
        );
    });

    res.sendStatus(201);
});

app.post('/send', (req, res) => {
    console.log(req.body);
});

wss.on('connection', websocket => {
    websocket.on('message', message => {
        console.log(message);
    });
});

server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started at http://localhost:${server.address().port}/`);
});

function setSmsUrl(newUrl) {
    
    const phoneSid = process.env.PHONE_SID;
    const accountSid = process.env.ACCOUNT_SID;
    const authToken = process.env.AUTH_TOKEN;

    const params = new URLSearchParams();
    params.append('SmsUrl', `${newUrl}/message`);


    axios.post(`https://${accountSid}:${authToken}@api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers/${phoneSid}.json`,
    params,
    {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        }
    })
    .then(function (response) {
        console.log('Twilio is now pointing at text0r!  Incoming SMS will function!');
    })
    .catch(function (error) {
        console.log('Twilio is _not_ pointing at text0r!  Incoming SMS will not function!');
    });
}