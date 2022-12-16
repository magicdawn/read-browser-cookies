# read-browser-cookies

> Node.js version of `--cookies-from-browser` from yt-dlp

[![Build Status](https://img.shields.io/github/actions/workflow/status/magicdawn/read-browser-cookies/ci.yml?branch=main&style=flat-square)](https://github.com/magicdawn/read-browser-cookies/actions/workflows/ci.yml)
[![Coverage Status](https://img.shields.io/codecov/c/github/magicdawn/read-browser-cookies.svg?style=flat-square)](https://codecov.io/gh/magicdawn/read-browser-cookies)
[![npm version](https://img.shields.io/npm/v/read-browser-cookies.svg?style=flat-square)](https://www.npmjs.com/package/read-browser-cookies)
[![npm downloads](https://img.shields.io/npm/dm/read-browser-cookies.svg?style=flat-square)](https://www.npmjs.com/package/read-browser-cookies)
[![npm license](https://img.shields.io/npm/l/read-browser-cookies.svg?style=flat-square)](http://magicdawn.mit-license.org)

## Install

```sh
$ pnpm add read-browser-cookies
```

## Alternative

I'm surprised yt-dlp's usage, and create this pkg, then I found these existing alternative pkgs

- https://github.com/bertrandom/chrome-cookies-secure
- https://github.com/phoqe/havelock

## Status

- [x] macOS + Chromium Based browsers
- [ ] macOS + safari
- [ ] macOS + firefox
- [ ] windows + Chromium Based browsers
- [ ] windows + firefox
- [ ] Linux + Chromium Based browsers
- [ ] Linux + firefox

current only macOS + Chromium based browsers are supported.

#### chromium based browser names

- chrome
- chromium
- edge
- brave
- opera
- vivaldi

## API

```js
import { readCookies, readCookiesStr } from 'read-browser-cookies'

// read all cookies
readCookies('chrome').then((cookiesArray) => {
  //
})

// read all cookies for specific site
readCookies('chrome', { site: 'youtube.com' }).then((cookiesArray) => {
  //
})

// read all cookies for specific site, as string
readCookiesStr('chrome', { site: 'youtube.com' }).then((cookiesStr) => {
  // request.get(url, { headers: { cookie: cookiesStr } })
})
```

## Changelog

[CHANGELOG.md](CHANGELOG.md)

## License

the MIT License http://magicdawn.mit-license.org
