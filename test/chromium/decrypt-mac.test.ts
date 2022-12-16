import 'should'
import { decrypt, getCipherKey } from '../../src/chromium/decrypt-mac'

describe('decrypt on mac', () => {
  it('works', () => {
    const cipherKey = getCipherKey(
      Buffer.from('534a6248447175376b2f5264744c3368475945696c413d3d', 'hex').toString()
    )
    const val = decrypt(cipherKey, Buffer.from('763130fdeef1d4e34ec6a15f9bd2abb6fc28e9', 'hex'))
    val.should.equal('1654381038')
  })
})
