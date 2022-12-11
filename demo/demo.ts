import { readBrowserCookies } from '../src'

void (async () => {
  const cookies = (await readBrowserCookies('chrome', { site: 'bilibili.com' })) || []
  console.log(cookies)
  for (const c of cookies || []) {
    if (c.expiresUtc) {
      console.log(new Date(c.expiresUtc))
    }
  }
})().catch(console.error)
