import { defineCrossPlatform } from '../helper'
import * as mac from './decrypt-mac'

const macCipherKeys: Record<string, Buffer> = {}
async function macGetCipherKey(keyring_name: string) {
  if (!macCipherKeys[keyring_name]) {
    // const password = mac.getPassword(keyring_name)
    const password = (await mac.getPasswordByKeytar(keyring_name)) || ''
    const cipherKey = mac.getCipherKey(password)
    macCipherKeys[keyring_name] = cipherKey
  }
  return macCipherKeys[keyring_name]
}

export class ChromeCookieDecryptor {
  browser_dir: string
  keyring_name: string
  keyring?: string

  constructor(browser_dir: string, keyring_name: string, keyring?: string) {
    this.browser_dir = browser_dir
    this.keyring_name = keyring_name
    this.keyring = keyring
  }

  init = defineCrossPlatform({
    async mac() {
      await macGetCipherKey(this.keyring_name)
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
      const cipherKey = macCipherKeys[this.keyring_name]
      const decrypted = mac.decrypt(cipherKey, encrypted)
      return decrypted
    },
  })
}
