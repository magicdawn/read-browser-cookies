import crypto from 'crypto'
import execa from 'execa'
import keytar from 'keytar'

export function getPasswordByExternalProcess(keyringName: string) {
  const { stdout: password } = execa.commandSync(
    `security find-generic-password -w -a '${keyringName}' -s '${keyringName} Safe Storage'`,
    { shell: true }
  )
  return password
}

export async function getPasswordByKeytar(keyringName: string) {
  return (await keytar.getPassword(`${keyringName} Safe Storage`, keyringName)) || ''
}

export function getPassword(keyringName: string) {
  return getPasswordByKeytar(keyringName)
}

export function getCipherKey(password: string) {
  return crypto.pbkdf2Sync(password, 'saltysalt', 1003, 16, 'sha1')
}

export function decrypt(cipherKey: Buffer, encryptedValue: Buffer) {
  // version = encrypted_value[:3]
  // ciphertext = encrypted_value[3:]
  // if version == b'v10':
  //     self._cookie_counts['v10'] += 1
  //     if self._v10_key is None:
  //         self._logger.warning('cannot decrypt v10 cookies: no key found', only_once=True)
  //         return None
  //     return _decrypt_aes_cbc(ciphertext, self._v10_key, self._logger)
  // else:
  //     self._cookie_counts['other'] += 1
  //     # other prefixes are considered 'old data' which were stored as plaintext
  //     # https://chromium.googlesource.com/chromium/src/+/refs/heads/main/components/os_crypt/os_crypt_mac.mm
  //     return encrypted_value

  const version = encryptedValue.subarray(0, 3)
  const encryptedPart = encryptedValue.subarray(3)

  if (version.toString('ascii') === 'v10') {
    return decryptAesCbc(cipherKey, encryptedPart)
  } else {
    return encryptedValue.toString()
  }
}

function decryptAesCbc(cipherKey: Buffer, encrypted: Buffer) {
  // https://pycryptodome.readthedocs.io/en/latest/src/cipher/aes.html
  // The secret key to use in the symmetric cipher.
  // It must be 16, 24 or 32 bytes long (respectively for AES-128, AES-192 or AES-256).

  let aesLen: 128 | 192 | 256 = 128
  if (cipherKey.byteLength === 16) aesLen = 128
  if (cipherKey.byteLength === 24) aesLen = 192
  if (cipherKey.byteLength === 32) aesLen = 256
  const alg = `AES-${aesLen}-CBC`

  const iv = Buffer.alloc(16, ' ')
  const decipher = crypto.createDecipheriv(alg, cipherKey, iv)

  decipher.setAutoPadding(true)

  const bufs: Buffer[] = [decipher.update(encrypted), decipher.final()]
  const result = Buffer.concat(bufs)

  return result.toString()
}
