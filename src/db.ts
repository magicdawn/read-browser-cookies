import { Database, OPEN_READONLY } from 'sqlite3'

const DEFAULT_SQL = `
SELECT host_key, name, value, encrypted_value, path, expires_utc, is_secure
FROM cookies
`

export type ICookieRow = {
  host_key: string
  name: string
  value: string
  encrypted_value: Buffer
  path: string
  expires_utc: number
  is_secure: number
}

export async function query(dbpath: string, site?: string) {
  const db = new Database(dbpath, OPEN_READONLY)

  let sql = DEFAULT_SQL
  if (site) {
    sql += `WHERE host_key like '%${site}%'`
  }

  const rows: ICookieRow[] = await new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) return reject(err)
      resolve(rows)
    })
  })

  return rows
}
