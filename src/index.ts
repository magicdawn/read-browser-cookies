import { chromiumBasedBrowsers, IChromiumBasedBrowser, readChromium } from './chromium'

type ISupportedBrowsers = IChromiumBasedBrowser | 'firefox' | 'safari'

export { chromiumBasedBrowsers }
export { ISupportedBrowsers, IChromiumBasedBrowser }

export async function readCookies(
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

/**
 * return a value for `Cookies: value`
 */
export async function readCookiesStr(
  browser: ISupportedBrowsers = 'chrome',
  options?: { profile?: string; keyring?: string; site?: string }
) {
  const cookies = await readCookies(browser, options)
  const str = (cookies || [])
    .filter((item) => item.expiresUtc && item.expiresUtc > Date.now())
    .map((c) => `${c.name}=${c.value}`)
    .join(';')
  return str
}
