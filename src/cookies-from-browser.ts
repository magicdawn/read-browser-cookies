/**
 * https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/cookies.py
 */

import crypto from 'crypto'
import execa from 'execa'
import { homedir } from 'os'
import path from 'path'
import sqlite3 from 'sqlite3'

const CHROME_COOKIE_PATH = path.join(
  homedir(),
  'Library',
  'Application Support',
  'Google/Chrome/Default/Cookies'
)

console.log(CHROME_COOKIE_PATH)
// /Users/magicdawn/Library/Application Support/Google/Chrome/Default/Cookies
const db = new sqlite3.Database(CHROME_COOKIE_PATH)

const sql = `
SELECT host_key, name, value, encrypted_value, path, expires_utc, is_secure
FROM cookies
WHERE host_key like '%bilibili%'
`

function getPassword() {
  const { stdout: password } = execa.commandSync(
    `security find-generic-password -w -a Chrome -s 'Chrome Safe Storage'`,
    { shell: true }
  )
  return password
}

function getCipherKey(password?: string) {
  password ||= getPassword()
  return crypto.pbkdf2Sync(password, 'saltysalt', 1003, 16, 'sha1')
}

function decrypt(cipherKey: Buffer, encryptedValue: Buffer) {
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
    encryptedValue
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

db.all(sql, (err, rows) => {
  if (err) {
    return console.log(err)
  }

  const cipherKey = getCipherKey()

  rows.forEach((row) => {
    row.encrypted_value = decrypt(cipherKey, row.encrypted_value)
  })

  console.log(rows)
})
