const SEAL = require('node-seal')

const polyModulusDegree = 8192
const coeffModulusBits = Int32Array.from([60, 40, 40, 60])

// Global SEAL context + keys setup
async function setupSeal() {
  const seal = await SEAL()

  const parms = seal.EncryptionParameters(seal.SchemeType.ckks)
  parms.setPolyModulusDegree(polyModulusDegree)
  parms.setCoeffModulus(seal.CoeffModulus.Create(polyModulusDegree, coeffModulusBits))

  const context = seal.Context(parms, true, seal.SecurityLevel.tc128)
  if (!context.parametersSet()) throw new Error('Invalid parameters!')

  const keygen = seal.KeyGenerator(context)

  const publicKey = keygen.createPublicKey()
  const secretKey = keygen.secretKey()

  const encoder = seal.CKKSEncoder(context)
  const encryptor = seal.Encryptor(context, publicKey)
  const decryptor = seal.Decryptor(context, secretKey)

  return { seal, context, encoder, encryptor, decryptor, publicKey, secretKey }
}

async function myencrypt(plain_num) {
  const { encoder, encryptor } = await setupSeal()

  const scale = Math.pow(2, 40)
  // Must be Float64Array
  const plain = encoder.encode(Float64Array.from([plain_num]), scale)
  const encrypted = encryptor.encrypt(plain)

  return Buffer.from(encrypted.save()).toString('base64')
}


async function mydecrypt(cipherB64) {
  const { seal, context, encoder, decryptor } = await setupSeal()

  const cipher = seal.CipherText()
  cipher.load(context, Uint8Array.from(Buffer.from(cipherB64, 'base64')))

  const plain = decryptor.decrypt(cipher)
  const decoded = encoder.decode(plain)
  return decoded[0] // first element of decoded array
}

module.exports = { myencrypt, mydecrypt }
