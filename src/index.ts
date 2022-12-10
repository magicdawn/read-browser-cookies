import { chromiumBasedBrowsers, IChromiumBasedBrowser, readChromium } from './chromium'

function notImplemented(): string {
  throw new Error('not implemented')
}

type ISupportedBrowsers = IChromiumBasedBrowser | 'firefox' | 'safari'

export function readBrowserCookies(
  browser: ISupportedBrowsers = 'chrome',
  options?: { site?: string; profile?: string; keyring_name?: string }
) {
  if (chromiumBasedBrowsers.includes(browser as IChromiumBasedBrowser)) {
    browser = <IChromiumBasedBrowser>browser
    return readChromium(browser, options)
  }
  return notImplemented()
}

// void (async () => {
//   debugger
//   console.log(await readBrowserCookies('chrome', { site: 'bilibili.com' }))
// })().catch(console.error)
