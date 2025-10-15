// File: myckks.js
const SEAL = require('node-seal')
const fs = require('fs')
const path = require('path')

const keyPath = path.join(__dirname, 'keys') // folder to save keys
let seal, context, encoder, encryptor, decryptor, evaluator

async function setupSeal() {
  // If already initialized, return objects
  if (seal) return { seal, context, encoder, encryptor, decryptor, evaluator }

  seal = await SEAL()

  // CKKS parameters
  const parms = seal.EncryptionParameters(seal.SchemeType.ckks)
  const polyModulusDegree = 8192
  parms.setPolyModulusDegree(polyModulusDegree)
  parms.setCoeffModulus(
    seal.CoeffModulus.Create(polyModulusDegree, Int32Array.from([60, 40, 40, 60]))
  )

  context = seal.Context(parms, true, seal.SecurityLevel.tc128)
  if (!context.parametersSet()) throw new Error('CKKS parameters not set properly!')

  encoder = seal.CKKSEncoder(context)
  evaluator = seal.Evaluator(context)

  // Load keys if exist
  const pubKeyFile = path.join(keyPath, 'publicKey.bin')
  const secKeyFile = path.join(keyPath, 'secretKey.bin')

  if (fs.existsSync(pubKeyFile) && fs.existsSync(secKeyFile)) {
    const publicKey = seal.PublicKey()
    publicKey.load(context, Uint8Array.from(Buffer.from(fs.readFileSync(pubKeyFile, 'utf8'), 'base64')))

    const secretKey = seal.SecretKey()
    secretKey.load(context, Uint8Array.from(Buffer.from(fs.readFileSync(secKeyFile, 'utf8'), 'base64')))

    encryptor = seal.Encryptor(context, publicKey)
    decryptor = seal.Decryptor(context, secretKey)
  } else {
    // Generate new keys
    const keygen = seal.KeyGenerator(context)
    const publicKey = keygen.createPublicKey()
    const secretKey = keygen.secretKey()

    encryptor = seal.Encryptor(context, publicKey)
    decryptor = seal.Decryptor(context, secretKey)

    // Save keys
    if (!fs.existsSync(keyPath)) fs.mkdirSync(keyPath)
    fs.writeFileSync(pubKeyFile, Buffer.from(publicKey.save()).toString('base64'))
    fs.writeFileSync(secKeyFile, Buffer.from(secretKey.save()).toString('base64'))
  }

  return { seal, context, encoder, encryptor, decryptor, evaluator }
}

// Encrypt a number
async function myencrypt(value) {
  await setupSeal()
  const scale = Math.pow(2, 40)
  const plain = encoder.encode(Float64Array.from([value]), scale)
  const cipher = encryptor.encrypt(plain)
  return Buffer.from(cipher.save()).toString('base64')
}


// Decrypt a base64 ciphertext
async function mydecrypt(cipherB64) {
  await setupSeal()
  const cipher = seal.CipherText()
  cipher.load(context, Uint8Array.from(Buffer.from(cipherB64, 'base64')))
  const plain = decryptor.decrypt(cipher)
  const decoded = encoder.decode(plain)
  return decoded[0] // first slot contains the number
}

module.exports = { setupSeal, myencrypt, mydecrypt }
