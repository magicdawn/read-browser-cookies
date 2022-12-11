import sqlite3, { Database } from 'sqlite3'
import { baseDebug, execCrossPlatform } from './helper'

const DEFAULT_SQL = `
SELECT host_key as hostKey, name, value, encrypted_value as encryptedValue, path, expires_utc as expiresUtc, is_secure as isSecure
FROM cookies
`
const debug = baseDebug.extend('db')

export type ICookieRow = {
  hostKey: string
  name: string
  value: string
  encryptedValue: Buffer
  path: string
  expiresUtc: number
  isSecure: number
}

export type ICookie = Omit<ICookieRow, 'encryptedValue'>

export async function query(dbpath: string, site?: string) {
  const db = new Database(dbpath, sqlite3.OPEN_READONLY)

  let sql = DEFAULT_SQL
  const params: Record<string, any> = {}
  if (site) {
    sql += `WHERE host_key like $site`
    params.$site = `%${site}%`
  }
  debug('exec: sql -> %s, with params -> %o', sql, params)

  const rows: ICookieRow[] = await new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err)
      resolve(rows)
    })
  })

  rows.forEach((row) => {
    postProcess(row)
  })

  db.close()
  return rows
}

/**
 * extra process for cookie
 */

function postProcess(cookie: ICookieRow) {
  execCrossPlatform({}, true)
}
