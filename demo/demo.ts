import debugFactory from 'debug'
import { readBrowserCookies } from '../src'

debugFactory.enable('read-browser-cookies:*')

void (async () => {
  const cookies = (await readBrowserCookies('chrome', { site: 't.bilibili.com' })) || []
  console.log(cookies)
  for (const c of cookies || []) {
    if (c.expiresUtc) {
      console.log(new Date(c.expiresUtc))
    }
  }
})().catch(console.error)
