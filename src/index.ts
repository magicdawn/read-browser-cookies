import { chromiumBasedBrowsers, IChromiumBasedBrowser, readChromium } from './chromium'
import { notImplemented } from './helper'

type ISupportedBrowsers = IChromiumBasedBrowser | 'firefox' | 'safari'

export { chromiumBasedBrowsers }
export { ISupportedBrowsers, IChromiumBasedBrowser }

export function readBrowserCookies(
  browser: ISupportedBrowsers = 'chrome',
  options?: { site?: string; profile?: string; keyring_name?: string }
) {
  if (chromiumBasedBrowsers.includes(browser as IChromiumBasedBrowser)) {
    browser = <IChromiumBasedBrowser>browser
    return readChromium(browser, options)
  }

  notImplemented()
}
