import { defineCrossPlatform } from '../helper'
import * as mac from './decrypt-mac'

const macCipherKeys: Record<string, Buffer> = {}
async function macGetCipherKey(keyringName: string) {
  if (!macCipherKeys[keyringName]) {
    const password = await mac.getPassword(keyringName)
    const cipherKey = mac.getCipherKey(password)
    macCipherKeys[keyringName] = cipherKey
  }
  return macCipherKeys[keyringName]
}

export class ChromeCookieDecryptor {
  browserDir: string
  keyringName: string
  keyring?: string

  constructor(browserDir: string, keyringName: string, keyring?: string) {
    this.browserDir = browserDir
    this.keyringName = keyringName
    this.keyring = keyring
  }

  init = defineCrossPlatform({
    async mac() {
      await macGetCipherKey(this.keyringName)
    },
    async win() {
      //
    },
    async linux() {
      //
    },
  })

  decrypt = defineCrossPlatform({
    mac(encrypted: Buffer) {
      const cipherKey = macCipherKeys[this.keyringName]
      const decrypted = mac.decrypt(cipherKey, encrypted)
      return decrypted
    },
  })
}
