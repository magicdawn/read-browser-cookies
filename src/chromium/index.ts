/**
 * https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/cookies.py
 */

import fse from 'fs-extra'
import globby from 'globby'
import os from 'os'
import path from 'path'
import { query } from '../db'
import { ArrayItems, baseDebug, execCrossPlatform } from '../helper'
import { ChromeCookieDecryptor } from './decrypt'

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
  browserName: IChromiumBasedBrowser,
  { profile, keyring, site }: { profile?: string; keyring?: string; site?: string } = {}
) {
  const config = getChromiumBasedBrowserSettings(browserName)

  let searchRoot: string
  if (!profile) {
    searchRoot = config.browserDir
  }
  // profile is path
  else if (isPath(profile)) {
    searchRoot = profile
    config.browserDir = config.supportsProfiles ? path.dirname(profile) : profile
  }
  // profile is normal string
  else {
    if (config.supportsProfiles) {
      searchRoot = path.join(config.browserDir, profile)
    } else {
      console.error('%s does not support profiles')
      searchRoot = config.browserDir
    }
  }

  // check search_root
  if (!fse.existsSync(searchRoot)) {
    debug('search %s root not exists', searchRoot)
    return
  }

  const cookieDatabasePath = findMostRecentlyUsedFile(searchRoot, 'Cookies')
  if (!cookieDatabasePath) {
    debug('cookies database not found')
    return
  }

  const allRows = await query(cookieDatabasePath, site)

  const decryptor = new ChromeCookieDecryptor(config.browserDir, config.keyringName, keyring)
  await decryptor.init()

  const decryptedRows = allRows.map((row) => {
    const newrow: Omit<typeof row, 'encryptedValue'> = {
      ...row,
      value: decryptor.decrypt(row.encryptedValue) || row.value,
    }
    // @ts-ignore
    delete newrow.encryptedValue
    return newrow
  })
  return decryptedRows
}

function isPath(value: string) {
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
function getChromiumBasedBrowserSettings(browserName: IChromiumBasedBrowser) {
  // https://chromium.googlesource.com/chromium/src/+/HEAD/docs/user_data_dir.md
  let browserDir = ''

  execCrossPlatform({
    mac() {
      const appdata = path.posix.join(os.homedir(), 'Library/Application Support')
      const join = path.posix.join
      browserDir = {
        brave: join(appdata, 'BraveSoftware/Brave-Browser'),
        chrome: join(appdata, 'Google/Chrome'),
        chromium: join(appdata, 'Chromium'),
        edge: join(appdata, 'Microsoft Edge'),
        opera: join(appdata, 'com.operasoftware.Opera'),
        vivaldi: join(appdata, 'Vivaldi'),
      }[browserName]
    },

    win() {
      const appdata_local = process.env.LOCALAPPDATA
      const appdata_roaming = process.env.APPDATA
      if (!appdata_local || !appdata_roaming) {
        throw new Error('expect LOCALAPPDATA & APPDATA environment variable')
      }
      const join = path.win32.join
      browserDir = {
        brave: join(appdata_local, 'BraveSoftware/Brave-Browser/User Data'),
        chrome: join(appdata_local, 'Google/Chrome/User Data'),
        chromium: join(appdata_local, 'Chromium/User Data'),
        edge: join(appdata_local, 'Microsoft/Edge/User Data'),
        opera: join(appdata_roaming, 'Opera Software/Opera Stable'),
        vivaldi: join(appdata_local, 'Vivaldi/User Data'),
      }[browserName]
    },

    linux() {
      const config = xdgConfigHome()
      const join = path.posix.join
      browserDir = {
        brave: join(config, 'BraveSoftware/Brave-Browser'),
        chrome: join(config, 'google-chrome'),
        chromium: join(config, 'chromium'),
        edge: join(config, 'microsoft-edge'),
        opera: join(config, 'opera'),
        vivaldi: join(config, 'vivaldi'),
      }[browserName]
    },
  })

  const keyringName = {
    brave: 'Brave',
    chrome: 'Chrome',
    chromium: 'Chromium',
    edge: process.platform == 'darwin' ? 'Microsoft Edge' : 'Chromium',
    opera: process.platform == 'darwin' ? 'Opera' : 'Chromium',
    vivaldi: process.platform == 'darwin' ? 'Vivaldi' : 'Chrome',
  }[browserName]

  const browsersWithoutProfiles: IChromiumBasedBrowser[] = ['opera']

  return {
    browserDir: browserDir,
    keyringName: keyringName,
    supportsProfiles: !browsersWithoutProfiles.includes(browserName),
  }
}

function xdgConfigHome() {
  return process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config')
}
