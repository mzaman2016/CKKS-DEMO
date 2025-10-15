// Part 1: Simple mock CKKS encryption/decryption logic for simulation
// File: /lib/mockCKKS.js
module.exports = {
    encrypt: (value) => ({ encrypted: true, value, noise: Math.random() * 0.0001 }),
    decrypt: (enc) => enc.value + enc.noise,
    add: (enc1, enc2) => ({
        encrypted: true,
        value: enc1.value + enc2.value,
        noise: enc1.noise + enc2.noise
    })
};
