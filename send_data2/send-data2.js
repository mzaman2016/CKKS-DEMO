// Part 5: Simulated power plant sender
// File: /simulator/send-data.js
const axios = require('axios');
const { myencrypt } = require('../lib/myckks'); // updated CKKS module with shared keys

// Send data every 1 second (simulated day)
setInterval(async () => {
  try {
    

    // Regional 2
    const raw2 = 400 + Math.random() * 100;
    console.log("regional 2: ",raw2);

    const encrypted2 = await myencrypt(raw2);
    //console.log("regional2 (encrypted):", encrypted2);

    await axios.post('http://localhost:4002/send-data', { encryptedValue: encrypted2 });

  } catch (err) {
    console.error('Error sending data:', err.message);
  }
}, 1000);
