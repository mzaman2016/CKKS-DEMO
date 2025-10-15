// File: national-server/index.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const ioClient = require('socket.io-client');
const axios = require('axios');
const { setupSeal, mydecrypt } = require('../lib/myckks'); // your CKKS module

const app = express();
const server = http.createServer(app);

// Socket.IO for dashboard connections
const io = socketIO(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

server.listen(5000, () => console.log('National Aggregator running on port 5000'));

// Variables to store latest regional sums
let regional1 = null;
let regional2 = null;

// Connect to regional servers via Socket.IO
const regional1Socket = ioClient('http://127.0.0.1:4000');
const regional2Socket = ioClient('http://127.0.0.1:4002');

// Function to aggregate and send only when both values exist
async function tryAggregate() {
  if (!regional1 || !regional2) {
    console.log('Waiting for both regional sums...', { regional1, regional2 });
    return;
  }

  try {
    const { seal, context, encoder, evaluator } = await setupSeal();

    // Load regional ciphertexts
    const cipher1 = seal.CipherText();
    cipher1.load(context, Uint8Array.from(Buffer.from(regional1, 'base64')));

    const cipher2 = seal.CipherText();
    cipher2.load(context, Uint8Array.from(Buffer.from(regional2, 'base64')));

    // Homomorphic addition
    const sumCipher = evaluator.add(cipher1, cipher2);

    // Serialize summed ciphertext
    const summedCipherB64 = Buffer.from(sumCipher.save()).toString('base64');

    // Decrypt
    const decryptedTotal = await mydecrypt(summedCipherB64);
    console.log('National total (decrypted):', decryptedTotal);

    // Emit to connected dashboards
    io.emit('national-aggregated', { national: decryptedTotal });

    // POST to Trusted Authority
    await axios.post('http://127.0.0.1:6000/receive', { cipherSum: summedCipherB64 });
    console.log('Sent summed ciphertext to Trusted Authority.');

  } catch (err) {
    console.error('Error aggregating regional data:', err.message);
  }
}

// Listen to regional events
regional1Socket.on('regional-aggregated', (data) => {
  regional1 = data; // store latest value
  tryAggregate();
});

regional2Socket.on('regional-aggregated', (data) => {
  regional2 = data;
  tryAggregate();
});
