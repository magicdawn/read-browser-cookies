/**
 * https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/cookies.py
 */

import os from 'os'
import path from 'path'
import { ArrayItems, baseDebug, defineCrossPlatform, execCrossPlatform } from '../helper'
import fse from 'fs-extra'
import globby from 'globby'
import { ChromeCookieDecryptor } from './decrypt'
import { query } from '../db'

const debug = baseDebug.extend('chromium:index')

export const chromiumBasedBrowsers = [
  'brave' as const,
  'chrome' as const,
  'chromium' as const,
  'edge' as const,
  'opera' as const,
  'vivaldi' as const,
]
export type IChromiumBasedBrowser = ArrayItems<typeof chromiumBasedBrowsers>

// cookiesfrombrowser:  A tuple containing
//  - the name of the browser, the profile
//  - name/path from where cookies are loaded
//  - the name of the keyring,
//  - and the container name,
// e.g.
// ('chrome', )
// or ('vivaldi', 'default', 'BASICTEXT')
// or ('firefox', 'default', None, 'Meta')
export async function readChromium(
  browser_name: IChromiumBasedBrowser,
  { profile, keyring, site }: { profile?: string; keyring?: string; site?: string } = {}
) {
  const config = getChromiumBasedBrowserSettings(browser_name)

  let search_root: string
  if (!profile) {
    search_root = config.browser_dir
  }
  // profile is path
  else if (_is_path(profile)) {
    search_root = profile
    config.browser_dir = config.supports_profiles ? path.dirname(profile) : profile
  }
  // profile is normal string
  else {
    if (config.supports_profiles) {
      search_root = path.join(config.browser_dir, profile)
    } else {
      console.error('%s does not support profiles')
      search_root = config.browser_dir
    }
  }

  // check search_root
  if (!fse.existsSync(search_root)) {
    debug('search %s root not exists', search_root)
    return
  }

  const cookie_database_path = findMostRecentlyUsedFile(search_root, 'Cookies')
  if (!cookie_database_path) {
    debug('cookies database not found')
    return
  }

  const allRows = await query(cookie_database_path, site)

  const decryptor = new ChromeCookieDecryptor(config.browser_dir, config.keyring_name, keyring)
  await decryptor.init()

  const decryptedRows = allRows.map((row) => {
    const newrow: Omit<typeof row, 'encrypted_value'> = {
      ...row,
      value: decryptor.decrypt(row.encrypted_value) || row.value,
    }
    // @ts-ignore
    delete newrow.encrypted_value
    return newrow
  })
  return decryptedRows
}

function _is_path(value: string) {
  return value?.includes(path.sep)
}

function findMostRecentlyUsedFile(root: string, filename: string) {
  const files = globby.sync(`./**/${filename}`, {
    cwd: root,
    absolute: true,
  })
  const withStat = files.map((f) => ({ filepath: f, stat: fse.statSync(f) }))
  const sorted = withStat.sort((a, b) => -(a.stat.mtimeMs - b.stat.mtimeMs)) // desc
  const first = sorted[0]?.filepath
  return first
}

/**
 * def _get_chromium_based_browser_settings(browser_name):
 */
function getChromiumBasedBrowserSettings(browser_name: IChromiumBasedBrowser) {
  // https://chromium.googlesource.com/chromium/src/+/HEAD/docs/user_data_dir.md
  let browser_dir = ''

  execCrossPlatform({
    mac() {
      const appdata = path.posix.join(os.homedir(), 'Library/Application Support')
      const join = path.posix.join
      browser_dir = {
        brave: join(appdata, 'BraveSoftware/Brave-Browser'),
        chrome: join(appdata, 'Google/Chrome'),
        chromium: join(appdata, 'Chromium'),
        edge: join(appdata, 'Microsoft Edge'),
        opera: join(appdata, 'com.operasoftware.Opera'),
        vivaldi: join(appdata, 'Vivaldi'),
      }[browser_name]
    },

    win() {
      const appdata_local = process.env.LOCALAPPDATA
      const appdata_roaming = process.env.APPDATA
      if (!appdata_local || !appdata_roaming) {
        throw new Error('expect LOCALAPPDATA & APPDATA environment variable')
      }
      const join = path.win32.join
      browser_dir = {
        brave: join(appdata_local, 'BraveSoftware/Brave-Browser/User Data'),
        chrome: join(appdata_local, 'Google/Chrome/User Data'),
        chromium: join(appdata_local, 'Chromium/User Data'),
        edge: join(appdata_local, 'Microsoft/Edge/User Data'),
        opera: join(appdata_roaming, 'Opera Software/Opera Stable'),
        vivaldi: join(appdata_local, 'Vivaldi/User Data'),
      }[browser_name]
    },

    linux() {
      const config = xdgConfigHome()
      const join = path.posix.join
      browser_dir = {
        brave: join(config, 'BraveSoftware/Brave-Browser'),
        chrome: join(config, 'google-chrome'),
        chromium: join(config, 'chromium'),
        edge: join(config, 'microsoft-edge'),
        opera: join(config, 'opera'),
        vivaldi: join(config, 'vivaldi'),
      }[browser_name]
    },
  })

  const keyring_name = {
    brave: 'Brave',
    chrome: 'Chrome',
    chromium: 'Chromium',
    edge: process.platform == 'darwin' ? 'Microsoft Edge' : 'Chromium',
    opera: process.platform == 'darwin' ? 'Opera' : 'Chromium',
    vivaldi: process.platform == 'darwin' ? 'Vivaldi' : 'Chrome',
  }[browser_name]

  const browsers_without_profiles: IChromiumBasedBrowser[] = ['opera']

  return {
    browser_dir,
    keyring_name,
    supports_profiles: !browsers_without_profiles.includes(browser_name),
  }
}

function xdgConfigHome() {
  return process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config')
}
