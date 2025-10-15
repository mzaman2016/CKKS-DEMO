// Part 5: Simulated power plant sender
// File: /simulator/send-data.js
const axios = require('axios');
const { myencrypt } = require('../lib/myckks'); // updated CKKS module with shared keys

// Send data every 1 second (simulated day)
setInterval(async () => {
  try {
    // Regional 1
    const raw1 = 600 + Math.random() * 100;
    console.log("regional1 (raw):", raw1);

    const encrypted1 = await myencrypt(raw1);
    //console.log("regional1 (encrypted):", encrypted1);

    await axios.post('http://localhost:4000/send-data', { encryptedValue: encrypted1 });

  } catch (err) {
    console.error('Error sending data:', err.message);
  }
}, 1000);
