import { readBrowserCookies } from '../src'

void (async () => {
  console.log(await readBrowserCookies('chrome', { site: 'bilibili.com' }))
})().catch(console.error)
