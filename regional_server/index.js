// Part 2: Regional Aggregator Server
// File: /regional-server/index.js
const express = require('express');
const http = require('http');
const { encrypt, add } = require('../lib/mockCKKS');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
//const io = socketIO(server);

const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000", // React client
    methods: ["GET", "POST"]
  }
});


let regionalSum = null;

//app.use(express.json());

// Increase limit for JSON payloads
app.use(express.json({ limit: '1mb' })) // or '10mb' depending on ciphertext size

app.post('/send-data', (req, res) => {
    const { encryptedValue } = req.body;
    //regionalSum = regionalSum ? add(regionalSum, encryptedValue) : encryptedValue;
    //console.log(encryptedValue)
    regionalSum = encryptedValue;
    io.emit('regional-aggregated', regionalSum);
    res.sendStatus(200);
});

app.get('/aggregated', (req, res) => {
    res.json({ regionalSum });
});

server.listen(4000, () => console.log('Regional Aggregator running on port 4000'));
