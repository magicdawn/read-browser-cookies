import debugFactory from 'debug'

export const baseDebug = debugFactory('read-browser-cookies')

export type ArrayItems<T extends any[]> = T extends Array<infer Item> ? Item : never

export function notImplemented() {
  throw new Error('not implemented')
}

const defaultNotImplement = notImplemented

export function defineCrossPlatform<M extends (...args: any[]) => any>(
  options: Partial<Record<'mac' | 'win' | 'linux', M>>
): M {
  const notImplemented = defaultNotImplement as M

  // win
  if (['cygwin', 'win32'].includes(process.platform)) {
    return options.win || notImplemented
  }

  // mac
  else if (process.platform === 'darwin') {
    return options.mac || notImplemented
  }

  // linux
  else {
    return options.linux || notImplemented
  }
}

export function execCrossPlatform(options: Partial<Record<'mac' | 'win' | 'linux', () => void>>) {
  defineCrossPlatform(options)()
}
