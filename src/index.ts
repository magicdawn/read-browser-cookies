import { chromiumBasedBrowsers, IChromiumBasedBrowser, readChromium } from './chromium'
import { notImplemented } from './helper'

type ISupportedBrowsers = IChromiumBasedBrowser | 'firefox' | 'safari'

export { chromiumBasedBrowsers }
export { ISupportedBrowsers, IChromiumBasedBrowser }

export async function readBrowserCookies(
  browser: ISupportedBrowsers = 'chrome',
  options?: { profile?: string; keyring?: string; site?: string }
) {
  if (chromiumBasedBrowsers.includes(browser as IChromiumBasedBrowser)) {
    browser = <IChromiumBasedBrowser>browser
    return await readChromium(browser, options)
  }

  // notImplemented()
  return undefined
}
