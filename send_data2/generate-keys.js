const SEAL = require('node-seal')
const fs = require('fs')

async function generateKeys() {
  const seal = await SEAL()

  const parms = seal.EncryptionParameters(seal.SchemeType.ckks)
  const polyModulusDegree = 8192
  parms.setPolyModulusDegree(polyModulusDegree)
  parms.setCoeffModulus(seal.CoeffModulus.Create(polyModulusDegree, Int32Array.from([60, 40, 40, 60])))

  const context = seal.Context(parms, true, seal.SecurityLevel.tc128)
  if (!context.parametersSet()) throw new Error('Invalid parameters!')

  const keygen = seal.KeyGenerator(context)
  const publicKey = keygen.createPublicKey()
  const secretKey = keygen.secretKey()

  // Save keys to disk
  fs.writeFileSync('publicKey.b64', Buffer.from(publicKey.save()).toString('base64'))
  fs.writeFileSync('secretKey.b64', Buffer.from(secretKey.save()).toString('base64'))

  console.log('Keys generated and saved.')
}

generateKeys()
