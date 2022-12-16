import debugFactory from 'debug'
import { readCookies, readCookiesStr } from '../src'

debugFactory.enable('read-browser-cookies:*')

void (async () => {
  {
    const cookies = (await readCookies('chrome', { site: 't.bilibili.com' })) || []
    // console.log(cookies)
  }

  {
    const cookies = await readCookiesStr('chrome', { site: 't.bilibili.com' })
    console.log(cookies)
  }
})().catch(console.error)
