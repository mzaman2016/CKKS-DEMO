/// File: trusted-authority/index.js
const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const { mydecrypt } = require('../lib/myckks')

const app = express()

// Allow large payloads
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

const server = http.createServer(app)
const io = socketIO(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
})

// Endpoint to receive encrypted national sum
app.post('/receive', async (req, res) => {
  try {
    const { cipherSum } = req.body

    if (!cipherSum) {
      return res.status(400).send({ error: 'Missing cipherSum' })
    }

    // Decrypt
    const decryptedTotal = await mydecrypt(cipherSum)

    // Emit to connected clients
    io.emit('national-aggregated', { national: decryptedTotal })
    console.log('National total (decrypted):', decryptedTotal)

    res.send({ status: 'ok' })
  } catch (err) {
    console.error('Error decrypting national sum:', err.message)
    res.status(500).send({ error: err.message })
  }
})

server.listen(6000, () =>
  console.log('Trusted Authority running on port 6000')
)
