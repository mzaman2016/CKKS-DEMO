// File: myckks.js
const SEAL = require('node-seal')
const fs = require('fs')

let seal, context, encoder, encryptor, decryptor
const scale = Math.pow(2, 40)

// Helper to setup CKKS context
async function setupSeal() {
  if (seal) return { seal, context, encoder, encryptor, decryptor } // already initialized

  seal = await SEAL()

  // CKKS parameters
  const parms = seal.EncryptionParameters(seal.SchemeType.ckks)
  const polyModulusDegree = 8192
  parms.setPolyModulusDegree(polyModulusDegree)
  parms.setCoeffModulus(seal.CoeffModulus.Create(polyModulusDegree, Int32Array.from([60, 40, 40, 60])))

  context = seal.Context(parms, true, seal.SecurityLevel.tc128)
  if (!context.parametersSet()) throw new Error('Invalid parameters!')

  encoder = seal.CKKSEncoder(context)
  encryptor = seal.Encryptor(context)
  decryptor = seal.Decryptor(context)

  return { seal, context, encoder, encryptor, decryptor }
}

// Encrypt a number using saved public key
async function myencrypt(value) {
  await setupSeal()

  // Load public key
  const publicKeyB64 = fs.readFileSync('publicKey.b64', 'utf8')
  const publicKey = seal.PublicKey()
  publicKey.load(context, Uint8Array.from(Buffer.from(publicKeyB64, 'base64')))
  encryptor.setPublicKey(publicKey)

  // Encode and encrypt
  const plain = encoder.encode(Float64Array.from([value]), scale)
  const cipher = encryptor.encrypt(plain)
  return Buffer.from(cipher.save()).toString('base64')
}

// Decrypt a ciphertext using saved secret key
async function mydecrypt(cipherB64) {
  await setupSeal()

  // Load secret key
  const secretKeyB64 = fs.readFileSync('secretKey.b64', 'utf8')
  const secretKey = seal.SecretKey()
  secretKey.load(context, Uint8Array.from(Buffer.from(secretKeyB64, 'base64')))
  decryptor.setSecretKey(secretKey)

  // Load ciphertext
  const cipher = seal.CipherText()
  cipher.load(context, Uint8Array.from(Buffer.from(cipherB64, 'base64')))

  // Decrypt and decode
  const plain = decryptor.decrypt(cipher)
  const decoded = encoder.decode(plain)
  return decoded[0] // return the number
}

module.exports = { setupSeal, myencrypt, mydecrypt }
